import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const PRICING_SERVICE_URL =
  process.env.NODE_ENV === "production"
    ? "https://trading-platform-backend-g3us.onrender.com"
    : process.env.PRICING_SERVICE_URL || "http://localhost:4001";
const API_KEY = process.env.API_KEY || "test-partner-abc123";

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

    // Получаем токен аутентификации
    const authToken = await getAuthToken();

    if (!authToken) {
      console.warn("No auth token available, using mock data");
      // Fallback к mock данным
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

    // Пытаемся обратиться к реальному бэкенду
    console.log(`Calling backend: ${PRICING_SERVICE_URL}/api/v1/pricing/rates`);

    const response = await fetch(
      `${PRICING_SERVICE_URL}/api/v1/pricing/rates?symbols=${symbols.join(
        ","
      )}&method=${method}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "TradingPlatform-Frontend/1.0",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.warn(
        `Backend rates error: ${response.status} ${response.statusText}, using mock data`
      );

      // Логируем детали ошибки
      const errorText = await response.text().catch(() => "Unknown error");
      console.warn(`Backend response: ${errorText}`);

      // Fallback к mock данным
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
    console.log("Successfully received rates from backend");
    return NextResponse.json(data);
  } catch (error) {
    console.warn("Backend connection error for rates, using mock data:", error);

    // Получаем параметры заново в catch блоке
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get("symbols")?.split(",") || ["EUR/USD"];
    const method = searchParams.get("method") || "FIXED_SPREAD";

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
}
