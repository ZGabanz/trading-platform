import { NextRequest, NextResponse } from "next/server";

// Mock services for demo purposes
const mockServices = [
  {
    name: "pricing-core",
    status: "online" as const,
    responseTime: Math.floor(Math.random() * 100) + 50,
    url: "http://localhost:4001",
    lastCheck: new Date().toISOString(),
  },
  {
    name: "p2p-parser",
    status: "online" as const,
    responseTime: Math.floor(Math.random() * 150) + 75,
    url: "http://localhost:4002",
    lastCheck: new Date().toISOString(),
  },
  {
    name: "rapira-parser",
    status: "online" as const,
    responseTime: Math.floor(Math.random() * 200) + 100,
    url: "http://localhost:4003",
    lastCheck: new Date().toISOString(),
  },
  {
    name: "deal-automation",
    status: Math.random() > 0.2 ? "online" : ("offline" as const),
    responseTime: Math.floor(Math.random() * 300) + 150,
    url: "http://localhost:4004",
    lastCheck: new Date().toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate mock data with some randomness
    const services = mockServices.map((service) => ({
      ...service,
      responseTime: Math.floor(Math.random() * 200) + 50,
      lastCheck: new Date().toISOString(),
      // Occasionally simulate service being offline
      status: Math.random() > 0.1 ? "online" : ("offline" as const),
    }));

    const onlineServices = services.filter((s) => s.status === "online").length;
    const totalServices = services.length;
    const systemHealth = (onlineServices / totalServices) * 100;

    return NextResponse.json({
      systemHealth: Math.round(systemHealth),
      onlineServices,
      totalServices,
      services,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { error: "Failed to check system health" },
      { status: 500 }
    );
  }
}
