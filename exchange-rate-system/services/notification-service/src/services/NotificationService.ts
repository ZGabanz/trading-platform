import { EmailService } from "./EmailService";
import { TelegramService } from "./TelegramService";
import { SlackService } from "./SlackService";
import { WebhookService } from "./WebhookService";
import { QueueService } from "./QueueService";
import { logger } from "../utils/logger";
import {
  NotificationRequest,
  NotificationResponse,
  NotificationChannel,
  NotificationStatus,
} from "../types/notification";

export class NotificationService {
  private static instance: NotificationService;
  private emailService: EmailService;
  private telegramService: TelegramService;
  private slackService: SlackService;
  private webhookService: WebhookService;
  private queueService: QueueService;
  private isInitialized = false;

  private constructor() {
    this.emailService = new EmailService();
    this.telegramService = new TelegramService();
    this.slackService = new SlackService();
    this.webhookService = new WebhookService();
    this.queueService = QueueService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    logger.info("Initializing notification service...");

    try {
      // Initialize all notification channels
      await Promise.all([
        this.emailService.initialize(),
        this.telegramService.initialize(),
        this.slackService.initialize(),
        this.webhookService.initialize(),
      ]);

      this.isInitialized = true;
      logger.info("Notification service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize notification service", { error });
      throw error;
    }
  }

  async sendNotification(
    request: NotificationRequest
  ): Promise<NotificationResponse> {
    if (!this.isInitialized) {
      throw new Error("Notification service not initialized");
    }

    const startTime = Date.now();
    const results: { [key in NotificationChannel]?: NotificationStatus } = {};

    logger.info("Processing notification request", {
      id: request.id,
      type: request.type,
      channels: request.channels,
      priority: request.priority,
    });

    // Process each channel
    for (const channel of request.channels) {
      try {
        switch (channel.type) {
          case "EMAIL":
            if (channel.recipients?.email) {
              await this.emailService.sendEmail({
                to: channel.recipients.email,
                subject: request.subject || request.type,
                content: request.message,
                template: request.template,
                data: request.data,
              });
              results.EMAIL = "SENT";
            }
            break;

          case "TELEGRAM":
            if (channel.recipients?.telegram) {
              await this.telegramService.sendMessage({
                chatId: channel.recipients.telegram,
                message: request.message,
                parseMode: "Markdown",
                disablePreview: true,
              });
              results.TELEGRAM = "SENT";
            }
            break;

          case "SLACK":
            if (channel.recipients?.slack) {
              await this.slackService.sendMessage({
                channel: channel.recipients.slack,
                message: request.message,
                attachments: request.attachments,
              });
              results.SLACK = "SENT";
            }
            break;

          case "WEBHOOK":
            if (channel.recipients?.webhook) {
              await this.webhookService.sendWebhook({
                url: channel.recipients.webhook,
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...channel.headers,
                },
                payload: {
                  id: request.id,
                  type: request.type,
                  message: request.message,
                  timestamp: request.timestamp,
                  data: request.data,
                },
              });
              results.WEBHOOK = "SENT";
            }
            break;

          default:
            logger.warn("Unknown notification channel", {
              channel: channel.type,
            });
            results[channel.type as NotificationChannel] = "FAILED";
        }
      } catch (error) {
        logger.error(`Failed to send notification via ${channel.type}`, {
          error: error instanceof Error ? error.message : "Unknown error",
          channel: channel.type,
          notificationId: request.id,
        });
        results[channel.type] = "FAILED";
      }
    }

    const duration = Date.now() - startTime;

    const response: NotificationResponse = {
      id: request.id,
      status: Object.values(results).some((status) => status === "SENT")
        ? "PARTIAL_SUCCESS"
        : "FAILED",
      results,
      processingTime: duration,
      timestamp: new Date(),
    };

    logger.info("Notification processing completed", {
      id: request.id,
      status: response.status,
      duration,
      results,
    });

    return response;
  }

  async sendNotificationAsync(
    request: NotificationRequest
  ): Promise<{ jobId: string }> {
    if (!this.isInitialized) {
      throw new Error("Notification service not initialized");
    }

    const jobId = await this.queueService.addNotificationJob(request);

    logger.info("Notification queued for async processing", {
      notificationId: request.id,
      jobId,
    });

    return { jobId };
  }

  async getNotificationStatus(
    notificationId: string
  ): Promise<NotificationResponse | null> {
    // TODO: Implement notification status tracking in database
    logger.info("Getting notification status", { notificationId });
    return null;
  }

  async cleanup(): Promise<void> {
    logger.info("Cleaning up notification service...");

    await Promise.all([
      this.emailService.cleanup(),
      this.telegramService.cleanup(),
      this.slackService.cleanup(),
      this.webhookService.cleanup(),
      this.queueService.cleanup(),
    ]);

    this.isInitialized = false;
    logger.info("Notification service cleanup completed");
  }

  // Health check methods
  async checkHealth(): Promise<{ [key: string]: boolean }> {
    const health = {
      email: await this.emailService.isHealthy(),
      telegram: await this.telegramService.isHealthy(),
      slack: await this.slackService.isHealthy(),
      webhook: await this.webhookService.isHealthy(),
      queue: await this.queueService.isHealthy(),
    };

    return health;
  }
}
