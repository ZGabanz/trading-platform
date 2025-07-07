import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICING_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL ||
      "https://trading-platform-backend-g3us.onrender.com"
    : process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

// Generate mock historical data
function generateMockHistoryData(
  symbol: string,
  timeWindow: string,
  limit: number
) {
  const data = [];
  const now = Date.now();
  const intervalMs = timeWindow === "24" ? 3600000 : 86400000; // 1 hour or 1 day

  for (let i = 0; i < limit; i++) {
    const timestamp = new Date(now - i * intervalMs);
    const baseRate =
      symbol === "EUR/USD" ? 1.08 : symbol === "GBP/USD" ? 1.27 : 149.85;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation

    data.unshift({
      timestamp: timestamp.toISOString(),
      rate: baseRate + baseRate * variation,
      volume: Math.floor(Math.random() * 1000000) + 100000,
    });
  }

  return {
    success: true,
    data,
    symbol,
    timeWindow,
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
    const limit = parseInt(searchParams.get("limit") || "100");

    // In production, return mock data
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        generateMockHistoryData(symbol, timeWindow, limit)
      );
    }

    // Development environment - try to reach actual service
    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/pricing/history/${symbol}?timeWindow=${timeWindow}&limit=${limit}`,
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
        `History service error: ${response.status}, using mock data`
      );
      return NextResponse.json(
        generateMockHistoryData(symbol, timeWindow, limit)
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("History API error, using mock data:", error);
    return NextResponse.json(generateMockHistoryData(params.symbol, "24", 100));
  }
}
