import { Request, Response, NextFunction } from "express";
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
    code?: string;
}
export declare class ValidationError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    code: string;
    constructor(message: string);
}
export declare class NotFoundError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    code: string;
    constructor(message?: string);
}
export declare class ExternalAPIError extends Error implements AppError {
    service?: string | undefined;
    statusCode: number;
    isOperational: boolean;
    code: string;
    constructor(message: string, service?: string | undefined);
}
export declare class RateLimitError extends Error implements AppError {
    statusCode: number;
    isOperational: boolean;
    code: string;
    constructor(message?: string);
}
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map