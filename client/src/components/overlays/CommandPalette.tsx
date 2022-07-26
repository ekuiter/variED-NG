import React from 'react';
import i18n from '../../i18n';
import {OnShowOverlayFunction, OnUndoFunction, OnRedoFunction, OnSetFeatureDiagramLayoutFunction, OnFitToScreenFunction, OnCreateFeatureAboveFunction, OnCreateFeatureBelowFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnRemoveFeatureFunction, OnRemoveFeatureSubtreeFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureOptionalFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction, OnExpandAllFeaturesFunction, OnCollapseAllFeaturesFunction, OnLeaveRequestFunction, Session, OnSetSettingFunction, OnMoveFeatureSubtreeFunction, OnCreateConstraintFunction, OnSetConstraintFunction, OnRemoveConstraintFunction, OnRemoveArtifactFunction, OnResetFunction, OnExitFunction} from '../../store/types';
import {getShortcutText} from '../../shortcuts';
import {OverlayType, Omit, FeatureDiagramLayoutType, ClientFormatType, isArtifactPathEqual, ArtifactPath} from '../../types';
import Palette, {PaletteItem, PaletteAction, getKey} from '../../helpers/Palette';
import {canExport} from '../featureDiagramView/export';
import FeatureDiagram, {ConstraintNode, getFeatureIDsBelow, paletteConstraintRenderer} from '../../model/FeatureDiagram';
import {arrayUnique} from '../../helpers/array';
import deferred from '../../helpers/deferred';
import logger from '../../helpers/logger';
import {Persistor} from 'redux-persist';
import {enableConstraintsView} from '../constraintsView/ConstraintsView';
import {defaultSettings, Settings} from '../../store/settings';
import {preconditions} from '../../model/preconditions';
import {redirectToArtifactPath} from '../../router';

interface Props {
    artifactPaths: ArtifactPath[],
    sessions: Session[],
    isOpen: boolean,
    featureDiagramLayout?: FeatureDiagramLayoutType,
    featureModel?: FeatureDiagram,
    settings: Settings,
    onDismiss: () => void,
    onShowOverlay: OnShowOverlayFunction,
    onRemoveArtifact: OnRemoveArtifactFunction,
    onLeaveRequest: OnLeaveRequestFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction,
    onFitToScreen: OnFitToScreenFunction,
    onCollapseAllFeatures: OnCollapseAllFeaturesFunction,
    onExpandAllFeatures: OnExpandAllFeaturesFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onRemoveFeature: OnRemoveFeatureFunction,
    onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction,
    onMoveFeatureSubtree: OnMoveFeatureSubtreeFunction,
    onCreateFeatureBelow: OnCreateFeatureBelowFunction,
    onCreateFeatureAbove: OnCreateFeatureAboveFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureOptional: OnSetFeatureOptionalFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction,
    onCreateConstraint: OnCreateConstraintFunction,
    onSetConstraint: OnSetConstraintFunction,
    onRemoveConstraint: OnRemoveConstraintFunction,
    onSetFeatureDiagramLayout: OnSetFeatureDiagramLayoutFunction,
    onSetSetting: OnSetSettingFunction,
    onReset: OnResetFunction,
    onExit: OnExitFunction
};

interface State {
    rerenderPalette: number,
    getArgumentItems?: () => Promise<PaletteItem[]>,
    argumentItems?: PaletteItem[],
    allowFreeform?: (value: string) => PaletteAction,
    transformFreeform?: (value: string) => string,
    title?: string
};

type PaletteItemDescriptor = Omit<PaletteItem, 'action'> | string;
type PaletteItemsFunction = ((...args: string[]) => PaletteItemDescriptor[] | Promise<PaletteItemDescriptor[]>);

interface ArgumentDescriptor {
    items?: PaletteItemsFunction,
    allowFreeform?: boolean,
    transformFreeform?: (value: string) => string,
    title?: string,
    skipArguments?: (value: string) => number
};

function clearLocalStorage() {
    const persistor: Persistor | undefined =
        (window as any).app && (window as any).app.persistor;
    if (!persistor)
        logger.warn(() => 'can not obtain persistor');
    else {
        persistor.pause();
        persistor.purge();
        window.location.reload();
    }
}

export default class extends React.Component<Props, State> {
    state: State = {rerenderPalette: +new Date()};
    commandUsage: {
        [x: string]: number
    } = {};

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (!prevProps.isOpen && this.props.isOpen)
            this.setState({getArgumentItems: undefined, argumentItems: undefined,
                allowFreeform: undefined, transformFreeform: undefined, title: undefined});

        if (this.props.isOpen &&
            this.state.getArgumentItems &&
            (prevState.getArgumentItems !== this.state.getArgumentItems ||
                prevProps.featureModel !== this.props.featureModel ||
                prevProps.artifactPaths !== this.props.artifactPaths ||
                prevProps.sessions !== this.props.sessions))
            this.state.getArgumentItems()
                .then(argumentItems => this.setState({argumentItems}));
    }

    onSubmit = (command: PaletteItem) => {
        deferred(() => this.commandUsage[getKey(command)] = +new Date())();
    }

    action = (action: PaletteAction): PaletteAction => {
        return () => {
            this.props.onDismiss();
            action();
        };
    };

    actionWithArguments = (args: (ArgumentDescriptor | PaletteItemsFunction)[], action: PaletteAction): PaletteAction => {
        if (args.length === 0)
            return this.action(action);

        const wrappedAction = () => {
            const toArgumentDescriptor = (argument: ArgumentDescriptor | PaletteItemsFunction) =>
                    typeof argument === 'function' ? {items: argument} : argument,
                    toPaletteItemsFunction = (items?: PaletteItemsFunction) => items || (() => []),
                argumentDescriptor: ArgumentDescriptor = toArgumentDescriptor(args[0]),
                // bind current argument and recurse (until all arguments are bound)
                recurse = (value: string) => {
                    const currentArgument = toArgumentDescriptor(args[0]);
                    return this.actionWithArguments(
                        args.slice(currentArgument.skipArguments ? currentArgument.skipArguments(value) + 1 : 1)
                            .map(toArgumentDescriptor)
                            .map(argument => ({
                            ...argument, items: toPaletteItemsFunction(argument.items).bind(undefined, value)
                        })),
                        action.bind(undefined, value));
                };

            this.setState({
                rerenderPalette: +new Date(),
                // instead of directly setting the argument items, we save a function that can recompute
                // the argument items, for example in case the feature model was updated
                getArgumentItems: () => Promise.resolve(toPaletteItemsFunction(argumentDescriptor.items)()).then(items => items.map(item => {
                    if (typeof item === 'string')
                        item = {text: item};
                    return {...item, action: recurse(item.key || item.text)};
                })),
                allowFreeform: !!argumentDescriptor.allowFreeform ? recurse : undefined,
                transformFreeform: argumentDescriptor.transformFreeform,
                title: argumentDescriptor.title
            });
        };
        wrappedAction.isActionWithArguments = true;
        return wrappedAction;
    };

    featureCommand(command: Omit<PaletteItem, 'action'>, action: PaletteAction): PaletteItem {
        return {
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.feature'),
                    items: () => this.props.featureModel!.getFeatureIDs().map(featureID => ({
                        key: featureID, text: this.props.featureModel!.getFeatureTree(featureID)!.name
                    }))
                }],
                action),
            ...command
        };
    }

    isEditing = (artifactPath: ArtifactPath) =>
        this.props.sessions.find(session =>
            isArtifactPathEqual(session.artifactPath, artifactPath));

    commands: PaletteItem[] = [
        {
            text: i18n.t('commandPalette.switch'),
            icon: 'JoinOnlineMeeting',
            disabled: () => this.props.sessions.length < 2,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.project'),
                    items: (() => arrayUnique(
                        this.props.sessions
                            .map(session => session.artifactPath.project))) as any
                }, {
                    title: i18n.t('commandPalette.artifact'),
                    items: (project: string) =>
                    this.props.sessions
                        .filter(session => session.artifactPath.project === project)
                        .map(session => session.artifactPath.artifact)
                }],
                (project, artifact) => redirectToArtifactPath({project, artifact}))
        }, {
            text: i18n.t('commandPalette.joinRequest'),
            icon: 'JoinOnlineMeeting',
            disabled: () => this.props.artifactPaths.length === 0,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.project'),
                    items: (() => arrayUnique(this.props.artifactPaths.map(artifactPath => artifactPath.project))) as any
                }, {
                    title: i18n.t('commandPalette.artifact'),
                    items: (project: string) =>
                        this.props.artifactPaths
                            .filter(artifactPath => artifactPath.project === project)
                            .map(artifactPath => ({
                                text: artifactPath.artifact,
                                icon: this.isEditing(artifactPath) ? 'FolderOpen' : 'Folder'
                            }))
                }],
                (project, artifact) => redirectToArtifactPath({project, artifact}))
        }, {
            text: i18n.t('commandPalette.leaveRequest'),
            icon: 'JoinOnlineMeeting',
            disabled: () => this.props.sessions.length === 0,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.project'),
                    items: (() => arrayUnique(
                        this.props.sessions
                            .map(session => session.artifactPath.project))) as any
                }, {
                    title: i18n.t('commandPalette.artifact'),
                    items: (project: string) =>
                    this.props.sessions
                        .filter(session => session.artifactPath.project === project)
                        .map(session => session.artifactPath.artifact)
                }],
                (project, artifact) => this.props.onLeaveRequest({artifactPath: {project, artifact}}))
        }, {
            text: i18n.t('commandPalette.userProfile'),
            icon: 'Contact',
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.userProfilePanel, overlayProps: {}}))
        }, {
            text: i18n.t('commandPalette.settings'),
            icon: 'Settings',
            shortcut: getShortcutText('settings'),
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commandPalette.about'),
            icon: 'Info',
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}}))
        }, /*{
            text: i18n.t('commands.undo'),
            icon: 'Undo',
            disabled: () => true, // TODO: until we have proper undo/redo support
            // disabled: () => !this.props.featureModel,
            shortcut: getShortcutText('undo'),
            action: this.action(this.props.onUndo)
        }, {
            text: i18n.t('commands.redo'),
            icon: 'Redo',
            disabled: () => true, // TODO: until we have proper undo/redo support
            // disabled: () => !this.props.featureModel,
            shortcut: getShortcutText('redo'),
            action: this.action(this.props.onRedo)
        },*/ {
            text: i18n.t('commandPalette.addArtifact'),
            icon: 'PageAdd',
            action: this.action(() =>
                this.props.onShowOverlay({overlay: OverlayType.addArtifactPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commandPalette.removeArtifact'),
            icon: 'PageRemove',
            disabled: () => this.props.artifactPaths.length === 0,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.project'),
                    items: (() => arrayUnique(this.props.artifactPaths.map(artifactPath => artifactPath.project))) as any
                }, {
                    title: i18n.t('commandPalette.artifact'),
                    items: (project: string) =>
                        this.props.artifactPaths
                            .filter(artifactPath => artifactPath.project === project)
                            .map(artifactPath => artifactPath.artifact)
                }],
                (project, artifact) => this.props.onRemoveArtifact({artifactPath: {project, artifact}}))
        }, {
            text: i18n.t('commandPalette.share'),
            icon: 'Share',
            disabled: () => !this.props.featureModel,
            action: this.action(() =>
                this.props.onShowOverlay({overlay: OverlayType.shareDialog, overlayProps: {}}))
        }, {
            text: i18n.t('commandPalette.featureDiagram.export'),
            icon: 'CloudDownload',
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.format'),
                    items: () => Object.values(ClientFormatType).map(format =>
                        ({text: i18n.t('commandPalette.featureDiagram', format), key: format}))
                }],
                formatString => {
                    const format = (ClientFormatType as any)[formatString];
                    if (canExport(this.props.featureDiagramLayout!, format))
                        this.props.onShowOverlay({overlay: OverlayType.exportDialog, overlayProps: {format}});
                })
        }, {
            text: i18n.t('commands.featureDiagram.setLayout'),
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.layout'),
                    items: () => Object.values(FeatureDiagramLayoutType).map(layout => ({text: i18n.t('commands.featureDiagram', layout), key: layout}))
                }],
                layoutString => this.props.onSetFeatureDiagramLayout({layout: (FeatureDiagramLayoutType as any)[layoutString]}))
        }, {
            key: 'fitToScreen',
            icon: 'FullScreen',
            text: i18n.t('commands.featureDiagram.fitToScreen'),
            disabled: () => !this.props.featureModel,
            action: this.action(this.props.onFitToScreen)
        }, {
            key: 'toggleConstraintView',
            text: i18n.t('commandPalette.featureDiagram.toggleConstraintView'),
            disabled: () => !enableConstraintsView(this.props.featureModel),
            action: this.action(() => this.props.onSetSetting(
                {path: 'views.splitAt', value: (splitAt: number) =>
                    splitAt > defaultSettings.views.splitAt ? defaultSettings.views.splitAt : 1}))
        }, {
            key: 'toggleConstraintViewSplitDirection',
            text: i18n.t('commandPalette.featureDiagram.toggleConstraintViewSplitDirection'),
            disabled: () => !enableConstraintsView(this.props.featureModel),
            action: this.action(() => this.props.onSetSetting(
                {path: 'views.splitDirection', value: (splitDirection: 'horizontal' | 'vertical') =>
                    splitDirection === 'horizontal' ? 'vertical' : 'horizontal'}))
        },
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.newMenu.newBelow'),
            shortcut: getShortcutText('featureDiagram.feature.new'),
            icon: 'Add'
        }, featureID => {
            if (preconditions.featureDiagram.feature.createBelow(featureID, this.props.featureModel!))
                this.props.onCreateFeatureBelow({featureParentID: featureID});
            else
                logger.warn(() => `feature ${featureID} vanished`);
        }),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.newMenu.newAbove'),
            icon: 'Add'
        }, featureID => {
            if (preconditions.featureDiagram.feature.createAbove([featureID], this.props.featureModel!))
                this.props.onCreateFeatureAbove({featureIDs: [featureID]});
            else
                logger.warn(() => `feature ${featureID} vanished`);
        }),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.removeMenu.remove')({length: 1}),
            shortcut: getShortcutText('featureDiagram.feature.remove'),
            icon: 'Remove'
        }, featureID => {
            if (preconditions.featureDiagram.feature.remove([featureID], this.props.featureModel!))
                this.props.onRemoveFeature({featureIDs: [featureID]});
            else
                logger.warn(() => `feature ${featureID} vanished`);
        }),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.removeMenu.removeBelow'),
            icon: 'Remove'
        }, featureID => {
            if (preconditions.featureDiagram.feature.removeSubtree([featureID], this.props.featureModel!))
                this.props.onRemoveFeatureSubtree({featureIDs: [featureID]});
            else
                logger.warn(() => `feature ${featureID} vanished`);
        }),
        
        {
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.featureDiagram.feature.moveSource'),
                    items: () => this.props.featureModel!.getFeatureIDs().map(featureID => ({
                        key: featureID, text: this.props.featureModel!.getFeatureTree(featureID)!.name
                    }))
                }, {
                    title: i18n.t('commandPalette.featureDiagram.feature.moveTarget'),
                    items: moveSourceID => {
                        const getFeatureNode = (featureID: string) => this.props.featureModel!.getFeatureNode(featureID)!,
                            featureIDsBelowMoveSource = getFeatureIDsBelow(getFeatureNode(moveSourceID));
                        return this.props.featureModel!.getFeatureIDs()
                            .filter(featureID => !featureIDsBelowMoveSource.includes(featureID))
                            .map(featureID => ({key: featureID, text: getFeatureNode(featureID).data.name}))
                    }
                }],
                (featureID, featureParentID) => {
                    if (preconditions.featureDiagram.feature.moveSubtree(featureID, featureParentID, this.props.featureModel!))
                        this.props.onMoveFeatureSubtree({featureID, featureParentID});
                    else
                        logger.warn(() => `feature ${featureID} vanished`);
                }),
            text: i18n.t('commandPalette.featureDiagram.feature.move'),
            icon: 'Move'
        },
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.details'),
            shortcut: getShortcutText('featureDiagram.feature.details'),
            icon: 'Info'
        }, featureID => this.props.onShowOverlay({overlay: OverlayType.featurePanel, overlayProps: {featureID}})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.rename'),
            shortcut: getShortcutText('featureDiagram.feature.rename'),
            icon: 'Rename'
        }, featureID => this.props.onShowOverlay({overlay: OverlayType.featureRenameDialog, overlayProps: {featureID}})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.setDescription'),
            icon: 'TextDocument',
        }, featureID => this.props.onShowOverlay({overlay: OverlayType.featureSetDescriptionDialog, overlayProps: {featureID}})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.abstract')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setAbstract([featureID], this.props.featureModel!))
                    this.props.onSetFeatureAbstract({featureIDs: [featureID], value: true});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.concrete')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setAbstract([featureID], this.props.featureModel!))
                    this.props.onSetFeatureAbstract({featureIDs: [featureID], value: false});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.hidden')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setHidden([featureID], this.props.featureModel!))
                    this.props.onSetFeatureHidden({featureIDs: [featureID], value: !this.props.featureModel!.getFeatureTree(featureID)!.isHidden});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.optional')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setOptional([featureID], this.props.featureModel!))
                    this.props.onSetFeatureOptional({featureIDs: [featureID], value: true});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
    
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.mandatory')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setOptional([featureID], this.props.featureModel!))
                    this.props.onSetFeatureOptional({featureIDs: [featureID], value: false});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
                
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.and')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setGroupType([featureID], this.props.featureModel!))
                    this.props.onSetFeatureAnd({featureIDs: [featureID]});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.or')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setGroupType([featureID], this.props.featureModel!))
                    this.props.onSetFeatureOr({featureIDs: [featureID]});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.alternative')},
            featureID => {
                if (preconditions.featureDiagram.feature.properties.setGroupType([featureID], this.props.featureModel!))
                    this.props.onSetFeatureAlternative({featureIDs: [featureID]});
                else
                    logger.warn(() => `feature ${featureID} vanished`);
            }),
        
        {
            text: i18n.t('commandPalette.featureDiagram.constraint.new'),
            icon: 'Add',
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.constraint'),
                    allowFreeform: true,
                    transformFreeform: value =>
                        ConstraintNode.readFormulaFromString(value,
                            this.props.featureModel!, paletteConstraintRenderer).preview ||
                        i18n.t('commandPalette.featureDiagram.constraint.invalid')
                }],
                formulaString => {
                    const {formula} = ConstraintNode.readFormulaFromString(formulaString,
                        this.props.featureModel!, paletteConstraintRenderer);
                    if (!formula || !preconditions.featureDiagram.constraint.create(formula, this.props.featureModel!))
                        logger.warn(() => 'invalid formula given'); // TODO: better error reporting UI
                    else
                        this.props.onCreateConstraint({formula});
                })
        }, {
            text: i18n.t('commandPalette.featureDiagram.constraint.set'),
            icon: 'Edit',
            disabled: () => !enableConstraintsView(this.props.featureModel),
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.oldConstraint'),
                    items: () => this.props.featureModel!.constraintNodes.map(constraint => ({
                        key: constraint.id, text: constraint.render(paletteConstraintRenderer)
                    }))
                }, {
                    title: i18n.t('commandPalette.newConstraint'),
                    allowFreeform: true,
                    transformFreeform: value =>
                        ConstraintNode.readFormulaFromString(value,
                            this.props.featureModel!, paletteConstraintRenderer).preview ||
                        i18n.t('commandPalette.featureDiagram.constraint.invalid')
                }],
                (constraintID, formulaString) => {
                    const {formula} = ConstraintNode.readFormulaFromString(formulaString,
                        this.props.featureModel!, paletteConstraintRenderer);
                    if (!formula || !preconditions.featureDiagram.constraint.set(constraintID, formula, this.props.featureModel!))
                        logger.warn(() => `invalid formula given or constraint ${constraintID} vanished`); // TODO: better error reporting UI
                    else
                        this.props.onSetConstraint({constraintID, formula});
                })
        }, {
            text: i18n.t('commandPalette.featureDiagram.constraint.remove'),
            icon: 'Remove',
            disabled: () => !enableConstraintsView(this.props.featureModel),
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.constraint'),
                    items: () => this.props.featureModel!.constraintNodes.map(constraint => ({
                        key: constraint.id, text: constraint.render(paletteConstraintRenderer)
                    }))
                }],
                constraintID => {
                    if (!preconditions.featureDiagram.constraint.remove(constraintID, this.props.featureModel!))
                        logger.warn(() => `constraint ${constraintID} vanished`); // TODO: better error reporting UI
                    else
                    this.props.onRemoveConstraint({constraintID});
                })
        },

        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(false),
            shortcut: getShortcutText('featureDiagram.feature.collapse'),
            icon: 'CollapseContentSingle'
        }, featureID => this.props.onCollapseFeatures({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(true),
            shortcut: getShortcutText('featureDiagram.feature.expand'),
            icon: 'ExploreContentSingle'
        }, featureID => this.props.onExpandFeatures({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseBelow'),
            icon: 'CollapseContent'
        }, featureID => this.props.onCollapseFeaturesBelow({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandBelow'),
            icon: 'ExploreContent'
        }, featureID => this.props.onExpandFeaturesBelow({featureIDs: [featureID]})),
        
        {
            text: i18n.t('commands.featureDiagram.feature.collapseAll'),
            shortcut: getShortcutText('featureDiagram.feature.collapse'),
            icon: 'CollapseContent',
            disabled: () => !this.props.featureModel,
            action: this.action(this.props.onCollapseAllFeatures)
        }, {
            text: i18n.t('commands.featureDiagram.feature.expandAll'),
            shortcut: getShortcutText('featureDiagram.feature.expand'),
            icon: 'ExploreContent',
            disabled: () => !this.props.featureModel,
            action: this.action(this.props.onExpandAllFeatures)
        }, {
            text: i18n.t('commandPalette.developer.debug'),
            icon: 'DeveloperTools',
            action: this.action(() => this.props.onSetSetting(
                {path: 'developer.debug', value: (bool: boolean) => !bool}))
        }, {
            text: i18n.t('commandPalette.developer.clearLocalStorage'),
            icon: 'DeveloperTools',
            action: clearLocalStorage
        }, {
            text: i18n.t('commandPalette.developer.reset'),
            icon: 'DeveloperTools',
            action: () => window.confirm(i18n.t('commandPalette.developer.confirmReset')) && this.props.onReset()
        }, {
            text: i18n.t('commandPalette.exit'),
            icon: 'ChromeClose',
            action: () => this.props.onExit()
        }
    ];

    render() {
        const items = this.state.argumentItems || this.commands;
        return (
            <Palette
                key={this.state.rerenderPalette}
                isOpen={this.props.isOpen}
                items={items}
                onDismiss={this.props.onDismiss}
                allowFreeform={this.state.allowFreeform}
                transformFreeform={this.state.transformFreeform}
                placeholder={this.state.title}
                onSubmit={this.onSubmit}
                itemUsage={this.state.argumentItems ? {} : this.commandUsage}/>
        );
    }
};