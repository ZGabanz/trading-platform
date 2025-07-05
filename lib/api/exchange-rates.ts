// API Key for development that matches pricing-core expectations
const DEV_API_KEY = "test-partner-abc123";

// Rate limiting configuration
const RATE_LIMIT_DELAY = 100; // минимальная задержка между запросами в мс
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // базовая задержка для retry в мс
const CACHE_DURATION = 5000; // время кеширования в мс

// Cache для хранения результатов запросов
const cache = new Map<string, { data: any; timestamp: number }>();

// Rate limiting: последнее время выполнения запроса
let lastRequestTime = 0;

// Статистика для отслеживания rate limiting
let requestCount = 0;
let retryCount = 0;
let cacheHits = 0;

interface RateCalculationRequest {
  symbol: string;
  amount: number;
  direction: "BUY" | "SELL";
  partnerId?: string;
  calculationMethod?: "FIXED_SPREAD" | "HYBRID_P2P" | "VOLATILITY_ADJUSTED";
}

interface RateCalculationResponse {
  success: boolean;
  data: {
    from?: string;
    to?: string;
    symbol?: string;
    spotRate?: number;
    finalRate?: number;
    spread?: number;
    spreadPercentage?: number;
    amount: number;
    payoutAmount?: number;
    result: number;
    rate: number;
    direction?: string;
    timestamp: string;
    partnerId?: string;
    calculationMethod?: string;
  };
  metadata?: {
    requestId: string;
    processingTime: number;
    cacheHit: boolean;
    dataAge: number;
  };
}

interface MultiRateResponse {
  success: boolean;
  data: Record<string, any>;
  timestamp: string;
  method: string;
}

interface SystemHealthResponse {
  systemHealth: number;
  onlineServices: number;
  totalServices: number;
  services: Array<{
    name: string;
    status: "online" | "offline";
    responseTime: number;
    url: string;
    lastCheck: string;
    error?: string;
  }>;
  timestamp: string;
}

class ExchangeRateAPI {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string = DEV_API_KEY) {
    this.apiKey = apiKey;
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getCacheKey(endpoint: string, options: RequestInit = {}): string {
    return `${endpoint}_${JSON.stringify(options)}`;
  }

  private getFromCache(cacheKey: string): any | null {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(cacheKey: string, data: any): void {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(endpoint, options);

    // Проверяем кеш для GET запросов
    if (!options.method || options.method === "GET") {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        cacheHits++;
        return cachedData;
      }
    }

    const headers = {
      "Content-Type": "application/json",
      "X-API-Key": this.apiKey,
      Authorization: `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    let currentRetryCount = 0;

    while (currentRetryCount <= MAX_RETRIES) {
      try {
        // Rate limiting: обеспечиваем минимальную задержку между запросами
        const timeSinceLastRequest = Date.now() - lastRequestTime;
        if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
          await this.delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
        }

        lastRequestTime = Date.now();
        requestCount++;

        const response = await fetch(url, {
          ...options,
          headers,
        });

        if (response.ok) {
          const data = await response.json();

          // Кешируем успешные GET запросы
          if (!options.method || options.method === "GET") {
            this.setCache(cacheKey, data);
          }

          return data;
        }

        // Если 429 (Too Many Requests), используем exponential backoff
        if (response.status === 429) {
          if (currentRetryCount < MAX_RETRIES) {
            const retryDelay =
              RETRY_DELAY_BASE * Math.pow(2, currentRetryCount);
            console.warn(
              `Rate limit exceeded. Retrying in ${retryDelay}ms... (attempt ${
                currentRetryCount + 1
              }/${MAX_RETRIES + 1})`
            );
            await this.delay(retryDelay);
            currentRetryCount++;
            retryCount++;
            continue;
          }
        }

        // Для других ошибок HTTP, выбрасываем исключение
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      } catch (error) {
        if (
          currentRetryCount < MAX_RETRIES &&
          (error as Error).message.includes("429")
        ) {
          const retryDelay = RETRY_DELAY_BASE * Math.pow(2, currentRetryCount);
          console.warn(
            `Request failed with 429. Retrying in ${retryDelay}ms... (attempt ${
              currentRetryCount + 1
            }/${MAX_RETRIES + 1})`
          );
          await this.delay(retryDelay);
          currentRetryCount++;
          retryCount++;
          continue;
        }
        throw error;
      }
    }

    throw new Error(`Max retries exceeded for ${endpoint}`);
  }

  async calculateRate(
    request: RateCalculationRequest
  ): Promise<RateCalculationResponse> {
    return this.makeRequest<RateCalculationResponse>(
      "/api/v1/pricing/calculate",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async getRates(
    symbols: string[],
    method?: string
  ): Promise<MultiRateResponse> {
    const symbolsParam = symbols.join(",");
    const queryParams = new URLSearchParams({
      symbols: symbolsParam,
      ...(method && { method }),
    });

    return this.makeRequest<MultiRateResponse>(
      `/api/v1/pricing/rates?${queryParams}`
    );
  }

  async getRateHistory(symbol: string, period: string = "24h") {
    return this.makeRequest(
      `/api/v1/pricing/history/${symbol}?timeWindow=${period}`
    );
  }

  async getVolatilityData(symbol: string, timeWindow: string = "24h") {
    return this.makeRequest(
      `/api/v1/pricing/volatility/${symbol}?timeWindow=${timeWindow}`
    );
  }

  async getSystemHealth(): Promise<SystemHealthResponse> {
    return this.makeRequest<SystemHealthResponse>("/api/system/health");
  }

  // Deal Management API calls
  async createDeal(dealData: any) {
    return this.makeRequest("/api/deals", {
      method: "POST",
      body: JSON.stringify(dealData),
    });
  }

  async getDeal(dealId: string) {
    return this.makeRequest(`/api/deals/${dealId}`);
  }

  async getDeals(partnerId?: string, status?: string, limit?: number) {
    const params = new URLSearchParams();
    if (partnerId) params.append("partnerId", partnerId);
    if (status) params.append("status", status);
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    return this.makeRequest(
      `/api/deals${queryString ? `?${queryString}` : ""}`
    );
  }

  async executeDeal(dealId: string) {
    return this.makeRequest(`/api/deals/${dealId}/execute`, {
      method: "POST",
    });
  }

  async cancelDeal(dealId: string, reason?: string) {
    return this.makeRequest(`/api/deals/${dealId}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    });
  }

  async getDealStats(partnerId?: string, fromDate?: string, toDate?: string) {
    const params = new URLSearchParams();
    if (partnerId) params.append("partnerId", partnerId);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);

    const queryString = params.toString();
    return this.makeRequest(
      `/api/deals/stats${queryString ? `?${queryString}` : ""}`
    );
  }

  // Legacy method for backward compatibility
  async getHealth() {
    return this.getSystemHealth();
  }
}

// Export singleton instance
export const exchangeRateAPI = new ExchangeRateAPI();

// Helper functions for components
export async function fetchExchangeRates(symbols: string[]) {
  try {
    const response = await exchangeRateAPI.getRates(symbols);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    return null;
  }
}

export async function calculateExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  direction: "BUY" | "SELL" = "BUY"
) {
  try {
    const response = await exchangeRateAPI.calculateRate({
      symbol: `${fromCurrency}/${toCurrency}`,
      amount,
      direction,
      calculationMethod: "FIXED_SPREAD",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to calculate exchange rate:", error);
    return null;
  }
}

export async function getSystemHealthData() {
  try {
    return await exchangeRateAPI.getSystemHealth();
  } catch (error) {
    console.error("Failed to fetch system health:", error);
    return null;
  }
}

// Функция для получения статистики rate limiting
export function getRateLimitStats() {
  return {
    requestCount,
    retryCount,
    cacheHits,
    cacheSize: cache.size,
  };
}

// Функция для очистки статистики
export function clearRateLimitStats() {
  requestCount = 0;
  retryCount = 0;
  cacheHits = 0;
}
