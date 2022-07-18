/**
 * A Fabric panel that contains further information about the application.
 */

import React from 'react';
import i18n from '../../i18n';
import {Panel, PanelType} from '@fluentui/react';

export default ({isOpen, onDismiss}: {isOpen: boolean, onDismiss: () => void}) => (
    <Panel
        isOpen={isOpen}
        type={PanelType.smallFixedFar}
        onDismiss={onDismiss}
        isLightDismiss={true}
        headerText={i18n.t('overlays.aboutPanel.title')}>
        {i18n.getElement('overlays.aboutPanel.content')}
    </Panel>
);