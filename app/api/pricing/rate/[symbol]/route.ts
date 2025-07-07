import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICING_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL ||
      "https://trading-platform-backend-g3us.onrender.com"
    : process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

// Generate mock rate data
function generateMockRateData(symbol: string, partnerId?: string) {
  const rates: Record<string, { rate: number; bid: number; ask: number }> = {
    "EUR/USD": { rate: 1.0856, bid: 1.0854, ask: 1.0858 },
    "GBP/USD": { rate: 1.2678, bid: 1.2675, ask: 1.2681 },
    "USD/JPY": { rate: 149.85, bid: 149.82, ask: 149.88 },
    "USD/EUR": { rate: 0.9211, bid: 0.9209, ask: 0.9213 },
    "BTC/USD": { rate: 43500, bid: 43480, ask: 43520 },
  };

  const rateData = rates[symbol] || rates["EUR/USD"];

  return {
    success: true,
    data: {
      symbol,
      rate: rateData.rate + (Math.random() - 0.5) * 0.001, // Small random variation
      bid: rateData.bid + (Math.random() - 0.5) * 0.001,
      ask: rateData.ask + (Math.random() - 0.5) * 0.001,
      spread: rateData.ask - rateData.bid,
      partnerId: partnerId || "default",
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
    const partnerId = searchParams.get("partnerId");

    // In production, return mock data
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        generateMockRateData(symbol, partnerId || undefined)
      );
    }

    // Development environment - try to reach actual service
    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/pricing/rate/${symbol}${
        partnerId ? `?partnerId=${partnerId}` : ""
      }`,
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn(`Rate service error: ${response.status}, using mock data`);
      return NextResponse.json(
        generateMockRateData(symbol, partnerId || undefined)
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Rate API error, using mock data:", error);
    return NextResponse.json(generateMockRateData(params.symbol, undefined));
  }
}
