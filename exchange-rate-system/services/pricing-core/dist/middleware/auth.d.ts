import { Request, Response, NextFunction } from "express";
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        partnerId?: string;
        role: "ADMIN" | "PARTNER" | "VIEWER";
        permissions: string[];
    };
    partnerId?: string;
}
export interface JWTPayload {
    sub: string;
    partnerId?: string;
    role: "ADMIN" | "PARTNER" | "VIEWER";
    permissions: string[];
    iat: number;
    exp: number;
    iss: string;
}
export declare const authMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuthMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Role-based access control middleware
 */
export declare const requireRole: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Permission-based access control middleware
 */
export declare const requirePermission: (permission: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map