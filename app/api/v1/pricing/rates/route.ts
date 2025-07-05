import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");
    const method = searchParams.get("method") || "FIXED_SPREAD";

    const symbols = symbolsParam
      ? symbolsParam.split(",")
      : ["USD/EUR", "EUR/USD", "USD/GBP", "GBP/USD"];

    // Mock exchange rates with some randomness
    const baseRates: Record<string, number> = {
      "USD/EUR": 0.85,
      "EUR/USD": 1.18,
      "USD/GBP": 0.73,
      "GBP/USD": 1.37,
      "USD/JPY": 110.25,
      "JPY/USD": 0.0091,
      "EUR/GBP": 0.86,
      "GBP/EUR": 1.16,
      "BTC/USD": 45000,
      "USD/BTC": 0.000022,
      "ETH/USD": 3200,
      "USD/ETH": 0.0003125,
    };

    const data: Record<string, any> = {};

    symbols.forEach((symbol) => {
      const baseRate = baseRates[symbol] || 1.0;
      // Add some randomness to simulate real market fluctuations
      const fluctuation = (Math.random() - 0.5) * 0.02; // ±1% fluctuation
      const currentRate = baseRate * (1 + fluctuation);

      data[symbol] = {
        symbol,
        rate: currentRate,
        bid: currentRate * 0.998,
        ask: currentRate * 1.002,
        spread: currentRate * 0.004,
        spreadPercentage: 0.4,
        timestamp: new Date().toISOString(),
        method,
        volume24h: Math.floor(Math.random() * 1000000) + 100000,
        change24h: (Math.random() - 0.5) * 0.1, // ±5% daily change
      };
    });

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 50));

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      method,
    });
  } catch (error) {
    console.error("Rates fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch rates" },
      { status: 500 }
    );
  }
}
