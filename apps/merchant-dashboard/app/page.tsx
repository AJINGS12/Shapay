"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "../lib/api";
import Link from "next/link";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

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
  Menu,
  X,
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

type Insight = {
  title: string;
  description: string;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  const [aiInsights, setAiInsights] = useState<Insight[]>([]);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [activities, setActivities] =
    useState<ActivityItem[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const [simulating, setSimulating] = useState(false);

  const simulateFailure = async () => {
    if (simulating) return;

    setSimulating(true);

    try {
      await api.post("/simulate/payment-failure");
      window.location.reload();
    } catch (error) {
      console.log(error);
      setSimulating(false);
    }
  };

  const createCheckout = () => {
    router.push("/payment-test");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      const fetchAnalytics = async () => {
        try {
          const response = await api.get("/analytics/overview");
          setAnalytics(response.data.analytics);

          const analyticsData = response.data.analytics;
          const insights: Insight[] = [];

          if (analyticsData.totalRevenue > 0) {
            insights.push({
              title: "Revenue Activity",
              description: `Your platform has processed ₦${analyticsData.totalRevenue} in total revenue.`,
            });
          }

          const successRate =
            analyticsData.totalPayments === 0
              ? 0
              : Math.round(
                  (analyticsData.successfulPayments /
                    analyticsData.totalPayments) *
                    100
                );

          if (successRate >= 90) {
            insights.push({
              title: "Healthy Payment Performance",
              description: `Payment success rate is performing strongly at ${successRate}%.`,
            });
          } else {
            insights.push({
              title: "Payment Performance Alert",
              description:
                "Payment success rate may require operational review.",
            });
          }

          if (analyticsData.activeSubscriptions > 0) {
            insights.push({
              title: "Recurring Revenue Growth",
              description: `${analyticsData.activeSubscriptions} active subscriptions are generating recurring revenue.`,
            });
          }

          if (analyticsData.failedPayments === 0) {
            insights.push({
              title: "Low Failure Rate",
              description: "No failed payments detected recently.",
            });
          }

          setAiInsights(insights);

          const paymentsResponse = await api.get("/reports/payments");
          setPayments(paymentsResponse.data.payments);

          const activitiesResponse = await api.get("/reports/activity");
          setActivities(activitiesResponse.data.activities);
        } catch (error) {
          console.log(error);
        }
      };

      fetchAnalytics();
    });

    return () => unsubscribe();
  }, [router]);

  const revenueData = payments.reduce((acc: any[], payment) => {
    const month = new Date(payment.createdAt).toLocaleString("default", {
      month: "short",
    });

    const existingMonth = acc.find((item) => item.month === month);

    if (existingMonth) {
      existingMonth.revenue += payment.amount;
    } else {
      acc.push({
        month,
        revenue: payment.amount,
      });
    }

    return acc;
  }, []);

  if (!analytics) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
        <p className="text-[#9CA3AF] text-xl font-[Inter]">
          Loading Dashboard...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] flex font-[Inter]">
      {/* MOBILE BACKDROP */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0F0F11] border-r border-[#27272A] p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-[#F5C518] font-[Space_Grotesk] tracking-tight">
            Shapay
          </h1>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#9CA3AF] hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 bg-[#F5C518] text-black p-4 rounded-2xl font-semibold"
          >
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </Link>

          <Link
            href="/payments"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 text-[#9CA3AF] p-4 rounded-2xl hover:bg-[#1C1C21] hover:text-white cursor-pointer transition"
          >
            <CreditCard size={20} />
            <span>Payments</span>
          </Link>

          <Link
            href="/subscriptions"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 text-[#9CA3AF] p-4 rounded-2xl hover:bg-[#1C1C21] hover:text-white cursor-pointer transition"
          >
            <Repeat size={20} />
            <span>Subscriptions</span>
          </Link>

          <Link
            href="/activity"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 text-[#9CA3AF] p-4 rounded-2xl hover:bg-[#1C1C21] hover:text-white cursor-pointer transition"
          >
            <Activity size={20} />
            <span>Activity</span>
          </Link>

          <Link
            href="/analytics"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 text-[#9CA3AF] p-4 rounded-2xl hover:bg-[#1C1C21] hover:text-white cursor-pointer transition"
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </Link>

          <Link
            href="/settings"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 text-[#9CA3AF] p-4 rounded-2xl hover:bg-[#1C1C21] hover:text-white cursor-pointer transition"
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}

      <section className="flex-1 p-4 md:p-10">
        {/* HEADER */}

        <div className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden bg-[#16161A] border border-[#27272A] text-[#9CA3AF] p-3 rounded-2xl"
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white font-[Space_Grotesk] tracking-tight">
                Welcome back 👋
              </h2>

              <p className="text-[#9CA3AF] mt-1 md:mt-3 text-sm md:text-lg">
                Here’s what’s happening with your business today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block bg-[#16161A] border border-[#27272A] text-white px-6 py-4 rounded-2xl font-semibold hover:bg-[#1C1C21] transition">
              Merchant
            </button>

            <button
              onClick={handleLogout}
              className="bg-[#F5C518] hover:bg-[#e0b512] transition text-black px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        {paymentStatus === "success" && (
          <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 text-[#F5C518] rounded-2xl p-5 mb-8">
            Payment completed successfully!
          </div>
        )}

        {paymentStatus === "pending" && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-2xl p-5 mb-8">
            Payment is still processing. Please refresh in a moment.
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-5 mb-8">
            Something went wrong confirming your payment.
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={createCheckout}
            className="bg-[#F5C518] hover:bg-[#e0b512] transition text-black px-6 py-4 rounded-2xl font-semibold"
          >
            Generate Payment Checkout
          </button>

          <button
            onClick={simulateFailure}
            disabled={simulating}
            className="bg-transparent border border-red-500/50 hover:bg-red-500/10 transition text-red-400 px-6 py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {simulating ? "Simulating..." : "Simulate Failed Payment"}
          </button>
        </div>

        {/* KPI CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[#27272A]">
            <p className="text-[#9CA3AF] text-sm md:text-base">
              Total Revenue
            </p>

            <h3 className="text-2xl md:text-4xl font-bold text-white mt-2 md:mt-4 font-[JetBrains_Mono]">
              ₦{analytics.totalRevenue}
            </h3>
          </div>

          <div className="bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[#27272A]">
            <p className="text-[#9CA3AF] text-sm md:text-base">
              Monthly Recurring Revenue
            </p>

            <h3 className="text-2xl md:text-4xl font-bold text-white mt-2 md:mt-4 font-[JetBrains_Mono]">
              ₦{analytics.monthlyRecurringRevenue}
            </h3>
          </div>

          <div className="bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[#27272A]">
            <p className="text-[#9CA3AF] text-sm md:text-base">
              Active Subscriptions
            </p>

            <h3 className="text-2xl md:text-4xl font-bold text-white mt-2 md:mt-4 font-[JetBrains_Mono]">
              {analytics.activeSubscriptions}
            </h3>
          </div>

          <div className="bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[#27272A]">
            <p className="text-[#9CA3AF] text-sm md:text-base">
              Total Payments
            </p>

            <h3 className="text-2xl md:text-4xl font-bold text-white mt-2 md:mt-4 font-[JetBrains_Mono]">
              {analytics.totalPayments}
            </h3>
          </div>

          <div className="bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[#27272A]">
            <p className="text-[#9CA3AF] text-sm md:text-base">
              Successful Payments
            </p>

            <h3 className="text-2xl md:text-4xl font-bold text-emerald-400 mt-2 md:mt-4 font-[JetBrains_Mono]">
              {analytics.successfulPayments}
            </h3>
          </div>

          <div className="bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[#27272A]">
            <p className="text-[#9CA3AF] text-sm md:text-base">
              Failed Payments
            </p>

            <h3 className="text-2xl md:text-4xl font-bold text-red-400 mt-2 md:mt-4 font-[JetBrains_Mono]">
              {analytics.failedPayments}
            </h3>
          </div>
        </div>

        {/* AI INSIGHTS */}

        <div className="mt-8 md:mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl md:text-3xl font-bold text-white font-[Space_Grotesk]">
                AI Financial Insights
              </h3>

              <p className="text-[#9CA3AF] mt-1 md:mt-2 text-sm md:text-base">
                Intelligent operational insights powered by Shapay AI.
              </p>
            </div>

            <div className="bg-[#F5C518] text-black px-4 py-2 md:px-5 md:py-3 rounded-2xl font-semibold text-sm md:text-base self-start">
              AI Powered
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {aiInsights.map((insight, index) => (
              <div
                key={index}
                className="bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-7 border border-[#27272A]"
              >
                <div className="bg-[#F5C518]/10 text-[#F5C518] text-xs md:text-sm font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full inline-block mb-4 md:mb-5">
                  AI Insight
                </div>

                <h4 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">
                  {insight.title}
                </h4>

                <p className="text-[#9CA3AF] text-sm md:text-base leading-6 md:leading-7">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CHART SECTION */}

        <div className="mt-8 md:mt-10 bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-8 border border-[#27272A]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-white font-[Space_Grotesk]">
                Revenue Overview
              </h3>

              <p className="text-[#9CA3AF] mt-1 text-sm md:text-base">
                Revenue analytics and recurring billing growth.
              </p>
            </div>

            <Link
              href="/analytics"
              className="bg-[#F5C518] text-black px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-sm md:text-base w-full sm:w-auto text-center font-semibold hover:bg-[#e0b512] transition"
            >
              View Analytics
            </Link>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F5C518" stopOpacity={0.4} />

                    <stop offset="95%" stopColor="#F5C518" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="month" stroke="#9CA3AF" />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#16161A",
                    border: "1px solid #27272A",
                    borderRadius: "12px",
                    color: "#F5F5F5",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#F5C518"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAYMENTS TABLE */}

        <div className="mt-8 md:mt-10 bg-[#16161A] rounded-2xl md:rounded-3xl p-5 md:p-8 border border-[#27272A]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-white font-[Space_Grotesk]">
                Recent Payments
              </h3>

              <p className="text-[#9CA3AF] mt-1 text-sm md:text-base">
                Latest merchant transactions.
              </p>
            </div>
          </div>

          {/* MOBILE CARD LIST */}
          <div className="md:hidden space-y-3">
            {payments.map((payment, index) => (
              <div
                key={index}
                className="border border-[#27272A] rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium text-sm">
                    {payment.customerName}
                  </p>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      payment.status === "paid"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <p className="text-white font-semibold font-[JetBrains_Mono]">
                    ₦{payment.amount}
                  </p>

                  <p className="text-[#9CA3AF] text-xs">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#27272A]">
                  <th className="pb-4 text-[#9CA3AF] font-normal">Customer</th>

                  <th className="pb-4 text-[#9CA3AF] font-normal">Amount</th>

                  <th className="pb-4 text-[#9CA3AF] font-normal">Status</th>

                  <th className="pb-4 text-[#9CA3AF] font-normal">Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment, index) => (
                  <tr key={index} className="border-b border-[#1C1C21]">
                    <td className="py-5 text-white font-medium">
                      {payment.customerName}
                    </td>

                    <td className="py-5 text-white font-[JetBrains_Mono]">
                      ₦{payment.amount}
                    </td>

                    <td className="py-5">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          payment.status === "paid"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="py-5 text-[#9CA3AF]">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTIVITY FEED */}

        <div className="mt-10 bg-[#16161A] rounded-3xl p-8 border border-[#27272A]">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white font-[Space_Grotesk]">
              Activity Feed
            </h3>

            <p className="text-[#9CA3AF] mt-1">
              Recent merchant events and operational activity.
            </p>
          </div>

          <div className="space-y-4">
            {activities.slice(0, 6).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-[#27272A] rounded-2xl p-5"
              >
                <div>
                  <p className="font-semibold text-white">
                    {activity.customerName}
                  </p>

                  <p className="text-[#9CA3AF] text-sm mt-1">
                    {activity.type} • {activity.status}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white font-[JetBrains_Mono]">
                    ₦{activity.amount}
                  </p>

                  <p className="text-sm text-[#9CA3AF] mt-1">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
          <p className="text-[#9CA3AF] text-xl">Loading Dashboard...</p>
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}