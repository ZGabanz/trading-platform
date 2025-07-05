import { Decimal } from "decimal.js";
import { db } from "../database/connection";
import { logger } from "../utils/logger";
import { NotificationService } from "./NotificationService";

export interface Deal {
  id: string;
  partnerId: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: Decimal;
  rate: Decimal;
  totalValue: Decimal;
  status: DealStatus;
  createdAt: Date;
  updatedAt: Date;
  executedAt?: Date;
  closedAt?: Date;
  metadata: {
    spotRate: Decimal;
    p2pRate?: Decimal;
    spread: Decimal;
    volatilityAdjustment: Decimal;
    confidence: number;
    source: string;
  };
  counterparty?: {
    id: string;
    name: string;
    rating: number;
    completionRate: number;
  };
  p2pOrderId?: string;
  notes?: string;
}

export enum DealStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  EXECUTING = "EXECUTING",
  EXECUTED = "EXECUTED",
  SETTLING = "SETTLING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface DealRequest {
  partnerId: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: Decimal;
  maxRate?: Decimal;
  minRate?: Decimal;
  autoExecute?: boolean;
  notes?: string;
}

export interface DealExecutionResult {
  success: boolean;
  dealId: string;
  executedRate?: Decimal;
  executedAmount?: Decimal;
  p2pOrderId?: string;
  error?: string;
  warnings?: string[];
  metadata: {
    executionTime: number;
    counterpartyFound: boolean;
    slippagePercent?: number;
  };
}

export interface DealStats {
  totalDeals: number;
  completedDeals: number;
  failedDeals: number;
  averageExecutionTime: number;
  totalVolume: Decimal;
  totalProfit: Decimal;
  successRate: number;
  averageSpread: Decimal;
  period: {
    from: Date;
    to: Date;
  };
}

export class DealAutomationService {
  private notificationService: NotificationService;
  private readonly MAX_EXECUTION_TIME = 300000; // 5 minutes
  private readonly MAX_SLIPPAGE_PERCENT = 2.0;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Create a new deal request
   */
  async createDeal(request: DealRequest): Promise<Deal> {
    try {
      logger.info("Creating new deal", {
        partnerId: request.partnerId,
        symbol: request.symbol,
        side: request.side,
        amount: request.amount.toString(),
      });

      // Validate partner
      const partner = await this.validatePartner(request.partnerId);
      if (!partner) {
        throw new Error("Invalid or inactive partner");
      }

      // Get current pricing
      const pricing = await this.getCurrentPricing(
        request.symbol,
        request.partnerId
      );

      // Validate rate limits
      if (request.maxRate && pricing.finalRate.gt(request.maxRate)) {
        throw new Error(
          `Current rate ${pricing.finalRate} exceeds maximum rate ${request.maxRate}`
        );
      }

      if (request.minRate && pricing.finalRate.lt(request.minRate)) {
        throw new Error(
          `Current rate ${pricing.finalRate} below minimum rate ${request.minRate}`
        );
      }

      // Calculate total value
      const totalValue = request.amount.mul(pricing.finalRate);

      // Create deal record
      const deal: Deal = {
        id: this.generateDealId(),
        partnerId: request.partnerId,
        symbol: request.symbol,
        side: request.side,
        amount: request.amount,
        rate: pricing.finalRate,
        totalValue,
        status: request.autoExecute ? DealStatus.APPROVED : DealStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          spotRate: pricing.spotRate,
          p2pRate: pricing.p2pIndicativeRate,
          spread: pricing.fixedSpread.plus(pricing.volatilitySpread),
          volatilityAdjustment: pricing.volatilitySpread,
          confidence: pricing.confidence,
          source: pricing.calculationMethod,
        },
        notes: request.notes,
      };

      // Save to database
      await this.saveDeal(deal);

      // Send notification
      await this.notificationService.sendDealCreatedNotification(deal);

      // Auto-execute if requested
      if (request.autoExecute) {
        // Execute asynchronously
        setImmediate(() => this.executeDeal(deal.id));
      }

      logger.info("Deal created successfully", {
        dealId: deal.id,
        rate: deal.rate.toString(),
        totalValue: deal.totalValue.toString(),
        autoExecute: request.autoExecute,
      });

      return deal;
    } catch (error) {
      logger.error("Failed to create deal", {
        partnerId: request.partnerId,
        symbol: request.symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Execute a deal
   */
  async executeDeal(dealId: string): Promise<DealExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info("Executing deal", { dealId });

      // Get deal
      const deal = await this.getDeal(dealId);
      if (!deal) {
        throw new Error("Deal not found");
      }

      if (
        deal.status !== DealStatus.APPROVED &&
        deal.status !== DealStatus.PENDING
      ) {
        throw new Error(`Cannot execute deal in status: ${deal.status}`);
      }

      // Update status to executing
      await this.updateDealStatus(dealId, DealStatus.EXECUTING);

      // Find counterparty
      const counterparty = await this.findCounterparty(deal);
      if (!counterparty) {
        await this.updateDealStatus(dealId, DealStatus.FAILED);
        throw new Error("No suitable counterparty found");
      }

      // Create P2P order
      const p2pResult = await this.createP2POrder(deal, counterparty);
      if (!p2pResult.success) {
        await this.updateDealStatus(dealId, DealStatus.FAILED);
        throw new Error(`P2P order creation failed: ${p2pResult.error}`);
      }

      // Update deal with P2P order info
      await this.updateDealWithP2POrder(
        dealId,
        p2pResult.orderId,
        counterparty
      );

      // Monitor execution
      const executionResult = await this.monitorP2PExecution(
        dealId,
        p2pResult.orderId
      );

      const processingTime = Date.now() - startTime;

      const result: DealExecutionResult = {
        success: executionResult.success,
        dealId,
        executedRate: executionResult.executedRate,
        executedAmount: executionResult.executedAmount,
        p2pOrderId: p2pResult.orderId,
        error: executionResult.error,
        warnings: executionResult.warnings,
        metadata: {
          executionTime: processingTime,
          counterpartyFound: true,
          slippagePercent: executionResult.slippagePercent,
        },
      };

      // Send notification
      await this.notificationService.sendDealExecutedNotification(deal, result);

      logger.info("Deal execution completed", {
        dealId,
        success: result.success,
        executionTime: processingTime,
        slippage: result.metadata.slippagePercent,
      });

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;

      logger.error("Deal execution failed", {
        dealId,
        executionTime: processingTime,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        dealId,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {
          executionTime: processingTime,
          counterpartyFound: false,
        },
      };
    }
  }

  /**
   * Get deal by ID
   */
  async getDeal(dealId: string): Promise<Deal | null> {
    try {
      const query = `
        SELECT d.*, p.name as partner_name
        FROM deals d
        JOIN partners p ON d.partner_id = p.id
        WHERE d.id = $1
      `;

      const result = await db.query(query, [dealId]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToDeal(result.rows[0]);
    } catch (error) {
      logger.error("Failed to get deal", {
        dealId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Get deals for a partner
   */
  async getDealsForPartner(
    partnerId: string,
    limit: number = 50
  ): Promise<Deal[]> {
    try {
      const query = `
        SELECT d.*, p.name as partner_name
        FROM deals d
        JOIN partners p ON d.partner_id = p.id
        WHERE p.api_key = $1
        ORDER BY d.created_at DESC
        LIMIT $2
      `;

      const result = await db.query(query, [partnerId, limit]);

      return result.rows.map((row) => this.mapRowToDeal(row));
    } catch (error) {
      logger.error("Failed to get deals for partner", {
        partnerId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return [];
    }
  }

  /**
   * Get deal statistics
   */
  async getDealStats(
    partnerId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<DealStats> {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_deals,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_deals,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_deals,
          AVG(EXTRACT(EPOCH FROM (executed_at - created_at))) as avg_execution_time,
          SUM(total_value) as total_volume,
          SUM(CASE WHEN status = 'COMPLETED' THEN (rate - spot_rate) * amount ELSE 0 END) as total_profit,
          AVG(spread) as avg_spread
        FROM deals d
      `;

      const params: any[] = [];
      const conditions: string[] = [];

      if (partnerId) {
        conditions.push(
          "d.partner_id = (SELECT id FROM partners WHERE api_key = $1)"
        );
        params.push(partnerId);
      }

      if (fromDate) {
        conditions.push(`d.created_at >= $${params.length + 1}`);
        params.push(fromDate);
      }

      if (toDate) {
        conditions.push(`d.created_at <= $${params.length + 1}`);
        params.push(toDate);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      const result = await db.query(query, params);
      const row = result.rows[0];

      const totalDeals = parseInt(row.total_deals) || 0;
      const completedDeals = parseInt(row.completed_deals) || 0;
      const successRate =
        totalDeals > 0 ? (completedDeals / totalDeals) * 100 : 0;

      return {
        totalDeals,
        completedDeals,
        failedDeals: parseInt(row.failed_deals) || 0,
        averageExecutionTime: parseFloat(row.avg_execution_time) || 0,
        totalVolume: new Decimal(row.total_volume || "0"),
        totalProfit: new Decimal(row.total_profit || "0"),
        successRate,
        averageSpread: new Decimal(row.avg_spread || "0"),
        period: {
          from: fromDate || new Date(0),
          to: toDate || new Date(),
        },
      };
    } catch (error) {
      logger.error("Failed to get deal stats", {
        partnerId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Cancel a deal
   */
  async cancelDeal(dealId: string, reason?: string): Promise<boolean> {
    try {
      const deal = await this.getDeal(dealId);
      if (!deal) {
        throw new Error("Deal not found");
      }

      if (
        deal.status === DealStatus.COMPLETED ||
        deal.status === DealStatus.CANCELLED
      ) {
        throw new Error(`Cannot cancel deal in status: ${deal.status}`);
      }

      // Cancel P2P order if exists
      if (deal.p2pOrderId) {
        await this.cancelP2POrder(deal.p2pOrderId);
      }

      // Update deal status
      await this.updateDealStatus(dealId, DealStatus.CANCELLED);

      // Add cancellation note
      if (reason) {
        await this.addDealNote(dealId, `Cancelled: ${reason}`);
      }

      // Send notification
      await this.notificationService.sendDealCancelledNotification(
        deal,
        reason
      );

      logger.info("Deal cancelled successfully", { dealId, reason });
      return true;
    } catch (error) {
      logger.error("Failed to cancel deal", {
        dealId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  // Private helper methods

  private async validatePartner(partnerId: string): Promise<boolean> {
    try {
      const query =
        "SELECT id FROM partners WHERE api_key = $1 AND is_active = true";
      const result = await db.query(query, [partnerId]);
      return result.rows.length > 0;
    } catch (error) {
      logger.error("Partner validation failed", { partnerId, error });
      return false;
    }
  }

  private async getCurrentPricing(
    symbol: string,
    partnerId: string
  ): Promise<any> {
    // This would call the pricing service
    // For now, return mock data
    return {
      spotRate: new Decimal("1.0850"),
      p2pIndicativeRate: new Decimal("1.0870"),
      fixedSpread: new Decimal("0.0020"),
      volatilitySpread: new Decimal("0.0010"),
      finalRate: new Decimal("1.0880"),
      confidence: 85,
      calculationMethod: "HYBRID",
    };
  }

  private generateDealId(): string {
    return `DEAL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveDeal(deal: Deal): Promise<void> {
    const query = `
      INSERT INTO deals (
        id, partner_id, symbol, side, amount, rate, total_value, status,
        created_at, updated_at, spot_rate, p2p_rate, spread, 
        volatility_adjustment, confidence, source, notes
      ) VALUES (
        $1, (SELECT id FROM partners WHERE api_key = $2), $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
    `;

    const params = [
      deal.id,
      deal.partnerId,
      deal.symbol,
      deal.side,
      deal.amount.toString(),
      deal.rate.toString(),
      deal.totalValue.toString(),
      deal.status,
      deal.createdAt,
      deal.updatedAt,
      deal.metadata.spotRate.toString(),
      deal.metadata.p2pRate?.toString(),
      deal.metadata.spread.toString(),
      deal.metadata.volatilityAdjustment.toString(),
      deal.metadata.confidence,
      deal.metadata.source,
      deal.notes,
    ];

    await db.query(query, params);
  }

  private async updateDealStatus(
    dealId: string,
    status: DealStatus
  ): Promise<void> {
    const query = `
      UPDATE deals 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
    `;
    await db.query(query, [status, dealId]);
  }

  private async findCounterparty(deal: Deal): Promise<any> {
    // Mock counterparty finding logic
    // In real implementation, this would query P2P APIs
    return {
      id: "cp_123",
      name: "TrustedTrader",
      rating: 4.8,
      completionRate: 98.5,
    };
  }

  private async createP2POrder(
    deal: Deal,
    counterparty: any
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    // Mock P2P order creation
    // In real implementation, this would call Bybit/HTX APIs
    return {
      success: true,
      orderId: `P2P_${Date.now()}`,
    };
  }

  private async updateDealWithP2POrder(
    dealId: string,
    orderId: string,
    counterparty: any
  ): Promise<void> {
    const query = `
      UPDATE deals 
      SET p2p_order_id = $1, counterparty_id = $2, counterparty_name = $3,
          counterparty_rating = $4, updated_at = NOW()
      WHERE id = $5
    `;
    await db.query(query, [
      orderId,
      counterparty.id,
      counterparty.name,
      counterparty.rating,
      dealId,
    ]);
  }

  private async monitorP2PExecution(
    dealId: string,
    orderId: string
  ): Promise<any> {
    // Mock execution monitoring
    // In real implementation, this would poll P2P APIs
    return {
      success: true,
      executedRate: new Decimal("1.0875"),
      executedAmount: new Decimal("1000"),
      slippagePercent: 0.05,
    };
  }

  private async cancelP2POrder(orderId: string): Promise<void> {
    // Mock P2P order cancellation
    logger.info("Cancelling P2P order", { orderId });
  }

  private async addDealNote(dealId: string, note: string): Promise<void> {
    const query = `
      UPDATE deals 
      SET notes = COALESCE(notes, '') || $1, updated_at = NOW()
      WHERE id = $2
    `;
    await db.query(query, [`\n${new Date().toISOString()}: ${note}`, dealId]);
  }

  private mapRowToDeal(row: any): Deal {
    return {
      id: row.id,
      partnerId: row.partner_id,
      symbol: row.symbol,
      side: row.side,
      amount: new Decimal(row.amount),
      rate: new Decimal(row.rate),
      totalValue: new Decimal(row.total_value),
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      executedAt: row.executed_at ? new Date(row.executed_at) : undefined,
      closedAt: row.closed_at ? new Date(row.closed_at) : undefined,
      metadata: {
        spotRate: new Decimal(row.spot_rate),
        p2pRate: row.p2p_rate ? new Decimal(row.p2p_rate) : undefined,
        spread: new Decimal(row.spread),
        volatilityAdjustment: new Decimal(row.volatility_adjustment),
        confidence: row.confidence,
        source: row.source,
      },
      counterparty: row.counterparty_id
        ? {
            id: row.counterparty_id,
            name: row.counterparty_name,
            rating: row.counterparty_rating,
            completionRate: row.counterparty_completion_rate || 0,
          }
        : undefined,
      p2pOrderId: row.p2p_order_id,
      notes: row.notes,
    };
  }
}
