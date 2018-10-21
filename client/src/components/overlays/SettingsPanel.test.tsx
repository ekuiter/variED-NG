import React from 'react';
import {shallow} from 'enzyme';
import SettingsPanel, {Setting} from './SettingsPanel';
import {defaultSettings, getNewSettings, getSetting} from '../../store/settings';
import {FeatureDiagramLayoutType} from '../../types';
import {Panel} from 'office-ui-fabric-react/lib/Panel';
import {DefaultButton} from 'office-ui-fabric-react/lib/Button';
import {ColorPicker} from 'office-ui-fabric-react/lib/ColorPicker';
import {Slider} from 'office-ui-fabric-react/lib/Slider';
import i18n from '../../i18n';

describe('Setting', () => {
    // can not use toHaveReturnedWith() until Jest 23
    // TODO: wait for create-react-app update
    let newSetting: any;
    const onSetSetting = jest.fn(({path, value}: {path: string, value: any}) =>
        newSetting = getSetting(getNewSettings(defaultSettings, path, value), path));
    afterEach(() => newSetting = undefined);

    describe('Toggle', () => {
        it('toggles a setting', () => {
            const wrapper = shallow(<Setting.Toggle
                    settings={defaultSettings}
                    onSetSetting={onSetSetting}
                    path="debug"/>),
                oldValue = wrapper.prop('checked');
            wrapper.simulate('click');
            expect(newSetting).toBe(!oldValue);
        });
    });

    describe('FontComboBox', () => {
        it('sets a font', () => {
            const wrapper = shallow(<Setting.FontComboBox
                settings={defaultSettings}
                onSetSetting={onSetSetting}
                path="featureDiagram.font.family"/>);
            wrapper.simulate('change', 'Times New Roman');
            expect(newSetting).toBe('Times New Roman');
        });
    });

    describe('SpinButton', () => {
        it('sets a number', () => {
            const wrapper = shallow(<Setting.SpinButton
                settings={defaultSettings}
                onSetSetting={onSetSetting}
                path="featureDiagram.font.size"
                suffix=" px" min={10} max={50}/>);
            wrapper.simulate('change', 42);
            expect(newSetting).toBe(42);
        });
    });

    describe('ColorPickerContextualMenu', () => {
        it('sets a color', () => {
            const wrapper = shallow(<Setting.ColorPickerContextualMenu
                settings={defaultSettings}
                onSetSetting={onSetSetting}
                paths={['featureDiagram.treeLayout.node.visibleFill']}/>);
            wrapper.simulate('render', {key: 'featureDiagram.treeLayout.node.visibleFill'});
            wrapper.find(ColorPicker).simulate('colorChanged', '#c0ffee');
            wrapper.simulate('apply', {key: 'featureDiagram.treeLayout.node.visibleFill'});
            expect(newSetting).toBe('#c0ffee');
        });
    });

    describe('Slider', () => {
        it('sets a number', () => {
            jest.useFakeTimers();
            const wrapper = shallow(<Setting.Slider
                settings={defaultSettings}
                onSetSetting={onSetSetting}
                path="featureDiagram.treeLayout.transitionDuration"
                min={0} max={100} step={1}/>);
            wrapper.find(Slider).simulate('change', 42);
            expect(newSetting).not.toBe(42);
            jest.runAllTimers();
            expect(newSetting).toBe(42);
        });
    });
});

describe('SettingsPanel', () => {
    const mock = jest.fn(),
        settingsPanel = (featureDiagramLayout: FeatureDiagramLayoutType) => shallow(
            <SettingsPanel
                isOpen={true}
                onDismissed={mock}
                settings={defaultSettings}
                onSetSetting={mock}
                onResetSettings={mock}
                featureDiagramLayout={featureDiagramLayout}/>
        );

    it('displays different settings depending on the layout', () => {
        expect(settingsPanel(FeatureDiagramLayoutType.verticalTree).find(Panel)
            .contains(i18n.t('overlays.settingsPanel.headings.verticalTree'))).toBe(true);
        expect(settingsPanel(FeatureDiagramLayoutType.horizontalTree).find(Panel)
            .contains(i18n.t('overlays.settingsPanel.headings.horizontalTree'))).toBe(true);
    });

    it('resets settings', () => {
        const wrapper = settingsPanel(FeatureDiagramLayoutType.verticalTree),
            resetButton = (wrapper: any) => wrapper.find(DefaultButton).first();
        expect(resetButton(wrapper).prop('disabled')).toBe(true);
        
        wrapper.find(Panel).find(Setting.SpinButton).first()
            .simulate('setSetting', 'featureDiagram.font.size', 'Arial');
        expect(resetButton(wrapper).prop('disabled')).toBe(false);

        resetButton(wrapper).simulate('click');
        expect(resetButton(wrapper).prop('disabled')).toBe(true);
    });
});