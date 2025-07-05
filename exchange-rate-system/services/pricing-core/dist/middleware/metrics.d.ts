import { Request, Response, NextFunction } from "express";
import promClient from "prom-client";
declare const register: promClient.Registry;
export declare const metricsMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export declare const recordPricingCalculation: (symbol: string, method: string, duration: number, success: boolean) => void;
export declare const recordSpreadDeviation: (symbol: string, deviation: number) => void;
export declare const recordCacheOperation: (operation: "get" | "set", result: "hit" | "miss" | "error") => void;
export declare const recordExternalApiCall: (service: string, endpoint: string, duration: number, success: boolean) => void;
export declare const recordAlert: (type: string, severity: string, symbol?: string) => void;
export declare const getMetrics: (req: Request, res: Response) => Promise<void>;
export declare const updateHealthMetric: (healthy: boolean) => void;
export { register };
//# sourceMappingURL=metrics.d.ts.map