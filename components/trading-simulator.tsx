"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Activity,
  BarChart3,
  PieChart,
  History,
  Target,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

interface Position {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  purchaseDate: Date;
}

interface Trade {
  id: string;
  symbol: string;
  type: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  pnl?: number;
}

interface VirtualPortfolio {
  cash: number;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: Position[];
  trades: Trade[];
}

const mockStockPrices: Record<
  string,
  { name: string; price: number; change: number }
> = {
  AAPL: { name: "Apple Inc.", price: 175.84, change: 1.35 },
  GOOGL: { name: "Alphabet Inc.", price: 128.45, change: -0.95 },
  MSFT: { name: "Microsoft Corporation", price: 384.52, change: 1.5 },
  TSLA: { name: "Tesla Inc.", price: 248.48, change: -3.47 },
  AMZN: { name: "Amazon.com Inc.", price: 151.94, change: 1.26 },
  NVDA: { name: "NVIDIA Corporation", price: 482.35, change: 2.14 },
  META: { name: "Meta Platforms Inc.", price: 318.75, change: 0.87 },
  NFLX: { name: "Netflix Inc.", price: 445.2, change: -1.23 },
};

export function TradingSimulator() {
  const [portfolio, setPortfolio] = useState<VirtualPortfolio>({
    cash: 100000, // Start with $100k virtual cash
    totalValue: 100000,
    totalPnL: 0,
    totalPnLPercent: 0,
    positions: [],
    trades: [],
  });

  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Update portfolio values based on current prices
  useEffect(() => {
    const updatedPositions = portfolio.positions.map((position) => {
      const currentPrice =
        mockStockPrices[position.symbol]?.price || position.currentPrice;
      const totalValue = position.quantity * currentPrice;
      const unrealizedPnL = totalValue - position.quantity * position.avgPrice;
      const unrealizedPnLPercent =
        (unrealizedPnL / (position.quantity * position.avgPrice)) * 100;

      return {
        ...position,
        currentPrice,
        totalValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      };
    });

    const positionsValue = updatedPositions.reduce(
      (sum, pos) => sum + pos.totalValue,
      0
    );
    const totalValue = portfolio.cash + positionsValue;
    const totalPnL =
      positionsValue -
      updatedPositions.reduce(
        (sum, pos) => sum + pos.quantity * pos.avgPrice,
        0
      );
    const totalPnLPercent = ((totalValue - 100000) / 100000) * 100;

    setPortfolio((prev) => ({
      ...prev,
      positions: updatedPositions,
      totalValue,
      totalPnL,
      totalPnLPercent,
    }));
  }, []);

  const executeTrade = () => {
    const stockData = mockStockPrices[selectedStock];
    if (!stockData) return;

    const tradeValue = tradeQuantity * stockData.price;
    const trade: Trade = {
      id: Date.now().toString(),
      symbol: selectedStock,
      type: tradeType,
      quantity: tradeQuantity,
      price: stockData.price,
      total: tradeValue,
      timestamp: new Date(),
    };

    if (tradeType === "BUY") {
      if (portfolio.cash < tradeValue) {
        toast.error("Insufficient cash for this trade");
        return;
      }

      // Update or create position
      const existingPositionIndex = portfolio.positions.findIndex(
        (pos) => pos.symbol === selectedStock
      );

      if (existingPositionIndex >= 0) {
        // Update existing position
        const existingPosition = portfolio.positions[existingPositionIndex];
        const newQuantity = existingPosition.quantity + tradeQuantity;
        const newAvgPrice =
          (existingPosition.quantity * existingPosition.avgPrice + tradeValue) /
          newQuantity;

        const updatedPosition: Position = {
          ...existingPosition,
          quantity: newQuantity,
          avgPrice: newAvgPrice,
          currentPrice: stockData.price,
          totalValue: newQuantity * stockData.price,
          unrealizedPnL:
            newQuantity * stockData.price - newQuantity * newAvgPrice,
          unrealizedPnLPercent: 0,
        };

        const newPositions = [...portfolio.positions];
        newPositions[existingPositionIndex] = updatedPosition;

        setPortfolio((prev) => ({
          ...prev,
          cash: prev.cash - tradeValue,
          positions: newPositions,
          trades: [...prev.trades, trade],
        }));
      } else {
        // Create new position
        const newPosition: Position = {
          id: Date.now().toString(),
          symbol: selectedStock,
          name: stockData.name,
          quantity: tradeQuantity,
          avgPrice: stockData.price,
          currentPrice: stockData.price,
          totalValue: tradeValue,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
          purchaseDate: new Date(),
        };

        setPortfolio((prev) => ({
          ...prev,
          cash: prev.cash - tradeValue,
          positions: [...prev.positions, newPosition],
          trades: [...prev.trades, trade],
        }));
      }

      toast.success(`Bought ${tradeQuantity} shares of ${selectedStock}`);
    } else {
      // SELL
      const existingPosition = portfolio.positions.find(
        (pos) => pos.symbol === selectedStock
      );

      if (!existingPosition || existingPosition.quantity < tradeQuantity) {
        toast.error("Insufficient shares to sell");
        return;
      }

      const realizedPnL =
        (stockData.price - existingPosition.avgPrice) * tradeQuantity;
      trade.pnl = realizedPnL;

      if (existingPosition.quantity === tradeQuantity) {
        // Close entire position
        setPortfolio((prev) => ({
          ...prev,
          cash: prev.cash + tradeValue,
          positions: prev.positions.filter(
            (pos) => pos.symbol !== selectedStock
          ),
          trades: [...prev.trades, trade],
        }));
      } else {
        // Partial sell
        const updatedPosition: Position = {
          ...existingPosition,
          quantity: existingPosition.quantity - tradeQuantity,
          totalValue:
            (existingPosition.quantity - tradeQuantity) * stockData.price,
          unrealizedPnL:
            (existingPosition.quantity - tradeQuantity) * stockData.price -
            (existingPosition.quantity - tradeQuantity) *
              existingPosition.avgPrice,
        };

        const newPositions = portfolio.positions.map((pos) =>
          pos.symbol === selectedStock ? updatedPosition : pos
        );

        setPortfolio((prev) => ({
          ...prev,
          cash: prev.cash + tradeValue,
          positions: newPositions,
          trades: [...prev.trades, trade],
        }));
      }

      toast.success(
        `Sold ${tradeQuantity} shares of ${selectedStock} - P&L: $${realizedPnL.toFixed(
          2
        )}`
      );
    }

    setShowTradeModal(false);
    setTradeQuantity(1);
  };

  const resetPortfolio = () => {
    setPortfolio({
      cash: 100000,
      totalValue: 100000,
      totalPnL: 0,
      totalPnLPercent: 0,
      positions: [],
      trades: [],
    });
    toast.success("Portfolio reset to $100,000");
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
            Trading Simulator
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <History className="h-4 w-4 mr-1 inline" />
              History
            </button>
            <button
              onClick={resetPortfolio}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-1 inline" />
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolio.totalValue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available Cash
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${portfolio.cash.toLocaleString()}
                </p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
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
                    portfolio.totalPnL >= 0
                      ? "text-success-500"
                      : "text-danger-500"
                  }`}
                >
                  ${portfolio.totalPnL.toFixed(2)}
                </p>
              </div>
              {portfolio.totalPnL >= 0 ? (
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
                    portfolio.totalPnLPercent >= 0
                      ? "text-success-500"
                      : "text-danger-500"
                  }`}
                >
                  {portfolio.totalPnLPercent >= 0 ? "+" : ""}
                  {portfolio.totalPnLPercent.toFixed(2)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Trade */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Quick Trade
          </h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedStock}
              onChange={(e) => setSelectedStock(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(mockStockPrices).map(([symbol, data]) => (
                <option key={symbol} value={symbol}>
                  {symbol} - ${data.price.toFixed(2)}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={tradeQuantity}
              onChange={(e) => setTradeQuantity(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setTradeType("BUY");
                  executeTrade();
                }}
                className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-1 inline" />
                Buy
              </button>
              <button
                onClick={() => {
                  setTradeType("SELL");
                  executeTrade();
                }}
                className="px-4 py-2 bg-danger-600 text-white rounded-lg hover:bg-danger-700 transition-colors"
              >
                <Minus className="h-4 w-4 mr-1 inline" />
                Sell
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Est. Total: $
              {(
                tradeQuantity * (mockStockPrices[selectedStock]?.price || 0)
              ).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Current Positions */}
      <div className="card p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <PieChart className="h-5 w-5 mr-2 text-primary-600" />
          Current Positions ({portfolio.positions.length})
        </h3>

        {portfolio.positions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No open positions. Start trading to build your portfolio!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    Avg Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    Current Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    Market Value
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                    Unrealized P&L
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {portfolio.positions.map((position, index) => (
                  <motion.tr
                    key={position.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {position.symbol}
                        </span>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {position.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      {position.quantity}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      ${position.avgPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                      ${position.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      ${position.totalValue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div
                        className={`${
                          position.unrealizedPnL >= 0
                            ? "text-success-500"
                            : "text-danger-500"
                        }`}
                      >
                        <div className="font-medium">
                          ${position.unrealizedPnL.toFixed(2)}
                        </div>
                        <div className="text-xs">
                          ({position.unrealizedPnLPercent >= 0 ? "+" : ""}
                          {position.unrealizedPnLPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade History */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <History className="h-5 w-5 mr-2 text-primary-600" />
            Trade History ({portfolio.trades.length})
          </h3>

          {portfolio.trades.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No trades executed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50">
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                      Symbol
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                      P&L
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {portfolio.trades
                    .slice()
                    .reverse()
                    .map((trade, index) => (
                      <tr
                        key={trade.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {trade.timestamp.toLocaleDateString()}{" "}
                          {trade.timestamp.toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {trade.symbol}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              trade.type === "BUY"
                                ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
                                : "bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200"
                            }`}
                          >
                            {trade.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                          {trade.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                          ${trade.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          ${trade.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {trade.pnl !== undefined ? (
                            <span
                              className={
                                trade.pnl >= 0
                                  ? "text-success-500"
                                  : "text-danger-500"
                              }
                            >
                              ${trade.pnl.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
