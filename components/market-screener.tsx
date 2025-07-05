"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Eye,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpDown,
  Settings2,
  RefreshCw,
} from "lucide-react";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividend: number;
  sector: string;
  exchange: string;
  rsi: number;
  macd: number;
  volume50day: number;
  price52wHigh: number;
  price52wLow: number;
  beta: number;
  eps: number;
}

const mockStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 175.84,
    change: 2.34,
    changePercent: 1.35,
    volume: 45230000,
    marketCap: 2780000000000,
    peRatio: 28.5,
    dividend: 0.96,
    sector: "Technology",
    exchange: "NASDAQ",
    rsi: 62.4,
    macd: 1.2,
    volume50day: 52000000,
    price52wHigh: 198.23,
    price52wLow: 124.17,
    beta: 1.2,
    eps: 6.16,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 128.45,
    change: -1.23,
    changePercent: -0.95,
    volume: 23450000,
    marketCap: 1620000000000,
    peRatio: 24.8,
    dividend: 0.0,
    sector: "Technology",
    exchange: "NASDAQ",
    rsi: 45.2,
    macd: -0.8,
    volume50day: 28000000,
    price52wHigh: 151.55,
    price52wLow: 83.34,
    beta: 1.1,
    eps: 5.18,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 384.52,
    change: 5.67,
    changePercent: 1.5,
    volume: 19870000,
    marketCap: 2850000000000,
    peRatio: 32.1,
    dividend: 2.72,
    sector: "Technology",
    exchange: "NASDAQ",
    rsi: 58.9,
    macd: 2.1,
    volume50day: 22500000,
    price52wHigh: 415.26,
    price52wLow: 245.18,
    beta: 0.9,
    eps: 11.97,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 248.48,
    change: -8.92,
    changePercent: -3.47,
    volume: 67890000,
    marketCap: 789000000000,
    peRatio: 62.8,
    dividend: 0.0,
    sector: "Consumer Cyclical",
    exchange: "NASDAQ",
    rsi: 35.6,
    macd: -3.2,
    volume50day: 45000000,
    price52wHigh: 314.67,
    price52wLow: 138.8,
    beta: 2.3,
    eps: 3.96,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 151.94,
    change: 1.89,
    changePercent: 1.26,
    volume: 34560000,
    marketCap: 1560000000000,
    peRatio: 45.2,
    dividend: 0.0,
    sector: "Consumer Cyclical",
    exchange: "NASDAQ",
    rsi: 52.1,
    macd: 0.9,
    volume50day: 38000000,
    price52wHigh: 170.0,
    price52wLow: 81.43,
    beta: 1.3,
    eps: 3.36,
  },
];

const sectors = [
  "All",
  "Technology",
  "Healthcare",
  "Finance",
  "Consumer Cyclical",
  "Energy",
  "Utilities",
];
const exchanges = ["All", "NYSE", "NASDAQ", "AMEX"];

const sortOptions = [
  { value: "symbol", label: "Symbol" },
  { value: "price", label: "Price" },
  { value: "change", label: "Change" },
  { value: "changePercent", label: "Change %" },
  { value: "volume", label: "Volume" },
  { value: "marketCap", label: "Market Cap" },
  { value: "peRatio", label: "P/E Ratio" },
  { value: "rsi", label: "RSI" },
];

export function MarketScreener() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedExchange, setSelectedExchange] = useState("All");
  const [sortBy, setSortBy] = useState("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Advanced filters
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [volumeRange, setVolumeRange] = useState({ min: "", max: "" });
  const [peRange, setPeRange] = useState({ min: "", max: "" });
  const [rsiRange, setRsiRange] = useState({ min: "", max: "" });

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = mockStocks.filter((stock) => {
      const matchesSearch =
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector =
        selectedSector === "All" || stock.sector === selectedSector;
      const matchesExchange =
        selectedExchange === "All" || stock.exchange === selectedExchange;

      // Advanced filters
      const matchesPrice =
        (!priceRange.min || stock.price >= parseFloat(priceRange.min)) &&
        (!priceRange.max || stock.price <= parseFloat(priceRange.max));

      const matchesVolume =
        (!volumeRange.min || stock.volume >= parseFloat(volumeRange.min)) &&
        (!volumeRange.max || stock.volume <= parseFloat(volumeRange.max));

      const matchesPE =
        (!peRange.min || stock.peRatio >= parseFloat(peRange.min)) &&
        (!peRange.max || stock.peRatio <= parseFloat(peRange.max));

      const matchesRSI =
        (!rsiRange.min || stock.rsi >= parseFloat(rsiRange.min)) &&
        (!rsiRange.max || stock.rsi <= parseFloat(rsiRange.max));

      return (
        matchesSearch &&
        matchesSector &&
        matchesExchange &&
        matchesPrice &&
        matchesVolume &&
        matchesPE &&
        matchesRSI
      );
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Stock];
      const bValue = b[sortBy as keyof Stock];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [
    searchTerm,
    selectedSector,
    selectedExchange,
    sortBy,
    sortOrder,
    priceRange,
    volumeRange,
    peRange,
    rsiRange,
  ]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const exportData = () => {
    // This would implement actual CSV/Excel export
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Symbol,Name,Price,Change,Change%,Volume,Market Cap,P/E,RSI\n" +
      filteredAndSortedStocks
        .map(
          (stock) =>
            `${stock.symbol},${stock.name},${stock.price},${stock.change},${stock.changePercent},${stock.volume},${stock.marketCap},${stock.peRatio},${stock.rsi}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "market_screener_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSector("All");
    setSelectedExchange("All");
    setPriceRange({ min: "", max: "" });
    setVolumeRange({ min: "", max: "" });
    setPeRange({ min: "", max: "" });
    setRsiRange({ min: "", max: "" });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Filter className="h-6 w-6 mr-2 text-primary-600" />
          Market Screener
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedStocks.length} stocks
          </span>
          <button
            onClick={exportData}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Download className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Search and Basic Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by symbol or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
          >
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>

          <select
            value={selectedExchange}
            onChange={(e) => setSelectedExchange(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
          >
            {exchanges.map((exchange) => (
              <option key={exchange} value={exchange}>
                {exchange}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showAdvancedFilters
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Advanced Filters
              </h3>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Price Range ($)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Volume Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={volumeRange.min}
                    onChange={(e) =>
                      setVolumeRange((prev) => ({
                        ...prev,
                        min: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={volumeRange.max}
                    onChange={(e) =>
                      setVolumeRange((prev) => ({
                        ...prev,
                        max: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  P/E Ratio
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={peRange.min}
                    onChange={(e) =>
                      setPeRange((prev) => ({ ...prev, min: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={peRange.max}
                    onChange={(e) =>
                      setPeRange((prev) => ({ ...prev, max: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  RSI Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={rsiRange.min}
                    onChange={(e) =>
                      setRsiRange((prev) => ({ ...prev, min: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="100"
                    value={rsiRange.max}
                    onChange={(e) =>
                      setRsiRange((prev) => ({ ...prev, max: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center space-x-4 mb-6">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Sort by:
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
        >
          {sortOrder === "asc" ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                Symbol
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                Name
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                Price
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                Change
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                Volume
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                P/E
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                RSI
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedStocks.map((stock, index) => (
              <motion.tr
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {stock.symbol}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {stock.exchange}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {stock.name}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                  ${stock.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                    )}
                    <span
                      className={
                        stock.change >= 0
                          ? "text-success-500"
                          : "text-danger-500"
                      }
                    >
                      {stock.change >= 0 ? "+" : ""}
                      {stock.change.toFixed(2)}
                      <br />
                      <span className="text-xs">
                        ({stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {(stock.volume / 1000000).toFixed(2)}M
                </td>
                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                  {stock.peRatio.toFixed(1)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      stock.rsi > 70
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : stock.rsi < 30
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {stock.rsi.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => toggleWatchlist(stock.symbol)}
                      className={`p-1 rounded transition-colors ${
                        watchlist.includes(stock.symbol)
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-400 hover:text-yellow-500"
                      }`}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          watchlist.includes(stock.symbol) ? "fill-current" : ""
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

      {filteredAndSortedStocks.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No stocks match your current filters.
        </div>
      )}
    </div>
  );
}
