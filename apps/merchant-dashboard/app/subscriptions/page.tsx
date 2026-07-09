"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

type Subscription = {
  subscriptionId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  interval: string;
  status: string;
  createdAt: string;
  nextBillingDate?: string;
  cardToken?: string | null;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [planName, setPlanName] = useState("");
  const [interval, setInterval] = useState("monthly");
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState("");

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get("/subscriptions");

      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const createSubscription = async () => {
    try {
      const response = await api.post("/subscriptions/create", {
        customerName,
        customerEmail: email,
        planName,
        amount: Number(amount),
        interval,
      });

      window.open(response.data.checkoutLink, "_blank");

      setTimeout(fetchSubscriptions, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const renewSubscription = async (subscriptionId: string) => {
    setActioningId(subscriptionId);
    setActionMessage("");

    try {
      const response = await api.post(
        `/subscriptions/${subscriptionId}/renew`
      );

      setActionMessage(response.data.message);
      fetchSubscriptions();
    } catch (error) {
      console.log(error);
      setActionMessage("Renewal request failed");
    } finally {
      setActioningId(null);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    setActioningId(subscriptionId);
    setActionMessage("");

    try {
      const response = await api.post(
        `/subscriptions/${subscriptionId}/cancel`
      );

      setActionMessage(response.data.message);
      fetchSubscriptions();
    } catch (error) {
      console.log(error);
      setActionMessage("Cancellation failed");
    } finally {
      setActioningId(null);
    }
  };

  const pauseSubscription = async (subscriptionId: string) => {
    setActioningId(subscriptionId);
    setActionMessage("");

    try {
      const response = await api.post(
        `/subscriptions/${subscriptionId}/pause`
      );

      setActionMessage(response.data.message);
      fetchSubscriptions();
    } catch (error) {
      console.log(error);
      setActionMessage("Pause failed");
    } finally {
      setActioningId(null);
    }
  };

  const resumeSubscription = async (subscriptionId: string) => {
    setActioningId(subscriptionId);
    setActionMessage("");

    try {
      const response = await api.post(
        `/subscriptions/${subscriptionId}/resume`
      );

      setActionMessage(response.data.message);
      fetchSubscriptions();
    } catch (error) {
      console.log(error);
      setActionMessage("Resume failed");
    } finally {
      setActioningId(null);
    }
  };

  const statusStyles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    paused: "bg-gray-200 text-gray-700",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-10">
      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900">
          Subscriptions
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          Manage recurring billing and
          customer subscriptions.
        </p>
      </div>

      {/* CREATE SUBSCRIPTION FORM */}

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create New Subscription
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />

          <input
            type="email"
            placeholder="Customer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />

          <input
            type="text"
            placeholder="Plan Name (e.g. Pro Monthly)"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />

          <input
            type="number"
            placeholder="Amount (NGN)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />

          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <button
          onClick={createSubscription}
          className="mt-6 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold shadow-lg"
        >
          Create Subscription & Checkout
        </button>
      </div>

      {actionMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-5 mb-8">
          {actionMessage}
        </div>
      )}

      {/* SUBSCRIPTIONS TABLE */}

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-gray-500">Customer</th>
                <th className="pb-4 text-gray-500">Email</th>
                <th className="pb-4 text-gray-500">Amount</th>
                <th className="pb-4 text-gray-500">Interval</th>
                <th className="pb-4 text-gray-500">Status</th>
                <th className="pb-4 text-gray-500">Next Billing</th>
                <th className="pb-4 text-gray-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map((subscription, index) => (
                <tr key={index} className="border-b border-gray-50">
                  <td className="py-5 font-medium text-gray-900">
                    {subscription.customerName}
                  </td>

                  <td className="py-5 text-gray-600">
                    {subscription.customerEmail}
                  </td>

                  <td className="py-5 text-gray-700">
                    ₦{subscription.amount}
                  </td>

                  <td className="py-5 text-gray-700 capitalize">
                    {subscription.interval}
                  </td>

                  <td className="py-5">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                        statusStyles[subscription.status] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {subscription.status}
                    </span>
                  </td>

                  <td className="py-5 text-gray-500">
                    {subscription.nextBillingDate
                      ? new Date(
                          subscription.nextBillingDate
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td className="py-5">
                    <div className="flex flex-wrap gap-2">
                      {subscription.status !== "cancelled" && (
                        <button
                          onClick={() =>
                            renewSubscription(subscription.subscriptionId)
                          }
                          disabled={actioningId === subscription.subscriptionId}
                          className="bg-gray-900 hover:bg-gray-700 transition text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                        >
                          {actioningId === subscription.subscriptionId
                            ? "..."
                            : "Renew"}
                        </button>
                      )}

                      {subscription.status === "active" && (
                        <button
                          onClick={() =>
                            pauseSubscription(subscription.subscriptionId)
                          }
                          disabled={actioningId === subscription.subscriptionId}
                          className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                        >
                          Pause
                        </button>
                      )}

                      {subscription.status === "paused" && (
                        <button
                          onClick={() =>
                            resumeSubscription(subscription.subscriptionId)
                          }
                          disabled={actioningId === subscription.subscriptionId}
                          className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                        >
                          Resume
                        </button>
                      )}

                      {subscription.status !== "cancelled" && (
                        <button
                          onClick={() =>
                            cancelSubscription(subscription.subscriptionId)
                          }
                          disabled={actioningId === subscription.subscriptionId}
                          className="bg-red-500 hover:bg-red-600 transition text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}