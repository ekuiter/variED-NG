/**
 * The application uses web sockets to communicate with the server.
 */

import constants from '../constants';
import {Message} from '../types';
import logger from '../helpers/logger';
import Sockette from './Sockette';
import {v4 as uuidv4} from 'uuid';

type HandleMessageFunction = (data: Message) => void;

let handleMessage: HandleMessageFunction;
const tag = 'socket';

const getWebSocket = ((): () => Promise<Sockette> => {
    let promise: Promise<Sockette> | undefined;

    function connect(): Promise<Sockette> {
        return promise = new Promise((resolve, reject) => {
            const url = constants.server.webSocket(uuidv4());
            logger.logTagged({tag}, () => `connecting to ${url}`);

            const sockette = new Sockette(url, {
                onopen() {
                    logger.logTagged({tag}, () => `open`);
                    resolve(sockette);
                },

                onclose(e) {
                    logger.warnTagged({tag}, () => `closed with code ${e.code} and reason ${e.reason}`);
                    promise = undefined;
                    // TODO: notify user that WebSocket was closed
                },

                onerror(e: any) {
                    logger.warnTagged({tag}, () => e);
                    // TODO: notify user of error
                    reject(e);
                },

                onreconnect() {
                    // TODO: notify user of reconnect
                    logger.logTagged({tag}, () => `reconnect to ${url}`);
                    return url;
                },

                onmessage(message) {
                    const data: Message = JSON.parse(message.data);
                    logger.logTagged({tag: 'receive'}, () => data);
                    if (handleMessage)
                        handleMessage(data);
                }
            });
        });
    }

    return () => promise || connect();
})();

export async function openWebSocket(_handleMessage?: HandleMessageFunction): Promise<void> {
    if (typeof _handleMessage === 'function')
        handleMessage = _handleMessage;
    await getWebSocket();
    // return nothing to not expose WebSocket object
}

export async function sendMessage(message: Message): Promise<void> {
    const webSocket = await getWebSocket();
    logger.logTagged({tag: 'send'}, () => message);
    webSocket.send(JSON.stringify(message));
}