import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface AppConfig {
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
    maxConnections: number;
    acquireTimeout: number;
    timeout: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    connectTimeout: number;
    lazyConnect: boolean;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
  };
  cors: {
    origins: string[];
  };
  jwt: {
    secret: string;
    expiresIn: string;
    issuer: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  pricing: {
    defaultCacheTTL: number;
    pricingCacheTTL: number;
    maxSpreadDeviation: number;
    volatilityAnalysisWindow: number;
  };
  external: {
    rapiraApiUrl: string;
    bybitApiUrl: string;
    htxApiUrl: string;
    requestTimeout: number;
    retryAttempts: number;
  };
  monitoring: {
    metricsEnabled: boolean;
    healthCheckInterval: number;
    alertingEnabled: boolean;
  };
  notifications: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user?: string;
      pass?: string;
    };
    telegram: {
      botToken?: string;
      chatId?: string;
    };
    slack: {
      webhookUrl?: string;
    };
  };
}

const config: AppConfig = {
  app: {
    name: process.env.APP_NAME || 'pricing-core-service',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4001', 10),
    logLevel: process.env.LOG_LEVEL || 'info'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'exchange_rate_db',
    username: process.env.DB_USER || 'exchange_user',
    password: process.env.DB_PASS || 'exchange_pass',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000', 10),
    timeout: parseInt(process.env.DB_TIMEOUT || '5000', 10)
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '10000', 10),
    lazyConnect: true,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },
  
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001']
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'pricing-core-service'
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) // 100 requests per window
  },
  
  pricing: {
    defaultCacheTTL: parseInt(process.env.DEFAULT_CACHE_TTL || '300', 10), // 5 minutes
    pricingCacheTTL: parseInt(process.env.PRICING_CACHE_TTL || '30', 10), // 30 seconds
    maxSpreadDeviation: parseFloat(process.env.MAX_SPREAD_DEVIATION || '10'), // 10%
    volatilityAnalysisWindow: parseInt(process.env.VOLATILITY_ANALYSIS_WINDOW || '24', 10) // 24 hours
  },
  
  external: {
    rapiraApiUrl: process.env.RAPIRA_API_URL || 'https://api.rapira.exchange',
    bybitApiUrl: process.env.BYBIT_API_URL || 'https://api.bybit.com',
    htxApiUrl: process.env.HTX_API_URL || 'https://api.huobi.pro',
    requestTimeout: parseInt(process.env.EXTERNAL_REQUEST_TIMEOUT || '10000', 10),
    retryAttempts: parseInt(process.env.EXTERNAL_RETRY_ATTEMPTS || '3', 10)
  },
  
  monitoring: {
    metricsEnabled: process.env.METRICS_ENABLED !== 'false',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
    alertingEnabled: process.env.ALERTING_ENABLED !== 'false'
  },
  
  notifications: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    telegram: {
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID
    },
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL
    }
  }
};

// Validation
if (config.app.env === 'production') {
  if (config.jwt.secret === 'default-jwt-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production environment');
  }
  
  if (!config.database.password) {
    throw new Error('DB_PASS must be set in production environment');
  }
}

// Log configuration (without sensitive data)
const logConfig = {
  ...config,
  database: {
    ...config.database,
    password: '***'
  },
  jwt: {
    ...config.jwt,
    secret: '***'
  },
  redis: {
    ...config.redis,
    password: config.redis.password ? '***' : undefined
  },
  notifications: {
    ...config.notifications,
    smtp: {
      ...config.notifications.smtp,
      user: config.notifications.smtp.user ? '***' : undefined,
      pass: config.notifications.smtp.pass ? '***' : undefined
    },
    telegram: {
      ...config.notifications.telegram,
      botToken: config.notifications.telegram.botToken ? '***' : undefined
    }
  }
};

console.log('Configuration loaded:', JSON.stringify(logConfig, null, 2));

export { config, AppConfig }; 