"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function SubscriptionsContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

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
    active: "bg-emerald-500/10 text-emerald-400",
    pending: "bg-yellow-500/10 text-yellow-400",
    paused: "bg-[#27272A] text-[#9CA3AF]",
    cancelled: "bg-red-500/10 text-red-400",
  };

  return (
    <main className="min-h-screen bg-[#0A0A0B] p-6 md:p-10 font-[Inter]">
      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-[Space_Grotesk] tracking-tight">
          Subscriptions
        </h1>

        <p className="text-[#9CA3AF] mt-3 text-lg">
          Manage recurring billing and
          customer subscriptions.
        </p>
      </div>

      {paymentStatus === "success" && (
        <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 text-[#F5C518] rounded-2xl p-5 mb-8">
          Payment completed successfully! Your subscription is now active.
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

      {/* CREATE SUBSCRIPTION FORM */}

      <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A] mb-10">
        <h2 className="text-2xl font-bold text-white mb-6 font-[Space_Grotesk]">
          Create New Subscription
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white placeholder:text-[#5C5C63] focus:border-[#F5C518] transition"
          />

          <input
            type="email"
            placeholder="Customer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white placeholder:text-[#5C5C63] focus:border-[#F5C518] transition"
          />

          <input
            type="text"
            placeholder="Plan Name (e.g. Pro Monthly)"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white placeholder:text-[#5C5C63] focus:border-[#F5C518] transition"
          />

          <input
            type="number"
            placeholder="Amount (NGN)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white placeholder:text-[#5C5C63] focus:border-[#F5C518] transition font-[JetBrains_Mono]"
          />

          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white focus:border-[#F5C518] transition"
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <button
          onClick={createSubscription}
          className="mt-6 bg-[#F5C518] hover:bg-[#e0b512] transition text-black px-6 py-4 rounded-2xl font-semibold"
        >
          Create Subscription & Checkout
        </button>
      </div>

      {actionMessage && (
        <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 text-[#F5C518] rounded-2xl p-5 mb-8">
          {actionMessage}
        </div>
      )}

      {/* SUBSCRIPTIONS TABLE */}

      <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A]">
        {subscriptions.length === 0 ? (
          <p className="text-[#9CA3AF]">No subscriptions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#27272A]">
                  <th className="pb-4 text-[#9CA3AF] font-normal">Customer</th>
                  <th className="pb-4 text-[#9CA3AF] font-normal">Email</th>
                  <th className="pb-4 text-[#9CA3AF] font-normal">Amount</th>
                  <th className="pb-4 text-[#9CA3AF] font-normal">Interval</th>
                  <th className="pb-4 text-[#9CA3AF] font-normal">Status</th>
                  <th className="pb-4 text-[#9CA3AF] font-normal">Next Billing</th>
                  <th className="pb-4 text-[#9CA3AF] font-normal">Actions</th>
                </tr>
              </thead>

              <tbody>
                {subscriptions.map((subscription, index) => (
                  <tr key={index} className="border-b border-[#1C1C21]">
                    <td className="py-5 font-medium text-white">
                      {subscription.customerName}
                    </td>

                    <td className="py-5 text-[#9CA3AF]">
                      {subscription.customerEmail}
                    </td>

                    <td className="py-5 text-white font-[JetBrains_Mono]">
                      ₦{subscription.amount}
                    </td>

                    <td className="py-5 text-white capitalize">
                      {subscription.interval}
                    </td>

                    <td className="py-5">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                          statusStyles[subscription.status] ||
                          "bg-[#27272A] text-[#9CA3AF]"
                        }`}
                      >
                        {subscription.status}
                      </span>
                    </td>

                    <td className="py-5 text-[#9CA3AF]">
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
                            className="bg-[#F5C518] hover:bg-[#e0b512] transition text-black px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
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
                            className="bg-transparent border border-yellow-500/40 hover:bg-yellow-500/10 transition text-yellow-400 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
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
                            className="bg-transparent border border-emerald-500/40 hover:bg-emerald-500/10 transition text-emerald-400 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
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
                            className="bg-transparent border border-red-500/40 hover:bg-red-500/10 transition text-red-400 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
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
        )}
      </div>
    </main>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
          <p className="text-[#9CA3AF] text-xl">Loading...</p>
        </main>
      }
    >
      <SubscriptionsContent />
    </Suspense>
  );
}