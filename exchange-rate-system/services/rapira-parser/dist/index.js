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
const PORT = process.env.PORT || 4003;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        service: "rapira-parser",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: "1.0.0",
    });
});
app.get("/api/v1/rapira/rates/:symbol", (req, res) => {
    const { symbol } = req.params;
    res.json({
        success: true,
        data: {
            symbol,
            rate: Math.random() * 2 + 0.5,
            timestamp: new Date().toISOString(),
            source: "rapira",
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
    console.log(`🚀 Rapira Parser Service running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map