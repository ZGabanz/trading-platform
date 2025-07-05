import { Decimal } from "decimal.js";
/**
 * P2P Exchange Sources
 */
export type P2PSource = "BYBIT" | "HTX" | "BINANCE" | "OKX";
/**
 * Payment methods supported by P2P platforms
 */
export type PaymentMethod = "BANK_TRANSFER" | "ALIPAY" | "WECHAT" | "PAYPAL" | "CASH" | "WISE" | "REVOLUT" | "SEPA" | "PIX";
/**
 * P2P seller information
 */
export interface P2PSeller {
    id: string;
    nickname: string;
    completionRate: number;
    totalOrders: number;
    rating: number;
    verificationLevel: "BASIC" | "INTERMEDIATE" | "ADVANCED";
    responseTime: number;
    isOnline: boolean;
    lastActiveTime: Date;
}
/**
 * P2P advertisement/offer
 */
export interface P2POffer {
    id: string;
    seller: P2PSeller;
    fiatCurrency: string;
    cryptoCurrency: string;
    price: Decimal;
    minAmount: Decimal;
    maxAmount: Decimal;
    availableAmount: Decimal;
    paymentMethods: PaymentMethod[];
    paymentTimeLimit: number;
    terms?: string;
    source: P2PSource;
    timestamp: Date;
}
/**
 * Aggregated P2P market data for a trading pair
 */
export interface P2PMarketData {
    symbol: string;
    source: P2PSource;
    offers: P2POffer[];
    topSellers: P2POffer[];
    weightedAveragePrice: Decimal;
    medianPrice: Decimal;
    lowestPrice: Decimal;
    highestPrice: Decimal;
    totalVolume: Decimal;
    offerCount: number;
    timestamp: Date;
    dataQuality: {
        score: number;
        issues: string[];
        coverage: number;
    };
}
/**
 * P2P parsing configuration
 */
export interface P2PParsingConfig {
    source: P2PSource;
    enabled: boolean;
    apiUrl?: string;
    webUrl?: string;
    requestTimeout: number;
    rateLimitDelay: number;
    maxRetries: number;
    sellerFilters: {
        minCompletionRate: number;
        minRating: number;
        minTotalOrders: number;
        requireVerification: boolean;
        maxResponseTime: number;
    };
    priceFilters: {
        maxDeviationPercent: number;
        minOfferAmount: Decimal;
        excludePaymentMethods: PaymentMethod[];
    };
    caching: {
        ttl: number;
        refreshInterval: number;
    };
}
/**
 * P2P parsing result
 */
export interface P2PParsingResult {
    success: boolean;
    source: P2PSource;
    symbol: string;
    data?: P2PMarketData;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    metadata: {
        parseTime: number;
        requestCount: number;
        cacheHit: boolean;
        dataAge: number;
        retryCount: number;
    };
}
/**
 * Historical P2P rate data
 */
export interface P2PHistoricalRate {
    id: string;
    symbol: string;
    source: P2PSource;
    weightedAveragePrice: Decimal;
    medianPrice: Decimal;
    offerCount: number;
    totalVolume: Decimal;
    dataQuality: number;
    timestamp: Date;
    createdAt: Date;
}
/**
 * P2P rate comparison with spot rates
 */
export interface P2PSpotComparison {
    symbol: string;
    timestamp: Date;
    spotRate: Decimal;
    p2pRates: {
        [source in P2PSource]?: {
            rate: Decimal;
            deviation: Decimal;
            quality: number;
        };
    };
    averageDeviation: Decimal;
    maxDeviation: Decimal;
    recommendedSource: P2PSource | null;
}
/**
 * Alert configuration for P2P monitoring
 */
export interface P2PAlert {
    id: string;
    symbol: string;
    source?: P2PSource;
    type: "PRICE_SPIKE" | "QUALITY_DROP" | "NO_DATA" | "HIGH_DEVIATION";
    threshold: number;
    isActive: boolean;
    lastTriggered?: Date;
    createdAt: Date;
}
/**
 * P2P parsing statistics
 */
export interface P2PParsingStats {
    source: P2PSource;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    cacheHitRate: number;
    dataQualityAverage: number;
    lastSuccessfulParse: Date;
    lastFailureReason?: string;
    uptime: number;
}
/**
 * Request/Response types for P2P API
 */
export interface P2PParseRequest {
    symbol: string;
    sources?: P2PSource[];
    forceRefresh?: boolean;
    topSellersOnly?: boolean;
    includeBuyOffers?: boolean;
}
export interface P2PParseResponse {
    success: boolean;
    data: {
        [source in P2PSource]?: P2PParsingResult;
    };
    summary?: {
        averageRate: Decimal;
        recommendedRate: Decimal;
        confidence: number;
        sources: P2PSource[];
    };
    metadata: {
        requestId: string;
        processingTime: number;
        timestamp: string;
    };
}
/**
 * Webhook payload for P2P rate updates
 */
export interface P2PWebhookPayload {
    event: "RATE_UPDATE" | "ALERT_TRIGGERED" | "SOURCE_FAILURE";
    symbol: string;
    source: P2PSource;
    data: any;
    timestamp: string;
}
/**
 * P2P service health status
 */
export interface P2PServiceHealth {
    status: "healthy" | "degraded" | "unhealthy";
    sources: {
        [source in P2PSource]?: {
            status: "online" | "offline" | "error";
            lastCheck: Date;
            responseTime?: number;
            error?: string;
        };
    };
    lastUpdate: Date;
    uptime: number;
}
//# sourceMappingURL=p2p.d.ts.map