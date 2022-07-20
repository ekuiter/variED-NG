/**
 * Main application entry point.
 * This initializes Redux and the React app container.
 */

import ReactDOM from 'react-dom';
import AppContainer from './components/AppContainer';
import 'normalize.css';
import './stylesheets/index.css';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import {persistStore, persistReducer, createTransform} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider} from 'react-redux';
import reducer, {Store} from './store/reducer';
import {initializeIcons} from '@fluentui/react';
import actions, {Action} from './store/actions';
import {LogLevel, setLogLevel} from './helpers/logger';
import {initialState, State} from './store/types';
import {numberofUnflushedOutgoingMessages} from './server/messageQueue';
import i18n from './i18n';

declare var window: any;

(() => {
    window.addEventListener('beforeunload', (e: BeforeUnloadEvent) => {
        if (numberofUnflushedOutgoingMessages() > 0)
            e.returnValue = i18n.getFunction('hasUnflushedOutgoingMessages')(numberofUnflushedOutgoingMessages());
    });

    initializeIcons('/fonts/');

    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    const substateTransform = createTransform(
        // ignore the state keys whitelisted below
        // (redux-persist white/blacklist does not work for some reason)
        (inboundState, key) => (initialState as any)[key],
        (outboundState, key) => outboundState,
        {'whitelist': ['overlay', 'overlayProps', 'sessions', 'artifactPaths']}
    );
    const persistedReducer = persistReducer<State, Action>({
        key: 'root',
        storage,
        transforms: [substateTransform]
    }, reducer);
    const store: Store = createStore(
        persistedReducer,
        composeEnhancers(applyMiddleware(thunk)));
    const persistor = persistStore(store as any);

    // for debugging purposes
    window.app = {
        setLogLevel,
        LogLevel, // parameter for setLogLevel
        actions, // can be dispatched with the store (for debugging)
        store, // used by message delay/offline simulation
        persistor // used to clear local storage
    };

    ReactDOM.render((
        <Provider store={store}>
            <PersistGate persistor={persistor}>
                <AppContainer/>
            </PersistGate>
        </Provider>
    ), document.getElementById('root'));
})();