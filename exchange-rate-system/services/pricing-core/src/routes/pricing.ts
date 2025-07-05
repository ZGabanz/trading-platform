import { Router, Request, Response } from "express";
import { authenticatePartner, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

/**
 * Health check endpoint
 * GET /health
 */
router.get("/health", (req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

/**
 * Get exchange rates for symbols
 * GET /rates?symbols=EUR/USD,GBP/USD
 */
router.get(
  "/rates",
  authenticatePartner,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const symbols = req.query.symbols as string;
      const method = (req.query.method as string) || "FIXED_SPREAD";

      // Mock data for now
      const mockRates = {
        "EUR/USD": {
          rate: 1.085,
          spread: 0.001,
          timestamp: new Date().toISOString(),
        },
        "GBP/USD": {
          rate: 1.265,
          spread: 0.0012,
          timestamp: new Date().toISOString(),
        },
        "USD/JPY": {
          rate: 149.5,
          spread: 0.0015,
          timestamp: new Date().toISOString(),
        },
        "EUR/GBP": {
          rate: 0.858,
          spread: 0.0008,
          timestamp: new Date().toISOString(),
        },
        "GBP/JPY": {
          rate: 189.15,
          spread: 0.0018,
          timestamp: new Date().toISOString(),
        },
        "AUD/USD": {
          rate: 0.672,
          spread: 0.0014,
          timestamp: new Date().toISOString(),
        },
      };

      const requestedSymbols = symbols ? symbols.split(",") : ["EUR/USD"];
      const result: any = {};

      requestedSymbols.forEach((symbol) => {
        if (mockRates[symbol as keyof typeof mockRates]) {
          result[symbol] = mockRates[symbol as keyof typeof mockRates];
        }
      });

      res.json({
        success: true,
        data: result,
        method,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Rates API error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch rates",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

/**
 * Calculate exchange rate
 * POST /calculate
 */
router.post(
  "/calculate",
  authenticatePartner,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { symbol, from, to, amount, direction } = req.body;

      // Parse symbol if provided, otherwise use from/to
      let fromCurrency = from;
      let toCurrency = to;

      if (symbol && symbol.includes("/")) {
        [fromCurrency, toCurrency] = symbol.split("/");
      }

      // Mock calculation with realistic rates
      const mockRates: Record<string, number> = {
        "EUR/USD": 1.085,
        "GBP/USD": 1.265,
        "USD/JPY": 149.5,
        "EUR/GBP": 0.858,
        "GBP/JPY": 189.15,
        "AUD/USD": 0.672,
        "USD/EUR": 0.922,
        "USD/GBP": 0.79,
        "JPY/USD": 0.0067,
      };

      const symbolKey = `${fromCurrency}/${toCurrency}`;
      const mockRate = mockRates[symbolKey] || 1.0;
      const calculatedAmount = parseFloat(amount) * mockRate;

      res.json({
        success: true,
        data: {
          symbol: symbolKey,
          from: fromCurrency,
          to: toCurrency,
          amount: parseFloat(amount),
          rate: mockRate,
          result: calculatedAmount,
          payoutAmount: calculatedAmount,
          direction: direction || "BUY",
          timestamp: new Date().toISOString(),
          calculationMethod: "FIXED_SPREAD",
        },
      });
    } catch (error) {
      console.error("Calculate API error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to calculate rate",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;
