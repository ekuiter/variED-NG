import FeatureModel from '../modeling/FeatureModel';
import {defaultSettings, Settings} from './settings';
import {Message, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {Feature, KernelConstraintFormula, KernelCombinedEffect, KernelConflictDescriptor} from '../modeling/types';

export interface Collaborator {
    siteID: string,
    name: string
};

export interface CollaborativeSession {
    artifactPath: ArtifactPath,
    collaborators: Collaborator[]
};

export type KernelContext = object;
export type KernelData = any;

export interface Votes {
    [siteID: string]: string
};

export interface FeatureDiagramCollaborativeSession extends CollaborativeSession {
    kernelContext: KernelContext,
    kernelCombinedEffect: KernelCombinedEffect,
    layout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureIDs: string[],
    collapsedFeatureIDs: string[],
    voterSiteIDs?: string[],
    votes: Votes,
    transitionResolutionOutcome?: string,
    transitionConflictDescriptor?: KernelConflictDescriptor
};

export interface State {
    settings: Settings,
    overlay: OverlayType,
    overlayProps: OverlayProps
    myself?: Collaborator,
    collaborativeSessions: CollaborativeSession[],
    artifactPaths: ArtifactPath[]
};

export const initialState: State = {
    settings: defaultSettings,
    overlay: OverlayType.none,
    overlayProps: {},
    myself: undefined,
    collaborativeSessions: [


        <any> {
            "artifactPath": {
              "project": "Examples",
              "artifact": "Car"
            },
            "collaborators": [],
            "kernelContext": {} as any,
            "kernelCombinedEffect": {
              "features": {
                "939d00f4-1f45-4dfe-b1d2-00e877a22d0f": {
                  "description": null,
                  "name": "Manual",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "217087c3-b6b9-47dc-9076-4e15002df368",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "939d00f4-1f45-4dfe-b1d2-00e877a22d0f"
                },
                "1ad8ed8d-a392-4ef7-a6f6-aa6ecaf07f60": {
                  "description": null,
                  "name": "Bluetooth",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "6a7bc9df-177e-4675-a27e-54d7293e4d10",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "1ad8ed8d-a392-4ef7-a6f6-aa6ecaf07f60"
                },
                "241feb05-f1f2-471d-ad9b-f8ab96156767": {
                  "description": null,
                  "name": "Navigation",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "6a7bc9df-177e-4675-a27e-54d7293e4d10",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "241feb05-f1f2-471d-ad9b-f8ab96156767"
                },
                "47f3869f-cd3b-4313-a050-28890c414c7c": {
                  "description": null,
                  "name": "Ports",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "6a7bc9df-177e-4675-a27e-54d7293e4d10",
                  "abstract?": false,
                  "group-type": "or",
                  "ID": "47f3869f-cd3b-4313-a050-28890c414c7c"
                },
                "53851a7a-8821-4651-b9cc-7a9e1893d583": {
                  "description": null,
                  "name": "GPSAntenna",
                  "optional?": true,
                  "hidden?": false,
                  "parent-ID": "241feb05-f1f2-471d-ad9b-f8ab96156767",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "53851a7a-8821-4651-b9cc-7a9e1893d583"
                },
                "587b22a3-10ef-4178-8184-34f420ea51d0": {
                  "description": null,
                  "name": "GearboxTest",
                  "optional?": true,
                  "hidden?": false,
                  "parent-ID": "2cb929d0-835d-4093-9c07-ee54a56d9bcc",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "587b22a3-10ef-4178-8184-34f420ea51d0"
                },
                "217087c3-b6b9-47dc-9076-4e15002df368": {
                  "description": null,
                  "name": "Gearbox",
                  "optional?": true,
                  "hidden?": false,
                  "parent-ID": "2cb929d0-835d-4093-9c07-ee54a56d9bcc",
                  "abstract?": false,
                  "group-type": "alternative",
                  "ID": "217087c3-b6b9-47dc-9076-4e15002df368"
                },
                "0ca078a5-be6a-419e-843a-29b37d128a91": {
                  "description": null,
                  "name": "USA",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "17938608-2068-4d25-950a-3c6bc02fc07e",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "0ca078a5-be6a-419e-843a-29b37d128a91"
                },
                "6a25d0e2-22ee-4680-b21a-2a3b5b7ae568": {
                  "description": null,
                  "name": "Automatic",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "217087c3-b6b9-47dc-9076-4e15002df368",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "6a25d0e2-22ee-4680-b21a-2a3b5b7ae568"
                },
                "b57dd39c-2812-4b23-8d01-fdca6f0629e7": {
                  "description": null,
                  "name": "Carbody",
                  "optional?": true,
                  "hidden?": false,
                  "parent-ID": "2cb929d0-835d-4093-9c07-ee54a56d9bcc",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "b57dd39c-2812-4b23-8d01-fdca6f0629e7"
                },
                "17938608-2068-4d25-950a-3c6bc02fc07e": {
                  "description": null,
                  "name": "DigitalCards",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "241feb05-f1f2-471d-ad9b-f8ab96156767",
                  "abstract?": false,
                  "group-type": "alternative",
                  "ID": "17938608-2068-4d25-950a-3c6bc02fc07e"
                },
                "2cb929d0-835d-4093-9c07-ee54a56d9bcc": {
                  "description": null,
                  "name": "Car",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": null,
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "2cb929d0-835d-4093-9c07-ee54a56d9bcc"
                },
                "25ed4c26-3840-4d4d-a224-4eebefe474b1": {
                  "description": null,
                  "name": "USB",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "47f3869f-cd3b-4313-a050-28890c414c7c",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "25ed4c26-3840-4d4d-a224-4eebefe474b1"
                },
                "6a7bc9df-177e-4675-a27e-54d7293e4d10": {
                  "description": null,
                  "name": "Radio",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "2cb929d0-835d-4093-9c07-ee54a56d9bcc",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "6a7bc9df-177e-4675-a27e-54d7293e4d10"
                },
                "b7ef5ee9-142d-4702-9e82-01c11853bfbd": {
                  "description": null,
                  "name": "CD",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "47f3869f-cd3b-4313-a050-28890c414c7c",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "b7ef5ee9-142d-4702-9e82-01c11853bfbd"
                },
                "c38d61fa-dcca-4dba-b978-c2e971fdffc1": {
                  "description": null,
                  "name": "Europe",
                  "optional?": false,
                  "hidden?": false,
                  "parent-ID": "17938608-2068-4d25-950a-3c6bc02fc07e",
                  "abstract?": false,
                  "group-type": "and",
                  "ID": "c38d61fa-dcca-4dba-b978-c2e971fdffc1"
                }
              },
              "constraints": {
                "d8b03332-e03c-47ac-9936-6b7783f88266": {
                  "graveyarded?": false,
                  "formula": [
                    "imp",
                    [
                      "conj",
                      "217087c3-b6b9-47dc-9076-4e15002df368",
                      "6a7bc9df-177e-4675-a27e-54d7293e4d10"
                    ],
                    "241feb05-f1f2-471d-ad9b-f8ab96156767"
                  ],
                  "ID": "d8b03332-e03c-47ac-9936-6b7783f88266"
                },
                "296631be-455f-4b95-9413-071c26a491d8": {
                  "graveyarded?": false,
                  "formula": [
                    "conj",
                    "b57dd39c-2812-4b23-8d01-fdca6f0629e7",
                    "217087c3-b6b9-47dc-9076-4e15002df368"
                  ],
                  "ID": "296631be-455f-4b95-9413-071c26a491d8"
                },
                "c9f13ce3-1dc7-49f4-918b-2117eed04bca": {
                  "graveyarded?": false,
                  "formula": [
                    "imp",
                    "241feb05-f1f2-471d-ad9b-f8ab96156767",
                    "25ed4c26-3840-4d4d-a224-4eebefe474b1"
                  ],
                  "ID": "c9f13ce3-1dc7-49f4-918b-2117eed04bca"
                },
                "8e638b61-d1d9-4ff8-914b-758f998d53ea": {
                  "graveyarded?": false,
                  "formula": [
                    "imp",
                    "53851a7a-8821-4651-b9cc-7a9e1893d583",
                    "25ed4c26-3840-4d4d-a224-4eebefe474b1"
                  ],
                  "ID": "8e638b61-d1d9-4ff8-914b-758f998d53ea"
                },
                "57841697-5503-4422-bdaa-d362889c0710": {
                  "graveyarded?": false,
                  "formula": [
                    "imp",
                    "b57dd39c-2812-4b23-8d01-fdca6f0629e7",
                    [
                      "conj",
                      "6a25d0e2-22ee-4680-b21a-2a3b5b7ae568",
                      [
                        "not",
                        "1ad8ed8d-a392-4ef7-a6f6-aa6ecaf07f60"
                      ]
                    ]
                  ],
                  "ID": "57841697-5503-4422-bdaa-d362889c0710"
                },
                "c7d07615-99d7-47fc-9b2c-85c4918e6666": {
                  "graveyarded?": false,
                  "formula": [
                    "imp",
                    "c38d61fa-dcca-4dba-b978-c2e971fdffc1",
                    "217087c3-b6b9-47dc-9076-4e15002df368"
                  ],
                  "ID": "c7d07615-99d7-47fc-9b2c-85c4918e6666"
                }
              },
              "children-cache": {
                "217087c3-b6b9-47dc-9076-4e15002df368": [
                  "6a25d0e2-22ee-4680-b21a-2a3b5b7ae568",
                  "939d00f4-1f45-4dfe-b1d2-00e877a22d0f"
                ],
                "6a7bc9df-177e-4675-a27e-54d7293e4d10": [
                  "1ad8ed8d-a392-4ef7-a6f6-aa6ecaf07f60",
                  "241feb05-f1f2-471d-ad9b-f8ab96156767",
                  "47f3869f-cd3b-4313-a050-28890c414c7c"
                ],
                "241feb05-f1f2-471d-ad9b-f8ab96156767": [
                  "17938608-2068-4d25-950a-3c6bc02fc07e",
                  "53851a7a-8821-4651-b9cc-7a9e1893d583"
                ],
                "2cb929d0-835d-4093-9c07-ee54a56d9bcc": [
                  "217087c3-b6b9-47dc-9076-4e15002df368",
                  "587b22a3-10ef-4178-8184-34f420ea51d0",
                  "6a7bc9df-177e-4675-a27e-54d7293e4d10",
                  "b57dd39c-2812-4b23-8d01-fdca6f0629e7"
                ],
                "17938608-2068-4d25-950a-3c6bc02fc07e": [
                  "0ca078a5-be6a-419e-843a-29b37d128a91",
                  "c38d61fa-dcca-4dba-b978-c2e971fdffc1"
                ],
                "nil": [
                  "2cb929d0-835d-4093-9c07-ee54a56d9bcc"
                ],
                "47f3869f-cd3b-4313-a050-28890c414c7c": [
                  "25ed4c26-3840-4d4d-a224-4eebefe474b1",
                  "b7ef5ee9-142d-4702-9e82-01c11853bfbd"
                ]
              }
            },
            "layout": "verticalTree",
            "isSelectMultipleFeatures": false,
            "selectedFeatureIDs": [],
            "collapsedFeatureIDs": [],
            "votes": {}
          }

    ],
    artifactPaths: []
};

export const initialFeatureDiagramCollaborativeSessionState =
    (artifactPath: ArtifactPath, kernelContext: KernelContext, kernelCombinedEffect: KernelCombinedEffect):
    FeatureDiagramCollaborativeSession => ({
        artifactPath,
        collaborators: [],
        kernelContext,
        kernelCombinedEffect,
        layout: FeatureDiagramLayoutType.verticalTree,
        isSelectMultipleFeatures: false,
        selectedFeatureIDs: [],
        collapsedFeatureIDs: [],
        voterSiteIDs: undefined,
        votes: {}
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
export type OnEndConflictViewTransitionFunction = () => void;

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
export type OnToggleFeatureOptionalFunction = (payload: {feature: Feature}) => Promise<void>;
export type OnSetFeatureAndFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureOrFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureAlternativeFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnCreateConstraintFunction = (payload: {formula: KernelConstraintFormula}) => Promise<void>;
export type OnSetConstraintFunction = (payload: {constraintID: string, formula: KernelConstraintFormula}) => Promise<void>;
export type OnRemoveConstraintFunction = (payload: {constraintID: string}) => Promise<void>;
export type OnToggleFeatureGroupTypeFunction = (payload: {feature: Feature}) => Promise<void>;
export type OnSetUserProfileFunction = (payload: {name: string}) => Promise<void>;
export type OnResetFunction = () => Promise<void>;
export type OnVoteFunction = (payload: {versionID?: string}) => Promise<void>;
export type OnSetVotingStrategyFunction = (payload: {votingStrategy: string, onlyInvolved: boolean}) => Promise<void>;

// Props that may derived from the state to use in React components.
// This enforces the convention that a prop called 'on...' has the same type in all components.
export type StateDerivedProps = Partial<{
    handleMessage: (message: Message) => void,
    currentArtifactPath: ArtifactPath,
    artifactPaths: ArtifactPath[],
    collaborativeSessions: CollaborativeSession[],
    myself: Collaborator,
    collaborators: Collaborator[],
    settings: Settings,
    featureDiagramLayout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureIDs: string[],
    featureModel: FeatureModel,
    conflictDescriptor: KernelConflictDescriptor,
    transitionResolutionOutcome: string,
    transitionConflictDescriptor: KernelConflictDescriptor,
    overlay: OverlayType,
    overlayProps: OverlayProps,
    voterSiteIDs: string[],
    votes: Votes,

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
    onEndConflictTransition: OnEndConflictViewTransitionFunction,

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
    onReset: OnResetFunction,
    onVote: OnVoteFunction,
    onSetVotingStrategy: OnSetVotingStrategyFunction
}>;