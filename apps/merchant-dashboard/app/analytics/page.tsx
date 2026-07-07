"use client";

import { useEffect, useState } from "react";
import axios from "axios";

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
} from "recharts";

type Analytics = {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  activeSubscriptions: number;
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
        const response = await axios.get(
          "http://localhost:5000/analytics/overview"
        );

        setAnalytics(response.data.analytics);

        const revenue =
          response.data.revenueData || [];

        setChartData(revenue);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAnalytics();
  }, []);

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

          <div className="grid grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500">
                    Revenue
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    ₦
                    {
                      analytics.totalRevenue
                    }
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
                    Payments
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    {
                      analytics.totalPayments
                    }
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
                    Subscriptions
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    {
                      analytics.activeSubscriptions
                    }
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
                    Success Rate
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-3">
                    {analytics.totalPayments ===
                    0
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

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Revenue Trend
              </h2>

              <p className="text-gray-500 mt-2">
                Revenue performance over
                time.
              </p>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
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
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </main>
  );
}