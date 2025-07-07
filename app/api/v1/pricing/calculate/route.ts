import { NextRequest, NextResponse } from "next/server";

const PRICING_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? "https://trading-platform-backend-g3us.onrender.com"
    : process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

export const dynamic = "force-dynamic";

// Cache for JWT token
let cachedToken: { token: string; expires: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  try {
    // Get new token from backend
    const response = await fetch(`${PRICING_SERVICE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    if (!response.ok) {
      console.warn("Failed to get auth token:", response.status);
      return null;
    }

    const data = await response.json();

    // Cache token for 23 hours (expires in 24h)
    cachedToken = {
      token: data.token,
      expires: Date.now() + 23 * 60 * 60 * 1000,
    };

    return data.token;
  } catch (error) {
    console.warn("Auth token request failed:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  // Mock calculation result для fallback
  const mockResult = {
    success: true,
    data: {
      from: "",
      to: "",
      symbol: "USD/EUR",
      spotRate: 0.85,
      finalRate: 0.84,
      spread: 0.01,
      spreadPercentage: 1.2,
      amount: 1000,
      payoutAmount: 840,
      result: 840,
      rate: 0.84,
      direction: "BUY",
      timestamp: new Date().toISOString(),
      partnerId: "default",
      calculationMethod: "FIXED_SPREAD",
    },
    metadata: {
      requestId: `req_${Date.now()}`,
      processingTime: Math.floor(Math.random() * 100) + 50,
      cacheHit: false,
      dataAge: 0,
    },
  };

  try {
    const body = await request.json();

    // Обновляем mock данные на основе запроса
    mockResult.data.from = body.symbol?.split("/")[0] || "USD";
    mockResult.data.to = body.symbol?.split("/")[1] || "EUR";
    mockResult.data.symbol = body.symbol || "USD/EUR";
    mockResult.data.amount = body.amount || 1000;
    mockResult.data.payoutAmount = (body.amount || 1000) * 0.84;
    mockResult.data.result = (body.amount || 1000) * 0.84;
    mockResult.data.direction = body.direction || "BUY";
    mockResult.data.partnerId = body.partnerId || "default";
    mockResult.data.calculationMethod =
      body.calculationMethod || "FIXED_SPREAD";
    mockResult.data.timestamp = new Date().toISOString();
    mockResult.metadata.requestId = `req_${Date.now()}`;

    // Получаем токен аутентификации
    const authToken = await getAuthToken();

    if (!authToken) {
      console.warn("No auth token available, using mock data");
      return NextResponse.json(mockResult);
    }

    // Пытаемся обратиться к реальному бэкенду
    console.log(
      `Calling backend: ${PRICING_SERVICE_URL}/api/v1/pricing/calculate`
    );

    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/v1/pricing/calculate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "TradingPlatform-Frontend/1.0",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000), // Увеличиваем таймаут до 10 сек
      }
    );

    if (!response.ok) {
      console.warn(
        `Backend error: ${response.status} ${response.statusText}, using mock data`
      );

      // Логируем детали ошибки
      const errorText = await response.text().catch(() => "Unknown error");
      console.warn(`Backend response: ${errorText}`);

      return NextResponse.json(mockResult);
    }

    const data = await response.json();
    console.log("Successfully received data from backend");
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Backend connection error, using mock data:", error);
    return NextResponse.json(mockResult);
  }
}
