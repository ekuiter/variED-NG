/**
 * Horizontal tree layout for feature diagrams.
 */

import AbstractTreeLayout, {AbstractTreeLayoutProps} from './AbstractTreeLayout';
import HorizontalTreeLink from './HorizontalTreeLink';
import HorizontalTreeNode from './HorizontalTreeNode';
import {estimateRectHeight, estimateXOffset, estimateYOffset} from './estimation';
import {FeatureDiagramLayoutType} from '../../../types';
import {FeatureNode} from '../../../model/types';

export default class extends AbstractTreeLayout {
    widestTextOnLayer: any = {};

    constructor(props: AbstractTreeLayoutProps) {
        super(props, HorizontalTreeNode, HorizontalTreeLink);
        this.treeNode.getWidestTextOnLayer = this.getWidestTextOnLayer.bind(this);
    }

    estimateXOffset(sgn: number, estimatedTextWidth: number): number {
        return estimateXOffset(this.props.settings, sgn, estimatedTextWidth, FeatureDiagramLayoutType.horizontalTree);
    }

    estimateYOffset(sgn: number): number {
        return estimateYOffset(this.props.settings, sgn, FeatureDiagramLayoutType.horizontalTree);
    }

    getSeparationFn(_estimateTextWidth: (node: FeatureNode) => number): (a: FeatureNode, b: FeatureNode) => number {
        return () => estimateRectHeight(this.props.settings) +
            this.props.settings.featureDiagram.treeLayout.horizontal.marginY;
    }

    createLayoutHook(nodes: FeatureNode[]): void {
        this.updateWidestTextOnLayer(nodes);
    }

    getWidestTextOnLayer(node: FeatureNode): number {
        // This fixes a bug when removing many nodes at once, and the tree no longer
        // has a node of the specified depth. In that case, we just use the node's
        // estimated width to achieve a smooth transition (this only occurs on node exits).
        if (typeof this.widestTextOnLayer[node.depth] === 'undefined')
            return this.treeNode.estimateTextWidth(node);
        return this.widestTextOnLayer[node.depth];
    }

    updateWidestTextOnLayer(nodes: FeatureNode[]): void {
        this.widestTextOnLayer = {};
        nodes.forEach(node => {
            const estimatedTextWidth = this.treeNode.estimateTextWidth(node);
            if (this.widestTextOnLayer.hasOwnProperty(node.depth))
                this.widestTextOnLayer[node.depth] = Math.max(this.widestTextOnLayer[node.depth], estimatedTextWidth);
            else
                this.widestTextOnLayer[node.depth] = estimatedTextWidth;
        });
    }
}