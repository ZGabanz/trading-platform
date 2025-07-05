"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.RateLimitError = exports.ExternalAPIError = exports.NotFoundError = exports.ValidationError = void 0;
const logger_1 = require("../utils/logger");
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.isOperational = true;
        this.code = "VALIDATION_ERROR";
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends Error {
    constructor(message = "Resource not found") {
        super(message);
        this.statusCode = 404;
        this.isOperational = true;
        this.code = "NOT_FOUND";
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class ExternalAPIError extends Error {
    constructor(message, service) {
        super(message);
        this.service = service;
        this.statusCode = 502;
        this.isOperational = true;
        this.code = "EXTERNAL_API_ERROR";
        this.name = "ExternalAPIError";
    }
}
exports.ExternalAPIError = ExternalAPIError;
class RateLimitError extends Error {
    constructor(message = "Rate limit exceeded") {
        super(message);
        this.statusCode = 429;
        this.isOperational = true;
        this.code = "RATE_LIMIT_EXCEEDED";
        this.name = "RateLimitError";
    }
}
exports.RateLimitError = RateLimitError;
const errorHandler = (error, req, res, next) => {
    const { statusCode = 500, message, code = "INTERNAL_SERVER_ERROR", isOperational = false, stack, } = error;
    // Log error details
    if (!isOperational || statusCode >= 500) {
        logger_1.logger.error("Unhandled error occurred", {
            error: message,
            stack,
            url: req.url,
            method: req.method,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            statusCode,
            code,
        });
    }
    else {
        logger_1.logger.warn("Operational error occurred", {
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
            message: isOperational || isDevelopment ? message : "Internal server error",
            ...(isDevelopment && { stack }),
        },
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
    };
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Async error wrapper
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map