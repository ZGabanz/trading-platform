/**
 * Pricing Core Service
 * Main entry point for the exchange rate pricing system
 */
declare class PricingCoreService {
    private app;
    private server;
    constructor();
    /**
     * Setup Express middleware
     */
    private setupMiddleware;
    /**
     * Setup API routes
     */
    private setupRoutes;
    /**
     * Setup error handling
     */
    private setupErrorHandling;
    /**
     * Setup Swagger documentation
     */
    private setupSwagger;
    /**
     * Start the server
     */
    start(): Promise<void>;
    /**
     * Initialize external services
     */
    private initializeServices;
    /**
     * Setup graceful shutdown
     */
    private setupGracefulShutdown;
    /**
     * Cleanup resources
     */
    private cleanup;
}
declare const service: PricingCoreService;
export default service;
//# sourceMappingURL=index.d.ts.map