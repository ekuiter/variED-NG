/**
 * Manages the root application component.
 */

import React from 'react';
import {openWebSocket} from '../server/webSocket';
import {connect} from 'react-redux';
import {ThemeProvider} from '@fluentui/react';
import OverlayContainer from './overlays/OverlayContainer';
import CommandBarContainer from './CommandBarContainer';
import ShortcutContainer from './ShortcutContainer';
import actions from '../store/actions';
import {StateDerivedProps, State} from '../store/types';
import logger, {setLogLevel, LogLevel} from '../helpers/logger';
import {flushOutgoingMessageQueue, queueingMessageHandler} from '../server/messageQueue';
import {artifactPathToString} from '../types';
import {history, getCurrentArtifactPath} from '../router';
import {Router, Route, Switch} from 'react-router-dom';
import FeatureDiagramRouteContainer from './FeatureDiagramRouteContainer';

class AppContainer extends React.Component<StateDerivedProps> {
    flushOutgoingMessageQueueInterval?: number;

    componentDidMount() {
        openWebSocket(queueingMessageHandler(this.props.handleMessage));

        this.flushOutgoingMessageQueueInterval = window.setInterval( // todo remove?
            flushOutgoingMessageQueue, this.props.settings!.intervals.flushOutgoingMessageQueue);

        if (this.props.settings!.developer.debug)
            setLogLevel(LogLevel.info);
    }

    componentWillUnmount() {
        window.clearInterval(this.flushOutgoingMessageQueueInterval);
    }

    componentDidUpdate() {
        const currentArtifactPath = getCurrentArtifactPath(this.props.sessions!);
        document.title = currentArtifactPath
            ? `${artifactPathToString(currentArtifactPath)} | variED`
            : 'variED';
    }

    render() {
        return (
            <Router history={history}>
                <ThemeProvider className="fabricRoot">
                    <div className="header">
                        <CommandBarContainer/>
                    </div>
                    <OverlayContainer/>
                    <ShortcutContainer/>
                    <Switch>
                        <Route path="/:project/:artifact" component={FeatureDiagramRouteContainer}/>
                    </Switch>
                </ThemeProvider>
            </Router>
        );
    }
}

export default connect(
    logger.mapStateToProps('AppContainer', (state: State): StateDerivedProps => ({
        settings: state.settings,
        sessions: state.sessions
    })),
    (dispatch): StateDerivedProps => ({
        handleMessage: message => dispatch(actions.server.receive(message)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload))
    })
)(AppContainer);