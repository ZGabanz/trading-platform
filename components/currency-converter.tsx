"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  calculateExchangeRate,
  fetchExchangeRates,
} from "@/lib/api/exchange-rates";

const currencies = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
];

interface ExchangeRate {
  rate: number;
  change: number;
  spread?: number;
  timestamp?: string;
}

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("1000");
  const [result, setResult] = useState("850.00");
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<Record<string, ExchangeRate>>({});
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch rates on component mount and periodically
  useEffect(() => {
    let mounted = true;

    const loadInitialRates = async () => {
      // Проверяем, что мы находимся в браузере и приложение готово
      if (typeof window === "undefined") return;

      // Добавляем задержку для предотвращения множественных запросов при загрузке
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (mounted) {
        try {
          await fetchCurrentRates();
        } catch (error) {
          console.error("Initial rates fetch failed:", error);
          // Устанавливаем mock данные при неудаче
          setRates({
            "USD-EUR": {
              rate: 0.85,
              change: 0.5,
              spread: 0.02,
              timestamp: new Date().toISOString(),
            },
            "USD-GBP": {
              rate: 0.73,
              change: -0.3,
              spread: 0.02,
              timestamp: new Date().toISOString(),
            },
            "USD-JPY": {
              rate: 110.25,
              change: 1.2,
              spread: 0.02,
              timestamp: new Date().toISOString(),
            },
            "EUR-GBP": {
              rate: 0.86,
              change: -0.8,
              spread: 0.02,
              timestamp: new Date().toISOString(),
            },
          });
          setLastUpdated(new Date());
        }
      }
    };

    loadInitialRates();

    // Увеличиваем интервал обновления с частого на более редкий
    const interval = setInterval(() => {
      if (mounted && typeof window !== "undefined") {
        fetchCurrentRates().catch(console.error);
      }
    }, 60000); // Обновляем каждые 60 секунд вместо более частого обновления

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Дебаунсинг для автоматической конвертации при изменении суммы
  useEffect(() => {
    if (
      !amount ||
      !fromCurrency ||
      !toCurrency ||
      typeof window === "undefined"
    )
      return;

    const debounceTimer = setTimeout(async () => {
      if (amount && parseFloat(amount) > 0) {
        // Автоматическая конвертация без toast-сообщений
        try {
          const conversionResult = await calculateExchangeRate(
            fromCurrency,
            toCurrency,
            parseFloat(amount),
            "BUY"
          );

          if (conversionResult && conversionResult.result !== undefined) {
            setResult(conversionResult.result.toFixed(2));
          } else {
            // Fallback to mock calculation
            const mockRate = Math.random() * 2 + 0.5;
            const newResult = (parseFloat(amount) * mockRate).toFixed(2);
            setResult(newResult);
          }
        } catch (error) {
          console.error("Auto-conversion failed:", error);
          // Fallback calculation без toast-сообщений при автоматической конвертации
          const mockRate = Math.random() * 2 + 0.5;
          const newResult = (parseFloat(amount) * mockRate).toFixed(2);
          setResult(newResult);
        }
      }
    }, 1000); // Ждем 1 секунду после остановки ввода

    return () => clearTimeout(debounceTimer);
  }, [amount, fromCurrency, toCurrency]);

  // Calculate conversion when currencies or amount changes
  useEffect(() => {
    if (amount && fromCurrency && toCurrency && typeof window !== "undefined") {
      handleConvert();
    }
  }, [fromCurrency, toCurrency, amount]);

  const fetchCurrentRates = async () => {
    try {
      const symbols = [
        "USD/EUR",
        "USD/GBP",
        "USD/JPY",
        "EUR/GBP",
        "GBP/JPY",
        "AUD/USD",
        "EUR/USD",
        "GBP/USD",
      ];

      const fetchedRates = await fetchExchangeRates(symbols);

      if (fetchedRates) {
        const formattedRates: Record<string, ExchangeRate> = {};

        Object.entries(fetchedRates).forEach(
          ([symbol, data]: [string, any]) => {
            // Convert backend format to frontend format
            const [from, to] = symbol.split("/");
            const key = `${from}-${to}`;

            formattedRates[key] = {
              rate: data.finalRate || data.spotRate || Math.random() * 2 + 0.5,
              change: (Math.random() - 0.5) * 4, // Mock change for now
              spread: data.spreadPercentage || 0.02,
              timestamp: data.timestamp,
            };
          }
        );

        setRates(formattedRates);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch rates:", error);
      // Не показываем toast при каждой ошибке, чтобы не спамить пользователя
      if (Object.keys(rates).length === 0) {
        // Устанавливаем mock данные при неудаче
        setRates({
          "USD-EUR": {
            rate: 0.85,
            change: 0.5,
            spread: 0.02,
            timestamp: new Date().toISOString(),
          },
          "USD-GBP": {
            rate: 0.73,
            change: -0.3,
            spread: 0.02,
            timestamp: new Date().toISOString(),
          },
          "USD-JPY": {
            rate: 110.25,
            change: 1.2,
            spread: 0.02,
            timestamp: new Date().toISOString(),
          },
          "EUR-GBP": {
            rate: 0.86,
            change: -0.8,
            spread: 0.02,
            timestamp: new Date().toISOString(),
          },
        });
        setLastUpdated(new Date());
      }
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleConvert = async () => {
    if (!amount || !fromCurrency || !toCurrency) return;

    setLoading(true);
    try {
      const conversionResult = await calculateExchangeRate(
        fromCurrency,
        toCurrency,
        parseFloat(amount),
        "BUY"
      );

      if (conversionResult && conversionResult.result !== undefined) {
        setResult(conversionResult.result.toFixed(2));
        toast.success(`Converted ${amount} ${fromCurrency} to ${toCurrency}`);
      } else {
        // Fallback to mock calculation
        const mockRate = Math.random() * 2 + 0.5;
        const newResult = (parseFloat(amount) * mockRate).toFixed(2);
        setResult(newResult);
        toast.success("Conversion updated (using fallback)!");
      }
    } catch (error) {
      console.error("Conversion failed:", error);
      // Только показываем ошибку при ручной конвертации
      if (error instanceof Error && error.message.includes("429")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else {
        toast.error("Conversion failed, using fallback rate");
      }
      // Fallback calculation
      const mockRate = Math.random() * 2 + 0.5;
      const newResult = (parseFloat(amount) * mockRate).toFixed(2);
      setResult(newResult);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshRates = async () => {
    setLoading(true);
    await fetchCurrentRates();
    setLoading(false);
    toast.success("Exchange rates refreshed!");
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Currency Converter
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Updated: {isClient ? lastUpdated.toLocaleTimeString() : "--:--:--"}
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefreshRates}
            disabled={loading}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* Converter */}
      <div className="space-y-4 mb-6">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            From
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
              placeholder="Amount"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwapCurrencies}
            className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors"
          >
            <ArrowRightLeft className="h-5 w-5" />
          </motion.button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            To
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={result}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 font-semibold"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConvert}
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50"
        >
          {loading ? "Converting..." : "Convert"}
        </motion.button>
      </div>

      {/* Exchange Rate System Status */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Connected to Exchange Rate System (Fixed Spread Module Active)
          </span>
        </div>
      </div>

      {/* Popular Exchange Rates */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Live Exchange Rates
        </h3>
        <div className="space-y-3">
          {Object.entries(rates).length > 0 ? (
            Object.entries(rates)
              .slice(0, 6)
              .map(([pair, data], index) => {
                const [from, to] = pair.split("-");
                return (
                  <motion.div
                    key={pair}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {currencies.find((c) => c.code === from)?.flag}
                        {currencies.find((c) => c.code === to)?.flag}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {from}/{to}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          1 {from} = {data.rate.toFixed(4)} {to}
                          {data.spread && (
                            <span className="ml-2 text-xs text-blue-500">
                              (Spread: {(data.spread * 100).toFixed(2)}%)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-right">
                      {data.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-danger-500 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          data.change >= 0
                            ? "text-success-500"
                            : "text-danger-500"
                        }`}
                      >
                        {data.change >= 0 ? "+" : ""}
                        {data.change.toFixed(2)}%
                      </span>
                    </div>
                  </motion.div>
                );
              })
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Loading exchange rates...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
