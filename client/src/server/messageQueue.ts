import {ArtifactPath, Message} from '../types';
import {sendMessage} from './webSocket';
import logger from '../helpers/logger';

const tag = 'queue';
const outgoingMessageQueue: Message[] = [];
const incomingMessageQueue: Message[] = [];
let isFlushingOutgoingMessageQueue = false;

export function enqueueOutgoingMessage(message: Message, artifactPath?: ArtifactPath): Message {
    if (artifactPath)
        message = {artifactPath, ...message};
    outgoingMessageQueue.push(message);
    return message;
}

function enqueueIncomingMessage(message: Message): void {
    incomingMessageQueue.push(message);
}

export function numberofUnflushedOutgoingMessages(): number {
    return outgoingMessageQueue.length;
}

export async function flushOutgoingMessageQueue(forceFlush = false): Promise<void> {
    if (isFlushingOutgoingMessageQueue) {
        logger.warnTagged({tag}, () => 'already flushing message queue, abort');
        return;
    }

    isFlushingOutgoingMessageQueue = true;
    const numberOfMessages = outgoingMessageQueue.length;
    while (numberofUnflushedOutgoingMessages() > 0) {
        try {
            await sendMessage(outgoingMessageQueue[0]);
        } catch (e) {
            // TODO: warn the user that the message will be sent when reconnected (maybe give an undo
            // button to remove the message from the queue and undo the operation)
            logger.warnTagged({tag}, () => `could not send ${outgoingMessageQueue[0].type} message, abort flushing message queue`);
            isFlushingOutgoingMessageQueue = false;
            return;
        }
        outgoingMessageQueue.shift();
    }

    if (numberOfMessages > 0)
        logger.infoTagged({tag}, () => `successfully sent ${numberOfMessages} messages`);
    isFlushingOutgoingMessageQueue = false;
}

export function flushIncomingMessageQueue(handleMessage?: (msg: Message) => void, forceFlush = false): void {
    while (incomingMessageQueue.length > 0) {
        if (handleMessage)
            handleMessage(incomingMessageQueue[0]);
        incomingMessageQueue.shift();
    }
}

export const queueingMessageHandler = (handleMessage?: (msg: Message) => void) =>
    (message: Message): void => {
        enqueueIncomingMessage(message);
        flushIncomingMessageQueue(handleMessage);
    };

export function forceFlushMessageQueues(handleMessage?: (msg: Message) => void): void {
    flushOutgoingMessageQueue(true);
    flushIncomingMessageQueue(handleMessage, true);
}