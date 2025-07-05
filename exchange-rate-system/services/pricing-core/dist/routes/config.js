"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.configRoutes = router;
/**
 * Get system configuration
 * GET /api/v1/config/system
 */
router.get("/system", (0, auth_1.requirePermission)("config.system.read"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    logger_1.logger.info("Fetching system configuration", {
        requestedBy: req.user?.id,
    });
    // Mock system configuration
    const systemConfig = {
        rateCacheTTL: 30,
        maxConcurrentRequests: 100,
        defaultTimeout: 5000,
        enableMetrics: true,
        enableAlerting: true,
        logLevel: process.env.LOG_LEVEL || "info",
        maintenanceMode: false,
        apiVersion: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        lastUpdated: new Date().toISOString(),
    };
    res.json({
        success: true,
        data: systemConfig,
    });
}));
/**
 * Update system configuration
 * PUT /api/v1/config/system
 */
router.put("/system", [
    (0, express_validator_1.body)("rateCacheTTL")
        .optional()
        .isInt({ min: 5, max: 3600 })
        .withMessage("Cache TTL must be between 5 and 3600 seconds"),
    (0, express_validator_1.body)("maxConcurrentRequests")
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage("Max concurrent requests must be between 1 and 1000"),
    (0, express_validator_1.body)("defaultTimeout")
        .optional()
        .isInt({ min: 1000, max: 60000 })
        .withMessage("Default timeout must be between 1000 and 60000ms"),
    (0, express_validator_1.body)("enableMetrics").optional().isBoolean(),
    (0, express_validator_1.body)("enableAlerting").optional().isBoolean(),
    (0, express_validator_1.body)("logLevel").optional().isIn(["debug", "info", "warn", "error"]),
    (0, express_validator_1.body)("maintenanceMode").optional().isBoolean(),
], (0, auth_1.requireRole)(["ADMIN"]), (0, auth_1.requirePermission)("config.system.write"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const updateData = req.body;
    logger_1.logger.info("Updating system configuration", {
        updateData,
        updatedBy: req.user?.id,
    });
    // Mock updated configuration
    const updatedConfig = {
        rateCacheTTL: 30,
        maxConcurrentRequests: 100,
        defaultTimeout: 5000,
        enableMetrics: true,
        enableAlerting: true,
        logLevel: "info",
        maintenanceMode: false,
        apiVersion: "1.0.0",
        environment: process.env.NODE_ENV || "development",
        ...updateData,
        lastUpdated: new Date().toISOString(),
        updatedBy: req.user?.id,
    };
    res.json({
        success: true,
        data: updatedConfig,
        message: "System configuration updated successfully",
    });
}));
/**
 * Get all spread configurations
 * GET /api/v1/config/spreads?active=true&symbol=EUR/USD
 */
router.get("/spreads", [
    (0, express_validator_1.query)("active")
        .optional()
        .isBoolean()
        .withMessage("Active must be a boolean"),
    (0, express_validator_1.query)("symbol")
        .optional()
        .isString()
        .withMessage("Symbol must be a string"),
    (0, express_validator_1.query)("partnerId")
        .optional()
        .isString()
        .withMessage("Partner ID must be a string"),
], (0, auth_1.requirePermission)("config.spreads.read"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const { active, symbol, partnerId } = req.query;
    logger_1.logger.info("Fetching spread configurations", {
        filters: { active, symbol, partnerId },
        requestedBy: req.user?.id,
    });
    // Mock spread configurations
    const spreadConfigs = [
        {
            id: "spread_1",
            symbol: "EUR/USD",
            baseSpreadPercent: 2.0,
            minSpreadPercent: 1.0,
            maxSpreadPercent: 5.0,
            isActive: true,
            validFrom: "2024-01-01T00:00:00Z",
            validTo: null,
            partnerNotificationRequired: true,
            createdBy: "admin",
            updatedBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        },
        {
            id: "spread_2",
            symbol: "GBP/USD",
            baseSpreadPercent: 2.5,
            minSpreadPercent: 1.5,
            maxSpreadPercent: 6.0,
            isActive: true,
            validFrom: "2024-01-01T00:00:00Z",
            validTo: null,
            partnerNotificationRequired: true,
            createdBy: "admin",
            updatedBy: "admin",
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
        },
    ];
    // Apply filters
    let filteredConfigs = spreadConfigs;
    if (active !== undefined) {
        filteredConfigs = filteredConfigs.filter((config) => config.isActive === (active === "true"));
    }
    if (symbol) {
        filteredConfigs = filteredConfigs.filter((config) => config.symbol === symbol);
    }
    res.json({
        success: true,
        data: filteredConfigs,
        total: filteredConfigs.length,
        filters: { active, symbol, partnerId },
    });
}));
/**
 * Create new spread configuration
 * POST /api/v1/config/spreads
 */
router.post("/spreads", [
    (0, express_validator_1.body)("symbol").isString().notEmpty().withMessage("Symbol is required"),
    (0, express_validator_1.body)("baseSpreadPercent")
        .isNumeric()
        .withMessage("Base spread percent is required and must be numeric"),
    (0, express_validator_1.body)("minSpreadPercent")
        .isNumeric()
        .withMessage("Min spread percent is required and must be numeric"),
    (0, express_validator_1.body)("maxSpreadPercent")
        .isNumeric()
        .withMessage("Max spread percent is required and must be numeric"),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
    (0, express_validator_1.body)("validFrom")
        .optional()
        .isISO8601()
        .withMessage("Valid from must be a valid ISO date"),
    (0, express_validator_1.body)("validTo")
        .optional()
        .isISO8601()
        .withMessage("Valid to must be a valid ISO date"),
    (0, express_validator_1.body)("partnerNotificationRequired").optional().isBoolean(),
], (0, auth_1.requireRole)(["ADMIN"]), (0, auth_1.requirePermission)("config.spreads.create"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const spreadData = req.body;
    // Validate spread logic
    if (spreadData.minSpreadPercent >= spreadData.maxSpreadPercent) {
        throw new errorHandler_1.ValidationError("Min spread percent must be less than max spread percent");
    }
    if (spreadData.baseSpreadPercent < spreadData.minSpreadPercent ||
        spreadData.baseSpreadPercent > spreadData.maxSpreadPercent) {
        throw new errorHandler_1.ValidationError("Base spread percent must be between min and max spread percents");
    }
    logger_1.logger.info("Creating new spread configuration", {
        spreadData,
        createdBy: req.user?.id,
    });
    // Mock created configuration
    const newConfig = {
        id: `spread_${Date.now()}`,
        ...spreadData,
        isActive: spreadData.isActive ?? true,
        validFrom: spreadData.validFrom || new Date().toISOString(),
        partnerNotificationRequired: spreadData.partnerNotificationRequired ?? true,
        createdBy: req.user?.id,
        updatedBy: req.user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    res.status(201).json({
        success: true,
        data: newConfig,
        message: "Spread configuration created successfully",
    });
}));
/**
 * Update spread configuration
 * PUT /api/v1/config/spreads/:id
 */
router.put("/spreads/:id", [
    (0, express_validator_1.param)("id").isString().notEmpty().withMessage("Spread ID is required"),
    (0, express_validator_1.body)("baseSpreadPercent").optional().isNumeric(),
    (0, express_validator_1.body)("minSpreadPercent").optional().isNumeric(),
    (0, express_validator_1.body)("maxSpreadPercent").optional().isNumeric(),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
    (0, express_validator_1.body)("validFrom").optional().isISO8601(),
    (0, express_validator_1.body)("validTo").optional().isISO8601(),
    (0, express_validator_1.body)("partnerNotificationRequired").optional().isBoolean(),
], (0, auth_1.requireRole)(["ADMIN"]), (0, auth_1.requirePermission)("config.spreads.update"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const { id } = req.params;
    const updateData = req.body;
    logger_1.logger.info("Updating spread configuration", {
        spreadId: id,
        updateData,
        updatedBy: req.user?.id,
    });
    // Mock updated configuration
    const updatedConfig = {
        id,
        symbol: "EUR/USD",
        baseSpreadPercent: 2.0,
        minSpreadPercent: 1.0,
        maxSpreadPercent: 5.0,
        isActive: true,
        validFrom: "2024-01-01T00:00:00Z",
        validTo: null,
        partnerNotificationRequired: true,
        createdBy: "admin",
        createdAt: "2024-01-01T00:00:00Z",
        ...updateData,
        updatedBy: req.user?.id,
        updatedAt: new Date().toISOString(),
    };
    res.json({
        success: true,
        data: updatedConfig,
        message: "Spread configuration updated successfully",
    });
}));
/**
 * Delete spread configuration
 * DELETE /api/v1/config/spreads/:id
 */
router.delete("/spreads/:id", [(0, express_validator_1.param)("id").isString().notEmpty().withMessage("Spread ID is required")], (0, auth_1.requireRole)(["ADMIN"]), (0, auth_1.requirePermission)("config.spreads.delete"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const { id } = req.params;
    logger_1.logger.info("Deleting spread configuration", {
        spreadId: id,
        deletedBy: req.user?.id,
    });
    res.json({
        success: true,
        message: "Spread configuration deleted successfully",
        spreadId: id,
    });
}));
/**
 * Get volatility configuration
 * GET /api/v1/config/volatility?symbol=EUR/USD
 */
router.get("/volatility", [(0, express_validator_1.query)("symbol").optional().isString()], (0, auth_1.requirePermission)("config.volatility.read"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { symbol } = req.query;
    logger_1.logger.info("Fetching volatility configuration", {
        symbol,
        requestedBy: req.user?.id,
    });
    // Mock volatility configurations
    const volatilityConfigs = [
        {
            id: "vol_1",
            symbol: "EUR/USD",
            baseSpread: 1.5,
            volatilityMultiplier: 0.5,
            lowVolatilityThreshold: 0.5,
            mediumVolatilityThreshold: 1.0,
            highVolatilityThreshold: 2.0,
            criticalVolatilityThreshold: 5.0,
            maxVolatilitySpread: 10.0,
            smoothingFactor: 0.3,
            isActive: true,
            validFrom: "2024-01-01T00:00:00Z",
            validTo: null,
        },
    ];
    const filteredConfigs = symbol
        ? volatilityConfigs.filter((config) => config.symbol === symbol)
        : volatilityConfigs;
    res.json({
        success: true,
        data: filteredConfigs,
    });
}));
/**
 * Get P2P configuration
 * GET /api/v1/config/p2p
 */
router.get("/p2p", (0, auth_1.requirePermission)("config.p2p.read"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    logger_1.logger.info("Fetching P2P configuration", {
        requestedBy: req.user?.id,
    });
    // Mock P2P configuration
    const p2pConfig = {
        enabledSources: ["BYBIT", "HTX"],
        topSellersCount: 10,
        volumeWeightEnabled: true,
        minimumSellerRating: 95,
        minimumCompletionRate: 90,
        maxPriceDeviationPercent: 5.0,
        cacheTimeout: 60,
        isActive: true,
        lastUpdated: new Date().toISOString(),
    };
    res.json({
        success: true,
        data: p2pConfig,
    });
}));
//# sourceMappingURL=config.js.map