import express from "express";
import { Decimal } from "decimal.js";
import {
  DealAutomationService,
  DealRequest,
  DealStatus,
} from "../services/DealAutomationService";
import { NotificationService } from "../services/NotificationService";
import { logger } from "../utils/logger";

const router = express.Router();
const notificationService = new NotificationService();
const dealService = new DealAutomationService(notificationService);

/**
 * Create a new deal
 * POST /api/deals
 */
router.post("/", async (req, res) => {
  try {
    const {
      partnerId,
      symbol,
      side,
      amount,
      maxRate,
      minRate,
      autoExecute,
      notes,
    } = req.body;

    // Validate required fields
    if (!partnerId || !symbol || !side || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
        message: "partnerId, symbol, side, and amount are required",
      });
    }

    const dealRequest: DealRequest = {
      partnerId,
      symbol,
      side,
      amount: new Decimal(amount),
      maxRate: maxRate ? new Decimal(maxRate) : undefined,
      minRate: minRate ? new Decimal(minRate) : undefined,
      autoExecute: autoExecute || false,
      notes,
    };

    const deal = await dealService.createDeal(dealRequest);

    res.status(201).json({
      success: true,
      data: {
        id: deal.id,
        partnerId: deal.partnerId,
        symbol: deal.symbol,
        side: deal.side,
        amount: deal.amount.toString(),
        rate: deal.rate.toString(),
        totalValue: deal.totalValue.toString(),
        status: deal.status,
        createdAt: deal.createdAt.toISOString(),
        metadata: {
          spotRate: deal.metadata.spotRate.toString(),
          p2pRate: deal.metadata.p2pRate?.toString(),
          spread: deal.metadata.spread.toString(),
          volatilityAdjustment: deal.metadata.volatilityAdjustment.toString(),
          confidence: deal.metadata.confidence,
          source: deal.metadata.source,
        },
        notes: deal.notes,
      },
    });
  } catch (error) {
    logger.error("Deal creation failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Deal creation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get deal by ID
 * GET /api/deals/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await dealService.getDeal(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        error: "Deal not found",
        message: `Deal with ID ${id} not found`,
      });
    }

    res.json({
      success: true,
      data: {
        id: deal.id,
        partnerId: deal.partnerId,
        symbol: deal.symbol,
        side: deal.side,
        amount: deal.amount.toString(),
        rate: deal.rate.toString(),
        totalValue: deal.totalValue.toString(),
        status: deal.status,
        createdAt: deal.createdAt.toISOString(),
        updatedAt: deal.updatedAt.toISOString(),
        executedAt: deal.executedAt?.toISOString(),
        closedAt: deal.closedAt?.toISOString(),
        metadata: {
          spotRate: deal.metadata.spotRate.toString(),
          p2pRate: deal.metadata.p2pRate?.toString(),
          spread: deal.metadata.spread.toString(),
          volatilityAdjustment: deal.metadata.volatilityAdjustment.toString(),
          confidence: deal.metadata.confidence,
          source: deal.metadata.source,
        },
        counterparty: deal.counterparty,
        p2pOrderId: deal.p2pOrderId,
        notes: deal.notes,
      },
    });
  } catch (error) {
    logger.error("Get deal failed", {
      dealId: req.params.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Get deal failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get deals for a partner
 * GET /api/deals/partner/:partnerId
 */
router.get("/partner/:partnerId", async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { limit = 50, status, symbol } = req.query;

    let deals = await dealService.getDealsForPartner(partnerId, Number(limit));

    // Filter by status if provided
    if (status) {
      deals = deals.filter((deal) => deal.status === status);
    }

    // Filter by symbol if provided
    if (symbol) {
      deals = deals.filter((deal) => deal.symbol === symbol);
    }

    const response = deals.map((deal) => ({
      id: deal.id,
      symbol: deal.symbol,
      side: deal.side,
      amount: deal.amount.toString(),
      rate: deal.rate.toString(),
      totalValue: deal.totalValue.toString(),
      status: deal.status,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString(),
      executedAt: deal.executedAt?.toISOString(),
      metadata: {
        confidence: deal.metadata.confidence,
        source: deal.metadata.source,
      },
    }));

    res.json({
      success: true,
      data: {
        deals: response,
        count: response.length,
        filters: {
          partnerId,
          status,
          symbol,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    logger.error("Get partner deals failed", {
      partnerId: req.params.partnerId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Get partner deals failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Execute a deal
 * POST /api/deals/:id/execute
 */
router.post("/:id/execute", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dealService.executeDeal(id);

    res.json({
      success: result.success,
      data: {
        dealId: result.dealId,
        success: result.success,
        executedRate: result.executedRate?.toString(),
        executedAmount: result.executedAmount?.toString(),
        p2pOrderId: result.p2pOrderId,
        error: result.error,
        warnings: result.warnings,
        metadata: {
          executionTime: result.metadata.executionTime,
          counterpartyFound: result.metadata.counterpartyFound,
          slippagePercent: result.metadata.slippagePercent,
        },
      },
    });
  } catch (error) {
    logger.error("Deal execution failed", {
      dealId: req.params.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Deal execution failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Cancel a deal
 * POST /api/deals/:id/cancel
 */
router.post("/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const success = await dealService.cancelDeal(id, reason);

    if (success) {
      res.json({
        success: true,
        message: "Deal cancelled successfully",
        data: {
          dealId: id,
          reason,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Deal cancellation failed",
        message: "Unable to cancel deal",
      });
    }
  } catch (error) {
    logger.error("Deal cancellation failed", {
      dealId: req.params.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Deal cancellation failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get deal statistics
 * GET /api/deals/stats
 */
router.get("/stats", async (req, res) => {
  try {
    const { partnerId, from, to } = req.query;

    const fromDate = from ? new Date(from as string) : undefined;
    const toDate = to ? new Date(to as string) : undefined;

    const stats = await dealService.getDealStats(
      partnerId as string,
      fromDate,
      toDate
    );

    res.json({
      success: true,
      data: {
        totalDeals: stats.totalDeals,
        completedDeals: stats.completedDeals,
        failedDeals: stats.failedDeals,
        averageExecutionTime: stats.averageExecutionTime,
        totalVolume: stats.totalVolume.toString(),
        totalProfit: stats.totalProfit.toString(),
        successRate: stats.successRate,
        averageSpread: stats.averageSpread.toString(),
        period: {
          from: stats.period.from.toISOString(),
          to: stats.period.to.toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error("Get deal stats failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Get deal stats failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Get deal statuses
 * GET /api/deals/statuses
 */
router.get("/statuses", async (req, res) => {
  try {
    const statuses = Object.values(DealStatus).map((status) => ({
      value: status,
      label: status.charAt(0) + status.slice(1).toLowerCase(),
      description: getStatusDescription(status),
    }));

    res.json({
      success: true,
      data: {
        statuses,
      },
    });
  } catch (error) {
    logger.error("Get deal statuses failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Get deal statuses failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Health check endpoint
 * GET /api/deals/health
 */
router.get("/health", async (req, res) => {
  try {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        notifications: "operational",
        dealAutomation: "operational",
      },
      version: process.env.npm_package_version || "1.0.0",
    };

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Health check failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Helper function to get status descriptions
function getStatusDescription(status: DealStatus): string {
  switch (status) {
    case DealStatus.PENDING:
      return "Deal is waiting for approval";
    case DealStatus.APPROVED:
      return "Deal has been approved and ready for execution";
    case DealStatus.EXECUTING:
      return "Deal is currently being executed";
    case DealStatus.EXECUTED:
      return "Deal has been executed successfully";
    case DealStatus.SETTLING:
      return "Deal is in settlement process";
    case DealStatus.COMPLETED:
      return "Deal has been completed successfully";
    case DealStatus.FAILED:
      return "Deal execution failed";
    case DealStatus.CANCELLED:
      return "Deal has been cancelled";
    default:
      return "Unknown status";
  }
}

export default router;
