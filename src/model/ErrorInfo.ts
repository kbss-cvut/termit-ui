export interface ErrorLogItem {
    timestamp: number;
    error: ErrorInfo;
}

export interface ErrorData {
    requestUrl?: string;
    messageId?: string;
    message?: string;
    status?: number; // Response status
}

/**
 * Represents error received from the server API.
 */
export default class ErrorInfo {
    public readonly origin: string;
    public readonly requestUrl?: string;
    public readonly messageId?: string;
    public readonly message?: string;
    public readonly status?: number;

    constructor(origin: string, data: ErrorData) {
        this.origin = origin;
        Object.assign(this, data);
    }
}
