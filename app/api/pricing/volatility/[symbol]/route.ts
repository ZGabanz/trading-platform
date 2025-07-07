import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICING_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL ||
      "https://trading-platform-backend-g3us.onrender.com"
    : process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

// Generate mock volatility data
function generateMockVolatilityData(symbol: string, timeWindow: string) {
  const baseVolatility =
    symbol === "EUR/USD" ? 0.12 : symbol === "GBP/USD" ? 0.18 : 0.25;

  return {
    success: true,
    data: {
      symbol,
      timeWindow,
      volatility: baseVolatility + (Math.random() - 0.5) * 0.05,
      standardDeviation: baseVolatility * 0.8,
      averageRange: baseVolatility * 1.2,
      maxMovement: baseVolatility * 2.5,
      minMovement: baseVolatility * 0.3,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;
    const { searchParams } = new URL(request.url);
    const timeWindow = searchParams.get("timeWindow") || "24";

    // In production, return mock data
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(generateMockVolatilityData(symbol, timeWindow));
    }

    // Development environment - try to reach actual service
    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/pricing/volatility/${symbol}?timeWindow=${timeWindow}`,
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn(
        `Volatility service error: ${response.status}, using mock data`
      );
      return NextResponse.json(generateMockVolatilityData(symbol, timeWindow));
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Volatility API error, using mock data:", error);
    return NextResponse.json(generateMockVolatilityData(params.symbol, "24"));
  }
}
