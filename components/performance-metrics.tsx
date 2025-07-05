"use client";

import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Target, TrendingUp, Shield, Zap } from "lucide-react";

const performanceData = [
  { name: "Stocks", value: 65, color: "#3b82f6" },
  { name: "Bonds", value: 20, color: "#10b981" },
  { name: "Crypto", value: 10, color: "#f59e0b" },
  { name: "Cash", value: 5, color: "#6b7280" },
];

const metrics = [
  {
    label: "Sharpe Ratio",
    value: "1.24",
    description: "Risk-adjusted return",
    icon: Target,
    color: "text-primary-600",
  },
  {
    label: "Max Drawdown",
    value: "-8.5%",
    description: "Largest peak-to-trough decline",
    icon: Shield,
    color: "text-danger-500",
  },
  {
    label: "Volatility",
    value: "12.3%",
    description: "Standard deviation of returns",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    label: "Beta",
    value: "0.95",
    description: "Market correlation",
    icon: TrendingUp,
    color: "text-success-500",
  },
];

export function PerformanceMetrics() {
  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Performance Metrics
      </h2>

      {/* Asset Allocation Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Asset Allocation
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {performanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {performanceData.map((item, index) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {item.name} ({item.value}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Metrics
        </h3>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div
                className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${metric.color}`}
              >
                <metric.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {metric.label}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {metric.value}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
        <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
          Portfolio Health Score
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-sm text-primary-700 dark:text-primary-300">
            Excellent diversification with strong risk-adjusted returns
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              8.7
            </span>
            <span className="text-sm text-primary-700 dark:text-primary-300">
              /10
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
