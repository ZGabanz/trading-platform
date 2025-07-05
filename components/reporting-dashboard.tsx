"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Eye,
  Mail,
  Bell,
  Target,
  Activity,
  Zap,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

interface Report {
  id: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
  title: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    totalVolume: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    successRate: number;
    totalDeals: number;
    averageExecutionTime: number;
    riskExposure: number;
  };
  deltaAnalysis: {
    currencyDeltas: Array<{
      currency: string;
      delta: number;
      exposure: number;
      riskLevel: "LOW" | "MEDIUM" | "HIGH";
    }>;
    totalDelta: number;
    maxExposure: number;
  };
  alerts: Array<{
    id: string;
    type: "RISK" | "PROFIT" | "VOLUME" | "SYSTEM";
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
  createdAt: string;
  status: "GENERATING" | "READY" | "SENT" | "FAILED";
}

interface ReportingStats {
  totalReports: number;
  automatedReports: number;
  totalAlerts: number;
  criticalAlerts: number;
  lastReportGenerated: string;
  systemHealth: number;
}

const reportTypeColors = {
  DAILY: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  WEEKLY:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  MONTHLY:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  CUSTOM: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

const alertSeverityColors = {
  LOW: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const riskLevelColors = {
  LOW: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export function ReportingDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<
    "reports" | "alerts" | "analytics"
  >("reports");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Mock data for development
      setReports([
        {
          id: "report_001",
          type: "DAILY",
          title: "Daily P&L Report - " + new Date().toLocaleDateString(),
          period: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          metrics: {
            totalVolume: 2450000,
            totalProfit: 12750,
            totalLoss: -2100,
            netProfit: 10650,
            successRate: 94.2,
            totalDeals: 48,
            averageExecutionTime: 1.8,
            riskExposure: 15.2,
          },
          deltaAnalysis: {
            currencyDeltas: [
              {
                currency: "USD",
                delta: 125000,
                exposure: 8.5,
                riskLevel: "LOW",
              },
              {
                currency: "EUR",
                delta: -45000,
                exposure: 12.3,
                riskLevel: "MEDIUM",
              },
              {
                currency: "GBP",
                delta: 78000,
                exposure: 6.7,
                riskLevel: "LOW",
              },
              {
                currency: "JPY",
                delta: -23000,
                exposure: 18.9,
                riskLevel: "HIGH",
              },
            ],
            totalDelta: 135000,
            maxExposure: 18.9,
          },
          alerts: [
            {
              id: "alert_001",
              type: "RISK",
              severity: "MEDIUM",
              message: "JPY exposure exceeds 15% threshold",
              timestamp: new Date(
                Date.now() - 2 * 60 * 60 * 1000
              ).toISOString(),
              resolved: false,
            },
            {
              id: "alert_002",
              type: "PROFIT",
              severity: "LOW",
              message: "Daily profit target achieved",
              timestamp: new Date(
                Date.now() - 4 * 60 * 60 * 1000
              ).toISOString(),
              resolved: true,
            },
          ],
          createdAt: new Date().toISOString(),
          status: "READY",
        },
        {
          id: "report_002",
          type: "WEEKLY",
          title: "Weekly Performance Summary",
          period: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          metrics: {
            totalVolume: 15750000,
            totalProfit: 87500,
            totalLoss: -12300,
            netProfit: 75200,
            successRate: 96.8,
            totalDeals: 312,
            averageExecutionTime: 1.6,
            riskExposure: 12.8,
          },
          deltaAnalysis: {
            currencyDeltas: [
              {
                currency: "USD",
                delta: 890000,
                exposure: 7.2,
                riskLevel: "LOW",
              },
              {
                currency: "EUR",
                delta: -234000,
                exposure: 9.8,
                riskLevel: "LOW",
              },
              {
                currency: "GBP",
                delta: 456000,
                exposure: 5.4,
                riskLevel: "LOW",
              },
              {
                currency: "JPY",
                delta: -178000,
                exposure: 14.2,
                riskLevel: "MEDIUM",
              },
            ],
            totalDelta: 934000,
            maxExposure: 14.2,
          },
          alerts: [
            {
              id: "alert_003",
              type: "SYSTEM",
              severity: "HIGH",
              message: "API latency spike detected",
              timestamp: new Date(
                Date.now() - 24 * 60 * 60 * 1000
              ).toISOString(),
              resolved: true,
            },
          ],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: "SENT",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for development
      setStats({
        totalReports: 156,
        automatedReports: 142,
        totalAlerts: 23,
        criticalAlerts: 2,
        lastReportGenerated: new Date().toISOString(),
        systemHealth: 98.5,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const generateReport = async (
    type: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM"
  ) => {
    try {
      toast.success(`Generating ${type.toLowerCase()} report...`);
      // API call would go here
      setTimeout(() => {
        toast.success("Report generated successfully!");
        fetchReports();
      }, 2000);
    } catch (error) {
      console.error("Failed to generate report:", error);
      toast.error("Failed to generate report");
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      toast.success("Downloading report...");
      // API call would go here
    } catch (error) {
      console.error("Failed to download report:", error);
      toast.error("Failed to download report");
    }
  };

  const sendReport = async (reportId: string, recipients: string[]) => {
    try {
      toast.success("Sending report...");
      // API call would go here
    } catch (error) {
      console.error("Failed to send report:", error);
      toast.error("Failed to send report");
    }
  };

  const allAlerts = reports.flatMap((report) => report.alerts);
  const unresolvedAlerts = allAlerts.filter((alert) => !alert.resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reporting Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automated reports, delta analysis, and system alerts
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => generateReport("DAILY")}
            className="btn-secondary flex items-center space-x-2"
          >
            <FileText className="h-4 w-4" />
            <span>Generate Report</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export All</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Reports
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalReports}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automated
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.automatedReports}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Alerts
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.totalAlerts}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Critical
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.criticalAlerts}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  System Health
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.systemHealth.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Last Report
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(stats.lastReportGenerated).toLocaleDateString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "alerts"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Alerts ({unresolvedAlerts.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "analytics"
                ? "border-primary-500 text-primary-600 dark:text-primary-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                Loading reports...
              </span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No reports found
            </div>
          ) : (
            reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(report.period.start).toLocaleDateString()} -{" "}
                        {new Date(report.period.end).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        reportTypeColors[report.type]
                      }`}
                    >
                      {report.type}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === "READY"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : report.status === "SENT"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                          : report.status === "GENERATING"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${(report.metrics.totalVolume / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Volume
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div
                      className={`text-lg font-semibold ${
                        report.metrics.netProfit > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ${report.metrics.netProfit.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Net P&L
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {report.metrics.successRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {report.metrics.totalDeals}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Deals
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Delta: ${report.deltaAnalysis.totalDelta.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Max Exposure:{" "}
                      {report.deltaAnalysis.maxExposure.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Alerts: {report.alerts.length}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => downloadReport(report.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() =>
                        sendReport(report.id, ["admin@company.com"])
                      }
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {allAlerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No alerts found
            </div>
          ) : (
            allAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card p-4 border-l-4 ${
                  alert.severity === "CRITICAL"
                    ? "border-red-500"
                    : alert.severity === "HIGH"
                    ? "border-orange-500"
                    : alert.severity === "MEDIUM"
                    ? "border-yellow-500"
                    : "border-green-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        alert.severity === "CRITICAL"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : alert.severity === "HIGH"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : alert.severity === "MEDIUM"
                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                          : "bg-green-100 dark:bg-green-900/30"
                      }`}
                    >
                      {alert.type === "RISK" ? (
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            alert.severity === "CRITICAL"
                              ? "text-red-600 dark:text-red-400"
                              : alert.severity === "HIGH"
                              ? "text-orange-600 dark:text-orange-400"
                              : alert.severity === "MEDIUM"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-green-600 dark:text-green-400"
                          }`}
                        />
                      ) : alert.type === "PROFIT" ? (
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : alert.type === "VOLUME" ? (
                        <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.message}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alertSeverityColors[alert.severity]
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.resolved
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {alert.resolved ? "RESOLVED" : "ACTIVE"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profit & Loss Trend
            </h3>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Chart placeholder
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Currency Exposure
            </h3>
            <div className="h-64 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Chart placeholder
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Risk Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Value at Risk (VaR)
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  $125,000
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Maximum Drawdown
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -2.3%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Sharpe Ratio
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  1.85
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Correlation Risk
                </span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  Medium
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Return
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +15.7%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Win Rate
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  94.2%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Avg. Trade Duration
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  1.8 min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Profit Factor
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  6.07
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedReport.title}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Metrics Overview */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      $
                      {(selectedReport.metrics.totalVolume / 1000000).toFixed(
                        1
                      )}
                      M
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Volume
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${
                        selectedReport.metrics.netProfit > 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      ${selectedReport.metrics.netProfit.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Net P&L
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedReport.metrics.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedReport.metrics.totalDeals}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Total Deals
                    </div>
                  </div>
                </div>
              </div>

              {/* Delta Analysis */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Currency Delta Analysis
                </h4>
                <div className="space-y-3">
                  {selectedReport.deltaAnalysis.currencyDeltas.map(
                    (delta, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {delta.currency}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              riskLevelColors[delta.riskLevel]
                            }`}
                          >
                            {delta.riskLevel}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div
                              className={`font-semibold ${
                                delta.delta > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              ${delta.delta.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {delta.exposure.toFixed(1)}% exposure
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Alerts */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Alerts
                </h4>
                <div className="space-y-2">
                  {selectedReport.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {alert.message}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alertSeverityColors[alert.severity]
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.resolved
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {alert.resolved ? "RESOLVED" : "ACTIVE"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => downloadReport(selectedReport.id)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() =>
                  sendReport(selectedReport.id, ["admin@company.com"])
                }
                className="btn-primary flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Send Report</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
