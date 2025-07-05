import winston from "winston";
declare const logger: winston.Logger;
export declare const Logger: {
    error: (message: string, error?: Error | any, meta?: Record<string, any>) => void;
    warn: (message: string, meta?: Record<string, any>) => void;
    info: (message: string, meta?: Record<string, any>) => void;
    debug: (message: string, meta?: Record<string, any>) => void;
    http: (message: string, meta?: Record<string, any>) => void;
    pricing: {
        calculation: (symbol: string, method: string, duration: number, meta?: Record<string, any>) => void;
        error: (symbol: string, error: Error, meta?: Record<string, any>) => void;
        spreadUpdate: (symbol: string, oldSpread: string, newSpread: string, updatedBy: string) => void;
        alert: (alertType: string, symbol: string, severity: string, meta?: Record<string, any>) => void;
    };
    performance: {
        start: (operation: string, meta?: Record<string, any>) => {
            end: (additionalMeta?: Record<string, any>) => number;
        };
        slow: (operation: string, duration: number, threshold: number, meta?: Record<string, any>) => void;
    };
    api: {
        request: (method: string, url: string, statusCode: number, duration: number, meta?: Record<string, any>) => void;
        error: (method: string, url: string, error: Error, meta?: Record<string, any>) => void;
    };
    database: {
        query: (query: string, duration: number, meta?: Record<string, any>) => void;
        error: (query: string, error: Error, meta?: Record<string, any>) => void;
        connection: (event: "connected" | "disconnected" | "error", meta?: Record<string, any>) => void;
    };
    cache: {
        hit: (key: string, meta?: Record<string, any>) => void;
        miss: (key: string, meta?: Record<string, any>) => void;
        set: (key: string, ttl: number, meta?: Record<string, any>) => void;
        error: (operation: string, key: string, error: Error, meta?: Record<string, any>) => void;
    };
    external: {
        request: (service: string, endpoint: string, duration: number, meta?: Record<string, any>) => void;
        error: (service: string, endpoint: string, error: Error, meta?: Record<string, any>) => void;
        rateLimit: (service: string, endpoint: string, meta?: Record<string, any>) => void;
    };
};
export { logger };
export default Logger;
//# sourceMappingURL=logger.d.ts.map