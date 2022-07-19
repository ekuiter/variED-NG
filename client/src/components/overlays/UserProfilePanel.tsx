import React from 'react';
import i18n from '../../i18n';
import {TextField} from '@fluentui/react';
import logger from '../../helpers/logger';
import {PrimaryButton} from '@fluentui/react';
import {OnSetUserProfileFunction, User} from '../../store/types';
import {Panel, PanelType} from '@fluentui/react';

interface UserProfilePanelProps {
    isOpen: boolean,
    onDismiss: () => void,
    onSetUserProfile: OnSetUserProfileFunction,
    myself: User
};

interface UserProfilePanelState {
    name?: string
};

export default class extends React.Component<UserProfilePanelProps, UserProfilePanelState> {
    state: UserProfilePanelState = {};
   
    getValue = (): string => typeof this.state.name === 'undefined' ? this.props.myself.name || '' : this.state.name;
    onNameChange = (_event: any, name?: string) => this.setState({name});

    onSubmit = () => {
        let name = this.getValue();
        name = name && name.trim();

        if (!name) {
            logger.warn(() => 'no name supplied'); // TODO: better error UI
            return;
        }

        this.props.onSetUserProfile({name});
        this.setState({name: undefined});
        this.props.onDismiss();
    };

    onRenderFooterContent = () =>
        <PrimaryButton onClick={this.onSubmit} text={i18n.t('overlays.userProfilePanel.save')}/>;

    render() {
        const {isOpen, onDismiss} = this.props;

        return (
            <Panel
                type={PanelType.smallFixedFar}
                isOpen={isOpen}
                onDismiss={onDismiss}
                isLightDismiss={true}
                headerText={i18n.t('overlays.userProfilePanel.title')}
                onRenderFooterContent={this.onRenderFooterContent}>
                <TextField
                    label={i18n.t('overlays.userProfilePanel.name')}
                    value={this.getValue()}
                    onChange={this.onNameChange}/>
            </Panel>
        );
    }
}