import React from 'react';
import {shallow} from 'enzyme';
import FeatureSetDescriptionDialog from './FeatureSetDescriptionDialog';
import FeatureModel from '../../server/FeatureModel';
import {validFeatureModel} from '../../fixtures';
import {TextFieldDialog} from '../../helpers/Dialog';
import actions from '../../store/actions';

jest.mock('../../store/actions');

describe('FeatureSetDescriptionDialog', () => {
    let featureSetDescriptionDialog: JSX.Element;

    beforeEach(() => {
        const featureModel = new FeatureModel(validFeatureModel, []),
            mock = jest.fn();
        featureSetDescriptionDialog = (
            <FeatureSetDescriptionDialog
                isOpen={true}
                onDismiss={mock}
                featureModel={featureModel}
                featureName="FeatureIDE"/>
        );
    });

    it('renders a dialog for setting a feature\'s description', () => {
        const wrapper = shallow(featureSetDescriptionDialog);
        expect(wrapper.find(TextFieldDialog).prop('defaultValue')).toBe('A sample description');
    });

    it('triggers a rename if a new name is entered', () => {
        const wrapper = shallow(featureSetDescriptionDialog);
        actions.server.featureDiagram.feature.setDescription.mockClear();
        wrapper.find(TextFieldDialog).simulate('submit', 'new description');
        expect(actions.server.featureDiagram.feature.setDescription).lastCalledWith('FeatureIDE', 'new description');
    });
});