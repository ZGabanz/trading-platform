"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Play,
  Pause,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  DollarSign,
  Sliders,
  Bot,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

interface P2PStrategy {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED" | "STOPPED";
  symbol: string;
  side: "BUY" | "SELL" | "BOTH";
  minAmount: number;
  maxAmount: number;
  targetSpread: number;
  maxSpread: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  executionMode: "AGGRESSIVE" | "CONSERVATIVE" | "BALANCED";
  autoExecution: boolean;
  createdAt: string;
  lastExecuted?: string;
  performance: {
    totalOrders: number;
    successfulOrders: number;
    totalVolume: number;
    totalProfit: number;
    averageExecutionTime: number;
    successRate: number;
  };
}

interface P2POrder {
  id: string;
  strategyId: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: number;
  price: number;
  status: "PENDING" | "FILLED" | "CANCELLED" | "EXPIRED";
  createdAt: string;
  filledAt?: string;
  profit?: number;
  counterparty?: string;
}

interface P2PStats {
  totalStrategies: number;
  activeStrategies: number;
  totalOrders: number;
  successfulOrders: number;
  totalVolume: number;
  totalProfit: number;
  averageSuccessRate: number;
}

const statusColors = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  PAUSED:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  STOPPED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  FILLED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const riskColors = {
  LOW: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export function P2PAutomation() {
  const [strategies, setStrategies] = useState<P2PStrategy[]>([]);
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [stats, setStats] = useState<P2PStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<P2PStrategy | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"strategies" | "orders">(
    "strategies"
  );

  useEffect(() => {
    fetchStrategies();
    fetchOrders();
    fetchStats();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      // Mock data for development
      setStrategies([
        {
          id: "strategy_001",
          name: "EUR/USD Scalping",
          status: "ACTIVE",
          symbol: "EUR/USD",
          side: "BOTH",
          minAmount: 1000,
          maxAmount: 10000,
          targetSpread: 0.0005,
          maxSpread: 0.002,
          riskLevel: "MEDIUM",
          executionMode: "BALANCED",
          autoExecution: true,
          createdAt: "2024-01-15T10:30:00Z",
          lastExecuted: new Date(Date.now() - 300000).toISOString(),
          performance: {
            totalOrders: 156,
            successfulOrders: 148,
            totalVolume: 1250000,
            totalProfit: 3750,
            averageExecutionTime: 1.2,
            successRate: 94.9,
          },
        },
        {
          id: "strategy_002",
          name: "GBP/USD Arbitrage",
          status: "ACTIVE",
          symbol: "GBP/USD",
          side: "BUY",
          minAmount: 5000,
          maxAmount: 50000,
          targetSpread: 0.001,
          maxSpread: 0.003,
          riskLevel: "LOW",
          executionMode: "CONSERVATIVE",
          autoExecution: true,
          createdAt: "2024-01-10T14:15:00Z",
          lastExecuted: new Date(Date.now() - 600000).toISOString(),
          performance: {
            totalOrders: 89,
            successfulOrders: 87,
            totalVolume: 890000,
            totalProfit: 2670,
            averageExecutionTime: 2.1,
            successRate: 97.8,
          },
        },
        {
          id: "strategy_003",
          name: "USD/JPY High Frequency",
          status: "PAUSED",
          symbol: "USD/JPY",
          side: "SELL",
          minAmount: 2000,
          maxAmount: 20000,
          targetSpread: 0.0003,
          maxSpread: 0.0015,
          riskLevel: "HIGH",
          executionMode: "AGGRESSIVE",
          autoExecution: false,
          createdAt: "2024-01-05T09:00:00Z",
          lastExecuted: new Date(Date.now() - 3600000).toISOString(),
          performance: {
            totalOrders: 234,
            successfulOrders: 201,
            totalVolume: 2340000,
            totalProfit: 4680,
            averageExecutionTime: 0.8,
            successRate: 85.9,
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
      toast.error("Failed to fetch strategies");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // Mock data for development
      setOrders([
        {
          id: "order_001",
          strategyId: "strategy_001",
          symbol: "EUR/USD",
          side: "BUY",
          amount: 5000,
          price: 1.0845,
          status: "FILLED",
          createdAt: new Date(Date.now() - 300000).toISOString(),
          filledAt: new Date(Date.now() - 280000).toISOString(),
          profit: 12.5,
          counterparty: "Alpha Trading",
        },
        {
          id: "order_002",
          strategyId: "strategy_002",
          symbol: "GBP/USD",
          side: "BUY",
          amount: 10000,
          price: 1.2655,
          status: "PENDING",
          createdAt: new Date(Date.now() - 120000).toISOString(),
        },
        {
          id: "order_003",
          strategyId: "strategy_001",
          symbol: "EUR/USD",
          side: "SELL",
          amount: 7500,
          price: 1.085,
          status: "FILLED",
          createdAt: new Date(Date.now() - 600000).toISOString(),
          filledAt: new Date(Date.now() - 580000).toISOString(),
          profit: 18.75,
          counterparty: "Beta Bank",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for development
      setStats({
        totalStrategies: 3,
        activeStrategies: 2,
        totalOrders: 479,
        successfulOrders: 436,
        totalVolume: 4480000,
        totalProfit: 11100,
        averageSuccessRate: 91.0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const toggleStrategy = async (
    strategyId: string,
    action: "start" | "pause" | "stop"
  ) => {
    try {
      // API call would go here
      const updatedStrategies = strategies.map((strategy) => {
        if (strategy.id === strategyId) {
          let newStatus: "ACTIVE" | "PAUSED" | "STOPPED";
          switch (action) {
            case "start":
              newStatus = "ACTIVE";
              break;
            case "pause":
              newStatus = "PAUSED";
              break;
            case "stop":
              newStatus = "STOPPED";
              break;
            default:
              newStatus = strategy.status;
          }
          return { ...strategy, status: newStatus };
        }
        return strategy;
      });
      setStrategies(updatedStrategies);
      toast.success(`Strategy ${action}ed successfully`);
    } catch (error) {
      console.error(`Failed to ${action} strategy:`, error);
      toast.error(`Failed to ${action} strategy`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            P2P Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automated trading strategies and order management
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Bot className="h-5 w-5" />
          <span>Create Strategy</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Strategies
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.activeStrategies}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.averageSuccessRate.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Volume
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(stats.totalVolume / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Profit
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${stats.totalProfit.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("strategies")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "strategies"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Strategies
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "orders"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Orders
          </button>
        </nav>
      </div>

      {/* Strategies Tab */}
      {activeTab === "strategies" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading strategies...
              </span>
            </div>
          ) : strategies.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No strategies found
            </div>
          ) : (
            strategies.map((strategy, index) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {strategy.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {strategy.symbol} • {strategy.side}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[strategy.status]
                      }`}
                    >
                      {strategy.status}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        riskColors[strategy.riskLevel]
                      }`}
                    >
                      {strategy.riskLevel} RISK
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {strategy.performance.totalOrders}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Orders
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {strategy.performance.successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${(strategy.performance.totalVolume / 1000000).toFixed(1)}
                      M
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Volume
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ${strategy.performance.totalProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Profit
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Amount: ${strategy.minAmount.toLocaleString()} - $
                      {strategy.maxAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Target Spread:{" "}
                      {(strategy.targetSpread * 10000).toFixed(1)} pips
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedStrategy(strategy)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                    {strategy.status === "ACTIVE" ? (
                      <button
                        onClick={() => toggleStrategy(strategy.id, "pause")}
                        className="p-2 text-yellow-500 hover:text-yellow-600 transition-colors"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleStrategy(strategy.id, "start")}
                        className="p-2 text-green-500 hover:text-green-600 transition-colors"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Symbol
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Side
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Profit
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {order.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {order.symbol}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.side === "BUY"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {order.side === "BUY" ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {order.side}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900 dark:text-white">
                        {order.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-900 dark:text-white">
                        {order.price.toFixed(4)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status]
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`font-medium ${
                          order.profit && order.profit > 0
                            ? "text-green-600 dark:text-green-400"
                            : order.profit && order.profit < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {order.profit ? `$${order.profit.toFixed(2)}` : "-"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Strategy Details Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedStrategy.name}
              </h3>
              <button
                onClick={() => setSelectedStrategy(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strategy Configuration */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Configuration
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Symbol
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedStrategy.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Side
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedStrategy.side}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Amount Range
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${selectedStrategy.minAmount.toLocaleString()} - $
                      {selectedStrategy.maxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Target Spread
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(selectedStrategy.targetSpread * 10000).toFixed(1)} pips
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Max Spread
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(selectedStrategy.maxSpread * 10000).toFixed(1)} pips
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Risk Level
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        riskColors[selectedStrategy.riskLevel]
                      }`}
                    >
                      {selectedStrategy.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Execution Mode
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {selectedStrategy.executionMode}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Auto Execution
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedStrategy.autoExecution
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {selectedStrategy.autoExecution ? "ENABLED" : "DISABLED"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Performance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedStrategy.performance.totalOrders}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Orders
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedStrategy.performance.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      $
                      {(
                        selectedStrategy.performance.totalVolume / 1000000
                      ).toFixed(1)}
                      M
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Volume
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      $
                      {selectedStrategy.performance.totalProfit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Profit
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedStrategy(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="btn-primary">Edit Strategy</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
