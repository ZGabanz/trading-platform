import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  isOperational = true;
  code = "VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  isOperational = true;
  code = "NOT_FOUND";

  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ExternalAPIError extends Error implements AppError {
  statusCode = 502;
  isOperational = true;
  code = "EXTERNAL_API_ERROR";

  constructor(
    message: string,
    public service?: string
  ) {
    super(message);
    this.name = "ExternalAPIError";
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = 429;
  isOperational = true;
  code = "RATE_LIMIT_EXCEEDED";

  constructor(message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    statusCode = 500,
    message,
    code = "INTERNAL_SERVER_ERROR",
    isOperational = false,
    stack,
  } = error;

  // Log error details
  if (!isOperational || statusCode >= 500) {
    logger.error("Unhandled error occurred", {
      error: message,
      stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      statusCode,
      code,
    });
  } else {
    logger.warn("Operational error occurred", {
      error: message,
      url: req.url,
      method: req.method,
      statusCode,
      code,
    });
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === "development";

  const errorResponse = {
    success: false,
    error: {
      code,
      message:
        isOperational || isDevelopment ? message : "Internal server error",
      ...(isDevelopment && { stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
