"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pricingRoutes = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const decimal_js_1 = require("decimal.js");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
const FixedSpreadService_1 = require("../services/FixedSpreadService");
const metrics_1 = require("../middleware/metrics");
const router = (0, express_1.Router)();
exports.pricingRoutes = router;
const fixedSpreadService = new FixedSpreadService_1.FixedSpreadService();
/**
 * Calculate exchange rate
 * POST /api/v1/pricing/calculate
 */
router.post("/calculate", [
    (0, express_validator_1.body)("symbol").isString().notEmpty().withMessage("Symbol is required"),
    (0, express_validator_1.body)("amount").isNumeric().withMessage("Amount must be a valid number"),
    (0, express_validator_1.body)("direction")
        .isIn(["BUY", "SELL"])
        .withMessage("Direction must be BUY or SELL"),
    (0, express_validator_1.body)("partnerId").optional().isString(),
    (0, express_validator_1.body)("forceRefresh").optional().isBoolean(),
    (0, express_validator_1.body)("calculationMethod")
        .optional()
        .isIn(["FIXED_SPREAD", "HYBRID_P2P", "VOLATILITY_ADJUSTED"]),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const startTime = Date.now();
    const requestData = req.body;
    const partnerId = requestData.partnerId || req.partnerId;
    try {
        logger_1.logger.info("Processing rate calculation request", {
            symbol: requestData.symbol,
            amount: requestData.amount,
            direction: requestData.direction,
            partnerId,
            method: requestData.calculationMethod || "FIXED_SPREAD",
        });
        // For now, create a mock spot rate - will be replaced with actual data fetching
        const mockSpotRate = {
            symbol: requestData.symbol,
            price: new decimal_js_1.Decimal("1.0850"), // Mock EUR/USD rate
            timestamp: new Date(),
            source: "RAPIRA",
            volume: new decimal_js_1.Decimal("1000000"),
            bid: new decimal_js_1.Decimal("1.0848"),
            ask: new decimal_js_1.Decimal("1.0852"),
            spread: new decimal_js_1.Decimal("0.0004"),
        };
        // Calculate rate using fixed spread service
        const pricingResult = await fixedSpreadService.calculateRate(requestData.symbol, mockSpotRate, partnerId);
        const processingTime = Date.now() - startTime;
        // Record metrics
        (0, metrics_1.recordPricingCalculation)(requestData.symbol, requestData.calculationMethod || "FIXED_SPREAD", processingTime, true);
        const response = {
            success: true,
            data: pricingResult,
            metadata: {
                requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                processingTime,
                cacheHit: false,
                dataAge: 0,
            },
        };
        res.json(response);
    }
    catch (error) {
        const processingTime = Date.now() - startTime;
        // Record failed calculation metric
        (0, metrics_1.recordPricingCalculation)(requestData.symbol, requestData.calculationMethod || "FIXED_SPREAD", processingTime, false);
        throw error;
    }
}));
/**
 * Get current rates for multiple symbols
 * GET /api/v1/pricing/rates?symbols=EUR/USD,GBP/USD&method=FIXED_SPREAD
 */
router.get("/rates", [
    (0, express_validator_1.query)("symbols")
        .isString()
        .notEmpty()
        .withMessage("Symbols parameter is required"),
    (0, express_validator_1.query)("method")
        .optional()
        .isIn(["FIXED_SPREAD", "HYBRID_P2P", "VOLATILITY_ADJUSTED"]),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const symbolsParam = req.query.symbols;
    const method = req.query.method || "FIXED_SPREAD";
    const symbols = symbolsParam.split(",").map((s) => s.trim());
    logger_1.logger.info("Fetching rates for symbols", {
        symbols,
        method,
        partnerId: req.partnerId,
    });
    const rates = {};
    for (const symbol of symbols) {
        try {
            // Mock spot rate for each symbol
            const mockSpotRate = {
                symbol,
                price: new decimal_js_1.Decimal(Math.random() * 2 + 0.5), // Random rate between 0.5-2.5
                timestamp: new Date(),
                source: "RAPIRA",
                volume: new decimal_js_1.Decimal("1000000"),
                bid: new decimal_js_1.Decimal(Math.random() * 2 + 0.5),
                ask: new decimal_js_1.Decimal(Math.random() * 2 + 0.5),
                spread: new decimal_js_1.Decimal("0.0004"),
            };
            const result = await fixedSpreadService.calculateRate(symbol, mockSpotRate, req.partnerId);
            rates[symbol] = result;
        }
        catch (error) {
            logger_1.logger.warn("Failed to calculate rate for symbol", {
                symbol,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
    res.json({
        success: true,
        data: rates,
        timestamp: new Date().toISOString(),
        method,
    });
}));
/**
 * Get rate history for a symbol
 * GET /api/v1/pricing/history/:symbol?period=24h
 */
router.get("/history/:symbol", [
    (0, express_validator_1.param)("symbol").isString().notEmpty().withMessage("Symbol is required"),
    (0, express_validator_1.query)("period")
        .optional()
        .isIn(["1h", "4h", "24h", "7d", "30d"])
        .withMessage("Invalid period"),
], (0, auth_1.requirePermission)("pricing.history.read"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const { symbol } = req.params;
    const period = req.query.period || "24h";
    logger_1.logger.info("Fetching rate history", {
        symbol,
        period,
        partnerId: req.partnerId,
    });
    // Mock historical data
    const history = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000).toISOString(),
        spotRate: Math.random() * 2 + 0.5,
        finalRate: Math.random() * 2 + 0.5,
        spread: 0.02,
        volume: Math.random() * 1000000,
    }));
    res.json({
        success: true,
        data: {
            symbol,
            period,
            dataPoints: history.length,
            history,
        },
    });
}));
/**
 * Get spread configuration for a symbol
 * GET /api/v1/pricing/spread/:symbol
 */
router.get("/spread/:symbol", [(0, express_validator_1.param)("symbol").isString().notEmpty().withMessage("Symbol is required")], (0, auth_1.requirePermission)("pricing.config.read"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const { symbol } = req.params;
    logger_1.logger.info("Fetching spread configuration", {
        symbol,
        partnerId: req.partnerId,
    });
    // Mock spread configuration
    const spreadConfig = {
        id: `spread_${symbol}_${Date.now()}`,
        symbol,
        baseSpreadPercent: 2.0,
        minSpreadPercent: 1.0,
        maxSpreadPercent: 5.0,
        isActive: true,
        validFrom: new Date().toISOString(),
        validTo: null,
        partnerNotificationRequired: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    res.json({
        success: true,
        data: spreadConfig,
    });
}));
/**
 * Update spread configuration
 * PUT /api/v1/pricing/spread/:symbol
 */
router.put("/spread/:symbol", [
    (0, express_validator_1.param)("symbol").isString().notEmpty().withMessage("Symbol is required"),
    (0, express_validator_1.body)("baseSpreadPercent")
        .isNumeric()
        .withMessage("Base spread percent must be a number"),
    (0, express_validator_1.body)("minSpreadPercent").optional().isNumeric(),
    (0, express_validator_1.body)("maxSpreadPercent").optional().isNumeric(),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
    (0, express_validator_1.body)("partnerNotificationRequired").optional().isBoolean(),
], (0, auth_1.requireRole)(["ADMIN"]), (0, auth_1.requirePermission)("pricing.config.write"), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_1.ValidationError("Validation failed: " +
            errors
                .array()
                .map((e) => e.msg)
                .join(", "));
    }
    const { symbol } = req.params;
    const updateData = req.body;
    logger_1.logger.info("Updating spread configuration", {
        symbol,
        updateData,
        updatedBy: req.user?.id,
    });
    // Mock update response
    const updatedConfig = {
        id: `spread_${symbol}_${Date.now()}`,
        symbol,
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
 * WebSocket endpoint for real-time rate updates
 * This would typically be handled by WebSocket middleware
 */
router.get("/stream/:symbol", [(0, express_validator_1.param)("symbol").isString().notEmpty().withMessage("Symbol is required")], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { symbol } = req.params;
    res.json({
        success: true,
        message: "WebSocket streaming endpoint",
        symbol,
        endpoint: `/ws/pricing/${symbol}`,
        note: "Connect to WebSocket endpoint for real-time updates",
    });
}));
//# sourceMappingURL=pricing.js.map