import { Decimal } from "decimal.js";
import {
  FixedSpreadConfig,
  SpreadBoundary,
  PricingResult,
  SpotRate,
  PricingAlert,
} from "../types/pricing";
import { db } from "../database/connection";
import { logger } from "../utils/logger";

/**
 * Fixed Spread Service (pricing.v1)
 *
 * Core implementation for stabilizing partner payouts through fixed spreads.
 * Implements formula: payout_rate = spot_rate + fixed_spread_%
 */
export class FixedSpreadService {
  private readonly SPREAD_CONFIG_CACHE_KEY = "spread_config:";
  private readonly PRICING_CACHE_TTL = 30; // 30 seconds

  /**
   * Calculate final rate using fixed spread methodology
   * Core formula: payout_rate = spot_rate + fixed_spread_%
   */
  async calculateRate(
    symbol: string,
    spotRate: SpotRate,
    partnerId?: string
  ): Promise<PricingResult> {
    try {
      // Get spread configuration
      const spreadConfig = await this.getSpreadConfig(symbol, partnerId);
      if (!spreadConfig) {
        // Use default spread if no config found
        const defaultSpreadConfig: FixedSpreadConfig = {
          id: "default",
          symbol,
          baseSpreadPercent: new Decimal("0.5"),
          minSpreadPercent: new Decimal("0.1"),
          maxSpreadPercent: new Decimal("2.0"),
          isActive: true,
          validFrom: new Date(),
          validTo: undefined,
          partnerNotificationRequired: false,
          createdBy: "system",
          updatedBy: "system",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return this.calculateWithConfig(
          symbol,
          spotRate,
          defaultSpreadConfig,
          partnerId
        );
      }

      // Validate spread configuration is active
      if (!this.isConfigActive(spreadConfig)) {
        throw new Error(`Spread configuration for ${symbol} is not active`);
      }

      return this.calculateWithConfig(
        symbol,
        spotRate,
        spreadConfig,
        partnerId
      );
    } catch (error) {
      logger.error("Failed to calculate rate with fixed spread", {
        symbol,
        partnerId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Calculate rate with specific configuration
   */
  private async calculateWithConfig(
    symbol: string,
    spotRate: SpotRate,
    spreadConfig: FixedSpreadConfig,
    partnerId?: string
  ): Promise<PricingResult> {
    // Calculate fixed spread
    const fixedSpread = this.calculateFixedSpread(spotRate.price, spreadConfig);

    // Calculate final rate
    const finalRate = spotRate.price.plus(fixedSpread);

    // Save pricing result to database
    await this.savePricingResult({
      symbol,
      partnerId,
      spotRate: spotRate.price,
      p2pIndicativeRate: undefined,
      fixedSpread,
      volatilitySpread: new Decimal("0"),
      finalRate,
      calculationMethod: "FIXED_SPREAD",
      confidence: this.calculateConfidence(spotRate, spreadConfig),
      processingTime: 0,
      timestamp: new Date(),
    });

    // Create pricing result
    const result: PricingResult = {
      symbol,
      spotRate: spotRate.price,
      p2pIndicativeRate: undefined,
      fixedSpread,
      volatilitySpread: new Decimal("0"),
      finalRate,
      calculationMethod: "FIXED_SPREAD",
      timestamp: new Date(),
      confidence: this.calculateConfidence(spotRate, spreadConfig),
      warnings: [],
      metadata: {
        spotSource: spotRate.source,
        spreadConfigId: spreadConfig.id,
        historicalDataPoints: 1,
      },
    };

    return result;
  }

  /**
   * Calculate fixed spread amount based on configuration
   */
  private calculateFixedSpread(
    spotRate: Decimal,
    config: FixedSpreadConfig
  ): Decimal {
    // Calculate percentage-based spread
    const spreadAmount = spotRate.mul(config.baseSpreadPercent).div(100);

    // Ensure spread is within configured boundaries
    const minSpreadAmount = spotRate.mul(config.minSpreadPercent).div(100);
    const maxSpreadAmount = spotRate.mul(config.maxSpreadPercent).div(100);

    return Decimal.max(
      minSpreadAmount,
      Decimal.min(maxSpreadAmount, spreadAmount)
    );
  }

  /**
   * Check if spread configuration is currently active
   */
  private isConfigActive(config: FixedSpreadConfig): boolean {
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
  private calculateConfidence(
    spotRate: SpotRate,
    config: FixedSpreadConfig
  ): number {
    let confidence = 100;

    // Reduce confidence based on data age
    const dataAge = Date.now() - spotRate.timestamp.getTime();
    const maxAge = 60000; // 1 minute

    if (dataAge > maxAge) {
      confidence -= Math.min(30, (dataAge - maxAge) / 1000);
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Get spread configuration from database
   */
  private async getSpreadConfig(
    symbol: string,
    partnerId?: string
  ): Promise<FixedSpreadConfig | null> {
    try {
      let query: string;
      let params: any[];

      if (partnerId) {
        // Get partner-specific config first
        query = `
          SELECT fsc.*, p.api_key
          FROM fixed_spread_configs fsc
          JOIN partners p ON fsc.partner_id = p.id
          WHERE fsc.symbol = $1 AND p.api_key = $2 AND fsc.is_active = true
          ORDER BY fsc.created_at DESC
          LIMIT 1
        `;
        params = [symbol, partnerId];
      } else {
        // Get default config (no partner_id)
        query = `
          SELECT *
          FROM fixed_spread_configs
          WHERE symbol = $1 AND partner_id IS NULL AND is_active = true
          ORDER BY created_at DESC
          LIMIT 1
        `;
        params = [symbol];
      }

      const result = await db.query(query, params);

      if (result.rows.length === 0) {
        logger.debug("No spread configuration found", { symbol, partnerId });
        return null;
      }

      const row = result.rows[0];

      return {
        id: row.id,
        symbol: row.symbol,
        baseSpreadPercent: new Decimal(row.base_spread_percent),
        minSpreadPercent: new Decimal(row.min_spread_percent),
        maxSpreadPercent: new Decimal(row.max_spread_percent),
        isActive: row.is_active,
        validFrom: new Date(row.valid_from),
        validTo: row.valid_to ? new Date(row.valid_to) : undefined,
        partnerNotificationRequired: row.partner_notification_required,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      };
    } catch (error) {
      logger.error("Failed to get spread configuration", {
        symbol,
        partnerId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Save pricing result to database for audit
   */
  private async savePricingResult(data: {
    symbol: string;
    partnerId?: string;
    spotRate: Decimal;
    p2pIndicativeRate?: Decimal;
    fixedSpread: Decimal;
    volatilitySpread: Decimal;
    finalRate: Decimal;
    calculationMethod: string;
    confidence: number;
    processingTime: number;
    timestamp: Date;
  }): Promise<void> {
    try {
      const query = `
        INSERT INTO pricing_results (
          symbol, partner_id, spot_rate, p2p_indicative_rate, 
          fixed_spread, volatility_spread, final_rate, 
          calculation_method, confidence, processing_time, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `;

      // Get partner ID if partnerId is provided
      let dbPartnerId = null;
      if (data.partnerId) {
        const partnerResult = await db.query(
          "SELECT id FROM partners WHERE api_key = $1",
          [data.partnerId]
        );
        if (partnerResult.rows.length > 0) {
          dbPartnerId = partnerResult.rows[0].id;
        }
      }

      const params = [
        data.symbol,
        dbPartnerId,
        data.spotRate.toString(),
        data.p2pIndicativeRate?.toString() || null,
        data.fixedSpread.toString(),
        data.volatilitySpread.toString(),
        data.finalRate.toString(),
        data.calculationMethod,
        data.confidence,
        data.processingTime,
        data.timestamp,
      ];

      await db.query(query, params);
    } catch (error) {
      logger.error("Failed to save pricing result", {
        symbol: data.symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Don't throw error as this is for audit purposes
    }
  }

  /**
   * Get spread boundaries for a symbol
   */
  async getSpreadBoundaries(symbol: string): Promise<SpreadBoundary | null> {
    try {
      const query = `
        SELECT * FROM spread_boundaries WHERE symbol = $1
      `;
      const result = await db.query(query, [symbol]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        symbol: row.symbol,
        minDeviationPercent: new Decimal(row.min_deviation_percent),
        maxDeviationPercent: new Decimal(row.max_deviation_percent),
        alertThresholdPercent: new Decimal(row.alert_threshold_percent),
        emergencyStopThresholdPercent: new Decimal(
          row.emergency_stop_threshold_percent
        ),
      };
    } catch (error) {
      logger.error("Failed to get spread boundaries", {
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }
}
