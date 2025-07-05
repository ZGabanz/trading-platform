"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown } from "lucide-react";

const alertsData = [
  {
    id: 1,
    symbol: "AAPL",
    name: "Apple Inc.",
    targetPrice: 185.0,
    currentPrice: 182.34,
    type: "above",
    active: true,
  },
  {
    id: 2,
    symbol: "TSLA",
    name: "Tesla Inc.",
    targetPrice: 240.0,
    currentPrice: 245.78,
    type: "below",
    active: true,
  },
  {
    id: 3,
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    targetPrice: 2900.0,
    currentPrice: 2845.67,
    type: "above",
    active: false,
  },
];

export function PriceAlerts() {
  const [alerts, setAlerts] = useState(alertsData);
  const [showAddAlert, setShowAddAlert] = useState(false);

  const toggleAlert = (id: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  const deleteAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Bell className="h-6 w-6 mr-2 text-primary-600" />
          Price Alerts
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddAlert(true)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const isTriggered =
            alert.type === "above"
              ? alert.currentPrice >= alert.targetPrice
              : alert.currentPrice <= alert.targetPrice;

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border transition-all ${
                isTriggered && alert.active
                  ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      alert.active ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {alert.symbol}
                  </span>
                  {isTriggered && alert.active && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded">
                      Triggered
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`text-sm font-medium ${
                      alert.active
                        ? "text-green-600 hover:text-green-700"
                        : "text-gray-400 hover:text-gray-600"
                    } transition-colors`}
                  >
                    {alert.active ? "Active" : "Inactive"}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteAlert(alert.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {alert.name}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {alert.type === "above" ? (
                    <TrendingUp className="h-4 w-4 text-success-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-danger-500" />
                  )}
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {alert.type === "above" ? "When above" : "When below"} $
                    {alert.targetPrice}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Current: ${alert.currentPrice}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add alert modal */}
      {showAddAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddAlert(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Price Alert
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Stock symbol (e.g., AAPL)"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              />
              <input
                type="number"
                placeholder="Target price"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              />
              <select className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100">
                <option value="above">Alert when price goes above</option>
                <option value="below">Alert when price goes below</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddAlert(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddAlert(false)}
                className="flex-1 btn-primary"
              >
                Create Alert
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
