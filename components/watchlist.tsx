"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, TrendingDown, Plus, Eye } from "lucide-react";

const watchlistData = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 182.34,
    change: 2.45,
    changePercent: 1.36,
    starred: true,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 2845.67,
    change: -15.23,
    changePercent: -0.53,
    starred: true,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    price: 378.92,
    change: 4.12,
    changePercent: 1.1,
    starred: false,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 245.78,
    change: 8.34,
    changePercent: 3.51,
    starred: true,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 145.23,
    change: -2.67,
    changePercent: -1.81,
    starred: false,
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    price: 456.89,
    change: 12.45,
    changePercent: 2.8,
    starred: true,
  },
];

export function Watchlist() {
  const [watchlist, setWatchlist] = useState(watchlistData);
  const [showAddStock, setShowAddStock] = useState(false);

  const toggleStar = (symbol: string) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.symbol === symbol ? { ...item, starred: !item.starred } : item
      )
    );
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Eye className="h-6 w-6 mr-2 text-primary-600" />
          Watchlist
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddStock(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="space-y-3">
        {watchlist.map((stock, index) => (
          <motion.div
            key={stock.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleStar(stock.symbol)}
                className={`transition-colors ${
                  stock.starred
                    ? "text-yellow-500 hover:text-yellow-600"
                    : "text-gray-400 hover:text-yellow-500"
                }`}
              >
                <Star
                  className={`h-4 w-4 ${stock.starred ? "fill-current" : ""}`}
                />
              </motion.button>

              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {stock.symbol}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-32">
                  {stock.name}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                ${stock.price.toFixed(2)}
              </p>
              <div className="flex items-center justify-end">
                {stock.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                )}
                <span
                  className={`text-sm ${
                    stock.change >= 0 ? "text-success-500" : "text-danger-500"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add stock modal */}
      {showAddStock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddStock(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add to Watchlist
            </h3>
            <input
              type="text"
              placeholder="Enter stock symbol (e.g., AAPL)"
              className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddStock(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddStock(false)}
                className="flex-1 btn-primary"
              >
                Add Stock
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
