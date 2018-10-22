import React from 'react';
import i18n from '../../i18n';
import {OnShowOverlayFunction, OnUndoFunction, OnRedoFunction} from '../../store/types';
import {getShortcutText} from '../../shortcuts';
import {OverlayType, Omit, MessageType} from '../../types';
import Palette, {PaletteItem, PaletteAction} from 'src/helpers/Palette';
import stringify from 'json-stable-stringify';

interface Props {
    isOpen: boolean,
    onDismiss: () => void,
    onShowOverlay: OnShowOverlayFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction
};

interface State {
    argumentItems?: PaletteItem[]
};

export default class extends React.Component<Props, State> {
    state: State = {};

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isOpen && this.props.isOpen)
            this.setState({argumentItems: undefined});
    }

    action = (action: PaletteAction): PaletteAction => {
        return () => {
            this.props.onDismiss();
            action();
        };
    };

    actionWithArguments = (args: Omit<PaletteItem, 'action'>[][], action: PaletteAction): PaletteAction => {
        if (args.length === 0)
            return this.action(action);

        return () => {
            this.setState({argumentItems: args[0].map(item => ({
                // bind current argument and recurse (until all arguments are bound)
                ...item, action: this.actionWithArguments(args.slice(1), action.bind(undefined, item.text))
            }))});
        };
    };

    commands: PaletteItem[] = [
        {
            text: 'Join',
            action: this.actionWithArguments([
                    [{text: 'FeatureModeling'}],
                    [{text: 'CTV'}, {text: 'FeatureIDE'}, {text: 'Automotive'}]
                ],
                (project, artifact) => // TODO
                    (window as any).app.sendMessage({type: MessageType.JOIN, artifact: `${project}::${artifact}`}))
        }, {
            text: i18n.t('commands.settings'),
            icon: 'Settings',
            shortcut: getShortcutText('settings'),
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commands.about'),
            icon: 'Info',
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commands.undo'),
            icon: 'Undo',
            shortcut: getShortcutText('undo'),
            action: this.action(this.props.onUndo)
        }, {
            text: i18n.t('commands.redo'),
            icon: 'Redo',
            shortcut: getShortcutText('redo'),
            action: this.action(this.props.onRedo)
        }
    ];

    render() {
        const items = this.state.argumentItems || this.commands;
        return (
            <Palette
                key={stringify(items)}
                isOpen={this.props.isOpen}
                items={items}
                onDismiss={this.props.onDismiss}/>
        );
    }
};