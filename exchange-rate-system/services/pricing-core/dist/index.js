"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const environment_1 = require("./config/environment");
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const metrics_1 = require("./middleware/metrics");
const pricing_1 = require("./routes/pricing");
const health_1 = require("./routes/health");
const config_1 = require("./routes/config");
/**
 * Pricing Core Service
 * Main entry point for the exchange rate pricing system
 */
class PricingCoreService {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
        this.setupSwagger();
    }
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: environment_1.config.cors.origins,
            credentials: true
        }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: environment_1.config.rateLimit.max,
            message: 'Too many requests from this IP',
            standardHeaders: true,
            legacyHeaders: false
        });
        this.app.use(limiter);
        // Body parsing and compression
        this.app.use((0, compression_1.default)());
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // Logging
        this.app.use((0, morgan_1.default)('combined', {
            stream: { write: (message) => logger_1.logger.info(message.trim()) }
        }));
        // Metrics collection
        this.app.use(metrics_1.metricsMiddleware);
        // Authentication (skip for health checks)
        this.app.use('/api', auth_1.authMiddleware);
    }
    /**
     * Setup API routes
     */
    setupRoutes() {
        // Health check routes (no auth required)
        this.app.use('/health', health_1.healthRoutes);
        // API routes
        this.app.use('/api/v1/pricing', pricing_1.pricingRoutes);
        this.app.use('/api/v1/config', config_1.configRoutes);
        // Root route
        this.app.get('/', (req, res) => {
            res.json({
                service: 'Pricing Core Service',
                version: environment_1.config.app.version,
                status: 'running',
                timestamp: new Date().toISOString()
            });
        });
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.originalUrl,
                method: req.method
            });
        });
    }
    /**
     * Setup error handling
     */
    setupErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    /**
     * Setup Swagger documentation
     */
    setupSwagger() {
        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Pricing Core Service API',
                    version: environment_1.config.app.version,
                    description: 'Exchange rate calculation and spread management API',
                    contact: {
                        name: 'Development Team',
                        email: 'dev@company.com'
                    }
                },
                servers: [
                    {
                        url: `http://localhost:${environment_1.config.app.port}`,
                        description: 'Development server'
                    }
                ],
                components: {
                    securitySchemes: {
                        bearerAuth: {
                            type: 'http',
                            scheme: 'bearer',
                            bearerFormat: 'JWT'
                        }
                    }
                },
                security: [
                    {
                        bearerAuth: []
                    }
                ]
            },
            apis: ['./src/routes/*.ts', './src/controllers/*.ts']
        };
        const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
        this.app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    }
    /**
     * Start the server
     */
    async start() {
        try {
            // Initialize database connections, cache, etc.
            await this.initializeServices();
            this.server = this.app.listen(environment_1.config.app.port, () => {
                logger_1.logger.info(`Pricing Core Service started on port ${environment_1.config.app.port}`, {
                    service: 'pricing-core',
                    port: environment_1.config.app.port,
                    environment: environment_1.config.app.env,
                    version: environment_1.config.app.version
                });
            });
            // Graceful shutdown handling
            this.setupGracefulShutdown();
        }
        catch (error) {
            logger_1.logger.error('Failed to start Pricing Core Service', error);
            process.exit(1);
        }
    }
    /**
     * Initialize external services
     */
    async initializeServices() {
        logger_1.logger.info('Initializing services...');
        // TODO: Initialize database connection
        // TODO: Initialize Redis connection
        // TODO: Initialize message queues
        // TODO: Initialize external API clients
        logger_1.logger.info('Services initialized successfully');
    }
    /**
     * Setup graceful shutdown
     */
    setupGracefulShutdown() {
        const shutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}, starting graceful shutdown...`);
            if (this.server) {
                this.server.close(async () => {
                    logger_1.logger.info('HTTP server closed');
                    // Close database connections, cache, etc.
                    await this.cleanup();
                    logger_1.logger.info('Graceful shutdown completed');
                    process.exit(0);
                });
            }
            else {
                await this.cleanup();
                process.exit(0);
            }
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        try {
            // TODO: Close database connections
            // TODO: Close Redis connections
            // TODO: Close message queue connections
            logger_1.logger.info('Cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('Error during cleanup', error);
        }
    }
}
// Start the service
const service = new PricingCoreService();
if (require.main === module) {
    service.start().catch((error) => {
        logger_1.logger.error('Failed to start service', error);
        process.exit(1);
    });
}
exports.default = service;
//# sourceMappingURL=index.js.map