import axios, { AxiosInstance } from "axios";
import { P2PMarketData, P2PParsingConfig, P2PSource } from "../types/p2p";
import { logger } from "../utils/logger";

export class HTXParser {
  private axiosInstance: AxiosInstance;
  private config: P2PParsingConfig;

  constructor(config: P2PParsingConfig) {
    this.config = config;
    this.axiosInstance = axios.create({
      baseURL: "https://api.htx.com",
      timeout: config.requestTimeout || 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.debug("HTX API request", {
          url: config.url,
          method: config.method,
          params: config.params,
        });
        return config;
      },
      (error) => {
        logger.error("HTX API request error", { error });
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.debug("HTX API response", {
          url: response.config.url,
          status: response.status,
          dataLength: JSON.stringify(response.data).length,
        });
        return response;
      },
      (error) => {
        logger.error("HTX API response error", {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  async parseP2PData(symbol: string): Promise<P2PMarketData> {
    try {
      const startTime = Date.now();

      // HTX uses different symbol format (e.g., USDT instead of USDT/EUR)
      const baseAsset = this.extractBaseAsset(symbol);
      const quoteAsset = this.extractQuoteAsset(symbol);

      logger.info("Parsing HTX P2P data", {
        symbol,
        baseAsset,
        quoteAsset,
        topSellersCount: this.config.sellerFilters?.minTotalOrders || 10,
      });

      // Get sell orders (users selling crypto for fiat)
      const sellOrders = await this.getP2POrders(baseAsset, quoteAsset, "sell");

      if (!sellOrders || sellOrders.length === 0) {
        throw new Error(`No HTX P2P sell orders found for ${symbol}`);
      }

      // Filter and sort orders
      const filteredOrders = this.filterOrders(sellOrders);
      const topOrders = filteredOrders.slice(0, 10);

      // Calculate weighted average price
      const { weightedAveragePrice, totalVolume } =
        this.calculateWeightedAverage(topOrders);

      // Calculate additional metrics
      const prices = topOrders.map((order) => parseFloat(order.price));
      const medianPrice = this.calculateMedian(prices);
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);

      // Calculate data quality score
      const dataQualityScore = this.calculateDataQualityScore(topOrders);

      const processingTime = Date.now() - startTime;

      const result: P2PMarketData = {
        symbol,
        source: "HTX" as P2PSource,
        offers: [], // We'll populate this if needed
        topSellers: [], // We'll populate this if needed
        weightedAveragePrice: new (await import("decimal.js")).Decimal(
          weightedAveragePrice
        ),
        medianPrice: new (await import("decimal.js")).Decimal(medianPrice),
        lowestPrice: new (await import("decimal.js")).Decimal(lowestPrice),
        highestPrice: new (await import("decimal.js")).Decimal(highestPrice),
        totalVolume: new (await import("decimal.js")).Decimal(totalVolume),
        offerCount: topOrders.length,
        timestamp: new Date(),
        dataQuality: {
          score: dataQualityScore,
          issues: [],
          coverage: (topOrders.length / filteredOrders.length) * 100,
        },
      };

      logger.info("HTX P2P data parsed successfully", {
        symbol,
        weightedAveragePrice,
        offerCount: topOrders.length,
        processingTime,
        dataQualityScore,
      });

      return result;
    } catch (error) {
      logger.error("Failed to parse HTX P2P data", {
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  private async getP2POrders(
    baseAsset: string,
    quoteAsset: string,
    side: "buy" | "sell"
  ): Promise<any[]> {
    try {
      // HTX P2P API endpoint
      const response = await this.axiosInstance.get(
        "/v1/otc/data/trade-market",
        {
          params: {
            coinId: baseAsset,
            currency: quoteAsset,
            tradeType: side,
            currPage: 1,
            payMethod: "all",
            acceptOrder: -1,
            country: "",
            blockType: "general",
            online: 1,
            range: 0,
            amount: "",
          },
        }
      );

      if (!response.data || !response.data.data) {
        throw new Error("Invalid HTX API response format");
      }

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error("HTX API rate limit exceeded");
        }
        if (error.response?.status === 403) {
          throw new Error("HTX API access forbidden");
        }
      }
      throw error;
    }
  }

  private filterOrders(orders: any[]): any[] {
    return orders.filter((order) => {
      // Filter by seller rating
      if (
        order.merchantInfo?.rate &&
        order.merchantInfo.rate < (this.config.sellerFilters?.minRating || 4.0)
      ) {
        return false;
      }

      // Filter by completion rate
      if (
        order.merchantInfo?.orderCompleteRate &&
        order.merchantInfo.orderCompleteRate <
          (this.config.sellerFilters?.minCompletionRate || 95)
      ) {
        return false;
      }

      // Filter by price deviation (if configured)
      if (this.config.priceFilters?.maxDeviationPercent) {
        const avgPrice =
          orders.reduce((sum, o) => sum + parseFloat(o.price), 0) /
          orders.length;
        const deviation =
          (Math.abs(parseFloat(order.price) - avgPrice) / avgPrice) * 100;
        if (deviation > this.config.priceFilters.maxDeviationPercent) {
          return false;
        }
      }

      // Ensure order has required fields
      return order.price && order.tradeCount && order.tradeMonthFinishRate;
    });
  }

  private calculateWeightedAverage(orders: any[]): {
    weightedAveragePrice: number;
    totalVolume: number;
  } {
    if (orders.length === 0) {
      return { weightedAveragePrice: 0, totalVolume: 0 };
    }

    let totalWeightedPrice = 0;
    let totalVolume = 0;

    for (const order of orders) {
      const price = parseFloat(order.price);
      const volume = parseFloat(order.tradeCount) || 1; // Use trade count as volume proxy

      totalWeightedPrice += price * volume;
      totalVolume += volume;
    }

    const weightedAveragePrice =
      totalVolume > 0 ? totalWeightedPrice / totalVolume : 0;

    return { weightedAveragePrice, totalVolume };
  }

  private calculateMedian(prices: number[]): number {
    if (prices.length === 0) return 0;

    const sorted = [...prices].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  private calculateDataQualityScore(orders: any[]): number {
    if (orders.length === 0) return 0;

    let score = 100;

    // Reduce score based on number of orders
    if (orders.length < 5) {
      score -= (5 - orders.length) * 10;
    }

    // Reduce score based on average seller rating
    const avgRating = this.calculateAverageRating(orders);
    if (avgRating < 4.5) {
      score -= (4.5 - avgRating) * 20;
    }

    // Reduce score based on completion rate
    const avgCompletionRate = this.calculateAverageCompletionRate(orders);
    if (avgCompletionRate < 95) {
      score -= 95 - avgCompletionRate;
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateAverageRating(orders: any[]): number {
    if (orders.length === 0) return 0;

    const ratings = orders
      .map((order) => order.merchantInfo?.rate || 0)
      .filter((rating) => rating > 0);

    if (ratings.length === 0) return 0;

    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  private calculateAverageCompletionRate(orders: any[]): number {
    if (orders.length === 0) return 0;

    const rates = orders
      .map((order) => order.merchantInfo?.orderCompleteRate || 0)
      .filter((rate) => rate > 0);

    if (rates.length === 0) return 0;

    return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  }

  private extractBaseAsset(symbol: string): string {
    // Convert symbol like "USDT/EUR" to "USDT"
    return symbol.split("/")[0];
  }

  private extractQuoteAsset(symbol: string): string {
    // Convert symbol like "USDT/EUR" to "EUR"
    const parts = symbol.split("/");
    return parts.length > 1 ? parts[1] : "USD";
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get("/v1/common/timestamp", {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error("HTX health check failed", { error });
      return false;
    }
  }
}
