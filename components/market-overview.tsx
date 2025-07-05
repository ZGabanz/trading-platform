"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const marketData = [
  {
    symbol: "S&P 500",
    value: 4563.89,
    change: 23.45,
    changePercent: 0.52,
    high: 4589.23,
    low: 4534.12,
  },
  {
    symbol: "NASDAQ",
    value: 14123.45,
    change: -45.67,
    changePercent: -0.32,
    high: 14201.78,
    low: 14089.34,
  },
  {
    symbol: "DOW JONES",
    value: 34567.12,
    change: 78.9,
    changePercent: 0.23,
    high: 34623.45,
    low: 34456.78,
  },
  {
    symbol: "FTSE 100",
    value: 7456.78,
    change: 12.34,
    changePercent: 0.17,
    high: 7489.12,
    low: 7423.56,
  },
  {
    symbol: "DAX",
    value: 15789.23,
    change: -23.45,
    changePercent: -0.15,
    high: 15834.67,
    low: 15723.89,
  },
  {
    symbol: "NIKKEI",
    value: 28456.78,
    change: 156.78,
    changePercent: 0.55,
    high: 28523.45,
    low: 28234.56,
  },
];

export function MarketOverview() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Activity className="h-6 w-6 mr-2 text-primary-600" />
          Market Overview
        </h2>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {marketData.map((market, index) => (
          <motion.div
            key={market.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {market.symbol}
              </h3>
              <div className="flex items-center">
                {market.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    market.change >= 0 ? "text-success-500" : "text-danger-500"
                  }`}
                >
                  {market.change >= 0 ? "+" : ""}
                  {market.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {market.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p
                className={`text-sm ${
                  market.change >= 0 ? "text-success-500" : "text-danger-500"
                }`}
              >
                {market.change >= 0 ? "+" : ""}
                {market.change.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                H:{" "}
                {market.high.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
              <span>
                L:{" "}
                {market.low.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
