import messageReducer from '../server/messageReducer';
import {combineReducers} from 'redux';
import constants from '../constants';
import {defaultSettings, getNewSettings, isSettingsResetAction, isSettingsSetAction} from './settings';
import {actionTypes} from './actions';

function serverReducer(state = {}, action) {
    if (constants.server.isMessageType(action.type))
        return messageReducer(state, action);
    return state;
}

function settingsReducer(state = defaultSettings, action) {
    if (isSettingsSetAction(action))
        return getNewSettings(state, action.path, action.value);
    if (isSettingsResetAction(action))
        return defaultSettings;
    return state;
}

function uiReducer(state = constants.store.initialUi, action) {
    if (action.type === actionTypes.UI_SET_FEATURE_DIAGRAM_LAYOUT)
        return {...state, featureDiagramLayout: action.featureDiagramLayout};
    if (action.type === actionTypes.UI_SHOW_PANEL)
        return {...state, panel: action.panel, panelProps: action.panelProps};
    if (action.type === actionTypes.UI_SHOW_DIALOG)
        return {...state, dialog: action.dialog, dialogProps: action.dialogProps};
    return state;
}

export default combineReducers({server: serverReducer, settings: settingsReducer, ui: uiReducer});