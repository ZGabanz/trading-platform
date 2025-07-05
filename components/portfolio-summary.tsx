"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const portfolioData = [
  { date: "2024-01", value: 10000 },
  { date: "2024-02", value: 12500 },
  { date: "2024-03", value: 11800 },
  { date: "2024-04", value: 14200 },
  { date: "2024-05", value: 15600 },
  { date: "2024-06", value: 17300 },
  { date: "2024-07", value: 16900 },
  { date: "2024-08", value: 18500 },
  { date: "2024-09", value: 19200 },
  { date: "2024-10", value: 20800 },
  { date: "2024-11", value: 22100 },
  { date: "2024-12", value: 23500 },
];

const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    value: 7500,
    change: 2.34,
    percentage: 32.1,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    value: 4200,
    change: -1.12,
    percentage: 17.9,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    value: 3800,
    change: 1.87,
    percentage: 16.2,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    value: 2500,
    change: 3.45,
    percentage: 10.6,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    value: 2200,
    change: -0.67,
    percentage: 9.4,
  },
  {
    symbol: "Others",
    name: "Other Holdings",
    value: 3300,
    change: 0.89,
    percentage: 14.0,
  },
];

export function PortfolioSummary() {
  const totalValue = 23500;
  const totalChange = 1250;
  const totalChangePercent = 5.62;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Portfolio Summary
        </h2>
        <select className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm text-gray-900 dark:text-gray-100">
          <option>Last 12 months</option>
          <option>Last 6 months</option>
          <option>Last 3 months</option>
          <option>Last month</option>
        </select>
      </div>

      {/* Portfolio value and change */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-4"
        >
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg p-4"
        >
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-success-600 dark:text-success-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Gain
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +${totalChange.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20 rounded-lg p-4"
        >
          <div className="flex items-center">
            <Percent className="h-8 w-8 text-success-600 dark:text-success-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Return
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                +{totalChangePercent}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Portfolio chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolioData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                className="text-xs text-gray-600 dark:text-gray-400"
              />
              <YAxis
                className="text-xs text-gray-600 dark:text-gray-400"
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                }}
                formatter={(value) => [
                  `$${value.toLocaleString()}`,
                  "Portfolio Value",
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holdings breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top Holdings
        </h3>
        <div className="space-y-3">
          {holdings.map((holding, index) => (
            <motion.div
              key={holding.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {holding.symbol}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {holding.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${holding.value.toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end">
                      {holding.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                      )}
                      <span
                        className={`text-sm ${
                          holding.change >= 0
                            ? "text-success-500"
                            : "text-danger-500"
                        }`}
                      >
                        {holding.change >= 0 ? "+" : ""}
                        {holding.change}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${holding.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {holding.percentage}% of portfolio
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
