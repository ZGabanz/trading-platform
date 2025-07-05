import { logger } from "../utils/logger";
import { Deal, DealExecutionResult } from "./DealAutomationService";

export class NotificationService {
  async sendDealCreatedNotification(deal: Deal): Promise<void> {
    try {
      logger.info("Sending deal created notification", {
        dealId: deal.id,
        partnerId: deal.partnerId,
        symbol: deal.symbol,
        amount: deal.amount.toString(),
        rate: deal.rate.toString(),
      });

      // Mock notification sending
      // In real implementation, this would send emails, Slack messages, etc.
    } catch (error) {
      logger.error("Failed to send deal created notification", {
        dealId: deal.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async sendDealExecutedNotification(
    deal: Deal,
    result: DealExecutionResult
  ): Promise<void> {
    try {
      logger.info("Sending deal executed notification", {
        dealId: deal.id,
        success: result.success,
        executedRate: result.executedRate?.toString(),
        executionTime: result.metadata.executionTime,
      });

      // Mock notification sending
    } catch (error) {
      logger.error("Failed to send deal executed notification", {
        dealId: deal.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async sendDealCancelledNotification(
    deal: Deal,
    reason?: string
  ): Promise<void> {
    try {
      logger.info("Sending deal cancelled notification", {
        dealId: deal.id,
        reason,
      });

      // Mock notification sending
    } catch (error) {
      logger.error("Failed to send deal cancelled notification", {
        dealId: deal.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
