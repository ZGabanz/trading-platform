import { Decimal } from "decimal.js";
import { db } from "../database/connection";
import { logger } from "../utils/logger";

export interface VolatilityMetrics {
  symbol: string;
  timeWindow: number; // hours
  variance: Decimal;
  standardDeviation: Decimal;
  movingAverage: Decimal;
  volatilityIndex: Decimal;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  calculatedAt: Date;
}

export interface VolatilitySpreadConfig {
  symbol: string;
  baseSpread: Decimal;
  volatilityMultiplier: Decimal;
  lowVolatilityThreshold: Decimal;
  mediumVolatilityThreshold: Decimal;
  highVolatilityThreshold: Decimal;
  criticalVolatilityThreshold: Decimal;
  maxVolatilitySpread: Decimal;
  smoothingFactor: Decimal;
  isActive: boolean;
}

export interface VolatilityAnalysisResult {
  symbol: string;
  currentVolatility: VolatilityMetrics;
  recommendedSpread: Decimal;
  spreadAdjustment: Decimal;
  confidence: number;
  warnings: string[];
  metadata: {
    dataPoints: number;
    analysisWindow: number;
    lastUpdate: Date;
  };
}

export class VolatilityAnalyzer {
  private readonly DEFAULT_TIME_WINDOWS = [1, 6, 24, 72]; // hours
  private readonly SMOOTHING_FACTOR = 0.8;
  private readonly MIN_DATA_POINTS = 10;

  /**
   * Analyze volatility for a symbol and calculate recommended spread adjustment
   */
  async analyzeVolatility(
    symbol: string,
    timeWindow: number = 24
  ): Promise<VolatilityAnalysisResult> {
    try {
      logger.info("Starting volatility analysis", { symbol, timeWindow });

      // Get historical rate deltas
      const deltas = await this.getHistoricalDeltas(symbol, timeWindow);

      if (deltas.length < this.MIN_DATA_POINTS) {
        logger.warn("Insufficient data for volatility analysis", {
          symbol,
          dataPoints: deltas.length,
          required: this.MIN_DATA_POINTS,
        });

        return this.getDefaultAnalysisResult(symbol, timeWindow);
      }

      // Calculate volatility metrics
      const metrics = await this.calculateVolatilityMetrics(
        symbol,
        deltas,
        timeWindow
      );

      // Get volatility spread configuration
      const config = await this.getVolatilitySpreadConfig(symbol);

      // Calculate recommended spread adjustment
      const spreadAdjustment = this.calculateSpreadAdjustment(metrics, config);
      const recommendedSpread = config.baseSpread.plus(spreadAdjustment);

      // Apply maximum spread limit
      const finalSpread = Decimal.min(
        recommendedSpread,
        config.maxVolatilitySpread
      );

      // Save metrics to database
      await this.saveVolatilityMetrics(metrics);

      const result: VolatilityAnalysisResult = {
        symbol,
        currentVolatility: metrics,
        recommendedSpread: finalSpread,
        spreadAdjustment,
        confidence: this.calculateConfidence(deltas.length, metrics.riskLevel),
        warnings: this.generateWarnings(metrics, config),
        metadata: {
          dataPoints: deltas.length,
          analysisWindow: timeWindow,
          lastUpdate: new Date(),
        },
      };

      logger.info("Volatility analysis completed", {
        symbol,
        volatilityIndex: metrics.volatilityIndex.toString(),
        riskLevel: metrics.riskLevel,
        recommendedSpread: finalSpread.toString(),
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error("Volatility analysis failed", {
        symbol,
        timeWindow,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Calculate volatility metrics from historical deltas
   */
  private async calculateVolatilityMetrics(
    symbol: string,
    deltas: Array<{ delta: Decimal; timestamp: Date }>,
    timeWindow: number
  ): Promise<VolatilityMetrics> {
    const deltaValues = deltas.map((d) => d.delta);

    // Calculate moving average
    const sum = deltaValues.reduce((acc, val) => acc.plus(val), new Decimal(0));
    const movingAverage = sum.div(deltaValues.length);

    // Calculate variance
    const squaredDiffs = deltaValues.map((val) =>
      val.minus(movingAverage).pow(2)
    );
    const variance = squaredDiffs
      .reduce((acc, val) => acc.plus(val), new Decimal(0))
      .div(deltaValues.length);

    // Calculate standard deviation
    const standardDeviation = variance.sqrt();

    // Calculate volatility index (coefficient of variation)
    const volatilityIndex = movingAverage.abs().gt(0)
      ? standardDeviation.div(movingAverage.abs()).mul(100)
      : new Decimal(0);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(volatilityIndex);

    return {
      symbol,
      timeWindow,
      variance,
      standardDeviation,
      movingAverage,
      volatilityIndex,
      riskLevel,
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate spread adjustment based on volatility metrics
   */
  private calculateSpreadAdjustment(
    metrics: VolatilityMetrics,
    config: VolatilitySpreadConfig
  ): Decimal {
    const { volatilityIndex } = metrics;

    let adjustment = new Decimal(0);

    if (volatilityIndex.gte(config.criticalVolatilityThreshold)) {
      // Critical volatility - maximum adjustment
      adjustment = config.maxVolatilitySpread.minus(config.baseSpread);
    } else if (volatilityIndex.gte(config.highVolatilityThreshold)) {
      // High volatility - significant adjustment
      const factor = volatilityIndex
        .minus(config.highVolatilityThreshold)
        .div(
          config.criticalVolatilityThreshold.minus(
            config.highVolatilityThreshold
          )
        );
      adjustment = config.volatilityMultiplier.mul(factor).mul(0.8);
    } else if (volatilityIndex.gte(config.mediumVolatilityThreshold)) {
      // Medium volatility - moderate adjustment
      const factor = volatilityIndex
        .minus(config.mediumVolatilityThreshold)
        .div(
          config.highVolatilityThreshold.minus(config.mediumVolatilityThreshold)
        );
      adjustment = config.volatilityMultiplier.mul(factor).mul(0.5);
    } else if (volatilityIndex.gte(config.lowVolatilityThreshold)) {
      // Low volatility - minimal adjustment
      const factor = volatilityIndex
        .minus(config.lowVolatilityThreshold)
        .div(
          config.mediumVolatilityThreshold.minus(config.lowVolatilityThreshold)
        );
      adjustment = config.volatilityMultiplier.mul(factor).mul(0.2);
    }

    // Apply smoothing factor to prevent sudden jumps
    return adjustment.mul(config.smoothingFactor);
  }

  /**
   * Get historical rate deltas for volatility calculation
   */
  private async getHistoricalDeltas(
    symbol: string,
    timeWindow: number
  ): Promise<Array<{ delta: Decimal; timestamp: Date }>> {
    try {
      const query = `
        SELECT delta, timestamp
        FROM rate_deltas
        WHERE symbol = $1 
          AND timestamp >= NOW() - INTERVAL '${timeWindow} hours'
        ORDER BY timestamp ASC
      `;

      const result = await db.query(query, [symbol]);

      return result.rows.map((row: any) => ({
        delta: new Decimal(row.delta),
        timestamp: new Date(row.timestamp),
      }));
    } catch (error) {
      logger.error("Failed to get historical deltas", {
        symbol,
        timeWindow,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }

  /**
   * Get volatility spread configuration
   */
  private async getVolatilitySpreadConfig(
    symbol: string
  ): Promise<VolatilitySpreadConfig> {
    try {
      const query = `
        SELECT * FROM volatility_spread_configs
        WHERE symbol = $1 AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await db.query(query, [symbol]);

      if (result.rows.length === 0) {
        // Return default configuration
        return this.getDefaultVolatilityConfig(symbol);
      }

      const row: any = result.rows[0];
      return {
        symbol: row.symbol,
        baseSpread: new Decimal(row.base_spread),
        volatilityMultiplier: new Decimal(row.volatility_multiplier),
        lowVolatilityThreshold: new Decimal(row.low_volatility_threshold),
        mediumVolatilityThreshold: new Decimal(row.medium_volatility_threshold),
        highVolatilityThreshold: new Decimal(row.high_volatility_threshold),
        criticalVolatilityThreshold: new Decimal(
          row.critical_volatility_threshold
        ),
        maxVolatilitySpread: new Decimal(row.max_volatility_spread),
        smoothingFactor: new Decimal(row.smoothing_factor),
        isActive: row.is_active,
      };
    } catch (error) {
      logger.error("Failed to get volatility spread config", {
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return this.getDefaultVolatilityConfig(symbol);
    }
  }

  /**
   * Save volatility metrics to database
   */
  private async saveVolatilityMetrics(
    metrics: VolatilityMetrics
  ): Promise<void> {
    try {
      const query = `
        INSERT INTO volatility_metrics (
          symbol, time_window, variance, standard_deviation,
          moving_average, volatility_index, risk_level, calculated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      const params = [
        metrics.symbol,
        metrics.timeWindow,
        metrics.variance.toString(),
        metrics.standardDeviation.toString(),
        metrics.movingAverage.toString(),
        metrics.volatilityIndex.toString(),
        metrics.riskLevel,
        metrics.calculatedAt,
      ];

      await db.query(query, params);
    } catch (error) {
      logger.error("Failed to save volatility metrics", {
        symbol: metrics.symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      // Don't throw error as this is for audit purposes
    }
  }

  /**
   * Determine risk level based on volatility index
   */
  private determineRiskLevel(
    volatilityIndex: Decimal
  ): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
    if (volatilityIndex.gte(15)) return "CRITICAL";
    if (volatilityIndex.gte(10)) return "HIGH";
    if (volatilityIndex.gte(5)) return "MEDIUM";
    return "LOW";
  }

  /**
   * Calculate confidence score for the analysis
   */
  private calculateConfidence(dataPoints: number, riskLevel: string): number {
    let confidence = 100;

    // Reduce confidence based on data points
    if (dataPoints < 50) {
      confidence -= (50 - dataPoints) * 0.5;
    }

    // Reduce confidence for higher risk levels
    switch (riskLevel) {
      case "CRITICAL":
        confidence -= 20;
        break;
      case "HIGH":
        confidence -= 10;
        break;
      case "MEDIUM":
        confidence -= 5;
        break;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Generate warnings based on volatility analysis
   */
  private generateWarnings(
    metrics: VolatilityMetrics,
    config: VolatilitySpreadConfig
  ): string[] {
    const warnings: string[] = [];

    if (metrics.riskLevel === "CRITICAL") {
      warnings.push(
        "Critical volatility detected - maximum spread protection activated"
      );
    }

    if (metrics.riskLevel === "HIGH") {
      warnings.push(
        "High volatility detected - increased spread protection recommended"
      );
    }

    if (metrics.volatilityIndex.gte(config.criticalVolatilityThreshold)) {
      warnings.push(
        "Volatility exceeds critical threshold - consider manual review"
      );
    }

    return warnings;
  }

  /**
   * Get default volatility configuration
   */
  private getDefaultVolatilityConfig(symbol: string): VolatilitySpreadConfig {
    return {
      symbol,
      baseSpread: new Decimal("0.5"),
      volatilityMultiplier: new Decimal("2.0"),
      lowVolatilityThreshold: new Decimal("2.0"),
      mediumVolatilityThreshold: new Decimal("5.0"),
      highVolatilityThreshold: new Decimal("10.0"),
      criticalVolatilityThreshold: new Decimal("15.0"),
      maxVolatilitySpread: new Decimal("5.0"),
      smoothingFactor: new Decimal("0.8"),
      isActive: true,
    };
  }

  /**
   * Get default analysis result when insufficient data
   */
  private getDefaultAnalysisResult(
    symbol: string,
    timeWindow: number
  ): VolatilityAnalysisResult {
    const defaultConfig = this.getDefaultVolatilityConfig(symbol);

    return {
      symbol,
      currentVolatility: {
        symbol,
        timeWindow,
        variance: new Decimal("0"),
        standardDeviation: new Decimal("0"),
        movingAverage: new Decimal("0"),
        volatilityIndex: new Decimal("0"),
        riskLevel: "LOW",
        calculatedAt: new Date(),
      },
      recommendedSpread: defaultConfig.baseSpread,
      spreadAdjustment: new Decimal("0"),
      confidence: 0,
      warnings: ["Insufficient historical data for volatility analysis"],
      metadata: {
        dataPoints: 0,
        analysisWindow: timeWindow,
        lastUpdate: new Date(),
      },
    };
  }

  /**
   * Batch analyze volatility for multiple symbols
   */
  async batchAnalyzeVolatility(
    symbols: string[],
    timeWindow: number = 24
  ): Promise<Map<string, VolatilityAnalysisResult>> {
    const results = new Map<string, VolatilityAnalysisResult>();

    const promises = symbols.map(async (symbol) => {
      try {
        const result = await this.analyzeVolatility(symbol, timeWindow);
        results.set(symbol, result);
      } catch (error) {
        logger.error("Failed to analyze volatility for symbol", {
          symbol,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    await Promise.all(promises);
    return results;
  }
}
