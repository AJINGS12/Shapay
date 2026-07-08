"use client";

import { useEffect, useState } from "react";
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

const mockRetryRecommendations = [
  {
    customer: "Ismail",
    retryDelay: "24 Hours",
    reasoning:
      "Customers often top up accounts within 24 hours after insufficient funds.",
  },
  {
    customer: "Sarah",
    retryDelay: "48 Hours",
    reasoning:
      "Retrying after salary cycles improves recovery success rates.",
  },
];

export default function Home() {
  const [analytics, setAnalytics] =
    useState<Analytics | null>(null);

  type Insight = {
  title: string;
  description: string;
};

const [aiInsights, setAiInsights] = useState<Insight[]>([]);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [activities, setActivities] =
  useState<ActivityItem[]>([]);

type RetryRecommendation = {
  customer: string;
  retryDelay: string;
  reasoning: string;
};

const [retryRecommendations, setRetryRecommendations] =
  useState<RetryRecommendation[]>(mockRetryRecommendations);

const [
  recoveryMetrics,
  setRecoveryMetrics,
] = useState<any>(null);

const [sidebarOpen, setSidebarOpen] =
  useState(false);

  const router = useRouter();

  const handleLogout =
  async () => {
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
  const unsubscribe =
    onAuthStateChanged(
      auth,
      (user) => {
        if (!user) {
          router.push("/login");
        }
      }
    );

  return () => unsubscribe();
}, [router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/analytics/overview");

        setAnalytics(response.data.analytics);

        const analyticsData =
  response.data.analytics;

const insights = [];

if (
  analyticsData.totalRevenue > 0
) {
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
    title:
      "Healthy Payment Performance",
    description: `Payment success rate is performing strongly at ${successRate}%.`,
  });
} else {
  insights.push({
    title:
      "Payment Performance Alert",
    description:
      "Payment success rate may require operational review.",
  });
}

if (
  analyticsData.activeSubscriptions >
  0
) {
  insights.push({
    title:
      "Recurring Revenue Growth",
    description: `${analyticsData.activeSubscriptions} active subscriptions are generating recurring revenue.`,
  });
}

if (
  analyticsData.failedPayments === 0
) {
  insights.push({
    title:
      "Low Failure Rate",
    description:
      "No failed payments detected recently.",
  });
}

setAiInsights(insights);

        const paymentsResponse =
          await api.get("/reports/payments");

        setPayments(
          paymentsResponse.data.payments
        );

        const activitiesResponse =
          await api.get("/reports/activity");

setActivities(
  activitiesResponse.data.activities
);

const retryResponse =
  await api.get("/ai/retry-recommendations");

setRetryRecommendations(
  retryResponse.data
    .recommendations
);

const recoveryResponse =
  await api.get("/analytics/recovery");

setRecoveryMetrics(
  recoveryResponse.data.metrics
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

if (!analytics) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-xl">
        Loading Dashboard...
      </p>
    </main>
  );
}

  return (
    <main className="min-h-screen bg-[#F5F7FB] flex">
      {/* MOBILE BACKDROP */}

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-blue-600">
            Shapay
          </h1>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-3">
          <Link
              href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 bg-blue-600 text-white p-4 rounded-2xl"
      >
          <LayoutDashboard size={20} />
           <span>Overview</span>
          </Link>

          <Link
             href="/payments"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition"
            >
            <CreditCard size={20} />
            <span>Payments</span>
          </Link>

          <Link
  href="/subscriptions"
  onClick={() => setSidebarOpen(false)}
  className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition"
     >
        <Repeat size={20} />
         <span>Subscriptions</span>
          </Link>

          <div className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition">
            <Activity size={20} />
            <span>Activity</span>
          </div>

          <Link
            href="/analytics"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition"
         >
          <BarChart3 size={20} />
          <span>Analytics</span>
         </Link>

          <Link
           href="/settings"
           onClick={() => setSidebarOpen(false)}
           className="flex items-center gap-3 text-gray-700 p-4 rounded-2xl hover:bg-blue-50 cursor-pointer transition"
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
              className="md:hidden bg-white border border-gray-200 text-gray-700 p-3 rounded-2xl shadow-sm"
            >
              <Menu size={24} />
            </button>

            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
                Welcome back 👋
              </h2>

              <p className="text-gray-500 mt-1 md:mt-3 text-sm md:text-lg">
                Here’s what’s happening with
                your business today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
          <button className="hidden sm:block bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition">
          Merchant
          </button>

         <button
         onClick={handleLogout}
         className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 md:px-6 py-3 md:py-4 rounded-2xl font-semibold shadow-lg"
        >
        Logout
        </button>
        </div>
        </div>

        {!analytics ? (
          <p className="text-gray-600">
            Loading analytics...
          </p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={createCheckout}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold shadow-lg"
              >
                Generate Payment Checkout
              </button>
            </div>

            {/* KPI CARDS */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm md:text-base">
                  Total Revenue
                </p>

                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2 md:mt-4">
                  ₦
                  {analytics.totalRevenue}
                </h3>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm md:text-base">
                  Monthly Recurring Revenue
                </p>

                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2 md:mt-4">
                  ₦
                  {
                    analytics.monthlyRecurringRevenue
                  }
                </h3>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm md:text-base">
                  Active Subscriptions
                </p>

                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2 md:mt-4">
                  {
                    analytics.activeSubscriptions
                  }
                </h3>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm md:text-base">
                  Total Payments
                </p>

                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2 md:mt-4">
                  {analytics.totalPayments}
                </h3>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm md:text-base">
                  Successful Payments
                </p>

                <h3 className="text-2xl md:text-4xl font-bold text-green-600 mt-2 md:mt-4">
                  {
                    analytics.successfulPayments
                  }
                </h3>
              </div>

              <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 shadow-sm border border-gray-100">
                <p className="text-gray-500 text-sm md:text-base">
                  Failed Payments
                </p>

                <h3 className="text-2xl md:text-4xl font-bold text-red-500 mt-2 md:mt-4">
                  {analytics.failedPayments}
                </h3>
              </div>
            </div>

            {/* AI INSIGHTS */}

<div className="mt-8 md:mt-10">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <h3 className="text-xl md:text-3xl font-bold text-gray-900">
        AI Financial Insights
      </h3>

      <p className="text-gray-500 mt-1 md:mt-2 text-sm md:text-base">
        Intelligent operational insights
        powered by Shapay AI.
      </p>
    </div>

    <div className="bg-blue-600 text-white px-4 py-2 md:px-5 md:py-3 rounded-2xl font-semibold shadow-lg text-sm md:text-base self-start">
      AI Powered
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
    {aiInsights.map(
      (insight, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-7 border border-gray-100 shadow-sm"
        >
          <div className="bg-blue-100 text-blue-600 text-xs md:text-sm font-semibold px-3 py-1.5 md:px-4 md:py-2 rounded-full inline-block mb-4 md:mb-5">
            AI Insight
          </div>

          <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
            {insight.title}
          </h4>

          <p className="text-gray-600 text-sm md:text-base leading-6 md:leading-7">
            {insight.description}
          </p>
        </div>
      )
    )}
  </div>
</div>


            {/* CHART SECTION */}

            <div className="mt-8 md:mt-10 bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                    Revenue Overview
                  </h3>

                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                    Revenue analytics and
                    recurring billing growth.
                  </p>
                </div>

                <button className="bg-blue-600 text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-sm md:text-base w-full sm:w-auto">
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

            <div className="mt-8 md:mt-10 bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                    Recent Payments
                  </h3>

                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                    Latest merchant transactions.
                  </p>
                </div>
              </div>

              {/* MOBILE CARD LIST */}
              <div className="md:hidden space-y-3">
                {payments.map(
                  (payment, index) => (
                    <div
                      key={index}
                      className="border border-gray-100 rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-gray-900 font-medium text-sm">
                          {payment.customerName}
                        </p>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-gray-700 font-semibold">
                          ₦{payment.amount}
                        </p>

                        <p className="text-gray-500 text-xs">
                          {new Date(
                            payment.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
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

{/* RECOVERY ANALYTICS */}

<div className="mt-10">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-3xl font-bold text-gray-900">
        Recovery Analytics
      </h3>

      <p className="text-gray-500 mt-2">
        AI-powered subscription recovery performance.
      </p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
  {recoveryMetrics && [
    {
      title: "Recovered Revenue",
      value: `₦${recoveryMetrics.recoveredRevenue.toLocaleString()}`,
    },

    {
      title: "Recovery Success Rate",
      value: `${recoveryMetrics.recoveryRate}%`,
    },

    {
      title: "Recovered Subscriptions",
      value: recoveryMetrics.recoveredSubscriptions,
    },

    {
      title: "AI Retry Success",
      value: `+${recoveryMetrics.aiRetrySuccess}%`,
    },
  ].map((metric, index) => (
    <div
      key={index}
      className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <p className="text-gray-500 text-sm">
        {metric.title}
      </p>

      <h4 className="text-4xl font-bold text-gray-900 mt-4">
        {metric.value}
      </h4>
    </div>
  ))}
</div>
</div>

            {/* AI RETRY INTELLIGENCE */}

<div className="mt-10">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-3xl font-bold text-gray-900">
        AI Recovery Intelligence
      </h3>
      <p className="text-gray-500 mt-2">
        Intelligent retry recommendations
        powered by Shapay AI.
      </p>
    </div>
    <button
    onClick={simulateFailure}
    disabled={simulating}
    className="bg-red-500 hover:bg-red-600 transition text-white px-5 py-3 rounded-2xl font-semibold shadow-lg disabled:opacity-50"
    >
      {simulating ? "Simulating..." : "Simulate Failed Payment"}
    </button>
    <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg">
      AI Powered
    </div>
  </div>
  <div className="grid grid-cols-2 gap-6">
    {retryRecommendations.map(
      (recommendation, index) => (
        <div
          key={index}
          className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm text-gray-500">
                Customer
              </p>
              <h4 className="text-xl font-bold text-gray-900 mt-1">
                {
                  recommendation.customer
                }
              </h4>
            </div>
            <div className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
              Retry in{" "}
              {
                recommendation.retryDelay
              }
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              AI Reasoning
            </p>
            <p className="text-gray-600 leading-7">
              {
                recommendation.reasoning
              }
            </p>
          </div>
        </div>
      )
    )}
  </div>
</div>
          </>
        )}
      </section>
    </main>
  );
}