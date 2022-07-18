/**
 * A Fabric panel that shows details for a feature and available operations.
 */

import React from 'react';
import {Panel, PanelType} from '@fluentui/react';
import i18n from '../../i18n';
import {CommandBar, ICommandBarItemProps} from '@fluentui/react';
import commands from '../commands';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {Feature} from '../../modeling/types';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnRemoveFeatureFunction, OnCreateFeatureBelowFunction, OnCreateFeatureAboveFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureOptionalFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction, OnRemoveFeatureSubtreeFunction} from '../../store/types';

type Props = FeatureComponentProps & {
    onDismiss: () => void,
    isOpen: boolean,
    onShowOverlay: OnShowOverlayFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
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

const buttonStyles = {root: {backgroundColor: 'transparent'}},
    transparentItems = (items: ICommandBarItemProps[]) => items;

export default class extends FeatureComponent()<Props> {
    onRenderFooterContent = () => (
        <CommandBar
            items={transparentItems([
                commands.featureDiagram.feature.newMenu(this.props.featureID!, this.props.featureModel, this.props.onCreateFeatureBelow, this.props.onCreateFeatureAbove, this.props.onDismiss, true),
                commands.featureDiagram.feature.removeMenu([(this as any).feature.ID], this.props.featureModel, this.props.onRemoveFeature, this.props.onRemoveFeatureSubtree, this.props.onDismiss, true)
            ])}
            overflowItems={[
                commands.featureDiagram.feature.collapseMenu(
                    [(this as any).feature], this.props.onCollapseFeatures, this.props.onExpandFeatures,
                    this.props.onCollapseFeaturesBelow, this.props.onExpandFeaturesBelow, this.props.onDismiss),
                commands.featureDiagram.feature.rename(this.props.featureID!, this.props.featureModel, this.props.onShowOverlay),
                commands.featureDiagram.feature.setDescription(this.props.featureID!, this.props.featureModel, this.props.onShowOverlay),
                commands.featureDiagram.feature.properties([(this as any).feature.ID], this.props.featureModel, this.props.onSetFeatureAbstract,
                    this.props.onSetFeatureHidden, this.props.onSetFeatureOptional, this.props.onSetFeatureAnd,
                    this.props.onSetFeatureOr, this.props.onSetFeatureAlternative, this.props.onDismiss)
            ]}
            overflowButtonProps={{styles: buttonStyles}}
            styles={{root: {margin: '0 -40px', padding: '0 35px'}}}/>
    );

    renderIfFeature(feature: Feature) {
        return (
            <Panel
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismiss={this.props.onDismiss}
                isLightDismiss={true}
                headerText={
                    <span>
                        {i18n.t('overlays.featurePanel.title')}: <strong>{feature.name}</strong>
                    </span> as any}
                onRenderFooterContent={this.onRenderFooterContent}>
                <p>{feature.description || <em>{i18n.t('overlays.featurePanel.noDescriptionSet')}</em>}</p>
            </Panel>
        );
    }
}