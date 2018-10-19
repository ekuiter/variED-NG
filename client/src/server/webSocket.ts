/**
 * The application uses web sockets to communicate with the server.
 */

import constants from '../constants';
import {Message, MessageType} from '../types';

type HandleMessageFunction = (data: Message) => void;

let handleMessage: HandleMessageFunction;

const getWebSocket = ((): () => Promise<WebSocket> => {
    let webSocket: WebSocket;

    function connect(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            webSocket = new WebSocket(constants.server.webSocket);
            
            webSocket.onopen = () => {
                console.log('opened WebSocket');
                resolve(webSocket);
            };
            
            webSocket.onclose = e => {
                console.warn('closed WebSocket with code', e.code, 'and reason', e.reason);
                // TODO: notify user that WebSocket was closed (with button to reopen)
            };
            
            webSocket.onerror = e => {
                console.warn('WebSocket error:', e);
                // TODO: notify user of error (and IF WebSocket is closed now, a button to reopen it)
                reject(e);
            };
            
            webSocket.onmessage = message => {
                let data = JSON.parse(message.data);
                console.log('received:', data);
                handleMessage && handleMessage(data);
            };
        });
    }

    return () => (webSocket && webSocket.readyState !== webSocket.CLOSED)
        ? Promise.resolve(webSocket)
        : connect();
})();

export function openWebSocket(_handleMessage?: HandleMessageFunction): Promise<void> {
    if (typeof _handleMessage === 'function')
        handleMessage = _handleMessage;
    return getWebSocket().then(() => {}); // do not expose WebSocket object
}

export function sendMessage(message: Message): Promise<void> {
    return getWebSocket().then(webSocket => {
        webSocket.send(JSON.stringify(message));
        console.log('sent:', message);
    });
}

export function sendMultipleMessages(messages: Message[]): Promise<void> {
    if (!messages || messages.length === 0)
        return Promise.resolve();
    if (messages.length === 1)
        return sendMessage(messages[0]);
    return sendMessage({type: MessageType.MULTIPLE_MESSAGES, messages});
}

(window as any).sendMessage = sendMessage; // for debugging purposes