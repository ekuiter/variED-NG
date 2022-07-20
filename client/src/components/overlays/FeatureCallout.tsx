/**
 * A Fabric callout that includes information about a feature.
 */

import React from 'react';
import {Callout, DirectionalHint} from '@fluentui/react';
import commands from '../commands';
import {CommandBar} from '@fluentui/react';
import {FeatureDiagramLayoutType} from '../../types';
import FeatureComponent, {FeatureComponentProps, isFeatureOffscreen} from './FeatureComponent';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnRemoveFeatureFunction, OnCreateFeatureBelowFunction, OnCreateFeatureAboveFunction, OnRemoveFeatureSubtreeFunction} from '../../store/types';
import {FeatureNode, FeatureTree} from '../../model/types';

type Props = FeatureComponentProps & {
    onDismiss: () => void,
    isOpen: boolean,
    featureDiagramLayout: FeatureDiagramLayoutType,
    onShowOverlay: OnShowOverlayFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onRemoveFeature: OnRemoveFeatureFunction,
    onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction,
    onCreateFeatureBelow: OnCreateFeatureBelowFunction,
    onCreateFeatureAbove: OnCreateFeatureAboveFunction
};

export default class extends FeatureComponent({doUpdate: true})<Props> {
    renderIfFeatureNode(feature: FeatureNode) {
        const {onDismiss, featureModel} = this.props,
            {gapSpace, width} = this.props.settings.featureDiagram.overlay;
        if (!featureModel.hasElement(feature.data.id))
            return null;
        const element = featureModel.getElement(feature.data.id)!;
        return (
            <Callout target={element.querySelector('.rectAndText')}
                onDismiss={onDismiss}
                hidden={!this.props.isOpen || isFeatureOffscreen(element)}
                gapSpace={gapSpace}
                calloutWidth={width}
                directionalHint={
                    this.props.featureDiagramLayout === FeatureDiagramLayoutType.verticalTree
                        ? DirectionalHint.bottomCenter
                        : DirectionalHint.rightCenter}>
                <div className="callout">
                    <div className="header">
                        <p>{feature.data.name}</p>
                    </div>
                    {feature.data.description
                        ? <div className="inner">
                            <p>{feature.data.description}</p>
                        </div>
                        : <div className="inner empty"/>}
                    <CommandBar
                        items={[
                            commands.featureDiagram.feature.newMenu(feature.data.id, this.props.featureModel, this.props.onCreateFeatureBelow, this.props.onCreateFeatureAbove, onDismiss, true),
                            commands.featureDiagram.feature.removeMenu([feature.data.id], this.props.featureModel, this.props.onRemoveFeature, this.props.onRemoveFeatureSubtree, onDismiss, true),
                            commands.featureDiagram.feature.collapseMenu(
                                [feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                                this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, onDismiss, true),
                        ]}
                        farItems={[
                            commands.featureDiagram.feature.details(feature.data.id, this.props.onShowOverlay)
                        ]}/>
                </div>
            </Callout>
        );
    }
}