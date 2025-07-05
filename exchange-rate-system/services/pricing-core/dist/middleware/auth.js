"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.requireRole = exports.optionalAuthMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const logger_1 = require("../utils/logger");
const errorHandler_1 = require("./errorHandler");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new errorHandler_1.ValidationError("Authorization header is required");
        }
        const token = authHeader.split(" ")[1]; // Bearer <token>
        if (!token) {
            throw new errorHandler_1.ValidationError("Authorization token is required");
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, environment_1.config.jwt.secret);
        // Check token issuer
        if (decoded.iss !== environment_1.config.jwt.issuer) {
            throw new errorHandler_1.ValidationError("Invalid token issuer");
        }
        // Attach user data to request
        req.user = {
            id: decoded.sub,
            partnerId: decoded.partnerId,
            role: decoded.role,
            permissions: decoded.permissions,
        };
        // Set partner context for pricing calculations
        req.partnerId = decoded.partnerId;
        logger_1.logger.debug("User authenticated successfully", {
            userId: decoded.sub,
            partnerId: decoded.partnerId,
            role: decoded.role,
            path: req.path,
        });
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            logger_1.logger.warn("Invalid JWT token", {
                error: error.message,
                path: req.path,
                ip: req.ip,
            });
            res.status(401).json({
                success: false,
                error: {
                    code: "INVALID_TOKEN",
                    message: "Invalid or expired token",
                },
            });
            return;
        }
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
// Optional auth middleware (doesn't fail if no token provided)
const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next();
    }
    // Use regular auth middleware if token is provided
    (0, exports.authMiddleware)(req, res, next);
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
/**
 * Role-based access control middleware
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: "Authentication required",
                code: "AUTH_REQUIRED",
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            logger_1.logger.warn("Access denied - insufficient role", {
                userId: req.user.id,
                userRole: req.user.role,
                requiredRoles: allowedRoles,
                component: "auth",
            });
            res.status(403).json({
                error: "Insufficient permissions",
                code: "INSUFFICIENT_ROLE",
                required: allowedRoles,
                current: req.user.role,
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Permission-based access control middleware
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: "Authentication required",
                code: "AUTH_REQUIRED",
            });
            return;
        }
        if (!req.user.permissions.includes(permission)) {
            logger_1.logger.warn("Access denied - missing permission", {
                userId: req.user.id,
                userRole: req.user.role,
                requiredPermission: permission,
                userPermissions: req.user.permissions,
                component: "auth",
            });
            res.status(403).json({
                error: "Insufficient permissions",
                code: "MISSING_PERMISSION",
                required: permission,
                available: req.user.permissions,
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
//# sourceMappingURL=auth.js.map