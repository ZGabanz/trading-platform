import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create logger for validation (simple console logger)
const logger = {
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

interface NotificationConfig {
  app: {
    name: string;
    version: string;
    env: string;
    port: number;
    logLevel: string;
  };
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  cors: {
    origins: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  email: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user?: string;
      pass?: string;
    };
    from: string;
    replyTo?: string;
  };
  telegram: {
    botToken?: string;
    defaultChatId?: string;
  };
  slack: {
    webhookUrl?: string;
    defaultChannel?: string;
  };
  webhooks: {
    timeout: number;
    retryAttempts: number;
  };
  queues: {
    concurrency: number;
    maxAttempts: number;
    backoffDelay: number;
  };
}

const config: NotificationConfig = {
  app: {
    name: "notification-service",
    version: process.env.npm_package_version || "1.0.0",
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "4005", 10),
    logLevel: process.env.LOG_LEVEL || "info",
  },

  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "exchange_rate_db",
    username: process.env.DB_USER || "exchange_user",
    password: process.env.DB_PASS || "exchange_pass",
    ssl: process.env.DB_SSL === "true",
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASS,
    db: parseInt(process.env.REDIS_DB || "0", 10),
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "900000", 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || "noreply@exchange-system.com",
    replyTo: process.env.EMAIL_REPLY_TO,
  },

  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    defaultChatId: process.env.TELEGRAM_CHAT_ID,
  },

  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL || "#alerts",
  },

  webhooks: {
    timeout: parseInt(process.env.WEBHOOK_TIMEOUT || "10000", 10),
    retryAttempts: parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS || "3", 10),
  },

  queues: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || "5", 10),
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || "3", 10),
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY || "5000", 10),
  },
};

// Validation
if (config.app.env === "production") {
  if (!config.email.smtp.user || !config.email.smtp.pass) {
    logger.warn(
      "SMTP credentials not configured - email notifications will be disabled"
    );
  }

  if (!config.telegram.botToken) {
    logger.warn(
      "Telegram bot token not configured - Telegram notifications will be disabled"
    );
  }

  if (!config.slack.webhookUrl) {
    logger.warn(
      "Slack webhook URL not configured - Slack notifications will be disabled"
    );
  }
}

export { config };
