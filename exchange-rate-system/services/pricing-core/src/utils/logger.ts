import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each log level
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Add colors to winston
winston.addColors(logColors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${service || "pricing-core"}] ${level}: ${message} ${metaStr}`;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    ({ timestamp, level, message, service, stack, ...meta }) => {
      return JSON.stringify({
        timestamp,
        level,
        service: service || "pricing-core",
        message,
        ...(stack ? { stack } : {}),
        ...meta,
      });
    }
  )
);

// Create transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || "info",
    format: consoleFormat,
  }),

  // Daily rotate file for all logs
  new DailyRotateFile({
    filename: "logs/pricing-core-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    level: "info",
    format: fileFormat,
  }),

  // Daily rotate file for error logs only
  new DailyRotateFile({
    filename: "logs/pricing-core-error-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d",
    level: "error",
    format: fileFormat,
  }),
];

// Add HTTP logs in development
if (process.env.NODE_ENV === "development") {
  transports.push(
    new DailyRotateFile({
      filename: "logs/pricing-core-http-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "7d",
      level: "http",
      format: fileFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true })
  ),
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === "test",
});

// Add methods to logger instance
(logger as any).addReqId = (reqId: string) => {
  return logger.child({ reqId });
};

(logger as any).addContext = (context: Record<string, any>) => {
  return logger.child(context);
};

// Structured logging methods
export const Logger = {
  // Basic logging methods
  error: (message: string, error?: Error | any, meta?: Record<string, any>) => {
    logger.error(message, { error, ...meta });
  },

  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
  },

  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
  },

  debug: (message: string, meta?: Record<string, any>) => {
    logger.debug(message, meta);
  },

  http: (message: string, meta?: Record<string, any>) => {
    logger.http(message, meta);
  },

  // Business-specific logging methods
  pricing: {
    calculation: (
      symbol: string,
      method: string,
      duration: number,
      meta?: Record<string, any>
    ) => {
      logger.info(`Pricing calculation completed`, {
        symbol,
        method,
        duration,
        component: "pricing",
        ...meta,
      });
    },

    error: (symbol: string, error: Error, meta?: Record<string, any>) => {
      logger.error(`Pricing calculation failed`, {
        symbol,
        error: error.message,
        stack: error.stack,
        component: "pricing",
        ...meta,
      });
    },

    spreadUpdate: (
      symbol: string,
      oldSpread: string,
      newSpread: string,
      updatedBy: string
    ) => {
      logger.info(`Spread configuration updated`, {
        symbol,
        oldSpread,
        newSpread,
        updatedBy,
        component: "spread-config",
      });
    },

    alert: (
      alertType: string,
      symbol: string,
      severity: string,
      meta?: Record<string, any>
    ) => {
      logger.warn(`Pricing alert triggered`, {
        alertType,
        symbol,
        severity,
        component: "alerts",
        ...meta,
      });
    },
  },

  // Performance logging
  performance: {
    start: (operation: string, meta?: Record<string, any>) => {
      const startTime = Date.now();
      return {
        end: (additionalMeta?: Record<string, any>) => {
          const duration = Date.now() - startTime;
          logger.info(`Performance: ${operation}`, {
            operation,
            duration,
            component: "performance",
            ...meta,
            ...additionalMeta,
          });
          return duration;
        },
      };
    },

    slow: (
      operation: string,
      duration: number,
      threshold: number,
      meta?: Record<string, any>
    ) => {
      logger.warn(`Slow operation detected`, {
        operation,
        duration,
        threshold,
        component: "performance",
        ...meta,
      });
    },
  },

  // API logging
  api: {
    request: (
      method: string,
      url: string,
      statusCode: number,
      duration: number,
      meta?: Record<string, any>
    ) => {
      logger.http(`API ${method} ${url}`, {
        method,
        url,
        statusCode,
        duration,
        component: "api",
        ...meta,
      });
    },

    error: (
      method: string,
      url: string,
      error: Error,
      meta?: Record<string, any>
    ) => {
      logger.error(`API error ${method} ${url}`, {
        method,
        url,
        error: error.message,
        stack: error.stack,
        component: "api",
        ...meta,
      });
    },
  },

  // Database logging
  database: {
    query: (query: string, duration: number, meta?: Record<string, any>) => {
      logger.debug(`Database query executed`, {
        query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
        duration,
        component: "database",
        ...meta,
      });
    },

    error: (query: string, error: Error, meta?: Record<string, any>) => {
      logger.error(`Database query failed`, {
        query: query.substring(0, 100) + (query.length > 100 ? "..." : ""),
        error: error.message,
        component: "database",
        ...meta,
      });
    },

    connection: (
      event: "connected" | "disconnected" | "error",
      meta?: Record<string, any>
    ) => {
      const level = event === "error" ? "error" : "info";
      logger[level](`Database ${event}`, {
        event,
        component: "database",
        ...meta,
      });
    },
  },

  // Cache logging
  cache: {
    hit: (key: string, meta?: Record<string, any>) => {
      logger.debug(`Cache hit`, {
        key,
        component: "cache",
        ...meta,
      });
    },

    miss: (key: string, meta?: Record<string, any>) => {
      logger.debug(`Cache miss`, {
        key,
        component: "cache",
        ...meta,
      });
    },

    set: (key: string, ttl: number, meta?: Record<string, any>) => {
      logger.debug(`Cache set`, {
        key,
        ttl,
        component: "cache",
        ...meta,
      });
    },

    error: (
      operation: string,
      key: string,
      error: Error,
      meta?: Record<string, any>
    ) => {
      logger.error(`Cache error`, {
        operation,
        key,
        error: error.message,
        component: "cache",
        ...meta,
      });
    },
  },

  // External API logging
  external: {
    request: (
      service: string,
      endpoint: string,
      duration: number,
      meta?: Record<string, any>
    ) => {
      logger.debug(`External API request`, {
        service,
        endpoint,
        duration,
        component: "external-api",
        ...meta,
      });
    },

    error: (
      service: string,
      endpoint: string,
      error: Error,
      meta?: Record<string, any>
    ) => {
      logger.error(`External API error`, {
        service,
        endpoint,
        error: error.message,
        component: "external-api",
        ...meta,
      });
    },

    rateLimit: (
      service: string,
      endpoint: string,
      meta?: Record<string, any>
    ) => {
      logger.warn(`External API rate limited`, {
        service,
        endpoint,
        component: "external-api",
        ...meta,
      });
    },
  },
};

// Export both the structured logger and the base winston logger
export { logger };
export default Logger;
