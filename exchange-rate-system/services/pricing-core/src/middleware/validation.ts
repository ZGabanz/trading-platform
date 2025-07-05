import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { logger } from "../utils/logger";

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Middleware to handle validation results
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors
      .array()
      .map((error: any) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      }));

    logger.warn("Request validation failed", {
      path: req.path,
      method: req.method,
      errors: validationErrors,
    });

    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: validationErrors,
    });
    return;
  }

  next();
};

/**
 * Validate symbol parameter
 */
export const validateSymbol = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { symbol } = req.params;

  if (!symbol) {
    res.status(400).json({
      success: false,
      error: "Symbol parameter is required",
    });
    return;
  }

  // Basic symbol format validation
  if (!/^[A-Z]{3,6}\/[A-Z]{3,6}$/.test(symbol)) {
    res.status(400).json({
      success: false,
      error:
        "Invalid symbol format. Expected format: BASE/QUOTE (e.g., USDT/EUR)",
    });
    return;
  }

  next();
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { page, limit } = req.query;

  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    res.status(400).json({
      success: false,
      error: "Page must be a positive integer",
    });
    return;
  }

  if (
    limit &&
    (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)
  ) {
    res.status(400).json({
      success: false,
      error: "Limit must be a positive integer between 1 and 100",
    });
    return;
  }

  next();
};

/**
 * Validate date range parameters
 */
export const validateDateRange = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { from, to } = req.query;

  if (from && isNaN(Date.parse(from as string))) {
    res.status(400).json({
      success: false,
      error: "Invalid 'from' date format. Use ISO 8601 format.",
    });
    return;
  }

  if (to && isNaN(Date.parse(to as string))) {
    res.status(400).json({
      success: false,
      error: "Invalid 'to' date format. Use ISO 8601 format.",
    });
    return;
  }

  if (from && to && new Date(from as string) > new Date(to as string)) {
    res.status(400).json({
      success: false,
      error: "'from' date must be before 'to' date",
    });
    return;
  }

  next();
};

/**
 * Validate API key header
 */
export const validateApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: "API key is required",
      message: "Please provide a valid API key in X-API-Key header",
    });
    return;
  }

  if (typeof apiKey !== "string" || apiKey.length < 10) {
    res.status(401).json({
      success: false,
      error: "Invalid API key format",
      message: "API key must be a valid string",
    });
    return;
  }

  next();
};
