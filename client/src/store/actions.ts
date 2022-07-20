/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import {deprecated, ActionType, action} from 'typesafe-actions';
import {Message, MessageType, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath, ServerFormatType} from '../types';
import {Dispatch, AnyAction, Action as ReduxAction} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {State} from './types';
import {FeatureTree, Formula} from '../model/types';
import {enqueueOutgoingMessage, flushOutgoingMessageQueue} from '../server/messageQueue';
import deferred from '../helpers/deferred';
import {getCurrentArtifactPath} from '../router';

const { createStandardAction } = deprecated;

export const SERVER_SEND_MESSAGE = 'server/sendMessage';
export const KERNEL_GENERATE_OPERATION = 'kernel/generateOperation';

function createMessageAction<P>(fn: (payload: P) => Message): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            const state = getState(),
                artifactPath = getCurrentArtifactPath(state.sessions),
                message = enqueueOutgoingMessage(fn(payload), artifactPath);
            deferred(flushOutgoingMessageQueue)();
            return dispatch(action(SERVER_SEND_MESSAGE, message));
        };
    };
}

function createOperationAction<P>(makePOSequence: (payload: P, kernel: object) => any): (payload: P) => ThunkAction<Promise<ReduxAction>, State, any, any> {
    return (payload: P) => {
        return async (dispatch: Dispatch<AnyAction>, getState: () => State) => {
            return dispatch(action(KERNEL_GENERATE_OPERATION, {}));
        };
    };
}

const actions = {
    settings: {
        set: createStandardAction('settings/set')<{path: string, value: any}>(),
        reset: createStandardAction('settings/reset')<void>()
    },
    ui: {
        featureDiagram: {
            setLayout: createStandardAction('ui/featureDiagram/setLayout')<{layout: FeatureDiagramLayoutType}>(),
            fitToScreen: createStandardAction('ui/featureDiagram/fitToScreen')<void>(),
            feature: {
                setSelectMultiple: createStandardAction('ui/featureDiagram/feature/setSelectMultiple')<{isSelectMultipleFeatures: boolean}>(),
                select: createStandardAction('ui/featureDiagram/feature/select')<{featureID: string}>(),
                deselect: createStandardAction('ui/featureDiagram/feature/deselect')<{featureID: string}>(),
                selectAll: createStandardAction('ui/featureDiagram/feature/selectAll')<void>(),
                deselectAll: createStandardAction('ui/featureDiagram/feature/deselectAll')<void>(),
                collapse: createStandardAction('ui/featureDiagram/feature/collapse')<{featureIDs: string[]}>(),
                expand: createStandardAction('ui/featureDiagram/feature/expand')<{featureIDs: string[]}>(),
                collapseAll: createStandardAction('ui/featureDiagram/feature/collapseAll')<void>(),
                expandAll: createStandardAction('ui/featureDiagram/feature/expandAll')<void>(),
                collapseBelow: createStandardAction('ui/featureDiagram/feature/collapseBelow')<{featureIDs: string[]}>(),
                expandBelow: createStandardAction('ui/featureDiagram/feature/expandBelow')<{featureIDs: string[]}>()
            }
        },
        overlay: {
            show: createStandardAction('ui/overlay/show')<{overlay: OverlayType, overlayProps: OverlayProps, selectOneFeature?: string}>(),
            hide: createStandardAction('ui/overlay/hide')<{overlay: OverlayType}>()
        }
    },
    server: {
        receive: createStandardAction('server/receiveMessage')<Message>(),
        addArtifact: createMessageAction(({artifactPath, source}: {artifactPath: ArtifactPath, source?: string}) =>
            ({type: MessageType.ADD_ARTIFACT, artifactPath, source})),
        removeArtifact: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) =>
            ({type: MessageType.REMOVE_ARTIFACT, artifactPath})),
        exportArtifact: createMessageAction(({artifactPath, format}: {artifactPath: ArtifactPath, format: ServerFormatType}) =>
            ({type: MessageType.EXPORT_ARTIFACT, artifactPath, format})),
        joinRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.JOIN_REQUEST, artifactPath})),
        leaveRequest: createMessageAction(({artifactPath}: {artifactPath: ArtifactPath}) => ({type: MessageType.LEAVE_REQUEST, artifactPath})),
        undo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        redo: createMessageAction(() => ({type: MessageType.ERROR})), // TODO
        setUserProfile: createMessageAction(({name}: {name: string}) => ({type: MessageType.SET_USER_PROFILE, name})),
        reset: createMessageAction(() => ({type: MessageType.RESET})),
        featureDiagram: {
            feature: {
                createBelow: createMessageAction(({featureParentID}: {featureParentID: string}) => ({type: MessageType.OPERATION_FEATURE_CREATE_BELOW, featureParentID})),
                
                createAbove: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) => null),
                
                remove: createMessageAction(({featureIDs}: {featureIDs: string[]}) => ({type: MessageType.OPERATION_FEATURE_REMOVE, featureIDs})),
                
                removeSubtree: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) => null),

                moveSubtree: createOperationAction(({featureID, featureParentID}: {featureID: string, featureParentID: string}, kernel) => null),
                
                setName: createOperationAction(({featureID, name}: {featureID: string, name: string}, kernel) => null),

                setDescription: createOperationAction(({featureID, description}: {featureID: string, description: string}, kernel) => null),

                properties: {
                    setAbstract: createOperationAction(({featureIDs, value}: {featureIDs: string[], value: boolean}, kernel) => null),

                    setHidden: createOperationAction(({featureIDs, value}: {featureIDs: string[], value: boolean}, kernel) => null),

                    setOptional: createOperationAction(({featureIDs, value}: {featureIDs: string[], value: boolean}, kernel) => null),

                    toggleOptional: createOperationAction(({feature}: {feature: FeatureTree}, kernel) => null),
                        
                    setAnd: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) => null),

                    setOr: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) => null),

                    setAlternative: createOperationAction(({featureIDs}: {featureIDs: string[]}, kernel) => null),
                    
                    toggleGroup: createOperationAction(({feature}: {feature: FeatureTree}, kernel) => null),
                }
            },

            constraint: {
                create: createOperationAction(({formula}: {formula: Formula}, kernel) => null),
                
                set: createOperationAction(({constraintID, formula}: {constraintID: string, formula: Formula}, kernel) => null),

                remove: createOperationAction(({constraintID}: {constraintID: string}, kernel) => null),
            }
        }
    }
};

export default actions;
export type Action = ActionType<typeof actions>;