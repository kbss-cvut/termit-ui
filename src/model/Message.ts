import MType from "./MessageType";

export type MessageType = "success" | "danger" | "warning" | "info";

export interface MessageData {
    message?: string;
    messageId?: string;
    values?: {};
}

/**
 * Represents a message published by TermIt UI's internal notification system.
 *
 * Examples of messages published by this system are successful creation of a term, save of a record etc.
 *
 * An instance can contain either directly the text of the message, or a message id used by the i18n function.
 */
export default class Message {
    private readonly mMessage?: string;
    private readonly mMessageId?: string;
    private readonly mValues?: {};    // Values for message formatting, relevant only for messageId
    private readonly mType: MessageType;
    private readonly mTimestamp: number;

    constructor(data: MessageData, type?: MessageType) {
        this.mMessage = data.message;
        this.mMessageId = data.messageId;
        this.mValues = data.values;
        this.mType = type ? type : MType.INFO;
        this.mTimestamp = Date.now();
    }

    get message(): string | undefined {
        return this.mMessage;
    }

    get messageId(): string | undefined {
        return this.mMessageId;
    }

    get values(): {} | undefined {
        return this.mValues;
    }

    get type(): MessageType {
        return this.mType;
    }

    get timestamp(): number {
        return this.mTimestamp;
    }
}

export function createStringMessage(text: string) {
    return new Message({message: text});
}

export function createFormattedMessage(mId: string, values?: {}) {
    return new Message({
        messageId: mId,
        values
    });
}
