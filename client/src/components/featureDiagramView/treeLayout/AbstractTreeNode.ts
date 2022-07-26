/**
 * Nodes for the abstract tree layout.
 */

import {Settings} from '../../../store/settings';
import measureTextWidth from '../../../helpers/measureTextWidth';
import {addStyle, appendCross, drawCircle, translateTransform, StyleDescriptor, attrs} from '../../../helpers/svg';
import styles from './styles';
import {isCommand} from '../../../helpers/withKeys';
import {OverlayType, Rect, D3Selection, Point} from '../../../types';
import {OnShowOverlayFunction, OnExpandFeaturesFunction, OnToggleFeatureGroupTypeFunction} from '../../../store/types';
import {FeatureNode} from '../../../model/types';
import {getNumberOfFeaturesBelow, isCollapsed} from '../../../model/FeatureDiagram';

// declare class AbstractTreeLink {
//     collapseAnchor(_node: FeatureNode): Partial<Point>;
//     drawGroup(arcSegment: D3Selection, arcSlice: D3Selection, arcClick: D3Selection): void;
// }

function widenBbox({x, y, width, height}: Rect, paddingX: number, paddingY: number): Rect {
    return {x: x - paddingX, y: y - paddingY, width: width + 2 * paddingX, height: height + 2 * paddingY};
}

function makeRect(settings: Settings, textBbox: Rect): Rect {
    const nodeSettings = settings.featureDiagram.treeLayout.node;
    return widenBbox(
        textBbox,
        nodeSettings.paddingX + nodeSettings.strokeWidth,
        nodeSettings.paddingY + nodeSettings.strokeWidth);
}

function addFontStyle(selection: D3Selection, settings: Settings, scale = 1): void {
    selection
        .attr('font-family', settings.featureDiagram.font.family)
        .attr('font-size', settings.featureDiagram.font.size * scale);
}

function makeText(settings: Settings, selection: D3Selection, isGettingRectInfo: boolean, textStyle: StyleDescriptor): Rect | Rect[] | undefined {
    if (isGettingRectInfo) {
        let rectInfo = undefined;
        selection.append('text')
            .call(addFontStyle, settings)
            .text('some text used to determine rect y and height')
            .each(function(this: SVGGraphicsElement) {
                rectInfo = makeRect(settings, this.getBBox());
            }).remove();
        return rectInfo;
    } else {
        const bboxes: Rect[] = [];
        selection.append('text')
            .call(addFontStyle, settings)
            .text((d: FeatureNode) => d.data.name)
            .call(addStyle, textStyle, styles.node.hidden(settings))
            .each(function(this: SVGGraphicsElement) {
                bboxes.push(this.getBBox());
            });
        return bboxes;
    }
}

export default class {
    rectInfo: any;
    treeLink: any;
    getWidestTextOnLayer: any;
    // rectInfo: Rect;
    // treeLink: AbstractTreeLink;
    // getWidestTextOnLayer: (node: FeatureNode) => number;

    constructor(public settings: Settings, public isSelectMultipleFeatures: boolean, public debug: boolean,
        public setActiveNode: (overlay: OverlayType | 'select', activeNode: FeatureNode) => void,
        public onShowOverlay: OnShowOverlayFunction, public onExpandFeatures: OnExpandFeaturesFunction,
        public onToggleFeatureGroupType: OnToggleFeatureGroupTypeFunction) {}

    x(_node: FeatureNode): number {
        throw new Error('abstract method not implemented');
    }

    y(_node: FeatureNode): number {
        throw new Error('abstract method not implemented');
    }

    getTextStyle(): StyleDescriptor {
        throw new Error('abstract method not implemented');
    }

    createSvgHook(g: D3Selection): void {
        this.rectInfo = makeText(this.settings, g, true, this.getTextStyle()) as Rect;
    }

    enter(node: D3Selection): D3Selection {
        const nodeEnter = node.append('g')
                .attr('class', 'node')
                .attr('data-feature-id', (d: FeatureNode) => d.data.id)
                .call(translateTransform, (d: FeatureNode) => this.x(d), (d: FeatureNode) => this.y(d))
                .attr('opacity', 0),
            rectAndText = nodeEnter.append('g')
                .attr('class', 'rectAndText')
                .on('click', (event, d: FeatureNode) => this.setActiveNode(isCommand(event) ? 'select' : OverlayType.featureCallout, d))
                .on('contextmenu', (event, d: FeatureNode) => {
                    event.preventDefault();
                    this.setActiveNode(isCommand(event) ? 'select' : OverlayType.featureContextualMenu, d);
                })
                .on('dblclick', (d: FeatureNode) => {
                    if (!this.isSelectMultipleFeatures)
                        this.onShowOverlay({overlay: OverlayType.featurePanel, overlayProps: {featureID: d.data.id}});
                });

        let bboxes = makeText(this.settings, rectAndText, false, this.getTextStyle()) as Rect[];

        let i = 0;
        
        attrs(rectAndText.insert('rect', 'text'), () => makeRect(this.settings, bboxes[i++]))
            .call(addStyle, styles.node.abstract(this.settings));

        const arcSegment = nodeEnter.insert('path', 'g.rectAndText')
                .attr('class', 'arcSegment')
                .call(addStyle, styles.node.arcSegment(this.settings)),
            arcSlice = nodeEnter.insert('path', 'g.rectAndText')
                .attr('class', 'arcSlice')
                .call(addStyle, styles.node.arcSlice(this.settings)),
            arcClick = nodeEnter.append('path')
                .attr('class', 'arcClick')
                .call(addStyle, styles.node.arcClick(this.settings))
                .on('dblclick', (d: FeatureNode) => this.onToggleFeatureGroupType({feature: d.data}));
        this.treeLink.drawGroup(arcSegment, arcSlice, arcClick);

        const expandFeature = (d: FeatureNode) => isCollapsed(d) && this.onExpandFeatures({featureIDs: [d.data.id]});
        i = 0;
        bboxes = [];
        attrs(nodeEnter.insert('text', 'path.arcClick')
            .call(addFontStyle, this.settings)
            .attr('fill', this.settings.featureDiagram.treeLayout.node.visibleFill)
            .attr('class', 'collapse')
            .attr('text-anchor', 'middle'), (d: FeatureNode) => this.treeLink.collapseAnchor(d))
            .call(addStyle, styles.node.collapseText(this.settings))
            .text((d: FeatureNode) => getNumberOfFeaturesBelow(d))
            .attr('opacity', 0)
            .each(function(this: SVGGraphicsElement) {
                bboxes.push(this.getBBox());
            })
            .on('dblclick', expandFeature);

        nodeEnter.insert('circle', 'text.collapse');
        nodeEnter.call(drawCircle, 'circle', {
            center: () => {
                const bbox = bboxes[i++];
                return {x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2};
            },
            style: styles.node.collapseCircle(this.settings),
            radius: 0,
            fn: (circle: D3Selection) => circle.on('dblclick', expandFeature)
        });

        if (this.debug) {
            appendCross(nodeEnter);
            const addDebugText = (text: (d: FeatureNode) => string, y: number) => {
                nodeEnter.append('text')
                    .call(addFontStyle, this.settings, 0.3)
                    .text(text)
                    .call(addStyle, this.getTextStyle())
                    .attr('opacity', 0.5)
                    .attr('y', y);
            };
            addDebugText(d => d.data.id.substr(0, 19), 6);
            addDebugText(d => d.data.id.substr(19), 11);
        }

        return nodeEnter;
    }

    update(node: D3Selection): void {
        node.call(translateTransform, (d: FeatureNode) => this.x(d), (d: FeatureNode) => this.y(d))
            .attr('opacity', 1);
        node.select('g.rectAndText rect').call(addStyle, styles.node.abstract(this.settings));
        node.select('g.rectAndText text').call(addStyle, styles.node.hidden(this.settings));
        node.select('text.collapse')
            .text((d: FeatureNode) => getNumberOfFeaturesBelow(d))
            .attr('cursor', (d: FeatureNode) => isCollapsed(d) ? 'pointer' : null)
            .attr('opacity', (d: FeatureNode) => isCollapsed(d) ? 1 : 0);
        node.select('circle').attr('r', (d: FeatureNode) =>
            isCollapsed(d) ? this.settings.featureDiagram.font.size : 0);
        this.treeLink.drawGroup(node.select('path.arcSegment'), node.select('path.arcSlice'), node.select('path.arcClick'));
    }

    exit(node: D3Selection): void {
        node.attr('opacity', 0).remove();
    }

    estimateTextWidth(node: FeatureNode): number {
        return measureTextWidth(
            this.settings.featureDiagram.font.family,
            this.settings.featureDiagram.font.size,
            node.data.name);
    }
}