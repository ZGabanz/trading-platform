import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get("partnerId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // Mock statistics data
    const mockStats = {
      totalDeals: Math.floor(Math.random() * 1000) + 100,
      completedDeals: Math.floor(Math.random() * 800) + 80,
      pendingDeals: Math.floor(Math.random() * 50) + 10,
      failedDeals: Math.floor(Math.random() * 20) + 5,
      totalVolume: Math.floor(Math.random() * 1000000) + 100000,
      totalFees: Math.floor(Math.random() * 10000) + 1000,
      averageRate: 1.15 + (Math.random() - 0.5) * 0.1,
      successRate: 85 + Math.random() * 10, // 85-95%
      topSymbols: [
        { symbol: "USD/EUR", count: Math.floor(Math.random() * 100) + 50 },
        { symbol: "GBP/USD", count: Math.floor(Math.random() * 80) + 40 },
        { symbol: "USD/JPY", count: Math.floor(Math.random() * 60) + 30 },
        { symbol: "BTC/USD", count: Math.floor(Math.random() * 40) + 20 },
      ],
      dailyVolume: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
        volume: Math.floor(Math.random() * 50000) + 10000,
        deals: Math.floor(Math.random() * 50) + 10,
      })).reverse(),
      partnerId: partnerId || "all",
      dateRange: {
        from:
          fromDate ||
          new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
        to: toDate || new Date().toISOString().split("T")[0],
      },
    };

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 150));

    return NextResponse.json({
      success: true,
      data: mockStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Deal stats error, using fallback data:", error);

    // Return fallback statistics instead of error
    return NextResponse.json({
      success: true,
      data: {
        totalDeals: 156,
        completedDeals: 142,
        pendingDeals: 8,
        failedDeals: 6,
        totalVolume: 2500000,
        totalFees: 12500,
        averageRate: 1.15,
        successRate: 91.0,
        topSymbols: [
          { symbol: "USD/EUR", count: 68 },
          { symbol: "GBP/USD", count: 42 },
          { symbol: "USD/JPY", count: 28 },
          { symbol: "BTC/USD", count: 18 },
        ],
        dailyVolume: [
          {
            date: new Date(Date.now() - 6 * 86400000)
              .toISOString()
              .split("T")[0],
            volume: 35000,
            deals: 15,
          },
          {
            date: new Date(Date.now() - 5 * 86400000)
              .toISOString()
              .split("T")[0],
            volume: 42000,
            deals: 18,
          },
          {
            date: new Date(Date.now() - 4 * 86400000)
              .toISOString()
              .split("T")[0],
            volume: 38000,
            deals: 16,
          },
          {
            date: new Date(Date.now() - 3 * 86400000)
              .toISOString()
              .split("T")[0],
            volume: 45000,
            deals: 20,
          },
          {
            date: new Date(Date.now() - 2 * 86400000)
              .toISOString()
              .split("T")[0],
            volume: 52000,
            deals: 23,
          },
          {
            date: new Date(Date.now() - 1 * 86400000)
              .toISOString()
              .split("T")[0],
            volume: 48000,
            deals: 21,
          },
          {
            date: new Date().toISOString().split("T")[0],
            volume: 41000,
            deals: 18,
          },
        ],
        partnerId: "fallback",
        dateRange: {
          from: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0],
          to: new Date().toISOString().split("T")[0],
        },
      },
      timestamp: new Date().toISOString(),
    });
  }
}
