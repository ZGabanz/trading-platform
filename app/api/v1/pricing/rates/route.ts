import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICING_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL ||
      "https://trading-platform-backend-g3us.onrender.com"
    : process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

// Mock rates data
const MOCK_RATES_DATA = {
  success: true,
  data: [
    {
      symbol: "EUR/USD",
      rate: 1.0856,
      bid: 1.0854,
      ask: 1.0858,
      spread: 0.0004,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: "GBP/USD",
      rate: 1.2678,
      bid: 1.2675,
      ask: 1.2681,
      spread: 0.0006,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: "USD/JPY",
      rate: 149.85,
      bid: 149.82,
      ask: 149.88,
      spread: 0.06,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: "USD/EUR",
      rate: 0.9211,
      bid: 0.9209,
      ask: 0.9213,
      spread: 0.0004,
      timestamp: new Date().toISOString(),
    },
    {
      symbol: "BTC/USD",
      rate: 43500,
      bid: 43480,
      ask: 43520,
      spread: 40,
      timestamp: new Date().toISOString(),
    },
  ],
  timestamp: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols")?.split(",") || ["EUR/USD"];
    const method = searchParams.get("method") || "FIXED_SPREAD";

    // In production, return mock data
    if (process.env.NODE_ENV === "production") {
      const filteredData = MOCK_RATES_DATA.data.filter((item) =>
        symbols.includes(item.symbol)
      );

      return NextResponse.json({
        ...MOCK_RATES_DATA,
        data:
          filteredData.length > 0
            ? filteredData
            : MOCK_RATES_DATA.data.slice(0, 1),
        method,
      });
    }

    // Development environment - try to reach actual service
    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/v1/pricing/rates?symbols=${symbols.join(
        ","
      )}&method=${method}`,
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      console.warn(`Rates service error: ${response.status}, using mock data`);
      const filteredData = MOCK_RATES_DATA.data.filter((item) =>
        symbols.includes(item.symbol)
      );

      return NextResponse.json({
        ...MOCK_RATES_DATA,
        data:
          filteredData.length > 0
            ? filteredData
            : MOCK_RATES_DATA.data.slice(0, 1),
        method,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Rates API error, using mock data:", error);
    return NextResponse.json(MOCK_RATES_DATA);
  }
}
