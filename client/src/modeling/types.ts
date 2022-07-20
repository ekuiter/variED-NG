import {HierarchyPointNode} from 'd3-hierarchy';
import {Point} from '../types';

export enum ConstraintType {
    error = 'error',
    not = 'not',
    or = 'or',
    biimplies = 'biimplies',
    implies = 'implies',
    and = 'and'
};

export enum GroupType {
    and = 'and',
    or = 'or',
    alternative = 'alternative'
};

export type FormulaAtom = ConstraintType | string;
export interface NestedFormula extends Array<NestedFormula | FormulaAtom> {}
export type Formula = FormulaAtom | NestedFormula;

export interface Constraint {
    id: string,
    formula: Formula
};

export interface FeatureModel {
    featureTree: FeatureTree,
    constraints: Constraint[]
};

export interface FeatureTree {
    id: string,
    parentId?: string,
    name: string,
    description?: string,
    isRoot: boolean,
    isAbstract: boolean,
    isHidden: boolean,
    isOptional: boolean,
    isAnd: boolean,
    isOr: boolean,
    isAlternative: boolean,
    isGroup: boolean,
    children: FeatureTree[],
    node: FeatureNode
};

export type FeatureNode = HierarchyPointNode<FeatureTree>;
export type FeaturePropertyKey = string | ((node: FeatureNode) => string);

export type NodeCoordinateFunction = (node: FeatureNode) => number;
export type NodeCoordinateForAxisFunction = (node: FeatureNode, axis: string) => number;
export type NodePointFunction = (node: FeatureNode) => Point;