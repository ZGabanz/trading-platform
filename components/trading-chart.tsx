"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Bar,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Volume2,
  Download,
  Settings,
  Maximize2,
} from "lucide-react";

// Enhanced chart data with technical indicators
const generateChartData = () => {
  const baseData = [
    {
      time: "09:00",
      price: 4520.45,
      volume: 1250000,
      open: 4515.3,
      high: 4525.67,
      low: 4512.89,
      close: 4520.45,
    },
    {
      time: "10:00",
      price: 4535.67,
      volume: 1100000,
      open: 4520.45,
      high: 4540.23,
      low: 4518.9,
      close: 4535.67,
    },
    {
      time: "11:00",
      price: 4542.23,
      volume: 980000,
      open: 4535.67,
      high: 4545.12,
      low: 4532.45,
      close: 4542.23,
    },
    {
      time: "12:00",
      price: 4538.89,
      volume: 1350000,
      open: 4542.23,
      high: 4548.76,
      low: 4535.34,
      close: 4538.89,
    },
    {
      time: "13:00",
      price: 4556.34,
      volume: 1200000,
      open: 4538.89,
      high: 4560.45,
      low: 4536.78,
      close: 4556.34,
    },
    {
      time: "14:00",
      price: 4563.78,
      volume: 1450000,
      open: 4556.34,
      high: 4568.9,
      low: 4554.23,
      close: 4563.78,
    },
    {
      time: "15:00",
      price: 4571.23,
      volume: 1600000,
      open: 4563.78,
      high: 4575.45,
      low: 4561.89,
      close: 4571.23,
    },
    {
      time: "16:00",
      price: 4563.89,
      volume: 1800000,
      open: 4571.23,
      high: 4573.45,
      low: 4560.12,
      close: 4563.89,
    },
  ];

  // Calculate technical indicators
  const prices = baseData.map((d) => d.close);
  const period = 5; // Simplified for demo

  return baseData.map((data, index) => {
    const recentPrices = prices.slice(
      Math.max(0, index - period + 1),
      index + 1
    );
    const sma20 = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

    // Simplified RSI calculation
    const rsi = 50 + (Math.random() - 0.5) * 60; // Demo data

    // Bollinger Bands (simplified)
    const stdDev = Math.sqrt(
      recentPrices.reduce((sq, n) => sq + Math.pow(n - sma20, 2), 0) /
        recentPrices.length
    );
    const upperBand = sma20 + stdDev * 2;
    const lowerBand = sma20 - stdDev * 2;

    return {
      ...data,
      sma20,
      rsi,
      upperBand,
      lowerBand,
      macd: (Math.random() - 0.5) * 10, // Demo MACD
      signal: (Math.random() - 0.5) * 8, // Demo Signal line
    };
  });
};

const timeframes = ["1D", "1W", "1M", "3M", "6M", "1Y"];
const chartTypes = [
  { id: "area", name: "Area", icon: Activity },
  { id: "line", name: "Line", icon: TrendingUp },
  { id: "candlestick", name: "Candlestick", icon: BarChart3 },
];

const indicators = [
  { id: "sma20", name: "SMA (20)", color: "#f59e0b" },
  { id: "bollinger", name: "Bollinger Bands", color: "#8b5cf6" },
  { id: "rsi", name: "RSI", color: "#ef4444" },
  { id: "macd", name: "MACD", color: "#10b981" },
];

export function TradingChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [chartType, setChartType] = useState("area");
  const [showVolume, setShowVolume] = useState(true);
  const [activeIndicators, setActiveIndicators] = useState(["sma20"]);
  const [showSettings, setShowSettings] = useState(false);

  const chartData = useMemo(() => generateChartData(), []);

  const currentPrice = 4563.89;
  const priceChange = 23.45;
  const priceChangePercent = 0.52;

  const toggleIndicator = (indicatorId: string) => {
    setActiveIndicators((prev) =>
      prev.includes(indicatorId)
        ? prev.filter((id) => id !== indicatorId)
        : [...prev, indicatorId]
    );
  };

  const exportChart = () => {
    // Chart export functionality would be implemented here
    console.log("Exporting chart...");
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary-400">Price: ${data.price?.toFixed(2)}</p>
          <p className="text-gray-300">
            Volume: {(data.volume / 1000000).toFixed(2)}M
          </p>
          {activeIndicators.includes("rsi") && (
            <p className="text-red-400">RSI: {data.rsi?.toFixed(2)}</p>
          )}
          {activeIndicators.includes("sma20") && (
            <p className="text-yellow-400">
              SMA(20): ${data.sma20?.toFixed(2)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
            S&P 500 (SPY)
          </h2>
          <div className="flex items-center mt-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white mr-4">
              ${currentPrice.toFixed(2)}
            </span>
            <div className="flex items-center">
              {priceChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success-500 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger-500 mr-1" />
              )}
              <span
                className={`font-medium ${
                  priceChange >= 0 ? "text-success-500" : "text-danger-500"
                }`}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)} ({priceChangePercent >= 0 ? "+" : ""}
                {priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart type selector */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {chartTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`p-2 rounded-md transition-colors ${
                  chartType === type.id
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                <type.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          {/* Tools */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`p-2 rounded-lg transition-colors ${
              showVolume
                ? "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400"
                : "text-gray-600 dark:text-gray-400 hover:text-primary-600"
            }`}
          >
            <Volume2 className="h-5 w-5" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>

          <button
            onClick={exportChart}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Download className="h-5 w-5" />
          </button>

          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
            <Maximize2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Indicators panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
        >
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Technical Indicators
          </h3>
          <div className="flex flex-wrap gap-2">
            {indicators.map((indicator) => (
              <button
                key={indicator.id}
                onClick={() => toggleIndicator(indicator.id)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  activeIndicators.includes(indicator.id)
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                {indicator.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Timeframe selector */}
      <div className="flex space-x-2 mb-6">
        {timeframes.map((timeframe) => (
          <motion.button
            key={timeframe}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedTimeframe === timeframe
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {timeframe}
          </motion.button>
        ))}
      </div>

      {/* Main chart */}
      <div className="h-96 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="time"
              className="text-xs text-gray-600 dark:text-gray-400"
            />
            <YAxis
              yAxisId="price"
              className="text-xs text-gray-600 dark:text-gray-400"
              domain={["dataMin - 10", "dataMax + 10"]}
              tickFormatter={(value: number) => `$${value}`}
            />
            {showVolume && (
              <YAxis
                yAxisId="volume"
                orientation="right"
                className="text-xs text-gray-600 dark:text-gray-400"
                tickFormatter={(value: number) =>
                  `${(value / 1000000).toFixed(1)}M`
                }
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Volume bars */}
            {showVolume && (
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#3b82f6"
                fillOpacity={0.2}
                name="Volume"
              />
            )}

            {/* Price chart */}
            {chartType === "area" && (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#priceGradient)"
                name="Price"
              />
            )}

            {chartType === "line" && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            )}

            {/* Technical indicators */}
            {activeIndicators.includes("sma20") && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma20"
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="SMA(20)"
              />
            )}

            {activeIndicators.includes("bollinger") && (
              <>
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="upperBand"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Upper Band"
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="lowerBand"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Lower Band"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Chart */}
      {activeIndicators.includes("rsi") && (
        <div className="h-24 mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            RSI (14)
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}`} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="2 2" />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="2 2" />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* MACD Chart */}
      {activeIndicators.includes("macd") && (
        <div className="h-24 mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            MACD
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis />
              <Bar dataKey="macd" fill="#10b981" opacity={0.6} />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Market stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Open</p>
          <p className="font-semibold text-gray-900 dark:text-white">
            $4,520.45
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">High</p>
          <p className="font-semibold text-success-500">$4,571.23</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Low</p>
          <p className="font-semibold text-danger-500">$4,520.45</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
            Volume
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">1.8M</p>
        </div>
      </div>
    </div>
  );
}
