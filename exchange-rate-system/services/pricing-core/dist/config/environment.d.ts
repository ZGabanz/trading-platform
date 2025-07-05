interface AppConfig {
    app: {
        name: string;
        version: string;
        env: string;
        port: number;
        logLevel: string;
    };
    database: {
        host: string;
        port: number;
        name: string;
        username: string;
        password: string;
        ssl: boolean;
        maxConnections: number;
        acquireTimeout: number;
        timeout: number;
    };
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
        connectTimeout: number;
        lazyConnect: boolean;
        retryDelayOnFailover: number;
        maxRetriesPerRequest: number;
    };
    cors: {
        origins: string[];
    };
    jwt: {
        secret: string;
        expiresIn: string;
        issuer: string;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    pricing: {
        defaultCacheTTL: number;
        pricingCacheTTL: number;
        maxSpreadDeviation: number;
        volatilityAnalysisWindow: number;
    };
    external: {
        rapiraApiUrl: string;
        bybitApiUrl: string;
        htxApiUrl: string;
        requestTimeout: number;
        retryAttempts: number;
    };
    monitoring: {
        metricsEnabled: boolean;
        healthCheckInterval: number;
        alertingEnabled: boolean;
    };
    notifications: {
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            user?: string;
            pass?: string;
        };
        telegram: {
            botToken?: string;
            chatId?: string;
        };
        slack: {
            webhookUrl?: string;
        };
    };
}
declare const config: AppConfig;
export { config, AppConfig };
//# sourceMappingURL=environment.d.ts.map