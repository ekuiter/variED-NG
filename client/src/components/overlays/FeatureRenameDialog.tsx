/**
 * A Fabric dialog for renaming a feature.
 */

import React from 'react';
import i18n from '../../i18n';
import {TextFieldDialog} from '../../helpers/Dialog';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {FeatureTree} from '../../modeling/types';
import {OnSetFeatureNameFunction} from '../../store/types';
import {preconditions} from '../../modeling/preconditions';

type Props = FeatureComponentProps & {
    isOpen: boolean,
    onDismiss: () => void,
    onSetFeatureName: OnSetFeatureNameFunction
};

export default class extends FeatureComponent()<Props> {
    renderIfFeature(feature: FeatureTree) {
        return (
            <TextFieldDialog
                isOpen={this.props.isOpen}
                onDismiss={this.props.onDismiss}
                title={i18n.t('overlays.featureRenameDialog.title')}
                submitText={i18n.t('overlays.featureRenameDialog.rename')}
                defaultValue={feature.name}
                onSubmit={newFeatureName => {
                    if (newFeatureName && feature.name !== newFeatureName &&
                        preconditions.featureDiagram.feature.setName(feature.id, this.props.featureModel))
                        this.props.onSetFeatureName({featureID: feature.id, name: newFeatureName});
                    else
                        ;//TODO: show error
                }}/>
        );
    }
}