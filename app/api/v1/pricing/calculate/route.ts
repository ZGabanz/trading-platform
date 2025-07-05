import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      symbol,
      amount,
      direction = "BUY",
      calculationMethod = "FIXED_SPREAD",
    } = body;

    // Mock exchange rates
    const mockRates: Record<string, number> = {
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

    const baseRate = mockRates[symbol] || 1.0;
    const spread = 0.02; // 2% spread
    const spreadPercentage = spread * 100;

    const finalRate =
      direction === "BUY" ? baseRate * (1 + spread) : baseRate * (1 - spread);

    const result = amount * finalRate;

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        spotRate: baseRate,
        finalRate,
        spread: spread * baseRate,
        spreadPercentage,
        amount,
        result,
        rate: finalRate,
        direction,
        timestamp: new Date().toISOString(),
        calculationMethod,
      },
      metadata: {
        requestId: `req_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        processingTime: 100,
        cacheHit: false,
        dataAge: 0,
      },
    });
  } catch (error) {
    console.error("Pricing calculation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate pricing" },
      { status: 500 }
    );
  }
}
