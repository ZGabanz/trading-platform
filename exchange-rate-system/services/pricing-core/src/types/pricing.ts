import { Decimal } from 'decimal.js';

// Base rate types
export interface BaseRate {
  symbol: string;
  price: Decimal;
  timestamp: Date;
  source: 'RAPIRA' | 'BYBIT' | 'HTX' | 'BINANCE';
  volume?: Decimal;
}

export interface SpotRate extends BaseRate {
  source: 'RAPIRA';
  bid: Decimal;
  ask: Decimal;
  spread: Decimal;
}

export interface P2PRate extends BaseRate {
  source: 'BYBIT' | 'HTX';
  sellerId: string;
  sellerRating: number;
  minAmount: Decimal;
  maxAmount: Decimal;
  paymentMethods: string[];
  completionRate: number;
}

// Fixed Spread Configuration (pricing.v1)
export interface FixedSpreadConfig {
  id: string;
  symbol: string;
  baseSpreadPercent: Decimal;
  minSpreadPercent: Decimal;
  maxSpreadPercent: Decimal;
  isActive: boolean;
  validFrom: Date;
  validTo?: Date;
  partnerNotificationRequired: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SpreadBoundary {
  symbol: string;
  minDeviationPercent: Decimal;
  maxDeviationPercent: Decimal;
  alertThresholdPercent: Decimal;
  emergencyStopThresholdPercent: Decimal;
}

// Pricing calculation result
export interface PricingResult {
  symbol: string;
  spotRate: Decimal;
  p2pIndicativeRate?: Decimal;
  fixedSpread: Decimal;
  volatilitySpread: Decimal;
  finalRate: Decimal;
  calculationMethod: 'FIXED_SPREAD' | 'HYBRID_P2P' | 'VOLATILITY_ADJUSTED';
  timestamp: Date;
  confidence: number; // 0-100
  warnings: string[];
  metadata: {
    spotSource: string;
    p2pSources?: string[];
    spreadConfigId: string;
    volatilityIndex?: Decimal;
    historicalDataPoints: number;
  };
}

// Volatility analysis (pricing.v2.volatility)
export interface VolatilityMetrics {
  symbol: string;
  timeWindow: number; // hours
  variance: Decimal;
  standardDeviation: Decimal;
  movingAverage: Decimal;
  volatilityIndex: Decimal; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  calculatedAt: Date;
}

export interface VolatilitySpreadConfig {
  id: string;
  symbol: string;
  baseSpread: Decimal;
  volatilityMultiplier: Decimal;
  lowVolatilityThreshold: Decimal;
  mediumVolatilityThreshold: Decimal;
  highVolatilityThreshold: Decimal;
  criticalVolatilityThreshold: Decimal;
  maxVolatilitySpread: Decimal;
  smoothingFactor: Decimal; // 0-1, for avoiding sudden jumps
  isActive: boolean;
  validFrom: Date;
  validTo?: Date;
}

// P2P Indicative pricing (pricing.p2p.indicative)
export interface P2PIndicativeConfig {
  symbol: string;
  enabledSources: ('BYBIT' | 'HTX')[];
  topSellersCount: number; // default 10
  volumeWeightEnabled: boolean;
  minimumSellerRating: number;
  minimumCompletionRate: number;
  maxPriceDeviationPercent: Decimal;
  cacheTimeout: number; // seconds
  isActive: boolean;
}

export interface WeightedP2PRate {
  symbol: string;
  weightedAverageRate: Decimal;
  totalVolume: Decimal;
  sellerCount: number;
  sources: {
    source: 'BYBIT' | 'HTX';
    rate: Decimal;
    volume: Decimal;
    weight: Decimal;
    sellerCount: number;
  }[];
  calculatedAt: Date;
  dataQuality: 'EXCELLENT' | 'GOOD' | 'POOR' | 'INSUFFICIENT';
  outlierCount: number;
}

// KPI and monitoring
export interface PricingKPI {
  symbol: string;
  date: Date;
  averageDeviation: Decimal;
  maxDeviation: Decimal;
  deviationCount: number;
  uptime: Decimal; // percentage
  responseTime: number; // milliseconds
  errorRate: Decimal; // percentage
  partnerSatisfactionScore?: number; // 1-5
  automatedDealsPercentage: Decimal;
}

export interface PricingAlert {
  id: string;
  symbol: string;
  type: 'DEVIATION_HIGH' | 'VOLATILITY_CRITICAL' | 'DATA_SOURCE_DOWN' | 'SPREAD_BOUNDARY_BREACH' | 'SYSTEM_ERROR';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  message: string;
  currentValue?: Decimal;
  thresholdValue?: Decimal;
  metadata: Record<string, any>;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
  notificationsSent: string[]; // channels where alert was sent
}

// Partner management
export interface Partner {
  id: string;
  name: string;
  tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  symbols: string[];
  customSpreadConfig?: FixedSpreadConfig[];
  notificationPreferences: {
    email: boolean;
    telegram: boolean;
    webhook?: string;
    rateChangeThreshold: Decimal; // notify when rate changes by this %
  };
  apiKey: string;
  rateLimit: number; // requests per minute
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
}

// Rate calculation request/response
export interface RateCalculationRequest {
  symbol: string;
  amount: Decimal;
  direction: 'BUY' | 'SELL';
  partnerId?: string;
  forceRefresh?: boolean;
  calculationMethod?: 'FIXED_SPREAD' | 'HYBRID_P2P' | 'VOLATILITY_ADJUSTED';
}

export interface RateCalculationResponse {
  success: boolean;
  data?: PricingResult;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    processingTime: number;
    cacheHit: boolean;
    dataAge: number; // seconds
  };
}

// Historical data
export interface HistoricalRate {
  symbol: string;
  timestamp: Date;
  spotRate: Decimal;
  p2pRate?: Decimal;
  finalRate: Decimal;
  spread: Decimal;
  volume?: Decimal;
  source: string;
}

export interface RateDelta {
  symbol: string;
  timestamp: Date;
  spotRate: Decimal;
  p2pRate: Decimal;
  delta: Decimal;
  deltaPercent: Decimal;
  absoluteDelta: Decimal;
}

// Configuration management
export interface SystemConfig {
  rateCacheTTL: number; // seconds
  maxConcurrentRequests: number;
  defaultTimeout: number; // milliseconds
  enableMetrics: boolean;
  enableAlerting: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  maintenanceMode: boolean;
  apiVersion: string;
}

// Export all types
export type PricingEngine = 'FIXED_SPREAD' | 'HYBRID_P2P' | 'VOLATILITY_ADJUSTED';
export type CurrencyPair = string; // e.g., 'USD/EUR', 'BTC/USDT'
export type TimeWindow = '1h' | '4h' | '24h' | '7d' | '30d';
export type DataSource = 'RAPIRA' | 'BYBIT' | 'HTX' | 'BINANCE';
export type NotificationChannel = 'EMAIL' | 'TELEGRAM' | 'SLACK' | 'WEBHOOK'; 