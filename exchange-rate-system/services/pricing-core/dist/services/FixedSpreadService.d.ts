import { PricingResult, SpotRate } from '../types/pricing';
/**
 * Fixed Spread Service (pricing.v1)
 *
 * Core implementation for stabilizing partner payouts through fixed spreads.
 * Implements formula: payout_rate = spot_rate + fixed_spread_%
 */
export declare class FixedSpreadService {
    private readonly SPREAD_CONFIG_CACHE_KEY;
    private readonly PRICING_CACHE_TTL;
    /**
     * Calculate final rate using fixed spread methodology
     * Core formula: payout_rate = spot_rate + fixed_spread_%
     */
    calculateRate(symbol: string, spotRate: SpotRate, partnerId?: string): Promise<PricingResult>;
    /**
     * Calculate fixed spread amount based on configuration
     */
    private calculateFixedSpread;
    /**
     * Check if spread configuration is currently active
     */
    private isConfigActive;
    /**
     * Calculate confidence score for the pricing result
     */
    private calculateConfidence;
    private getSpreadConfig;
}
//# sourceMappingURL=FixedSpreadService.d.ts.map