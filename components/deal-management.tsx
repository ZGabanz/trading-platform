"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3,
  DollarSign,
  Zap,
  Target,
  ArrowUpDown,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { exchangeRateAPI } from "@/lib/api/exchange-rates";

interface Deal {
  id: string;
  partnerId: string;
  symbol: string;
  side: "BUY" | "SELL";
  amount: number;
  rate: number;
  totalValue: number;
  status:
    | "PENDING"
    | "APPROVED"
    | "EXECUTING"
    | "COMPLETED"
    | "FAILED"
    | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  executedAt?: string;
  metadata: {
    spotRate: number;
    spread: number;
    confidence: number;
    source: string;
  };
  counterparty?: {
    id: string;
    name: string;
    rating: number;
  };
  p2pOrderId?: string;
  notes?: string;
}

interface DealStats {
  totalDeals: number;
  completedDeals: number;
  failedDeals: number;
  successRate: number;
  totalVolume: number;
  totalProfit: number;
  averageExecutionTime: number;
}

interface ApiResponse {
  success: boolean;
  data: any;
}

const statusColors = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  APPROVED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  EXECUTING:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const statusIcons = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  EXECUTING: Play,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  CANCELLED: Pause,
};

export function DealManagement() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<DealStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [symbolFilter, setSymbolFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // New deal form state
  const [newDeal, setNewDeal] = useState({
    symbol: "EUR/USD",
    side: "BUY" as "BUY" | "SELL",
    amount: 1000,
    maxRate: "",
    minRate: "",
    autoExecute: false,
    notes: "",
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([fetchDeals(), fetchStats()]);
      setLoading(false);
    };

    loadInitialData();

    // Обновляем данные каждые 30 секунд
    const interval = setInterval(() => {
      fetchDeals();
      fetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDeals = async () => {
    try {
      const response = (await exchangeRateAPI.getDeals()) as ApiResponse;
      if (response.success) {
        setDeals(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      toast.error("Failed to load deals");
    }
  };

  const fetchStats = async () => {
    try {
      const response = (await exchangeRateAPI.getDealStats()) as ApiResponse;
      if (response.success) {
        setStats(
          response.data || {
            totalDeals: 0,
            completedDeals: 0,
            failedDeals: 0,
            successRate: 0,
            totalVolume: 0,
            totalProfit: 0,
            averageExecutionTime: 0,
          }
        );
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const createDeal = async () => {
    try {
      const dealData = {
        partnerId: "partner-123",
        symbol: "USD/EUR",
        side: "BUY",
        amount: 1000,
        rate: 0.85,
        totalValue: 850,
        metadata: {
          spotRate: 0.85,
          spread: 0.01,
          confidence: 0.95,
          source: "pricing-core",
        },
      };

      const response = (await exchangeRateAPI.createDeal(
        dealData
      )) as ApiResponse;
      if (response.success) {
        toast.success("Deal created successfully");
        fetchDeals();
        fetchStats();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create deal:", error);
      toast.error("Failed to create deal");
    }
  };

  const executeDeal = async (dealId: string) => {
    try {
      const response = (await exchangeRateAPI.executeDeal(
        dealId
      )) as ApiResponse;
      if (response.success) {
        toast.success("Deal executed successfully");
        fetchDeals();
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to execute deal:", error);
      toast.error("Failed to execute deal");
    }
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      deal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || deal.status === statusFilter;
    const matchesSymbol =
      symbolFilter === "ALL" || deal.symbol === symbolFilter;

    return matchesSearch && matchesStatus && matchesSymbol;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    const aValue = a[sortBy as keyof Deal] as string | number;
    const bValue = b[sortBy as keyof Deal] as string | number;

    if (aValue === undefined || bValue === undefined) return 0;

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const uniqueSymbols = Array.from(new Set(deals.map((deal) => deal.symbol)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Deal Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor your exchange deals
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Deal</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Deals
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDeals || 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Success Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.successRate
                    ? `${stats.successRate.toFixed(1)}%`
                    : "0%"}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                  $
                  {stats.totalVolume ? stats.totalVolume.toLocaleString() : "0"}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                  $
                  {stats.totalProfit ? stats.totalProfit.toLocaleString() : "0"}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="EXECUTING">Executing</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={symbolFilter}
            onChange={(e) => setSymbolFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">All Symbols</option>
            {uniqueSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Deals Table */}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Deal ID
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
                  Rate
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Created
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        Loading deals...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : sortedDeals.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No deals found
                  </td>
                </tr>
              ) : (
                sortedDeals.map((deal, index) => {
                  const StatusIcon = statusIcons[deal.status] || Clock;
                  return (
                    <motion.tr
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                          {deal.id.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {deal.symbol}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            deal.side === "BUY"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {deal.side === "BUY" ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {deal.side}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-white">
                          {deal.amount ? deal.amount.toLocaleString() : "0"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-white">
                          {deal.rate ? deal.rate.toFixed(4) : "0.0000"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[deal.status] ||
                            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                          }`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {deal.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {deal.createdAt
                            ? new Date(deal.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedDeal(deal)}
                            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {deal.status === "PENDING" && (
                            <button
                              onClick={() => executeDeal(deal.id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Deal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Deal
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Symbol
                </label>
                <select
                  value={newDeal.symbol}
                  onChange={(e) =>
                    setNewDeal((prev) => ({ ...prev, symbol: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="EUR/USD">EUR/USD</option>
                  <option value="GBP/USD">GBP/USD</option>
                  <option value="USD/JPY">USD/JPY</option>
                  <option value="AUD/USD">AUD/USD</option>
                  <option value="EUR/GBP">EUR/GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Side
                </label>
                <select
                  value={newDeal.side}
                  onChange={(e) =>
                    setNewDeal((prev) => ({
                      ...prev,
                      side: e.target.value as "BUY" | "SELL",
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newDeal.amount}
                  onChange={(e) =>
                    setNewDeal((prev) => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                  placeholder="Enter amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Min Rate (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newDeal.minRate}
                    onChange={(e) =>
                      setNewDeal((prev) => ({
                        ...prev,
                        minRate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    placeholder="Min rate"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Rate (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={newDeal.maxRate}
                    onChange={(e) =>
                      setNewDeal((prev) => ({
                        ...prev,
                        maxRate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                    placeholder="Max rate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newDeal.notes}
                  onChange={(e) =>
                    setNewDeal((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                  rows={3}
                  placeholder="Enter notes..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoExecute"
                  checked={newDeal.autoExecute}
                  onChange={(e) =>
                    setNewDeal((prev) => ({
                      ...prev,
                      autoExecute: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="autoExecute"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Auto-execute deal
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button onClick={createDeal} className="btn-primary">
                Create Deal
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Deal Details Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Deal Details
              </h3>
              <button
                onClick={() => setSelectedDeal(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Deal ID
                  </label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">
                    {selectedDeal.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedDeal.status] ||
                      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}
                  >
                    {React.createElement(
                      statusIcons[selectedDeal.status] || Clock,
                      {
                        className: "h-3 w-3 mr-1",
                      }
                    )}
                    {selectedDeal.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Symbol
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDeal.symbol}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Side
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedDeal.side === "BUY"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    {selectedDeal.side}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Amount
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDeal.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rate
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDeal.rate.toFixed(4)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Value
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedDeal.totalValue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Metadata
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Spot Rate
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedDeal.metadata.spotRate.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Spread
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedDeal.metadata.spread.toFixed(4)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Confidence
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedDeal.metadata.confidence}%
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Source
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedDeal.metadata.source}
                    </p>
                  </div>
                </div>
              </div>

              {selectedDeal.counterparty && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Counterparty
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedDeal.counterparty.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Rating
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {selectedDeal.counterparty.rating}/5
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedDeal.notes && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDeal.notes}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Timeline
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Created
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedDeal.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Updated
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {new Date(selectedDeal.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  {selectedDeal.executedAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Executed
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedDeal.executedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              {selectedDeal.status === "PENDING" && (
                <button
                  onClick={() => {
                    executeDeal(selectedDeal.id);
                    setSelectedDeal(null);
                  }}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>Execute Deal</span>
                </button>
              )}
              <button
                onClick={() => setSelectedDeal(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
