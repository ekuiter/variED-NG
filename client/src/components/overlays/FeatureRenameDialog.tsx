/**
 * A Fabric dialog for renaming a feature.
 */

import React from 'react';
import i18n from '../../i18n';
import {TextFieldDialog} from '../../helpers/Dialog';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {FeatureNode, FeatureTree} from '../../model/types';
import {OnSetFeatureNameFunction} from '../../store/types';
import {preconditions} from '../../model/preconditions';

type Props = FeatureComponentProps & {
    isOpen: boolean,
    onDismiss: () => void,
    onSetFeatureName: OnSetFeatureNameFunction
};

export default class extends FeatureComponent()<Props> {
    renderIfFeatureNode(feature: FeatureNode) {
        return (
            <TextFieldDialog
                isOpen={this.props.isOpen}
                onDismiss={this.props.onDismiss}
                title={i18n.t('overlays.featureRenameDialog.title')}
                submitText={i18n.t('overlays.featureRenameDialog.rename')}
                defaultValue={feature.data.name}
                onSubmit={newFeatureName => {
                    if (newFeatureName && feature.data.name !== newFeatureName &&
                        preconditions.featureDiagram.feature.setName(feature.data.id, this.props.featureModel))
                        this.props.onSetFeatureName({featureID: feature.data.id, name: newFeatureName});
                    else
                        ;//TODO: show error
                }}/>
        );
    }
}