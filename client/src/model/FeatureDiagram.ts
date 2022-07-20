/**
 * The feature model is the main artifact shown and edited by this application.
 * It is a tree-like structure containing features and additional feature and cross-tree constraints.
 * The feature model is intended for read-only use in rendering a feature model.
 * It lays out the feature model and manages collapsed features.
 */

import {hierarchy as d3Hierarchy} from 'd3-hierarchy';
import constants from '../constants';
import memoize from '../helpers/memoize';
import {estimateHierarchySize} from '../components/featureDiagramView/treeLayout/estimation';
import {Settings} from '../store/settings';
import {FeatureDiagramLayoutType} from '../types';
import {present} from '../helpers/present';
import logger from '../helpers/logger';
import {FeatureNode, FeatureTree, FeatureModel, Constraint, ConstraintType, Formula, FormulaAtom, GroupType, FeaturePropertyKey} from './types';
import {getViewportWidth, getViewportHeight} from '../helpers/withDimensions';
// @ts-ignore: no declarations available for s-expression
import SParse from 's-expression';
import nodeTest from 'node:test';

export function getID(node: FeatureNode): string {
    return node.data.id;
}

export function isRoot(node: FeatureNode): boolean {
    return !node.parent;
}

export function isCollapsed(node: FeatureNode): boolean {
    return (!node.children || node.children.length === 0) && node.actualChildren.length > 0;
}

export function hasChildren(node: FeatureNode): boolean {
    return !!node.children && node.children.length > 0;
}

export function hasActualChildren(node: FeatureNode): boolean {
    return node.actualChildren.length > 0;
}

export function getPropertyString(node: FeatureNode, key: FeaturePropertyKey): string {
    if (typeof key === 'function')
        return key(node);
    return (node as any).data[key] ? 'yes' : 'no';
}

export function getNumberOfFeaturesBelow(node: FeatureNode): number {
    return node.actualChildren.length +
        node.actualChildren
            .map(child => getNumberOfFeaturesBelow(child))
            .reduce((acc, val) => acc + val, 0);
}

export function getFeatureIDsBelow(node: FeatureNode): string[] {
    return [getID(node)].concat(
        ...node.actualChildren.map(child => getFeatureIDsBelow(child)));
}

function eachNodeBelow(node: FeatureNode, callback: (node: FeatureNode) => void): void {
    var current, currentNode: FeatureNode | undefined = node, next = [node], children, i, n;
    do {
        current = next.reverse();
        next = [];
        while ((currentNode = current.pop())) {
            callback(currentNode);
            children = currentNode.actualChildren;
            for (i = 0, n = children.length; i < n; ++i)
                next.push(children[i]);
        }
    } while (next.length);
}

function getNodesBelow(node: FeatureNode): FeatureNode[] {
    var nodes: FeatureNode[] = [];
    eachNodeBelow(node, node => nodes.push(node));
    return nodes;
}

type ConstraintRenderer<T> = ((featureModel: FeatureDiagram, formula: Formula) => T) & {cacheKey: string};

// adapted from FeatureIDE fm.core's org/prop4j/NodeWriter.java
export function createConstraintRenderer<T>({neutral, _return, returnFeature, join, cacheKey}: {
        neutral: T,
        _return: (s: string) => T,
        returnFeature: (f: FeatureTree | undefined, idx: number) => T,
        join: (ts: T[], t: T) => T,
        cacheKey: string
    }): ConstraintRenderer<T> {
    const operatorMap: {[x: string]: string} = {
        [ConstraintType.not]: '\u00AC',
        [ConstraintType.or]: '\u2228',
        [ConstraintType.biimplies]: '\u21D4',
        [ConstraintType.implies]: '\u21D2',
        [ConstraintType.and]: '\u2227'
    };

    const orderMap: {[x: string]: number} = {
        [ConstraintType.error]: -1,
        [ConstraintType.not]: 0,
        [ConstraintType.or]: 3,
        [ConstraintType.biimplies]: 1,
        [ConstraintType.implies]: 2,
        [ConstraintType.and]: 4
    };

    let i = 0;

    const isAtom = (formula: Formula): formula is FormulaAtom => !Array.isArray(formula),
            renderLiteral = (featureModel: FeatureDiagram, atom: FormulaAtom): T => {
            const feature = featureModel.getFeatureTree(atom);
            return returnFeature(feature, i++);
        },
        renderFormula = (featureModel: FeatureDiagram, formula: Formula, parentType: ConstraintType): T => {
        if (isAtom(formula))
            return renderLiteral(featureModel, formula);
        const nodeType = formula[0] as ConstraintType;

        if (nodeType === ConstraintType.not) {
            if (formula.length !== 2)
                throw new Error('invalid negation formula');
            const child = formula[1];
            if (isAtom(child))
                return join([_return(operatorMap[ConstraintType.not]), renderLiteral(featureModel, child)], neutral);
            if (child[0] as ConstraintType === ConstraintType.not)
                return renderFormula(featureModel, child[1], parentType);
        }

        const operands = formula.slice(1).map(child => renderFormula(featureModel, child, nodeType)),
            operator = operatorMap[nodeType];
        
        if (!operator)
            throw new Error(`invalid operator ${nodeType}`);
        if ((nodeType === ConstraintType.not && operands.length !== 1) ||
            (nodeType !== ConstraintType.not && operands.length !== 2))
            throw new Error(`invalid number of operations ${operands.length}`);

        if (nodeType === ConstraintType.and || nodeType === ConstraintType.or ||
            nodeType === ConstraintType.implies || nodeType === ConstraintType.biimplies) {
            const result = join(operands, _return(` ${operator} `)),
                orderParent = orderMap[parentType],
                orderChild = orderMap[nodeType];
            return orderParent > orderChild ||
                (orderParent === orderChild && orderParent === orderMap[ConstraintType.implies])
                ? join([_return('('), result, _return(')')], neutral)
                : result;
        } else
            return join([_return(operator), _return('('), join(operands, _return(', ')), _return(')')], neutral);
    }

    const constraintRenderer = (featureModel: FeatureDiagram, root: Formula) => {
        i = 0;
        return renderFormula(featureModel, root, ConstraintType.error);
    };
    constraintRenderer.cacheKey = cacheKey;
    return constraintRenderer;
}

const stringConstraintRenderer = createConstraintRenderer({
    neutral: '',
    _return: s => s,
    returnFeature: f => f ? f.name : '',
    join: (ts, t) => ts.join(t),
    cacheKey: 'string'
});

export const paletteConstraintRenderer = createConstraintRenderer({
    neutral: '',
    _return: s => s,
    returnFeature: f => f ? f.name : '?',
    join: (ts, t) => ts.join(t),
    cacheKey: 'palette'
});

export class ConstraintNode {
    _renderCache: {[x: string]: any} = {};

    constructor(public constraintData: Constraint,
        public featureModel: FeatureDiagram) {}

    get id(): string {
        return this.constraintData.id;
    }

    get formula(): Formula {
        return this.constraintData.formula;
    }

    render<T>(constraintRenderer: ConstraintRenderer<T>): T {
        return this._renderCache[constraintRenderer.cacheKey] ||
            (this._renderCache[constraintRenderer.cacheKey] =
                constraintRenderer(this.featureModel, this.formula));
    }

    toString(): string {
        return this.render(stringConstraintRenderer);
    }

    getKey(): string {
        return this.id.toString();
    }

    static readFormulaFromString<T>(formulaString: string, featureModel: FeatureDiagram,
        constraintRenderer: ConstraintRenderer<T>): {formula?: Formula, preview?: T} {
        const operatorMap: {[x: string]: string} = {
            "not": ConstraintType.not,
            "or": ConstraintType.or,
            "biimplies": ConstraintType.biimplies,
            "implies": ConstraintType.implies,
            "and": ConstraintType.and,
            "!": ConstraintType.not,
            "~": ConstraintType.not,
            "-": ConstraintType.not,
            "|": ConstraintType.or,
            "||": ConstraintType.or,
            "<=>": ConstraintType.biimplies,
            "<->": ConstraintType.biimplies,
            "=>": ConstraintType.implies,
            "->": ConstraintType.implies,
            "&": ConstraintType.and,
            "&&": ConstraintType.and
        };

        function recurse(sexpr: any): any {
            if (Array.isArray(sexpr))
                return [operatorMap[sexpr[0].toLowerCase()], ...sexpr.slice(1).map(recurse)];
            else if (typeof sexpr === 'string' || sexpr instanceof String) {
                sexpr = sexpr.toString();
                if (featureModel.isValidFeatureID(sexpr))
                    return sexpr;
                const feature = featureModel.getFeatureTreeByName(sexpr);
                return feature ? feature.id : undefined;
            } else
                throw new Error('invalid constraint s-expression');
        }

        for (let i = 0; i < 5; i++) { // try to append some parentheses for "eager" preview
            try {
                let sexpr = SParse(formulaString + ')'.repeat(i));
                if (sexpr instanceof Error) {
                    if (sexpr.message.indexOf('Expected `)`') >= 0)
                        continue;
                    return {};
                }
                sexpr = recurse(sexpr);
                const constraint = new ConstraintNode({
                    id: "", // todo!
                    formula: sexpr
                }, featureModel);
                return {
                    formula: sexpr,
                    preview: constraint.render(constraintRenderer)
                };
            } catch (e) {
                continue;
            }
        }

        return {};
    }
}

class FeatureDiagram {
    collapsedFeatureIDs: string[] = [];
    rootFeatureNode: FeatureNode;
    featureNodes: FeatureNode[];
    actualFeatureNodes: FeatureNode[];
    constraintNodes: ConstraintNode[];
    IDsToFeatureNodes: {[x: string]: FeatureNode} = {};
    IDsToConstraintNodes: {[x: string]: ConstraintNode} = {};

    // feature model as supplied by feature model messages from the server
    constructor(public featureModel: FeatureModel) {
        const {featureTree, constraints} = this.featureModel;
        this.rootFeatureNode = d3Hierarchy(featureTree) as FeatureNode; // todo: does this have x and y? also, add node, isCollapsed, visibleChildren
        this.actualFeatureNodes = this.rootFeatureNode.descendants();
        this.featureNodes = [];

        const isVisible: (node: FeatureNode) => boolean = memoize(node => {
            if (isRoot(node))
                return true;
            if (isCollapsed(node.parent!))
                return false;
            return isVisible(node.parent!);
        }, (node: FeatureNode) => getID(node));

        this.actualFeatureNodes.forEach((node: FeatureNode) => {
            node.actualChildren = node.children || [];

            if (this.collapsedFeatureIDs.find(featureID => getID(node) === featureID))
                node.children = undefined;

            if (isVisible(node))
                this.featureNodes.push(node);

            this.IDsToFeatureNodes[getID(node)] = node;
        });

        this.constraintNodes = constraints.map(constraint => new ConstraintNode(constraint, this));

        this.constraintNodes.forEach((constraintNode: ConstraintNode) =>
            this.IDsToConstraintNodes[constraintNode.id] = constraintNode);
    }

    collapse(collapsedFeatureIDs: string[]): FeatureDiagram {
        this.collapsedFeatureIDs = collapsedFeatureIDs;
        return this;
    }

    getFeatureNode(featureID: string): FeatureNode | undefined {
        return this.IDsToFeatureNodes[featureID];
    }

    getFeatureTree(featureID: string): FeatureTree | undefined {
        const node = this.getFeatureNode(featureID);
        return node ? node.data : undefined;
    }

    getConstraintNode(constraintID: string): ConstraintNode | undefined {
        return this.IDsToConstraintNodes[constraintID];
    }

    isValidFeatureID(featureID: string): boolean {
        return !!this.getFeatureNode(featureID);
    }

    // inefficient for large models and can not guarantee uniqueness
    getFeatureTreeByName(featureName: string): FeatureTree | undefined {
        const results = this.actualFeatureNodes.filter(node =>
            node.data.name.toLowerCase() === featureName.toLowerCase());
        return results.length === 1 ? results[0].data : undefined;
    }

    getFeatureNodes(featureIDs: string[]): FeatureNode[] {
        return featureIDs
            .map(featureID => this.getFeatureNode(featureID))
            .filter(present);
    }

    getFeatureTrees(featureIDs: string[]): FeatureTree[] {
        return featureIDs
            .map(featureID => this.getFeatureTree(featureID))
            .filter(present);
    }

    hasElement(featureID: string): boolean {
        return Array
            .from(document.querySelectorAll('[data-feature-id]'))
            .filter(node => node.getAttribute('data-feature-id') === featureID)
            .length === 1;
    }

    getElement(featureID: string): Element | undefined {
        // Operate under the assumption that we only render ONE feature model, and that it is THIS feature model.
        // This way we don't need to propagate a concrete feature diagram instance.
        const elements = Array
            .from(document.querySelectorAll('[data-feature-id]'))
            .filter(node => node.getAttribute('data-feature-id') === featureID);
        if (elements.length > 1)
            throw new Error(`multiple features "${featureID}" found - ` +
                'getElement supports only one feature model on the page');
        return elements.length === 1 ? elements[0] : undefined;
    }

    static getSvg(): SVGSVGElement {
        // Here we also assume for now that only one SVG is rendered and that is is a feature model.
        const svg = document.querySelectorAll('svg');
        if (svg.length !== 1)
            throw new Error('no SVG feature model found');
        return svg[0];
    }

    static getWidth(settings: Settings): number {
        return getViewportWidth() *
            (settings.views.splitDirection === 'horizontal' ? settings.views.splitAt : 1);
    }

    static getHeight(settings: Settings): number {
        return getViewportHeight() *
            (settings.views.splitDirection === 'vertical' ? settings.views.splitAt : 1);
    }

    getFeatureIDs(): string[] {
        return this.featureNodes.map(getID);
    }

    getActualFeatureIDs(): string[] {
        return this.actualFeatureNodes.map(getID);
    }

    getFeatureIDsWithActualChildren(): string[] {
        return this.actualFeatureNodes.filter(hasActualChildren).map(getID);
    }

    getFeatureIDsBelowWithActualChildren(featureID: string): string[] {
        const node = this.getFeatureNode(featureID);
        return node ? getNodesBelow(node).filter(hasActualChildren).map(getID) : [];
    }

    areSiblingFeatures(featureIDs: string[]): boolean {
        const parents = this
            .getFeatureNodes(featureIDs)
            .map(node => node.parent);
        return parents.every(parent => parent === parents[0]);
    }

    // returns features which, when collapsed, make the feature model fit to the given screen size
    getFittingFeatureIDs(settings: Settings, featureDiagramLayout: FeatureDiagramLayoutType,
        width = FeatureDiagram.getWidth(settings), height = FeatureDiagram.getHeight(settings),
        scale = 0.5): string[] {
        const fontFamily = settings.featureDiagram.font.family,
            fontSize = settings.featureDiagram.font.size,
            widthPadding = 2 * settings.featureDiagram.treeLayout.node.paddingX +
                2 * settings.featureDiagram.treeLayout.node.strokeWidth,
            rectHeight = settings.featureDiagram.font.size +
                2 * settings.featureDiagram.treeLayout.node.paddingY +
                2 * settings.featureDiagram.treeLayout.node.strokeWidth,
            estimatedDimension = featureDiagramLayout === FeatureDiagramLayoutType.verticalTree ? 'width' : 'height';
        let nodes = this.actualFeatureNodes, collapsedFeatureIDs: string[] = [];
        width = Math.max(width, constants.featureDiagram.fitToScreen.minWidth);
        height = Math.max(height, constants.featureDiagram.fitToScreen.minHeight);
        logger.infoBeginCollapsed(() => `[fit to screen] fitting feature model to ${estimatedDimension} ${FeatureDiagramLayoutType.verticalTree ? width : height}px`);

        while (true) {
            const {estimatedSize, collapsibleNodes} = estimateHierarchySize(
                nodes, collapsedFeatureIDs, featureDiagramLayout,
                {fontFamily, fontSize, widthPadding, rectHeight, getID, scale});
            logger.info(() => `estimated ${estimatedDimension} ${Math.round(estimatedSize)}px when collapsing ${JSON.stringify(collapsedFeatureIDs)}`);
    
            if ((featureDiagramLayout === FeatureDiagramLayoutType.verticalTree ? estimatedSize <= width : estimatedSize <= height) ||
                collapsibleNodes.length === 0) {
                logger.info(() => `feature model fitted by collapsing ${collapsedFeatureIDs.length} feature(s)`);
                logger.infoEnd();
                return collapsedFeatureIDs;
            }
    
            const collapsibleNodeIDs = collapsibleNodes.map(getID);
            logger.info(() => `collapsing ${JSON.stringify(collapsibleNodeIDs)}`);
            collapsedFeatureIDs = collapsedFeatureIDs.concat(collapsibleNodeIDs);
            const invisibleNodes = collapsibleNodes
                .map(node => getNodesBelow(node).slice(1))
                .reduce((acc, children) => acc.concat(children), []);
            nodes = nodes.filter(node => !invisibleNodes.includes(node));
        }
    }

    toString() {
        return `FeatureModel ${JSON.stringify(this.getFeatureIDs())}`;
    }
}

export default FeatureDiagram;