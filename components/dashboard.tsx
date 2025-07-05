"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MarketOverview } from "./market-overview";
import { PortfolioSummary } from "./portfolio-summary";
import { CurrencyConverter } from "./currency-converter";
import { TradingChart } from "./trading-chart";
import { Watchlist } from "./watchlist";
import { NewsFeeds } from "./news-feeds";
import { PriceAlerts } from "./price-alerts";
import { PerformanceMetrics } from "./performance-metrics";
import { SystemStatus } from "./system-status";
import { DealManagement } from "./deal-management";
import { PartnerCabinet } from "./partner-cabinet";
import { P2PAutomation } from "./p2p-automation";
import { ReportingDashboard } from "./reporting-dashboard";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "exchange":
        return <ExchangeContent />;
      case "deals":
        return <DealManagement />;
      case "partner":
        return <PartnerCabinet />;
      case "p2p":
        return <P2PAutomation />;
      case "reports":
        return <ReportingDashboard />;
      case "market":
        return <MarketAnalysisContent />;
      case "portfolio":
        return <PortfolioContent />;
      case "risk":
        return <RiskManagementContent />;
      case "monitor":
        return <SystemMonitorContent />;
      case "global":
        return <GlobalMarketsContent />;
      case "news":
        return <NewsContent />;
      case "alerts":
        return <AlertsContent />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent() {
  return (
    <>
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Financial Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's your portfolio overview and market insights.
        </p>
      </motion.div>

      {/* Dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Portfolio Summary - spans 2 columns on large screens */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <PortfolioSummary />
        </motion.div>

        {/* Currency Converter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CurrencyConverter />
        </motion.div>
      </div>

      {/* Market Overview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <MarketOverview />
      </motion.div>

      {/* System Status and Trading Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <SystemStatus />
        </motion.div>

        {/* Trading Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <TradingChart />
        </motion.div>
      </div>

      {/* Trading Chart and Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
        >
          <TradingChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <PerformanceMetrics />
        </motion.div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Watchlist />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <PriceAlerts />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <NewsFeeds />
        </motion.div>
      </div>
    </>
  );
}

// Exchange Content Component
function ExchangeContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Currency Exchange
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Exchange currencies with real-time rates and advanced features.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrencyConverter />
        <TradingChart />
      </div>

      <MarketOverview />
    </motion.div>
  );
}

// Market Analysis Content Component
function MarketAnalysisContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Market Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Advanced market analysis tools and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TradingChart />
        </div>
        <div className="space-y-6">
          <PerformanceMetrics />
          <Watchlist />
        </div>
      </div>

      <MarketOverview />
    </motion.div>
  );
}

// Portfolio Content Component
function PortfolioContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Portfolio Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your investment portfolio and track performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioSummary />
        <PerformanceMetrics />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TradingChart />
        <Watchlist />
      </div>
    </motion.div>
  );
}

// Risk Management Content Component
function RiskManagementContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Risk Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage portfolio risks with advanced analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Analytics Dashboard
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  15%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Portfolio Risk
                </div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  2.3
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sharpe Ratio
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  12%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Max Drawdown
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  0.85
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Beta
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <PriceAlerts />
          <SystemStatus />
        </div>
      </div>
    </motion.div>
  );
}

// System Monitor Content Component
function SystemMonitorContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          System Monitor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor system health and performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemStatus />
        <PerformanceMetrics />
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Health Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              99.9%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Uptime
            </div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              45ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Latency
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              1.2k
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Req/sec
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              78%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              CPU Usage
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Global Markets Content Component
function GlobalMarketsContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Global Markets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor global financial markets and international trends.
        </p>
      </div>

      <MarketOverview />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TradingChart />
        <Watchlist />
      </div>
    </motion.div>
  );
}

// News Content Component
function NewsContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          News & Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay updated with the latest financial news and market insights.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <NewsFeeds />
        </div>
        <div className="space-y-6">
          <MarketOverview />
          <PriceAlerts />
        </div>
      </div>
    </motion.div>
  );
}

// Alerts Content Component
function AlertsContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Price Alerts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your price alerts and notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceAlerts />
        <SystemStatus />
      </div>
    </motion.div>
  );
}

// Settings Content Component
function SettingsContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your application preferences and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Zone
              </label>
              <select className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100">
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
                <option>GMT</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Trading Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Auto-execute orders
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Email notifications
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                SMS alerts
              </span>
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Currency
              </label>
              <select className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
