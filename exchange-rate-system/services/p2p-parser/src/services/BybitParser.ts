import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Decimal } from "decimal.js";
import {
  P2PSource,
  P2POffer,
  P2PSeller,
  P2PMarketData,
  P2PParsingResult,
  P2PParsingConfig,
  PaymentMethod,
} from "../types/p2p";
import { logger } from "../utils/logger";

interface BybitP2PApiResponse {
  retCode: number;
  retMsg: string;
  result: {
    count: number;
    items: BybitP2PItem[];
  };
  time: number;
}

interface BybitP2PItem {
  id: string;
  userId: string;
  nickName: string;
  side: "Buy" | "Sell";
  tokenId: string;
  currencyId: string;
  price: string;
  minAmount: string;
  maxAmount: string;
  quantity: string;
  frozen: string;
  payments: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  createTime: string;
  recentOrderNum: string;
  recentExecuteRate: string;
  isOnline: boolean;
  avgReleaseTime: string;
  avgPayTime: string;
  userLevel: number;
}

export class BybitParser {
  private client: AxiosInstance;
  private config: P2PParsingConfig;
  private lastRequestTime: number = 0;

  constructor(config: P2PParsingConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.apiUrl || "https://api.bybit.com",
      timeout: config.requestTimeout,
      headers: {
        "User-Agent": "ExchangeRateSystem/1.0",
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.config.rateLimitDelay) {
        const delay = this.config.rateLimitDelay - timeSinceLastRequest;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      this.lastRequestTime = Date.now();
      return config;
    });
  }

  /**
   * Parse P2P market data for a given symbol
   */
  async parseMarketData(symbol: string): Promise<P2PParsingResult> {
    const startTime = Date.now();
    let requestCount = 0;
    let retryCount = 0;

    try {
      logger.info("Starting Bybit P2P parsing", {
        symbol,
        source: "BYBIT",
        component: "bybit-parser",
      });

      // Extract currency pair from symbol (e.g., "USDT/EUR" -> "USDT", "EUR")
      const [crypto, fiat] = symbol.split("/");

      if (!crypto || !fiat) {
        throw new Error(
          `Invalid symbol format: ${symbol}. Expected format: CRYPTO/FIAT`
        );
      }

      // Fetch sell offers (what we're interested in for buying crypto)
      const sellOffers = await this.fetchOffers(crypto, fiat, "Sell");
      requestCount++;

      // Convert API response to our format
      const offers = this.convertApiOffers(sellOffers, symbol);

      // Filter and rank offers
      const filteredOffers = this.filterOffers(offers);
      const topSellers = this.getTopSellers(filteredOffers);

      // Calculate market statistics
      const marketData = this.calculateMarketData(
        symbol,
        filteredOffers,
        topSellers
      );

      const parseTime = Date.now() - startTime;

      logger.info("Bybit P2P parsing completed successfully", {
        symbol,
        offerCount: offers.length,
        topSellersCount: topSellers.length,
        parseTime,
        component: "bybit-parser",
      });

      return {
        success: true,
        source: "BYBIT",
        symbol,
        data: marketData,
        metadata: {
          parseTime,
          requestCount,
          cacheHit: false,
          dataAge: 0,
          retryCount,
        },
      };
    } catch (error) {
      const parseTime = Date.now() - startTime;

      logger.error("Bybit P2P parsing failed", {
        symbol,
        error: error instanceof Error ? error.message : "Unknown error",
        parseTime,
        requestCount,
        retryCount,
        component: "bybit-parser",
      });

      return {
        success: false,
        source: "BYBIT",
        symbol,
        error: {
          code: "PARSING_FAILED",
          message:
            error instanceof Error ? error.message : "Unknown parsing error",
          details: error,
        },
        metadata: {
          parseTime,
          requestCount,
          cacheHit: false,
          dataAge: 0,
          retryCount,
        },
      };
    }
  }

  /**
   * Fetch P2P offers from Bybit API
   */
  private async fetchOffers(
    tokenId: string,
    currencyId: string,
    side: "Buy" | "Sell"
  ): Promise<BybitP2PItem[]> {
    const params = {
      tokenId,
      currencyId,
      side,
      size: 100, // Maximum offers to fetch
      page: 1,
    };

    const response = await this.client.get<BybitP2PApiResponse>(
      "/v5/market/orderbook/p2p",
      { params }
    );

    if (response.data.retCode !== 0) {
      throw new Error(`Bybit API error: ${response.data.retMsg}`);
    }

    return response.data.result.items || [];
  }

  /**
   * Convert Bybit API offers to our standard format
   */
  private convertApiOffers(
    apiOffers: BybitP2PItem[],
    symbol: string
  ): P2POffer[] {
    return apiOffers.map((item) => {
      const seller: P2PSeller = {
        id: item.userId,
        nickname: item.nickName,
        completionRate: parseFloat(item.recentExecuteRate) || 0,
        totalOrders: parseInt(item.recentOrderNum) || 0,
        rating: this.calculateRating(item),
        verificationLevel: this.getVerificationLevel(item.userLevel),
        responseTime: parseInt(item.avgReleaseTime) || 0,
        isOnline: item.isOnline,
        lastActiveTime: new Date(),
      };

      const offer: P2POffer = {
        id: item.id,
        seller,
        fiatCurrency: item.currencyId,
        cryptoCurrency: item.tokenId,
        price: new Decimal(item.price),
        minAmount: new Decimal(item.minAmount),
        maxAmount: new Decimal(item.maxAmount),
        availableAmount: new Decimal(item.quantity),
        paymentMethods: this.mapPaymentMethods(item.payments),
        paymentTimeLimit: parseInt(item.avgPayTime) || 15,
        source: "BYBIT",
        timestamp: new Date(),
      };

      return offer;
    });
  }

  /**
   * Filter offers based on configuration criteria
   */
  private filterOffers(offers: P2POffer[]): P2POffer[] {
    const filters = this.config.sellerFilters;

    return offers.filter((offer) => {
      // Check seller criteria
      if (offer.seller.completionRate < filters.minCompletionRate) return false;
      if (offer.seller.rating < filters.minRating) return false;
      if (offer.seller.totalOrders < filters.minTotalOrders) return false;
      if (
        filters.requireVerification &&
        offer.seller.verificationLevel === "BASIC"
      )
        return false;
      if (offer.seller.responseTime > filters.maxResponseTime) return false;

      // Check price criteria
      if (offer.minAmount.lt(this.config.priceFilters.minOfferAmount))
        return false;

      // Check payment methods
      const hasExcludedPayment = offer.paymentMethods.some((method) =>
        this.config.priceFilters.excludePaymentMethods.includes(method)
      );
      if (hasExcludedPayment) return false;

      return true;
    });
  }

  /**
   * Get top sellers based on rating and volume
   */
  private getTopSellers(offers: P2POffer[]): P2POffer[] {
    return offers
      .sort((a, b) => {
        // Primary sort: rating
        const ratingDiff = b.seller.rating - a.seller.rating;
        if (Math.abs(ratingDiff) > 0.1) return ratingDiff;

        // Secondary sort: completion rate
        const completionDiff =
          b.seller.completionRate - a.seller.completionRate;
        if (Math.abs(completionDiff) > 1) return completionDiff;

        // Tertiary sort: total orders
        return b.seller.totalOrders - a.seller.totalOrders;
      })
      .slice(0, 10); // Top 10 sellers
  }

  /**
   * Calculate market statistics
   */
  private calculateMarketData(
    symbol: string,
    allOffers: P2POffer[],
    topSellers: P2POffer[]
  ): P2PMarketData {
    if (allOffers.length === 0) {
      throw new Error("No valid offers found");
    }

    const prices = allOffers.map((offer) => offer.price);
    const volumes = allOffers.map((offer) => offer.availableAmount);

    // Calculate weighted average price
    const totalValue = allOffers.reduce((sum, offer) => {
      return sum.plus(offer.price.times(offer.availableAmount));
    }, new Decimal(0));

    const totalVolume = volumes.reduce(
      (sum, volume) => sum.plus(volume),
      new Decimal(0)
    );
    const weightedAveragePrice = totalValue.div(totalVolume);

    // Calculate median price
    const sortedPrices = prices.sort((a, b) => a.cmp(b));
    const medianIndex = Math.floor(sortedPrices.length / 2);
    const medianPrice =
      sortedPrices.length % 2 === 0
        ? sortedPrices[medianIndex - 1].plus(sortedPrices[medianIndex]).div(2)
        : sortedPrices[medianIndex];

    // Calculate data quality
    const dataQuality = this.calculateDataQuality(allOffers, topSellers);

    return {
      symbol,
      source: "BYBIT",
      offers: allOffers,
      topSellers,
      weightedAveragePrice,
      medianPrice,
      lowestPrice: prices.reduce((min, price) => (price.lt(min) ? price : min)),
      highestPrice: prices.reduce((max, price) =>
        price.gt(max) ? price : max
      ),
      totalVolume,
      offerCount: allOffers.length,
      timestamp: new Date(),
      dataQuality,
    };
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQuality(
    allOffers: P2POffer[],
    topSellers: P2POffer[]
  ): { score: number; issues: string[]; coverage: number } {
    const issues: string[] = [];
    let score = 100;

    // Check offer count
    if (allOffers.length < 5) {
      issues.push("Low offer count");
      score -= 20;
    }

    // Check top seller coverage
    const coverage = (topSellers.length / Math.min(10, allOffers.length)) * 100;
    if (coverage < 80) {
      issues.push("Low top seller coverage");
      score -= 15;
    }

    // Check price spread
    const prices = allOffers.map((offer) => offer.price);
    const maxPrice = prices.reduce((max, price) =>
      price.gt(max) ? price : max
    );
    const minPrice = prices.reduce((min, price) =>
      price.lt(min) ? price : min
    );
    const priceSpread = maxPrice.minus(minPrice).div(minPrice).times(100);

    if (priceSpread.gt(10)) {
      issues.push("High price spread");
      score -= 10;
    }

    // Check online sellers
    const onlineSellers = allOffers.filter(
      (offer) => offer.seller.isOnline
    ).length;
    const onlinePercentage = (onlineSellers / allOffers.length) * 100;

    if (onlinePercentage < 70) {
      issues.push("Many sellers offline");
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      coverage,
    };
  }

  /**
   * Calculate seller rating based on various factors
   */
  private calculateRating(item: BybitP2PItem): number {
    let rating = 3.0; // Base rating

    // Completion rate factor (0-5 stars)
    const completionRate = parseFloat(item.recentExecuteRate) || 0;
    rating += (completionRate / 100) * 2; // Max +2 stars

    // Order count factor
    const orderCount = parseInt(item.recentOrderNum) || 0;
    if (orderCount > 100) rating += 0.3;
    if (orderCount > 500) rating += 0.2;

    // User level factor
    rating += (item.userLevel / 10) * 0.5; // Max +0.5 stars

    // Online status
    if (item.isOnline) rating += 0.2;

    return Math.min(5.0, Math.max(0.0, rating));
  }

  /**
   * Map user level to verification level
   */
  private getVerificationLevel(
    userLevel: number
  ): "BASIC" | "INTERMEDIATE" | "ADVANCED" {
    if (userLevel >= 8) return "ADVANCED";
    if (userLevel >= 5) return "INTERMEDIATE";
    return "BASIC";
  }

  /**
   * Map Bybit payment methods to our standard format
   */
  private mapPaymentMethods(
    payments: Array<{ id: string; name: string; type: string }>
  ): PaymentMethod[] {
    const methodMap: Record<string, PaymentMethod> = {
      bank: "BANK_TRANSFER",
      alipay: "ALIPAY",
      wechat: "WECHAT",
      paypal: "PAYPAL",
      wise: "WISE",
      revolut: "REVOLUT",
      sepa: "SEPA",
    };

    return payments
      .map((payment) => {
        const normalizedName = payment.name.toLowerCase();
        for (const [key, method] of Object.entries(methodMap)) {
          if (normalizedName.includes(key)) {
            return method;
          }
        }
        return "BANK_TRANSFER"; // Default fallback
      })
      .filter((method, index, array) => array.indexOf(method) === index); // Remove duplicates
  }
}
