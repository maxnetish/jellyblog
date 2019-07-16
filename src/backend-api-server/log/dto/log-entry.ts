export interface ILogEntry {
    requestUrl?: string;
    requestMethod?: string;
    responseTime: number;
    responseStatus?: string;
    referrer?: string;
    remoteAddress?: string;
    httpVersion?: string;
    userAgent?: string;
    userName?: string;
    date: Date;
    error?: string;
}
