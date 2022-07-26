/**
 * Defines commands (actions and metadata) that may be used throughout the application.
 * Commands are expected to be used in Fabric's contextual menus and command bars
 * and defined accordingly.
 */

import i18n from '../i18n';
import {FeatureDiagramLayoutType, OverlayType, Message, ClientFormatType, ServerFormatType} from '../types';
import {ContextualMenuItemType} from '@fluentui/react';
import {getShortcutText} from '../shortcuts';
import {canExport, doExport} from './featureDiagramView/export';
import {OnShowOverlayFunction, OnCollapseFeaturesFunction, OnExpandFeaturesFunction, OnSetFeatureDiagramLayoutFunction, OnFitToScreenFunction, OnDeselectAllFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesBelowFunction, OnSetSelectMultipleFeaturesFunction, OnSelectAllFeaturesFunction, OnCollapseAllFeaturesFunction, OnExpandAllFeaturesFunction, OnRemoveFeatureFunction, OnUndoFunction, OnRedoFunction, OnCreateFeatureBelowFunction, OnCreateFeatureAboveFunction, OnRemoveFeatureSubtreeFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureOptionalFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction, OnSetSettingFunction} from '../store/types';
import FeatureDiagram, {hasActualChildren, isCollapsed} from '../model/FeatureDiagram';
import {FeatureNode, FeatureTree} from '../model/types';
import {defaultSettings, Settings} from '../store/settings';
import {preconditions} from '../model/preconditions';
import logger from '../helpers/logger';
import {forceFlushMessageQueues} from '../server/messageQueue';

const exportServerFormatItem = (featureDiagramLayout: FeatureDiagramLayoutType, format: ServerFormatType) =>
    canExport(featureDiagramLayout, format)
        ? [{
            key: format,
            text: i18n.t('commands.featureDiagram', format),
            onClick: () => doExport(featureDiagramLayout, ServerFormatType[format], {})
        }]
        : [];

const exportClientFormatItem = (featureDiagramLayout: FeatureDiagramLayoutType,
    onShowOverlay: OnShowOverlayFunction, format: ClientFormatType) =>
    canExport(featureDiagramLayout, format)
        ? [{
            key: format,
            text: i18n.t('commands.featureDiagram', format),
            onClick: () => onShowOverlay({overlay: OverlayType.exportDialog, overlayProps: {format}})
        }]
        : [];

export const makeDivider = () =>
    ({key: 'divider', itemType: ContextualMenuItemType.Divider}); // todo: duplicate key sometimes: Encountered two children with the same key, `divider`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.

export const collapseCommand = (features: FeatureNode[], onCollapseFeatures: OnCollapseFeaturesFunction,
    onExpandFeatures: OnExpandFeaturesFunction, onClick?: () => void) => ({
    disabled: features.some(feature => !hasActualChildren(feature)),
    action: (fn?: OnCollapseFeaturesFunction | OnExpandFeaturesFunction) => {
        const isSingleFeature = features.length === 1,
            featureIDs = features.map(feature => feature.data.id);
        fn = fn || (isSingleFeature && isCollapsed(features[0]) ? onExpandFeatures : onCollapseFeatures);
        fn({featureIDs});
        onClick && onClick();
    }
});

const commands = {
    commandPalette: (onShowOverlay: OnShowOverlayFunction) => ({
        key: 'commandPalette',
        iconProps: {iconName: 'Processing'},
        text: i18n.t('commands.commandPalette'),
        secondaryText: getShortcutText('commandPalette'),
        onClick: () => onShowOverlay({overlay: OverlayType.commandPalette, overlayProps: {}})
    }),
    settings: (onShowOverlay: OnShowOverlayFunction) => ({
        key: 'settings',
        text: i18n.t('commands.settings'),
        iconProps: {iconName: 'Settings'},
        secondaryText: getShortcutText('settings'),
        onClick: () => onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}})
    }),
    about: (onShowOverlay: OnShowOverlayFunction) => ({
        key: 'about',
        text: i18n.t('commands.about'),
        iconProps: {iconName: 'Info'},
        onClick: () => onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}})
    }),
    undo: (onUndo: OnUndoFunction) => ({
        key: 'undo',
        text: i18n.t('commands.undo'),
        iconProps: {iconName: 'Undo'},
        secondaryText: getShortcutText('undo'),
        onClick: onUndo
    }),
    redo: (onRedo: OnRedoFunction) => ({
        key: 'redo',
        text: i18n.t('commands.redo'),
        iconProps: {iconName: 'Redo'},
        secondaryText: getShortcutText('redo'),
        onClick: onRedo
    }),
    featureDiagram: {
        addArtifact: (onShowOverlay: OnShowOverlayFunction) => ({
            key: 'addArtifact',
            text: i18n.t('commands.addArtifact'),
            iconProps: {iconName: 'PageAdd'},
            onClick: () => onShowOverlay({overlay: OverlayType.addArtifactPanel, overlayProps: {}})
        }),
        share: (onShowOverlay: OnShowOverlayFunction) => ({
            key: 'share',
            text: i18n.t('commands.share'),
            iconProps: {iconName: 'Share'},
            onClick: () => onShowOverlay({overlay: OverlayType.shareDialog, overlayProps: {}})
        }),
        export: (featureDiagramLayout: FeatureDiagramLayoutType, onShowOverlay: OnShowOverlayFunction) => ({
            key: 'export',
            text: i18n.t('commands.featureDiagram.export'),
            iconProps: {iconName: 'CloudDownload'},
            subMenuProps: {
                items: [
                    ...exportServerFormatItem(featureDiagramLayout, ServerFormatType.XmlFeatureModelFormat),
                    ...exportServerFormatItem(featureDiagramLayout, ServerFormatType.SXFMFormat),
                    ...exportServerFormatItem(featureDiagramLayout, ServerFormatType.ConquererFMWriter),
                    ...exportServerFormatItem(featureDiagramLayout, ServerFormatType.DIMACSFormat),
                    ...exportServerFormatItem(featureDiagramLayout, ServerFormatType.CNFFormat),
                    ...exportServerFormatItem(featureDiagramLayout, ServerFormatType.GuidslFormat),
                    makeDivider(),
                    ...exportClientFormatItem(featureDiagramLayout, onShowOverlay, ClientFormatType.png),
                    ...exportClientFormatItem(featureDiagramLayout, onShowOverlay, ClientFormatType.jpg),
                    makeDivider(),
                    ...exportClientFormatItem(featureDiagramLayout, onShowOverlay, ClientFormatType.svg),
                    ...exportClientFormatItem(featureDiagramLayout, onShowOverlay, ClientFormatType.pdf)
                ]
            }
        }),
        setLayout: (featureDiagramLayout: FeatureDiagramLayoutType,
            onSetFeatureDiagramLayout: OnSetFeatureDiagramLayoutFunction) => ({
            key: 'setLayout',
            text: i18n.t('commands.featureDiagram.setLayout'),
            subMenuProps: {
                items: [{
                    key: 'verticalTree',
                    text: i18n.t('commands.featureDiagram.verticalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === FeatureDiagramLayoutType.verticalTree,
                    onClick: () => onSetFeatureDiagramLayout({layout: FeatureDiagramLayoutType.verticalTree})
                }, {
                    key: 'horizontalTree',
                    text: i18n.t('commands.featureDiagram.horizontalTree'),
                    canCheck: true,
                    isChecked: featureDiagramLayout === FeatureDiagramLayoutType.horizontalTree,
                    onClick: () => onSetFeatureDiagramLayout({layout: FeatureDiagramLayoutType.horizontalTree})
                }]
            }
        }),
        fitToScreen: (onFitToScreen: OnFitToScreenFunction) => ({
            key: 'fitToScreen',
            text: i18n.t('commands.featureDiagram.fitToScreen'),
            iconProps: {iconName: 'FullScreen'},
            onClick: onFitToScreen
        }),
        showConstraintView: (onSetSetting: OnSetSettingFunction, splitAt: number) => ({
            key: 'showConstraintView',
            text: i18n.t('commands.featureDiagram.showConstraintView'),
            canCheck: true,
            isChecked: splitAt < 0.95,
            onClick: () => onSetSetting(
                {path: 'views.splitAt', value: (splitAt: number) =>
                    splitAt > defaultSettings.views.splitAt ? defaultSettings.views.splitAt : 1})
        }),
        splitConstraintViewHorizontally: (onSetSetting: OnSetSettingFunction, splitDirection: 'horizontal' | 'vertical') => ({
            key: 'splitConstraintViewHorizontally',
            text: i18n.t('commands.featureDiagram.splitConstraintViewHorizontally'),
            canCheck: true,
            isChecked: splitDirection === 'horizontal',
            onClick: () => onSetSetting(
                {path: 'views.splitDirection', value: (splitDirection: 'horizontal' | 'vertical') =>
                    splitDirection === 'horizontal' ? 'vertical' : 'horizontal'})
        }),
        feature: {
            newMenu: (featureID: string, featureModel: FeatureDiagram, onCreateFeatureBelow: OnCreateFeatureBelowFunction,
                onCreateFeatureAbove: OnCreateFeatureAboveFunction, onClick: () => void, iconOnly = false) => ({
                key: 'newMenu',
                text: !iconOnly ? i18n.t('commands.featureDiagram.feature.newMenu.title') : undefined,
                iconProps: {iconName: 'Add'},
                iconOnly,
                split: true,
                onClick: () => {
                    if (preconditions.featureDiagram.feature.createBelow(featureID, featureModel))
                        onCreateFeatureBelow({featureParentID: featureID}).then(onClick);
                    else
                        logger.warn(() => 'can not create below this feature'); // TODO: better error reporting UI
                },
                disabled: !preconditions.featureDiagram.feature.createBelow(featureID, featureModel),
                subMenuProps: {
                    items: [
                        {
                            key: 'newBelow',
                            text: i18n.t('commands.featureDiagram.feature.newMenu.newBelow'),
                            secondaryText: getShortcutText('featureDiagram.feature.new'),
                            iconProps: {iconName: 'Add'},
                            onClick: () => {
                                onCreateFeatureBelow({featureParentID: featureID}).then(onClick);
                            },
                            disabled: !preconditions.featureDiagram.feature.createBelow(featureID, featureModel)
                        },
                        commands.featureDiagram.feature.newAbove([featureID], featureModel, onCreateFeatureAbove, onClick)
                    ]
                }
            }),
            newAbove: (featureIDs: string[], featureModel: FeatureDiagram, onCreateFeatureAbove: OnCreateFeatureAboveFunction,
            onClick: () => void) => ({
                key: 'newAbove',
                text: i18n.t('commands.featureDiagram.feature.newMenu.newAbove'),
                iconProps: {iconName: 'Add'},
                disabled: !preconditions.featureDiagram.feature.createAbove(featureIDs, featureModel),
                onClick: () => {
                    onCreateFeatureAbove({featureIDs}).then(onClick);
                }
            }),
            removeMenu: (featureIDs: string[], featureModel: FeatureDiagram, onRemoveFeature: OnRemoveFeatureFunction,
                onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction, onClick: () => void, iconOnly = false) => ({
                key: 'removeMenu',
                text: !iconOnly ? i18n.t('commands.featureDiagram.feature.removeMenu.title') : undefined,
                iconProps: {iconName: 'Remove'},
                iconOnly,
                split: true,
                onClick: () => {
                    if (preconditions.featureDiagram.feature.remove(featureIDs, featureModel))
                        onRemoveFeature({featureIDs}).then(onClick);
                    else
                        logger.warn(() => 'can not remove selected features');
                },
                subMenuProps: {
                    items: [{
                        key: 'remove',
                        text: i18n.getFunction('commands.featureDiagram.feature.removeMenu.remove')(featureIDs),
                        secondaryText: getShortcutText('featureDiagram.feature.remove'),
                        iconProps: {iconName: 'Remove'},
                        onClick: () => {
                            onRemoveFeature({featureIDs}).then(onClick);
                        },
                        disabled: !preconditions.featureDiagram.feature.remove(featureIDs, featureModel)
                    }, {
                        key: 'removeBelow',
                        text: i18n.t('commands.featureDiagram.feature.removeMenu.removeBelow'),
                        iconProps: {iconName: 'Remove'},
                        disabled: !preconditions.featureDiagram.feature.removeSubtree(featureIDs, featureModel),
                        onClick: () => {
                            onRemoveFeatureSubtree({featureIDs}).then(onClick);
                        }
                    }]
                }
            }),
            details: (featureID: string, onShowOverlay: OnShowOverlayFunction) => ({
                key: 'details',
                text: i18n.t('commands.featureDiagram.feature.details'),
                secondaryText: getShortcutText('featureDiagram.feature.details'),
                iconProps: {iconName: 'Info'},
                iconOnly: true,
                onClick: () => onShowOverlay({overlay: OverlayType.featurePanel, overlayProps: {featureID}})
            }),
            rename: (featureID: string, featureModel: FeatureDiagram, onShowOverlay: OnShowOverlayFunction) => ({
                key: 'rename',
                text: i18n.t('commands.featureDiagram.feature.rename'),
                secondaryText: getShortcutText('featureDiagram.feature.rename'),
                iconProps: {iconName: 'Rename'},
                onClick: () => onShowOverlay({overlay: OverlayType.featureRenameDialog, overlayProps: {featureID}}),
                disabled: !preconditions.featureDiagram.feature.setName(featureID, featureModel)
            }),
            setDescription: (featureID: string, featureModel: FeatureDiagram, onShowOverlay: OnShowOverlayFunction) => ({
                key: 'setDescription',
                text: i18n.t('commands.featureDiagram.feature.setDescription'),
                iconProps: {iconName: 'TextDocument'},
                onClick: () => onShowOverlay({overlay: OverlayType.featureSetDescriptionDialog, overlayProps: {featureID}}),
                disabled: !preconditions.featureDiagram.feature.setDescription(featureID, featureModel)
            }),
            properties: (featureIDs: string[], featureModel: FeatureDiagram, onSetFeatureAbstract: OnSetFeatureAbstractFunction,
                onSetFeatureHidden: OnSetFeatureHiddenFunction, onSetFeatureOptional: OnSetFeatureOptionalFunction,
                onSetFeatureAnd: OnSetFeatureAndFunction, onSetFeatureOr: OnSetFeatureOrFunction,
                onSetFeatureAlternative: OnSetFeatureAlternativeFunction, onClick: () => void) => ({
                    key: 'propertiesMenu',
                    text: i18n.t('commands.featureDiagram.feature.propertiesMenu.title'),
                    iconProps: {iconName: 'FieldNotChanged'},
                    subMenuProps: {
                        items: [{
                            key: 'abstract',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.abstract'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setAbstract(featureIDs, featureModel) ||
                                featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isAbstract),
                            isChecked: featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isAbstract),
                            onClick: () => {
                                onSetFeatureAbstract({featureIDs, value: true}).then(onClick);
                            }
                        }, {
                            key: 'concrete',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.concrete'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setAbstract(featureIDs, featureModel) ||
                                featureIDs.every(featureID => !featureModel.getFeatureTree(featureID)!.isAbstract),
                            isChecked: featureIDs.every(featureID => !featureModel.getFeatureTree(featureID)!.isAbstract),
                            onClick: () => {
                                onSetFeatureAbstract({featureIDs, value: false}).then(onClick);
                            }
                        }, makeDivider(), {
                            key: 'hidden',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.hidden'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setHidden(featureIDs, featureModel),
                            isChecked: featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isHidden),
                            onClick: () => {
                                onSetFeatureHidden({
                                    featureIDs,
                                    value: !featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isHidden)
                                }).then(onClick);
                            }
                        }, makeDivider(), {
                            key: 'optional',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.optional'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setOptional(featureIDs, featureModel) ||
                                featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isOptional),
                            isChecked: featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isOptional),
                            onClick: () => {
                                onSetFeatureOptional({featureIDs, value: true}).then(onClick);
                            }
                        }, {
                            key: 'mandatory',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.mandatory'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setOptional(featureIDs, featureModel) ||
                                featureIDs.every(featureID => !featureModel.getFeatureTree(featureID)!.isOptional),
                            isChecked: featureIDs.every(featureID => !featureModel.getFeatureTree(featureID)!.isOptional),
                            onClick: () => {
                                onSetFeatureOptional({featureIDs, value: false}).then(onClick);
                            }
                        }, makeDivider(), {
                            key: 'and',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.and'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setGroupType(featureIDs, featureModel) ||
                                featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isAnd),
                            isChecked: featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isAnd),
                            onClick: () => {
                                onSetFeatureAnd({featureIDs}).then(onClick);
                            }
                        }, {
                            key: 'or',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.or'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setGroupType(featureIDs, featureModel) ||
                                featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isOr),
                            isChecked: featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isOr),
                            onClick: () => {
                                onSetFeatureOr({featureIDs}).then(onClick);
                            }
                        }, {
                            key: 'alternative',
                            text: i18n.t('commands.featureDiagram.feature.propertiesMenu.alternative'),
                            canCheck: true,
                            disabled: !preconditions.featureDiagram.feature.properties.setGroupType(featureIDs, featureModel) ||
                                featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isAlternative),
                            isChecked: featureIDs.every(featureID => featureModel.getFeatureTree(featureID)!.isAlternative),
                            onClick: () => {
                                onSetFeatureAlternative({featureIDs}).then(onClick);
                            }
                        }]
                    }
                }),
            selection: (isSelectMultipleFeatures: boolean, onSetSelectMultipleFeatures: OnSetSelectMultipleFeaturesFunction,
                selectedFeatureIDs: string[], onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
                onCollapseFeatures: OnCollapseFeaturesFunction, onExpandFeatures: OnExpandFeaturesFunction,
                onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction, onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
                onCreateFeatureAbove: OnCreateFeatureAboveFunction, onRemoveFeature: OnRemoveFeatureFunction,
                onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction, onSetFeatureAbstract: OnSetFeatureAbstractFunction,
                onSetFeatureHidden: OnSetFeatureHiddenFunction, onSetFeatureOptional: OnSetFeatureOptionalFunction,
                onSetFeatureAnd: OnSetFeatureAndFunction, onSetFeatureOr: OnSetFeatureOrFunction,
                onSetFeatureAlternative: OnSetFeatureAlternativeFunction, featureModel: FeatureDiagram) => ({
                key: 'selection',
                text: i18n.getFunction('commands.featureDiagram.feature.selection')(isSelectMultipleFeatures, selectedFeatureIDs),
                onClick: () => onSetSelectMultipleFeatures({isSelectMultipleFeatures: !isSelectMultipleFeatures}), // TODO: tell the user he can choose features now
                subMenuProps: isSelectMultipleFeatures
                    ? {items: commands.featureDiagram.feature.selectionItems(selectedFeatureIDs, onDeselectAllFeatures,
                        onCollapseFeatures, onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, onCreateFeatureAbove,
                        onRemoveFeature, onRemoveFeatureSubtree, onSetFeatureAbstract, onSetFeatureHidden, onSetFeatureOptional, onSetFeatureAnd, onSetFeatureOr,
                        onSetFeatureAlternative, featureModel)}
                    : undefined
            }),
            selectionItems: (selectedFeatureIDs: string[], onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
                onCollapseFeatures: OnCollapseFeaturesFunction, onExpandFeatures: OnExpandFeaturesFunction,
                onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction, onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
                onCreateFeatureAbove: OnCreateFeatureAboveFunction, onRemoveFeature: OnRemoveFeatureFunction,
                onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction, onSetFeatureAbstract: OnSetFeatureAbstractFunction,
                onSetFeatureHidden: OnSetFeatureHiddenFunction, onSetFeatureOptional: OnSetFeatureOptionalFunction,
                onSetFeatureAnd: OnSetFeatureAndFunction, onSetFeatureOr: OnSetFeatureOrFunction,
                onSetFeatureAlternative: OnSetFeatureAlternativeFunction, featureModel: FeatureDiagram) => [
                commands.featureDiagram.feature.newAbove(selectedFeatureIDs, featureModel, onCreateFeatureAbove, onDeselectAllFeatures),
                commands.featureDiagram.feature.removeMenu(selectedFeatureIDs, featureModel, onRemoveFeature, onRemoveFeatureSubtree, onDeselectAllFeatures),
                commands.featureDiagram.feature.collapseMenu(featureModel.getFeatureNodes(selectedFeatureIDs),
                    onCollapseFeatures, onExpandFeatures, onCollapseFeaturesBelow, onExpandFeaturesBelow, onDeselectAllFeatures),
                makeDivider(),
                commands.featureDiagram.feature.properties(selectedFeatureIDs, featureModel,
                onSetFeatureAbstract, onSetFeatureHidden, onSetFeatureOptional, onSetFeatureAnd, onSetFeatureOr,
                onSetFeatureAlternative, onDeselectAllFeatures)
            ],
            selectAll: (onSelectAll: OnSelectAllFeaturesFunction) => ({
                key: 'selectAll',
                text: i18n.t('commands.featureDiagram.feature.selectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.selectAll'),
                onClick: onSelectAll
            }),
            deselectAll: (onDeselectAll: OnDeselectAllFeaturesFunction) => ({
                key: 'deselectAll',
                text: i18n.t('commands.featureDiagram.feature.deselectAll'),
                secondaryText: getShortcutText('featureDiagram.feature.deselectAll'),
                onClick: onDeselectAll
            }),
            collapseMenu: (features: FeatureNode[], onCollapseFeatures: OnCollapseFeaturesFunction, onExpandFeatures: OnExpandFeaturesFunction,
                onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction, onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
                onClick: () => void, iconOnly = false) => {
                const isSingleFeature = features.length === 1,
                    isCollapsedSingleFeature = isSingleFeature && isCollapsed(features[0]),
                    {disabled, action} = collapseCommand(features, onCollapseFeatures, onExpandFeatures, onClick);
                return {
                    key: 'collapseMenu',
                    text: !iconOnly ? i18n.getFunction('commands.featureDiagram.feature.collapseMenu.title')(isCollapsedSingleFeature) : undefined,
                    iconProps: {iconName: isCollapsedSingleFeature ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                    iconOnly,
                    split: isSingleFeature,
                    disabled,
                    onClick: () => action(),
                    subMenuProps: {
                        items: [
                            ...((isSingleFeature ? [{
                                key: 'collapse',
                                text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(isCollapsed(features[0])),
                                secondaryText: isCollapsed(features[0])
                                    ? getShortcutText('featureDiagram.feature.expand')
                                    : getShortcutText('featureDiagram.feature.collapse'),
                                iconProps: {iconName: isCollapsed(features[0]) ? 'ExploreContentSingle' : 'CollapseContentSingle'},
                                onClick: () => action()
                            }] : [{
                                key: 'collapse',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseMultiple'),
                                secondaryText: getShortcutText('featureDiagram.feature.collapse'),
                                iconProps: {iconName: 'CollapseContentSingle'},
                                onClick: () => action(onCollapseFeatures)
                            }, {
                                key: 'expand',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandMultiple'),
                                secondaryText: getShortcutText('featureDiagram.feature.expand'),
                                iconProps: {iconName: 'ExploreContentSingle'},
                                onClick: () => action(onExpandFeatures)
                            }])),
                            makeDivider(), {
                                key: 'collapseBelow',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseBelow'),
                                iconProps: {iconName: 'CollapseContent'},
                                onClick: () => action(onCollapseFeaturesBelow)
                            }, {
                                key: 'expandBelow',
                                text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandBelow'),
                                iconProps: {iconName: 'ExploreContent'},
                                onClick: () => action(onExpandFeaturesBelow)
                            }
                        ]
                    }
                };
            },
            collapseAll: (onCollapseAllFeatures: OnCollapseAllFeaturesFunction) => ({
                key: 'collapseAll',
                text: i18n.t('commands.featureDiagram.feature.collapseAll'),
                secondaryText: getShortcutText('featureDiagram.feature.collapse'),
                iconProps: {iconName: 'CollapseContent'},
                onClick: onCollapseAllFeatures
            }),
            expandAll: (onExpandAllFeatures: OnExpandAllFeaturesFunction) => ({
                key: 'expandAll',
                text: i18n.t('commands.featureDiagram.feature.expandAll'),
                secondaryText: getShortcutText('featureDiagram.feature.expand'),
                iconProps: {iconName: 'ExploreContent'},
                onClick: onExpandAllFeatures
            })
        }
    }
};

export default commands;