"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

import {
  LayoutDashboard,
  CreditCard,
  Repeat,
  Activity,
  BarChart3,
  Settings,
} from "lucide-react";

type Analytics = {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  activeSubscriptions: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
};

type Payment = {
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
};

type ActivityItem = {
  type: string;
  status: string;
  customerName: string;
  amount: number;
  createdAt: string;
};

export default function Home() {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [activities, setActivities] =
  useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/analytics/overview"
        );

        setAnalytics(response.data.analytics);

        const paymentsResponse =
          await axios.get(
            "http://localhost:5000/reports/payments"
          );

        setPayments(
          paymentsResponse.data.payments
        );

        const activitiesResponse =
          await axios.get(
            "http://localhost:5000/reports/activity"
     );

setActivities(
  activitiesResponse.data.activities
);
      } catch (error) {
        console.log(error);
      }
    };

    fetchAnalytics();
  }, []);

  const revenueData = payments.reduce(
  (acc: any[], payment) => {
    const month = new Date(
      payment.createdAt
    ).toLocaleString("default", {
      month: "short",
    });

    const existingMonth = acc.find(
      (item) => item.month === month
    );

    if (existingMonth) {
      existingMonth.revenue +=
        payment.amount;
    } else {
      acc.push({
        month,
        revenue: payment.amount,
      });
    }

    return acc;
  },
  []
);

  return (
    <main className="min-h-screen bg-[#F5F7FB] flex">
      {/* SIDEBAR */}

      <aside className="w-72 bg-white border-r border-gray-200 p-6">
        <h1 className="text-4xl font-bold text-blue-600 mb-10">
          Shapay
        </h1>

        <nav className="space-y-3">
          <Link
              href="/"
            className="flex items-center gap-3 bg-blue-600 text-white p-4 rounded-2xl"
      >
          <LayoutDashboard size={20} />
           <span>Overview</span>
          </Link>
            
            
          

          <Link
             href="/payments"
            className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition"
            >
            <CreditCard size={20} />
            <span>Payments</span>
          </Link>

          <Link
  href="/subscriptions"
  className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition"
     >
        <Repeat size={20} />
         <span>Subscriptions</span>
          </Link>

          <div className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition">
            <Activity size={20} />
            <span>Activity</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition">
            <BarChart3 size={20} />
            <span>Analytics</span>
          </div>

          <div className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition">
            <Settings size={20} />
            <span>Settings</span>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}

      <section className="flex-1 p-10">
        {/* HEADER */}

        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-5xl font-bold text-gray-900">
              Welcome back 👋
            </h2>

            <p className="text-gray-500 mt-3 text-lg">
              Here’s what’s happening with
              your business today.
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold shadow-lg">
            Export Report
          </button>
        </div>

        {!analytics ? (
          <p className="text-gray-600">
            Loading analytics...
          </p>
        ) : (
          <>
            {/* KPI CARDS */}

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500">
                  Total Revenue
                </p>

                <h3 className="text-4xl font-bold text-gray-900 mt-4">
                  ₦
                  {analytics.totalRevenue}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500">
                  Monthly Recurring Revenue
                </p>

                <h3 className="text-4xl font-bold text-gray-900 mt-4">
                  ₦
                  {
                    analytics.monthlyRecurringRevenue
                  }
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500">
                  Active Subscriptions
                </p>

                <h3 className="text-4xl font-bold text-gray-900 mt-4">
                  {
                    analytics.activeSubscriptions
                  }
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500">
                  Total Payments
                </p>

                <h3 className="text-4xl font-bold text-gray-900 mt-4">
                  {analytics.totalPayments}
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500">
                  Successful Payments
                </p>

                <h3 className="text-4xl font-bold text-green-600 mt-4">
                  {
                    analytics.successfulPayments
                  }
                </h3>
              </div>

              <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500">
                  Failed Payments
                </p>

                <h3 className="text-4xl font-bold text-red-500 mt-4">
                  {analytics.failedPayments}
                </h3>
              </div>
            </div>

            {/* CHART SECTION */}

            <div className="mt-10 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Revenue Overview
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Revenue analytics and
                    recurring billing growth.
                  </p>
                </div>

                <button className="bg-blue-600 text-white px-5 py-3 rounded-xl">
                  View Analytics
                </button>
              </div>

              <div className="h-72">
  <ResponsiveContainer
    width="100%"
    height="100%"
  >
    <AreaChart data={revenueData}>
      <defs>
        <linearGradient
          id="colorRevenue"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="5%"
            stopColor="#2563EB"
            stopOpacity={0.4}
          />

          <stop
            offset="95%"
            stopColor="#2563EB"
            stopOpacity={0}
          />
        </linearGradient>
      </defs>

      <XAxis dataKey="month" />

      <Tooltip />

      <Area
        type="monotone"
        dataKey="revenue"
        stroke="#2563EB"
        strokeWidth={4}
        fillOpacity={1}
        fill="url(#colorRevenue)"
      />
    </AreaChart>
  </ResponsiveContainer>
</div>
            
            
            </div>

            {/* PAYMENTS TABLE */}

            <div className="mt-10 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Recent Payments
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Latest merchant transactions.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-4 text-gray-500">
                        Customer
                      </th>

                      <th className="pb-4 text-gray-500">
                        Amount
                      </th>

                      <th className="pb-4 text-gray-500">
                        Status
                      </th>

                      <th className="pb-4 text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map(
                      (payment, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-50"
                        >
                          <td className="py-5 text-gray-900 font-medium">
                            {
                              payment.customerName
                            }
                          </td>

                          <td className="py-5 text-gray-700">
                            ₦{payment.amount}
                          </td>

                          <td className="py-5">
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-medium ${
                                payment.status ===
                                "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>

                          <td className="py-5 text-gray-500">
                            {new Date(
                              payment.createdAt
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* ACTIVITY FEED */}

<div className="mt-10 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
  <div className="mb-6">
    <h3 className="text-2xl font-bold text-gray-900">
      Activity Feed
    </h3>

    <p className="text-gray-500 mt-1">
      Recent merchant events and
      operational activity.
    </p>
  </div>

  <div className="space-y-4">
    {activities
      .slice(0, 6)
      .map((activity, index) => (
        <div
          key={index}
          className="flex items-center justify-between border border-gray-100 rounded-2xl p-5"
        >
          <div>
            <p className="font-semibold text-gray-900">
              {
                activity.customerName
              }
            </p>

            <p className="text-gray-500 text-sm mt-1">
              {activity.type} •{" "}
              {activity.status}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold text-gray-900">
              ₦{activity.amount}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {new Date(
                activity.createdAt
              ).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
  </div>
</div>
          </>
        )}
      </section>
    </main>
  );
}