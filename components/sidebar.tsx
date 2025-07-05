"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  ArrowLeftRight,
  TrendingUp,
  Briefcase,
  Shield,
  Monitor,
  Globe,
  Bell,
  Settings,
  X,
  Target,
  Zap,
  FileText,
  Users,
  Activity,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({
  isOpen,
  onClose,
  activeSection,
  onSectionChange,
}: SidebarProps) {
  const handleSectionClick = (section: string) => {
    onSectionChange(section);
    // Закрываем sidebar только на мобильных устройствах
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Home,
      description: "Overview and analytics",
    },
    {
      id: "exchange",
      label: "Exchange",
      icon: ArrowLeftRight,
      description: "Currency conversion",
    },
  ];

  const dealManagementItems = [
    {
      id: "deals",
      label: "Deal Management",
      icon: Target,
      description: "Manage trading deals",
    },
    {
      id: "partner",
      label: "Partner Cabinet",
      icon: Users,
      description: "Partner relationships",
    },
    {
      id: "p2p",
      label: "P2P Automation",
      icon: Zap,
      description: "Automated trading",
    },
    {
      id: "reports",
      label: "Reporting",
      icon: FileText,
      description: "Reports & analytics",
    },
  ];

  const analysisItems = [
    {
      id: "market",
      label: "Market Analysis",
      icon: TrendingUp,
      description: "Market insights",
    },
    {
      id: "portfolio",
      label: "Portfolio",
      icon: Briefcase,
      description: "Portfolio management",
    },
    {
      id: "risk",
      label: "Risk Management",
      icon: Shield,
      description: "Risk assessment",
    },
    {
      id: "monitor",
      label: "System Monitor",
      icon: Monitor,
      description: "System health",
    },
  ];

  const globalItems = [
    {
      id: "global",
      label: "Global Markets",
      icon: Globe,
      description: "International markets",
    },
    {
      id: "news",
      label: "News & Insights",
      icon: Activity,
      description: "Market news",
    },
    {
      id: "alerts",
      label: "Price Alerts",
      icon: Bell,
      description: "Notifications",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "App preferences",
    },
  ];

  const renderMenuItem = (item: any) => (
    <motion.button
      key={item.id}
      onClick={() => handleSectionClick(item.id)}
      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
        activeSection === item.id
          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-500"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium">{item.label}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {item.description}
        </div>
      </div>
    </motion.button>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen
            ? 0
            : typeof window !== "undefined" && window.innerWidth >= 1024
            ? 0
            : -300,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-800 shadow-xl z-50 lg:relative lg:translate-x-0 lg:shadow-none"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  ExchangeRate Pro
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Trading Platform
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-6">
              {/* Main Navigation */}
              <div>
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Main
                </h2>
                <div className="space-y-1">{menuItems.map(renderMenuItem)}</div>
              </div>

              {/* Deal Management */}
              <div>
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Deal Management
                </h2>
                <div className="space-y-1">
                  {dealManagementItems.map(renderMenuItem)}
                </div>
              </div>

              {/* Analysis & Risk */}
              <div>
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Analysis & Risk
                </h2>
                <div className="space-y-1">
                  {analysisItems.map(renderMenuItem)}
                </div>
              </div>

              {/* Global & Tools */}
              <div>
                <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Global & Tools
                </h2>
                <div className="space-y-1">
                  {globalItems.map(renderMenuItem)}
                </div>
              </div>
            </nav>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  John Doe
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Premium Trader
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
