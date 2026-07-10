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

  const tooltipStyle = {
    backgroundColor: "#16161A",
    border: "1px solid #27272A",
    borderRadius: "12px",
    color: "#F5F5F5",
  };

  return (
    <main className="min-h-screen bg-[#0A0A0B] p-6 md:p-10 font-[Inter]">
      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-[Space_Grotesk] tracking-tight">
          Analytics
        </h1>

        <p className="text-[#9CA3AF] mt-3 text-lg">
          Monitor platform revenue,
          payments, and subscription
          performance.
        </p>
      </div>

      {!analytics ? (
        <p className="text-[#9CA3AF]">Loading analytics...</p>
      ) : (
        <>
          {/* KPI CARDS */}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <div className="bg-[#16161A] rounded-3xl p-6 border border-[#27272A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF]">
                    Total Revenue
                  </p>

                  <h2 className="text-3xl font-bold text-white mt-3 font-[JetBrains_Mono]">
                    ₦{analytics.totalRevenue}
                  </h2>
                </div>

                <div className="bg-[#F5C518]/10 p-4 rounded-2xl">
                  <Wallet className="text-[#F5C518]" />
                </div>
              </div>
            </div>

            <div className="bg-[#16161A] rounded-3xl p-6 border border-[#27272A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF]">
                    Monthly Recurring Revenue
                  </p>

                  <h2 className="text-3xl font-bold text-white mt-3 font-[JetBrains_Mono]">
                    ₦{analytics.monthlyRecurringRevenue}
                  </h2>
                </div>

                <div className="bg-[#F5C518]/10 p-4 rounded-2xl">
                  <Repeat className="text-[#F5C518]" />
                </div>
              </div>
            </div>

            <div className="bg-[#16161A] rounded-3xl p-6 border border-[#27272A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF]">
                    Total Payments
                  </p>

                  <h2 className="text-3xl font-bold text-white mt-3 font-[JetBrains_Mono]">
                    {analytics.totalPayments}
                  </h2>
                </div>

                <div className="bg-[#F5C518]/10 p-4 rounded-2xl">
                  <CreditCard className="text-[#F5C518]" />
                </div>
              </div>
            </div>

            <div className="bg-[#16161A] rounded-3xl p-6 border border-[#27272A]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9CA3AF]">
                    Success Rate
                  </p>

                  <h2 className="text-3xl font-bold text-white mt-3 font-[JetBrains_Mono]">
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

                <div className="bg-[#F5C518]/10 p-4 rounded-2xl">
                  <TrendingUp className="text-[#F5C518]" />
                </div>
              </div>
            </div>
          </div>

          {/* REVENUE CHART */}

          <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A] mb-10">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white font-[Space_Grotesk]">
                Revenue Trend
              </h2>

              <p className="text-[#9CA3AF] mt-2">
                Last 14 days of revenue from successful payments.
              </p>
            </div>

            <div className="h-[400px]">
              {chartData.every((point) => point.revenue === 0) ? (
                <div className="h-full flex items-center justify-center text-[#5C5C63]">
                  No revenue recorded in the last 14 days.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />

                    <XAxis dataKey="day" stroke="#9CA3AF" />

                    <YAxis stroke="#9CA3AF" />

                    <Tooltip contentStyle={tooltipStyle} />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#F5C518"
                      strokeWidth={3}
                      dot={{ r: 3, fill: "#F5C518" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* BREAKDOWN CHARTS */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A]">
              <h2 className="text-xl font-bold text-white mb-6 font-[Space_Grotesk]">
                Payment Status Breakdown
              </h2>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis dataKey="label" stroke="#9CA3AF" />
                    <YAxis allowDecimals={false} stroke="#9CA3AF" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#F5C518" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A]">
              <h2 className="text-xl font-bold text-white mb-6 font-[Space_Grotesk]">
                Subscription Status Breakdown
              </h2>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subscriptionBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                    <XAxis dataKey="label" stroke="#9CA3AF" />
                    <YAxis allowDecimals={false} stroke="#9CA3AF" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="#34D399" radius={[8, 8, 0, 0]} />
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