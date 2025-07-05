import winston from "winston";
declare const logger: winston.Logger;
export declare const businessLogger: {
    parsingStarted: (symbol: string, source: string) => void;
    parsingCompleted: (symbol: string, source: string, duration: number, offerCount: number) => void;
    parsingFailed: (symbol: string, source: string, error: string, duration: number) => void;
    dataQualityAlert: (symbol: string, source: string, score: number, issues: string[]) => void;
    rateLimitHit: (source: string, retryAfter: number) => void;
    cacheHit: (symbol: string, source: string, age: number) => void;
    cacheMiss: (symbol: string, source: string) => void;
};
export { logger };
//# sourceMappingURL=logger.d.ts.map