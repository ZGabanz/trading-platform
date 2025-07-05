"use client";

import React from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

const newsData = [
  {
    id: 1,
    title: "Federal Reserve Signals Interest Rate Changes",
    summary:
      "The Fed indicates potential shifts in monetary policy affecting market sentiment.",
    time: "2 hours ago",
    source: "Financial Times",
    category: "Monetary Policy",
  },
  {
    id: 2,
    title: "Tech Stocks Rally on AI Developments",
    summary:
      "Major technology companies see significant gains following breakthrough AI announcements.",
    time: "4 hours ago",
    source: "MarketWatch",
    category: "Technology",
  },
  {
    id: 3,
    title: "Energy Sector Volatility Continues",
    summary:
      "Oil prices fluctuate amid geopolitical tensions and supply chain concerns.",
    time: "6 hours ago",
    source: "Reuters",
    category: "Energy",
  },
  {
    id: 4,
    title: "Cryptocurrency Market Update",
    summary:
      "Bitcoin and major altcoins show mixed performance in volatile trading session.",
    time: "8 hours ago",
    source: "CoinDesk",
    category: "Crypto",
  },
];

const categories = ["All", "Technology", "Energy", "Monetary Policy", "Crypto"];

export function NewsFeeds() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
          <Newspaper className="h-6 w-6 mr-2 text-primary-600" />
          Market News
        </h2>
        <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
          View All
        </button>
      </div>

      {/* Category filters */}
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {newsData.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                {news.category}
              </span>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {news.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {news.summary}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">{news.source}</span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{news.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
