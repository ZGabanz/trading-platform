import { NextRequest, NextResponse } from "next/server";

const PRICING_SERVICE_URL =
  process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols")?.split(",") || ["EUR/USD"];
    const method = searchParams.get("method") || "FIXED_SPREAD";

    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/v1/pricing/rates?symbols=${symbols.join(
        ","
      )}&method=${method}`,
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
    console.error("Pricing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/v1/pricing/calculate`,
      {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Pricing service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Pricing calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate pricing" },
      { status: 500 }
    );
  }
}
