"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

import {
  TrendingUp,
  CreditCard,
  Repeat,
  Wallet,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type Analytics = {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  activeSubscriptions: number;
  pausedSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
};

type RevenuePoint = {
  day: string;
  revenue: number;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [chartData, setChartData] =
    useState<RevenuePoint[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/analytics/overview");

        setAnalytics(response.data.analytics);
        setChartData(response.data.revenueData || []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAnalytics();
  }, []);

  const paymentBreakdown = analytics
    ? [
        { label: "Successful", value: analytics.successfulPayments },
        { label: "Failed", value: analytics.failedPayments },
        { label: "Pending", value: analytics.pendingPayments },
      ]
    : [];

  const subscriptionBreakdown = analytics
    ? [
        { label: "Active", value: analytics.activeSubscriptions },
        { label: "Paused", value: analytics.pausedSubscriptions },
        { label: "Cancelled", value: analytics.cancelledSubscriptions },
      ]
    : [];

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-10">
      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900">
          Analytics
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          Monitor platform revenue,
          payments, and subscription
          performance.
        </p>
      </div>

      {!analytics ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          {/* KPI CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    Total Revenue
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    ₦{analytics.totalRevenue}
                  </h2>
                </div>

                <div className="bg-blue-100 p-4 rounded-2xl">
                  <Wallet className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    Monthly Recurring Revenue
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    ₦{analytics.monthlyRecurringRevenue}
                  </h2>
                </div>

                <div className="bg-blue-100 p-4 rounded-2xl">
                  <Repeat className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    Total Payments
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    {analytics.totalPayments}
                  </h2>
                </div>

                <div className="bg-blue-100 p-4 rounded-2xl">
                  <CreditCard className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    Success Rate
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    {analytics.totalPayments === 0
                      ? 0
                      : Math.round(
                          (analytics.successfulPayments /
                            analytics.totalPayments) *
                            100
                        )}
                    %
                  </h2>
                </div>

                <div className="bg-blue-100 p-4 rounded-2xl">
                  <TrendingUp className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* REVENUE CHART */}

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Revenue Trend
              </h2>

              <p className="text-gray-500 mt-2">
                Last 14 days of revenue from successful payments.
              </p>
            </div>

            <div className="h-[400px]">
              {chartData.every((point) => point.revenue === 0) ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No revenue recorded in the last 14 days.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />

                    <YAxis />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#2563EB"
                      strokeWidth={4}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* BREAKDOWN CHARTS */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Status Breakdown
              </h2>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Subscription Status Breakdown
              </h2>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subscriptionBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#16A34A" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}