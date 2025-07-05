"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bitcoin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Star,
  Eye,
  Filter,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  supply: number;
  rank: number;
  sparkline: number[];
  dominance: number;
}

interface CryptoHolding {
  symbol: string;
  amount: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

const mockCryptoData: CryptoCurrency[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 67245.82,
    change24h: 2.45,
    change7d: -1.23,
    marketCap: 1320000000000,
    volume24h: 28500000000,
    supply: 19654321,
    rank: 1,
    sparkline: [66800, 67100, 66950, 67300, 67150, 67245],
    dominance: 52.3,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3456.78,
    change24h: 1.89,
    change7d: 3.45,
    marketCap: 415000000000,
    volume24h: 15200000000,
    supply: 120276543,
    rank: 2,
    sparkline: [3420, 3445, 3430, 3465, 3450, 3456],
    dominance: 17.8,
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "Binance Coin",
    price: 598.34,
    change24h: -0.67,
    change7d: 2.11,
    marketCap: 89000000000,
    volume24h: 1850000000,
    supply: 153856150,
    rank: 3,
    sparkline: [601, 599, 595, 597, 598, 598],
    dominance: 3.8,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 145.67,
    change24h: 4.23,
    change7d: 8.91,
    marketCap: 67000000000,
    volume24h: 3200000000,
    supply: 467854213,
    rank: 4,
    sparkline: [140, 142, 144, 146, 145, 145],
    dominance: 2.9,
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: 0.67,
    change24h: -1.45,
    change7d: -3.22,
    marketCap: 23500000000,
    volume24h: 850000000,
    supply: 35045020830,
    rank: 5,
    sparkline: [0.68, 0.67, 0.69, 0.68, 0.67, 0.67],
    dominance: 1.0,
  },
  {
    id: "polygon",
    symbol: "MATIC",
    name: "Polygon",
    price: 0.89,
    change24h: 3.78,
    change7d: 12.45,
    marketCap: 8900000000,
    volume24h: 420000000,
    supply: 10000000000,
    rank: 6,
    sparkline: [0.86, 0.87, 0.88, 0.89, 0.88, 0.89],
    dominance: 0.4,
  },
];

const mockPortfolio: CryptoHolding[] = [
  {
    symbol: "BTC",
    amount: 0.5,
    avgPrice: 65000,
    currentPrice: 67245.82,
    value: 33622.91,
    pnl: 1122.91,
    pnlPercent: 3.45,
  },
  {
    symbol: "ETH",
    amount: 2.5,
    avgPrice: 3200,
    currentPrice: 3456.78,
    value: 8641.95,
    pnl: 641.95,
    pnlPercent: 8.01,
  },
  {
    symbol: "SOL",
    amount: 50,
    avgPrice: 130,
    currentPrice: 145.67,
    value: 7283.5,
    pnl: 783.5,
    pnlPercent: 12.05,
  },
];

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

export function CryptoTracker() {
  const [cryptos] = useState<CryptoCurrency[]>(mockCryptoData);
  const [portfolio] = useState<CryptoHolding[]>(mockPortfolio);
  const [watchlist, setWatchlist] = useState<string[]>(["BTC", "ETH"]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewType, setViewType] = useState<"market" | "portfolio">("market");

  const totalPortfolioValue = portfolio.reduce(
    (sum, holding) => sum + holding.value,
    0
  );
  const totalPortfolioPnL = portfolio.reduce(
    (sum, holding) => sum + holding.pnl,
    0
  );
  const portfolioPnLPercent =
    (totalPortfolioPnL / (totalPortfolioValue - totalPortfolioPnL)) * 100;

  const sortedCryptos = useMemo(() => {
    return [...cryptos].sort((a, b) => {
      const aValue = a[sortBy as keyof CryptoCurrency];
      const bValue = b[sortBy as keyof CryptoCurrency];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [cryptos, sortBy, sortOrder]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const portfolioChartData = portfolio.map((holding, index) => ({
    name: holding.symbol,
    value: holding.value,
    fill: COLORS[index % COLORS.length],
  }));

  const dominanceData = cryptos.slice(0, 5).map((crypto, index) => ({
    name: crypto.symbol,
    value: crypto.dominance,
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Bitcoin className="h-6 w-6 mr-2 text-orange-500" />
            Crypto Market Tracker
          </h2>
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewType("market")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewType === "market"
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setViewType("portfolio")}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  viewType === "portfolio"
                    ? "bg-white dark:bg-gray-600 shadow-sm"
                    : "hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Portfolio
              </button>
            </div>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Total Market Cap
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $2.45T
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  24h Volume
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $89.5B
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  BTC Dominance
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  52.3%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Fear & Greed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  74 <span className="text-sm">Greed</span>
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {viewType === "market" ? (
        <>
          {/* Market Data Table */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Cryptocurrency Prices
              </h3>
              <div className="flex items-center space-x-4">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="rank">Rank</option>
                  <option value="price">Price</option>
                  <option value="change24h">24h Change</option>
                  <option value="marketCap">Market Cap</option>
                  <option value="volume24h">Volume</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                      Name
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      24h
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      7d
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      Market Cap
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      Volume
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">
                      Chart
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedCryptos.map((crypto, index) => (
                    <motion.tr
                      key={crypto.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                        {crypto.rank}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white text-xs font-bold">
                              {crypto.symbol.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {crypto.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {crypto.symbol}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                        $
                        {crypto.price.toLocaleString(undefined, {
                          minimumFractionDigits: crypto.price < 1 ? 4 : 2,
                          maximumFractionDigits: crypto.price < 1 ? 4 : 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`${
                            crypto.change24h >= 0
                              ? "text-success-500"
                              : "text-danger-500"
                          }`}
                        >
                          {crypto.change24h >= 0 ? "+" : ""}
                          {crypto.change24h.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`${
                            crypto.change7d >= 0
                              ? "text-success-500"
                              : "text-danger-500"
                          }`}
                        >
                          {crypto.change7d >= 0 ? "+" : ""}
                          {crypto.change7d.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        ${(crypto.marketCap / 1000000000).toFixed(2)}B
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                        ${(crypto.volume24h / 1000000000).toFixed(2)}B
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-8 w-16">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={crypto.sparkline.map((price, i) => ({
                                value: price,
                                index: i,
                              }))}
                            >
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={
                                  crypto.change24h >= 0 ? "#10b981" : "#ef4444"
                                }
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => toggleWatchlist(crypto.symbol)}
                            className={`p-1 rounded transition-colors ${
                              watchlist.includes(crypto.symbol)
                                ? "text-yellow-500 hover:text-yellow-600"
                                : "text-gray-400 hover:text-yellow-500"
                            }`}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                watchlist.includes(crypto.symbol)
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-primary-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Dominance Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Market Dominance
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dominanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {dominanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`,
                      "Dominance",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {dominanceData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.name}: {item.value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Portfolio Overview */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Crypto Portfolio
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${totalPortfolioValue.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary-600" />
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total P&L
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        totalPortfolioPnL >= 0
                          ? "text-success-500"
                          : "text-danger-500"
                      }`}
                    >
                      ${totalPortfolioPnL.toFixed(2)}
                    </p>
                  </div>
                  {totalPortfolioPnL >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-success-500" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-danger-500" />
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      P&L %
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        portfolioPnLPercent >= 0
                          ? "text-success-500"
                          : "text-danger-500"
                      }`}
                    >
                      {portfolioPnLPercent >= 0 ? "+" : ""}
                      {portfolioPnLPercent.toFixed(2)}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Portfolio Allocation Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Portfolio Allocation
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {portfolioChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [
                          `$${value.toLocaleString()}`,
                          "Value",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Holdings
                </h4>
                <div className="space-y-3">
                  {portfolio.map((holding, index) => (
                    <div
                      key={holding.symbol}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {holding.symbol}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {holding.amount} coins
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ${holding.value.toLocaleString()}
                        </div>
                        <div
                          className={`text-xs ${
                            holding.pnl >= 0
                              ? "text-success-500"
                              : "text-danger-500"
                          }`}
                        >
                          {holding.pnl >= 0 ? "+" : ""}${holding.pnl.toFixed(2)}{" "}
                          ({holding.pnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
