import { P2PParsingResult, P2PParsingConfig } from "../types/p2p";
export declare class BybitParser {
    private client;
    private config;
    private lastRequestTime;
    constructor(config: P2PParsingConfig);
    /**
     * Parse P2P market data for a given symbol
     */
    parseMarketData(symbol: string): Promise<P2PParsingResult>;
    /**
     * Fetch P2P offers from Bybit API
     */
    private fetchOffers;
    /**
     * Convert Bybit API offers to our standard format
     */
    private convertApiOffers;
    /**
     * Filter offers based on configuration criteria
     */
    private filterOffers;
    /**
     * Get top sellers based on rating and volume
     */
    private getTopSellers;
    /**
     * Calculate market statistics
     */
    private calculateMarketData;
    /**
     * Calculate data quality score
     */
    private calculateDataQuality;
    /**
     * Calculate seller rating based on various factors
     */
    private calculateRating;
    /**
     * Map user level to verification level
     */
    private getVerificationLevel;
    /**
     * Map Bybit payment methods to our standard format
     */
    private mapPaymentMethods;
}
//# sourceMappingURL=BybitParser.d.ts.map