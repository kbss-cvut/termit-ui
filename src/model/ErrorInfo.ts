export interface ErrorLogItem {
  timestamp: number;
  error: ErrorInfo;
}

export interface ErrorData {
  requestUrl?: string;
  messageId?: string;
  message?: string;
  /// values used for formatting localized message
  values?: { [key: string]: string };
  status?: number; // Response status
}

/**
 * Represents error received from the server API.
 */
export default class ErrorInfo implements ErrorData {
  public readonly origin: string;
  public readonly requestUrl?: string;
  public readonly messageId?: string;
  public readonly message?: string;
  public readonly status?: number;
  public readonly values?: { [key: string]: string };

  constructor(origin: string, data: ErrorData) {
    this.origin = origin;
    Object.assign(this, data);
  }
}
