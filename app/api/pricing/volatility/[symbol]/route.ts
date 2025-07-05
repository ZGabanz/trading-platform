import { NextRequest, NextResponse } from "next/server";

const PRICING_SERVICE_URL =
  process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;
    const { searchParams } = new URL(request.url);
    const timeWindow = searchParams.get("timeWindow") || "24";

    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/pricing/volatility/${symbol}?timeWindow=${timeWindow}`,
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pricing service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Volatility API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch volatility data" },
      { status: 500 }
    );
  }
}
