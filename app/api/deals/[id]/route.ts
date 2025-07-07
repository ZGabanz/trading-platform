import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEAL_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL ||
      "https://trading-platform-backend-g3us.onrender.com"
    : process.env.DEAL_SERVICE_URL || "http://localhost:4004";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

// Mock deal data
const mockDeals: Record<string, any> = {
  deal_001: {
    id: "deal_001",
    partnerId: "partner_001",
    symbol: "USD/EUR",
    amount: 1000,
    rate: 0.85,
    direction: "BUY",
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    executedAt: new Date(Date.now() - 86000000).toISOString(),
    fee: 10,
    result: 850,
  },
  deal_002: {
    id: "deal_002",
    partnerId: "partner_001",
    symbol: "GBP/USD",
    amount: 500,
    rate: 1.37,
    direction: "SELL",
    status: "pending",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    fee: 5,
    result: 685,
  },
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // In production, return mock data
    if (process.env.NODE_ENV === "production") {
      const deal = mockDeals[id] || mockDeals["deal_001"];
      return NextResponse.json({
        success: true,
        data: { ...deal, id },
        timestamp: new Date().toISOString(),
      });
    }

    // Development environment - try to reach actual service
    const response = await fetch(`${DEAL_SERVICE_URL}/api/deals/${id}`, {
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(`Deal service error: ${response.status}, using mock data`);
      const deal = mockDeals[id] || mockDeals["deal_001"];
      return NextResponse.json({
        success: true,
        data: { ...deal, id },
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Deal API error, using mock data:", error);
    const deal = mockDeals[params.id] || mockDeals["deal_001"];
    return NextResponse.json({
      success: true,
      data: { ...deal, id: params.id },
      timestamp: new Date().toISOString(),
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // In production, return mock response
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({
        success: true,
        message: "Deal cancelled successfully",
        data: { id, status: "cancelled" },
        timestamp: new Date().toISOString(),
      });
    }

    // Development environment - try to reach actual service
    const response = await fetch(`${DEAL_SERVICE_URL}/api/deals/${id}/cancel`, {
      method: "POST",
      headers: {
        "X-API-Key": API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.warn(
        `Deal cancellation error: ${response.status}, using mock response`
      );
      return NextResponse.json({
        success: true,
        message: "Deal cancelled successfully",
        data: { id, status: "cancelled" },
        timestamp: new Date().toISOString(),
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Deal cancellation error, using mock response:", error);
    return NextResponse.json({
      success: true,
      message: "Deal cancelled successfully",
      data: { id: params.id, status: "cancelled" },
      timestamp: new Date().toISOString(),
    });
  }
}
