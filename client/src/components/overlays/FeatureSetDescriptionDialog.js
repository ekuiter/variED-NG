import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';
import PropTypes from 'prop-types';
import {FeatureModelType} from '../../server/FeatureModel';

const FeatureSetDescriptionDialog = ({featureName, featureModel, ...props}) => {
    const feature = featureModel && featureModel.getFeatureOrDismiss(featureName, props.isOpen, props.onDismiss);
    if (!feature)
        return null;
    return (
        <TextFieldDialog
            {...props}
            title={i18n.t('dialogs.featureSetDescriptionDialog.title')}
            submitText={i18n.t('dialogs.featureSetDescriptionDialog.rename')}
            defaultValue={feature.description}
            onSubmit={description => actions.server.feature.setDescription(featureName, description)}
            submitOnEnter={false}
            styles={{
                main: {
                    selectors: {
                        '@media (min-width: 480px)': {minWidth: 400, maxWidth: 500},
                        '@media (min-width: 720px)': {minWidth: 500, maxWidth: 600}
                    }
                }
            }}
            textFieldProps={{multiline: true, rows: 5}}/>
    );
};

FeatureSetDescriptionDialog.propTypes = {
    onDismiss: PropTypes.func.isRequired,
    featureModel: FeatureModelType.isRequired,
    featureName: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default FeatureSetDescriptionDialog;