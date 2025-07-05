"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Star,
  Shield,
  TrendingUp,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  CreditCard,
  Globe,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";

interface Partner {
  id: string;
  name: string;
  type: "BANK" | "BROKER" | "FINTECH" | "CORPORATE";
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "BLOCKED";
  rating: number;
  totalVolume: number;
  completedDeals: number;
  successRate: number;
  averageExecutionTime: number;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    singleDealLimit: number;
  };
  fees: {
    fixedFee: number;
    percentageFee: number;
    minimumFee: number;
  };
  createdAt: string;
  lastActiveAt: string;
  riskScore: number;
  complianceStatus: "APPROVED" | "PENDING" | "REJECTED";
}

interface PartnerStats {
  totalPartners: number;
  activePartners: number;
  pendingPartners: number;
  totalVolume: number;
  averageRating: number;
  topPerformers: Partner[];
}

const statusColors = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  SUSPENDED:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  BLOCKED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const typeColors = {
  BANK: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  BROKER:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  FINTECH:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CORPORATE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
};

export function PartnerCabinet() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    fetchPartners();
    fetchStats();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      // Mock data for development
      setPartners([
        {
          id: "partner_001",
          name: "Alpha Trading Ltd",
          type: "BROKER",
          status: "ACTIVE",
          rating: 4.8,
          totalVolume: 2500000,
          completedDeals: 156,
          successRate: 98.7,
          averageExecutionTime: 1.2,
          contact: {
            email: "trading@alpha.com",
            phone: "+44 20 7123 4567",
            address: "London, UK",
          },
          limits: {
            dailyLimit: 500000,
            monthlyLimit: 10000000,
            singleDealLimit: 100000,
          },
          fees: {
            fixedFee: 50,
            percentageFee: 0.15,
            minimumFee: 25,
          },
          createdAt: "2024-01-15T10:30:00Z",
          lastActiveAt: new Date().toISOString(),
          riskScore: 15,
          complianceStatus: "APPROVED",
        },
        {
          id: "partner_002",
          name: "Beta Bank",
          type: "BANK",
          status: "ACTIVE",
          rating: 4.9,
          totalVolume: 5200000,
          completedDeals: 289,
          successRate: 99.3,
          averageExecutionTime: 0.8,
          contact: {
            email: "fx@betabank.com",
            phone: "+1 212 555 0123",
            address: "New York, USA",
          },
          limits: {
            dailyLimit: 2000000,
            monthlyLimit: 50000000,
            singleDealLimit: 500000,
          },
          fees: {
            fixedFee: 100,
            percentageFee: 0.1,
            minimumFee: 50,
          },
          createdAt: "2023-11-20T14:15:00Z",
          lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
          riskScore: 8,
          complianceStatus: "APPROVED",
        },
        {
          id: "partner_003",
          name: "Gamma Fintech",
          type: "FINTECH",
          status: "PENDING",
          rating: 4.2,
          totalVolume: 0,
          completedDeals: 0,
          successRate: 0,
          averageExecutionTime: 0,
          contact: {
            email: "partnerships@gamma.io",
            phone: "+49 30 1234 5678",
            address: "Berlin, Germany",
          },
          limits: {
            dailyLimit: 100000,
            monthlyLimit: 2000000,
            singleDealLimit: 50000,
          },
          fees: {
            fixedFee: 25,
            percentageFee: 0.2,
            minimumFee: 15,
          },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
          riskScore: 25,
          complianceStatus: "PENDING",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch partners:", error);
      toast.error("Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats for development
      setStats({
        totalPartners: 3,
        activePartners: 2,
        pendingPartners: 1,
        totalVolume: 7700000,
        averageRating: 4.6,
        topPerformers: partners.slice(0, 3),
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || partner.status === statusFilter;
    const matchesType = typeFilter === "ALL" || partner.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Partner Cabinet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your trading partners and counterparties
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Partner</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Partners
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalPartners}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Partners
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.activePartners}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingPartners}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Volume
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${(stats.totalVolume / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Rating
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.averageRating.toFixed(1)}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-100"
          >
            <option value="ALL">All Types</option>
            <option value="BANK">Bank</option>
            <option value="BROKER">Broker</option>
            <option value="FINTECH">Fintech</option>
            <option value="CORPORATE">Corporate</option>
          </select>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Loading partners...
            </span>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No partners found
          </div>
        ) : (
          filteredPartners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {partner.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        typeColors[partner.type]
                      }`}
                    >
                      {partner.type}
                    </span>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[partner.status]
                  }`}
                >
                  {partner.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rating
                  </span>
                  {renderStarRating(partner.rating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Volume
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ${(partner.totalVolume / 1000000).toFixed(1)}M
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Success Rate
                  </span>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    {partner.successRate.toFixed(1)}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Risk Score
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      partner.riskScore <= 10
                        ? "text-green-600 dark:text-green-400"
                        : partner.riskScore <= 20
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {partner.riskScore}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPartner(partner)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {partner.completedDeals} deals
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Partner Details Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedPartner.name}
              </h3>
              <button
                onClick={() => setSelectedPartner(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Basic Information
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Type
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        typeColors[selectedPartner.type]
                      }`}
                    >
                      {selectedPartner.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[selectedPartner.status]
                      }`}
                    >
                      {selectedPartner.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Rating
                    </span>
                    {renderStarRating(selectedPartner.rating)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Risk Score
                    </span>
                    <span
                      className={`font-medium ${
                        selectedPartner.riskScore <= 10
                          ? "text-green-600 dark:text-green-400"
                          : selectedPartner.riskScore <= 20
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {selectedPartner.riskScore}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedPartner.contact.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedPartner.contact.phone}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {selectedPartner.contact.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Performance
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedPartner.completedDeals}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Deals
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {selectedPartner.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(selectedPartner.totalVolume / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Volume
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedPartner.averageExecutionTime.toFixed(1)}s
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Avg Time
                    </div>
                  </div>
                </div>
              </div>

              {/* Limits & Fees */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Limits & Fees
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Daily Limit
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${selectedPartner.limits.dailyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Monthly Limit
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${selectedPartner.limits.monthlyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Fixed Fee
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      ${selectedPartner.fees.fixedFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Percentage Fee
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedPartner.fees.percentageFee}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
              <button className="btn-primary">Edit Partner</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
