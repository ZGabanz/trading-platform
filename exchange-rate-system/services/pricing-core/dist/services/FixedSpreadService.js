"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedSpreadService = void 0;
const decimal_js_1 = require("decimal.js");
/**
 * Fixed Spread Service (pricing.v1)
 *
 * Core implementation for stabilizing partner payouts through fixed spreads.
 * Implements formula: payout_rate = spot_rate + fixed_spread_%
 */
class FixedSpreadService {
    constructor() {
        this.SPREAD_CONFIG_CACHE_KEY = 'spread_config:';
        this.PRICING_CACHE_TTL = 30; // 30 seconds
    }
    /**
     * Calculate final rate using fixed spread methodology
     * Core formula: payout_rate = spot_rate + fixed_spread_%
     */
    async calculateRate(symbol, spotRate, partnerId) {
        try {
            // Get spread configuration
            const spreadConfig = await this.getSpreadConfig(symbol, partnerId);
            if (!spreadConfig) {
                throw new Error(`No spread configuration found for symbol: ${symbol}`);
            }
            // Validate spread configuration is active
            if (!this.isConfigActive(spreadConfig)) {
                throw new Error(`Spread configuration for ${symbol} is not active`);
            }
            // Calculate fixed spread
            const fixedSpread = this.calculateFixedSpread(spotRate.price, spreadConfig);
            // Calculate final rate
            const finalRate = spotRate.price.plus(fixedSpread);
            // Create pricing result
            const result = {
                symbol,
                spotRate: spotRate.price,
                p2pIndicativeRate: undefined,
                fixedSpread,
                volatilitySpread: new decimal_js_1.Decimal('0'),
                finalRate,
                calculationMethod: 'FIXED_SPREAD',
                timestamp: new Date(),
                confidence: this.calculateConfidence(spotRate, spreadConfig),
                warnings: [],
                metadata: {
                    spotSource: spotRate.source,
                    spreadConfigId: spreadConfig.id,
                    historicalDataPoints: 1
                }
            };
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Calculate fixed spread amount based on configuration
     */
    calculateFixedSpread(spotRate, config) {
        // Calculate percentage-based spread
        const spreadAmount = spotRate.mul(config.baseSpreadPercent).div(100);
        // Ensure spread is within configured boundaries
        const minSpreadAmount = spotRate.mul(config.minSpreadPercent).div(100);
        const maxSpreadAmount = spotRate.mul(config.maxSpreadPercent).div(100);
        return decimal_js_1.Decimal.max(minSpreadAmount, decimal_js_1.Decimal.min(maxSpreadAmount, spreadAmount));
    }
    /**
     * Check if spread configuration is currently active
     */
    isConfigActive(config) {
        const now = new Date();
        if (!config.isActive) {
            return false;
        }
        if (config.validFrom > now) {
            return false;
        }
        if (config.validTo && config.validTo < now) {
            return false;
        }
        return true;
    }
    /**
     * Calculate confidence score for the pricing result
     */
    calculateConfidence(spotRate, config) {
        let confidence = 100;
        // Reduce confidence based on data age
        const dataAge = Date.now() - spotRate.timestamp.getTime();
        const maxAge = 60000; // 1 minute
        if (dataAge > maxAge) {
            confidence -= Math.min(30, (dataAge - maxAge) / 1000);
        }
        return Math.max(0, Math.min(100, confidence));
    }
    // Placeholder for database operations
    async getSpreadConfig(symbol, partnerId) {
        // TODO: Implement database query
        return null;
    }
}
exports.FixedSpreadService = FixedSpreadService;
//# sourceMappingURL=FixedSpreadService.js.map