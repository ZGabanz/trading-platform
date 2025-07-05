import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/environment";
import { logger } from "../utils/logger";
import { ValidationError } from "./errorHandler";
import { db } from "../database/connection";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    partnerId?: string;
    role: "ADMIN" | "PARTNER" | "VIEWER";
    permissions: string[];
    tier: string;
  };
  partnerId?: string;
}

export interface JWTPayload {
  sub: string; // user id
  partnerId?: string;
  role: "ADMIN" | "PARTNER" | "VIEWER";
  permissions: string[];
  iat: number;
  exp: number;
  iss: string;
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ValidationError("Authorization header is required");
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>

    if (!token) {
      throw new ValidationError("Authorization token is required");
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

    // Check token issuer
    if (decoded.iss !== config.jwt.issuer) {
      throw new ValidationError("Invalid token issuer");
    }

    // Attach user data to request
    req.user = {
      id: decoded.sub,
      partnerId: decoded.partnerId,
      role: decoded.role,
      permissions: decoded.permissions,
      tier: "", // This will be populated later
    };

    // Set partner context for pricing calculations
    req.partnerId = decoded.partnerId;

    logger.debug("User authenticated successfully", {
      userId: decoded.sub,
      partnerId: decoded.partnerId,
      role: decoded.role,
      path: req.path,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Invalid JWT token", {
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

    logger.error("Authentication error", {
      error: error instanceof Error ? error.message : "Unknown error",
      path: req.path,
    });

    next(error);
  }
};

// Optional auth middleware (doesn't fail if no token provided)
export const optionalAuthMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  // Use regular auth middleware if token is provided
  authMiddleware(req, res, next);
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("Access denied - insufficient role", {
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

/**
 * Permission-based access control middleware
 */
export const requirePermission = (permission: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    if (!req.user.permissions.includes(permission)) {
      logger.warn("Access denied - missing permission", {
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

export const authenticatePartner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: "API key required",
        message: "Please provide a valid API key in X-API-Key header",
      });
    }

    // For development, accept the test API key
    if (apiKey === "test-partner-abc123") {
      // Set user context
      req.user = {
        id: "test-partner-1",
        partnerId: apiKey,
        role: "PARTNER",
        permissions: ["read", "write"],
        tier: "STANDARD",
      };
      req.partnerId = apiKey;

      return next();
    }

    // TODO: Validate API key against database in production
    // const query = "SELECT id, name, tier, is_active FROM partners WHERE api_key = $1";
    // const result = await db.query(query, [apiKey]);

    return res.status(401).json({
      success: false,
      error: "Invalid API key",
      message: "The provided API key is not valid",
    });
  } catch (error) {
    logger.error("Authentication failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res.status(500).json({
      success: false,
      error: "Authentication failed",
      message: "Internal server error during authentication",
    });
  }
};
