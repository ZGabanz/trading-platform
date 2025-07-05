export type NotificationChannel = "EMAIL" | "TELEGRAM" | "SLACK" | "WEBHOOK";

export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "RETRY";

export type NotificationType =
  | "RATE_CHANGE"
  | "SPREAD_UPDATE"
  | "SYSTEM_ALERT"
  | "DEAL_EXECUTED"
  | "MARKET_VOLATILITY"
  | "API_ERROR"
  | "PARTNER_NOTIFICATION"
  | "MAINTENANCE"
  | "CUSTOM";

export interface NotificationRecipients {
  email?: string[];
  telegram?: string[]; // chat IDs
  slack?: string[]; // channel names
  webhook?: string[]; // webhook URLs
}

export interface NotificationChannelConfig {
  type: NotificationChannel;
  recipients: {
    email?: string[];
    telegram?: string;
    slack?: string;
    webhook?: string;
  };
  headers?: Record<string, string>; // for webhooks
}

export interface NotificationRequest {
  id: string;
  type: string;
  subject?: string;
  message: string;
  template?: string;
  data?: any;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  channels: {
    type: NotificationChannel;
    recipients?: {
      email?: string;
      telegram?: string;
      slack?: string;
      webhook?: string;
    };
    headers?: Record<string, string>;
  }[];
  timestamp: Date;
  attachments?: any[];
}

export interface NotificationResponse {
  id: string;
  status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  results: { [key in NotificationChannel]?: NotificationStatus };
  processingTime: number;
  timestamp: Date;
}

export interface NotificationAttachment {
  filename: string;
  content?: Buffer;
  url?: string;
  contentType: string;
}

// Email specific types
export interface EmailRequest {
  to: string[];
  subject: string;
  content: string;
  template?: string;
  data?: Record<string, any>;
  attachments?: NotificationAttachment[];
  from?: string;
  replyTo?: string;
}

// Telegram specific types
export interface TelegramRequest {
  chatId: string;
  message: string;
  parseMode?: "Markdown" | "HTML";
  disablePreview?: boolean;
  buttons?: TelegramButton[];
}

export interface TelegramButton {
  text: string;
  url?: string;
  callbackData?: string;
}

// Slack specific types
export interface SlackRequest {
  channel: string;
  message: string;
  attachments?: SlackAttachment[];
  username?: string;
  iconEmoji?: string;
}

export interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: SlackField[];
  timestamp?: number;
}

export interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

// Webhook specific types
export interface WebhookRequest {
  url: string;
  method: "POST" | "PUT" | "PATCH";
  headers: Record<string, string>;
  payload: any;
  timeout?: number;
}

// Template types
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channels: NotificationChannel[];
  subject?: string;
  htmlTemplate?: string;
  textTemplate?: string;
  telegramTemplate?: string;
  slackTemplate?: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription types
export interface NotificationSubscription {
  id: string;
  partnerId?: string;
  userId?: string;
  type: NotificationType;
  channels: NotificationChannelConfig[];
  isActive: boolean;
  filters?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Statistics types
export interface NotificationStats {
  period: "HOUR" | "DAY" | "WEEK" | "MONTH";
  totalSent: number;
  successRate: number;
  channelStats: {
    [key in NotificationChannel]?: {
      sent: number;
      failed: number;
      avgResponseTime: number;
    };
  };
  typeStats: {
    [key in NotificationType]?: {
      count: number;
      successRate: number;
    };
  };
}
