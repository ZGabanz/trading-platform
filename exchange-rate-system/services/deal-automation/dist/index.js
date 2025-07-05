"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4004;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "deal-automation",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: "1.0.0",
    });
});
app.post("/api/v1/deals", (req, res) => {
    res.json({
        success: true,
        data: {
            dealId: `deal_${Date.now()}`,
            status: "created",
            timestamp: new Date().toISOString(),
        },
    });
});
app.get("/api/v1/deals/status", (req, res) => {
    res.json({
        success: true,
        data: {
            totalDeals: 42,
            pendingDeals: 3,
            completedDeals: 38,
            failedDeals: 1,
        },
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Internal server error",
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Deal Automation Service running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map