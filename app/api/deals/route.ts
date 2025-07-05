import { NextRequest, NextResponse } from "next/server";

// Mock deals data
const mockDeals = [
  {
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
  {
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
  {
    id: "deal_003",
    partnerId: "partner_002",
    symbol: "BTC/USD",
    amount: 0.1,
    rate: 45000,
    direction: "BUY",
    status: "failed",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    fee: 25,
    result: 4500,
    error: "Insufficient liquidity",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredDeals = [...mockDeals];

    if (partnerId) {
      filteredDeals = filteredDeals.filter(
        (deal) => deal.partnerId === partnerId
      );
    }

    if (status) {
      filteredDeals = filteredDeals.filter((deal) => deal.status === status);
    }

    filteredDeals = filteredDeals.slice(0, limit);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      data: filteredDeals,
      total: filteredDeals.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Deals fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, amount, direction, partnerId = "partner_001" } = body;

    const newDeal = {
      id: `deal_${Date.now()}`,
      partnerId,
      symbol,
      amount,
      rate: 1.0, // Would be calculated based on current rates
      direction,
      status: "pending",
      createdAt: new Date().toISOString(),
      fee: amount * 0.01, // 1% fee
      result: amount * 0.99, // Simplified calculation
    };

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 200));

    return NextResponse.json({
      success: true,
      data: newDeal,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Deal creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create deal" },
      { status: 500 }
    );
  }
}
