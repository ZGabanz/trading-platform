import { NextRequest, NextResponse } from "next/server";

const DEAL_SERVICE_URL =
  process.env.DEAL_SERVICE_URL || "http://localhost:4004";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await fetch(
      `${DEAL_SERVICE_URL}/api/deals/${id}/execute`,
      {
        method: "POST",
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Deal service error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Deal execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute deal" },
      { status: 500 }
    );
  }
}
