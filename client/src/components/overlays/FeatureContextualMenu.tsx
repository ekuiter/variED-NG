/**
 * A Fabric contextual menu for a given feature.
 */

import React from 'react';
import {DirectionalHint} from '@fluentui/react';
import {ContextualMenu} from '@fluentui/react';
import commands, {makeDivider} from '../commands';
import {FeatureDiagramLayoutType} from '../../types';
import FeatureComponent, {FeatureComponentProps, isFeatureOffscreen} from './FeatureComponent';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnDeselectAllFeaturesFunction, OnRemoveFeatureFunction, OnCreateFeatureAboveFunction, OnCreateFeatureBelowFunction, OnRemoveFeatureSubtreeFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureOptionalFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction} from '../../store/types';
import {FeatureNode, FeatureTree} from '../../model/types';

type Props = FeatureComponentProps & {
    onDismiss: () => void,
    isOpen: boolean,
    isSelectMultipleFeatures: boolean,
    featureDiagramLayout: FeatureDiagramLayoutType,
    selectedFeatureIDs: string[],
    onShowOverlay: OnShowOverlayFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
    onRemoveFeature: OnRemoveFeatureFunction,
    onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction,
    onCreateFeatureBelow: OnCreateFeatureBelowFunction,
    onCreateFeatureAbove: OnCreateFeatureAboveFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureOptional: OnSetFeatureOptionalFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction
};

export default class extends FeatureComponent({doUpdate: true})<Props> {
    renderIfFeatureNode(feature: FeatureNode) {
        const {
                onDismiss, onDeselectAllFeatures, isSelectMultipleFeatures, selectedFeatureIDs, featureModel
            } = this.props,
            {gapSpace} = this.props.settings.featureDiagram.overlay;
        if (!featureModel.hasElement(feature.data.id))
            return null;
        const element = featureModel.getElement(feature.data.id)!;
        return (
            <ContextualMenu
                target={element.querySelector('.rectAndText')}
                onDismiss={onDismiss}
                hidden={!this.props.isOpen || isFeatureOffscreen(element)}
                isBeakVisible={!isSelectMultipleFeatures}
                gapSpace={isSelectMultipleFeatures ? 2 * gapSpace : gapSpace}
                directionalHint={
                    this.props.featureDiagramLayout === FeatureDiagramLayoutType.verticalTree
                        ? DirectionalHint.bottomCenter
                        : DirectionalHint.rightCenter}
                items={isSelectMultipleFeatures
                    ? commands.featureDiagram.feature.selectionItems(selectedFeatureIDs, onDeselectAllFeatures,
                        this.props.onCollapseFeatures, this.props.onExpandFeatures, this.props.onCollapseFeaturesBelow,
                        this.props.onExpandFeaturesBelow, this.props.onCreateFeatureAbove, this.props.onRemoveFeature,
                        this.props.onRemoveFeatureSubtree, this.props.onSetFeatureAbstract, this.props.onSetFeatureHidden,
                        this.props.onSetFeatureOptional, this.props.onSetFeatureAnd, this.props.onSetFeatureOr,
                        this.props.onSetFeatureAlternative, featureModel!)
                    : [
                        commands.featureDiagram.feature.newMenu(feature.data.id, this.props.featureModel, this.props.onCreateFeatureBelow, this.props.onCreateFeatureAbove, onDismiss),
                        commands.featureDiagram.feature.removeMenu([feature.data.id], this.props.featureModel, this.props.onRemoveFeature, this.props.onRemoveFeatureSubtree, onDismiss),
                        commands.featureDiagram.feature.collapseMenu(
                            [feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                            this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.rename(feature.data.id, this.props.featureModel, this.props.onShowOverlay),
                        commands.featureDiagram.feature.setDescription(feature.data.id, this.props.featureModel, this.props.onShowOverlay),
                        commands.featureDiagram.feature.properties([feature.data.id], this.props.featureModel, this.props.onSetFeatureAbstract,
                            this.props.onSetFeatureHidden, this.props.onSetFeatureOptional, this.props.onSetFeatureAnd,
                            this.props.onSetFeatureOr, this.props.onSetFeatureAlternative, onDismiss),
                        makeDivider(),
                        commands.featureDiagram.feature.details(feature.data.id, this.props.onShowOverlay)
                    ]
                }/>
        );
    }
}
