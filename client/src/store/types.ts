import FeatureDiagram from '../model/FeatureDiagram';
import {defaultSettings, Settings} from './settings';
import {Message, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {FeatureTree, Formula, FeatureModel} from '../model/types';

export interface User {
    userID: string,
    name: string
};

export interface Session {
    artifactPath: ArtifactPath,
    users: User[]
};

export interface FeatureDiagramSession extends Session {
    kernelFeatureModel: FeatureModel,
    layout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureIDs: string[],
    collapsedFeatureIDs: string[]
};

export interface State {
    settings: Settings,
    overlay: OverlayType,
    overlayProps: OverlayProps
    myself?: User,
    sessions: Session[],
    artifactPaths: ArtifactPath[]
};

export const initialState: State = {
    settings: defaultSettings,
    overlay: OverlayType.none,
    overlayProps: {},
    myself: undefined,
    sessions: [],
    artifactPaths: []
};

export const initialFeatureDiagramSessionState =
    (artifactPath: ArtifactPath, kernelFeatureModel: FeatureModel):
    FeatureDiagramSession => ({
        artifactPath,
        users: [],
        kernelFeatureModel,
        layout: FeatureDiagramLayoutType.verticalTree,
        isSelectMultipleFeatures: false,
        selectedFeatureIDs: [],
        collapsedFeatureIDs: []
    });

export type OnSelectFeatureFunction = (payload: {featureID: string}) => void;
export type OnDeselectFeatureFunction = (payload: {featureID: string}) => void;
export type OnSelectAllFeaturesFunction = () => void;
export type OnDeselectAllFeaturesFunction = () => void;
export type OnCollapseAllFeaturesFunction = () => void;
export type OnExpandAllFeaturesFunction = () => void;
export type OnSetFeatureDiagramLayoutFunction = (payload: {layout: FeatureDiagramLayoutType}) => void;
export type OnSetSelectMultipleFeaturesFunction = (payload: {isSelectMultipleFeatures: boolean}) => void;
export type OnCollapseFeaturesFunction = (payload: {featureIDs: string[]}) => void;
export type OnExpandFeaturesFunction = (payload: {featureIDs: string[]}) => void;
export type OnCollapseFeaturesBelowFunction = (payload: {featureIDs: string[]}) => void;
export type OnExpandFeaturesBelowFunction = (payload: {featureIDs: string[]}) => void;
export type OnShowOverlayFunction = (payload: {overlay: OverlayType, overlayProps: OverlayProps, selectOneFeatureID?: string}) => void;
export type OnHideOverlayFunction = (payload: {overlay: OverlayType}) => void;
export type OnFitToScreenFunction = () => void;
export type OnSetSettingFunction = (payload: {path: string, value: any}) => void;
export type OnResetSettingsFunction = () => void;

export type OnAddArtifactFunction = (payload: {artifactPath: ArtifactPath, source?: string}) => Promise<void>;
export type OnRemoveArtifactFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnJoinRequestFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnLeaveRequestFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnUndoFunction = () => Promise<void>;
export type OnRedoFunction = () => Promise<void>;
export type OnCreateFeatureBelowFunction = (payload: {featureParentID: string}) => Promise<void>;
export type OnCreateFeatureAboveFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnRemoveFeatureFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnRemoveFeatureSubtreeFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnMoveFeatureSubtreeFunction = (payload: {featureID: string, featureParentID: string}) => Promise<void>;
export type OnSetFeatureNameFunction = (payload: {featureID: string, name: string}) => Promise<void>;
export type OnSetFeatureDescriptionFunction = (payload: {featureID: string, description: string}) => Promise<void>;
export type OnSetFeatureAbstractFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureHiddenFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureOptionalFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnToggleFeatureOptionalFunction = (payload: {feature: FeatureTree}) => Promise<void>;
export type OnSetFeatureAndFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureOrFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureAlternativeFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnCreateConstraintFunction = (payload: {formula: Formula}) => Promise<void>;
export type OnSetConstraintFunction = (payload: {constraintID: string, formula: Formula}) => Promise<void>;
export type OnRemoveConstraintFunction = (payload: {constraintID: string}) => Promise<void>;
export type OnToggleFeatureGroupTypeFunction = (payload: {feature: FeatureTree}) => Promise<void>;
export type OnSetUserProfileFunction = (payload: {name: string}) => Promise<void>;
export type OnResetFunction = () => Promise<void>;

// Props that may derived from the state to use in React components.
// This enforces the convention that a prop called 'on...' has the same type in all components.
export type StateDerivedProps = Partial<{
    handleMessage: (message: Message) => void,
    currentArtifactPath: ArtifactPath,
    artifactPaths: ArtifactPath[],
    sessions: Session[],
    myself: User,
    users: User[],
    settings: Settings,
    featureDiagramLayout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureIDs: string[],
    featureModel: FeatureDiagram,
    overlay: OverlayType,
    overlayProps: OverlayProps,

    onSelectFeature: OnSelectFeatureFunction,
    onDeselectFeature: OnDeselectFeatureFunction,
    onSelectAllFeatures: OnSelectAllFeaturesFunction,
    onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
    onCollapseAllFeatures: OnCollapseAllFeaturesFunction,
    onExpandAllFeatures: OnExpandAllFeaturesFunction,
    onSetFeatureDiagramLayout: OnSetFeatureDiagramLayoutFunction,
    onSetSelectMultipleFeatures: OnSetSelectMultipleFeaturesFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onShowOverlay: OnShowOverlayFunction,
    onHideOverlay: OnHideOverlayFunction,
    onFitToScreen: OnFitToScreenFunction,
    onSetSetting: OnSetSettingFunction,
    onResetSettings: OnResetSettingsFunction,

    onAddArtifact: OnAddArtifactFunction,
    onRemoveArtifact: OnRemoveArtifactFunction,
    onJoinRequest: OnJoinRequestFunction,
    onLeaveRequest: OnLeaveRequestFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction,
    onCreateFeatureBelow: OnCreateFeatureBelowFunction,
    onCreateFeatureAbove: OnCreateFeatureAboveFunction,
    onRemoveFeature: OnRemoveFeatureFunction,
    onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction,
    onMoveFeatureSubtree: OnMoveFeatureSubtreeFunction,
    onSetFeatureName: OnSetFeatureNameFunction,
    onSetFeatureDescription: OnSetFeatureDescriptionFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureOptional: OnSetFeatureOptionalFunction,
    onToggleFeatureOptional: OnToggleFeatureOptionalFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction,
    onCreateConstraint: OnCreateConstraintFunction,
    onSetConstraint: OnSetConstraintFunction,
    onRemoveConstraint: OnRemoveConstraintFunction,
    onToggleFeatureGroupType: OnToggleFeatureGroupTypeFunction,
    onSetUserProfile: OnSetUserProfileFunction,
    onReset: OnResetFunction
}>;