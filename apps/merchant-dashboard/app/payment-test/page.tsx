"use client";

import { useState } from "react";
import api from "../../lib/api";

export default function PaymentTestPage() {
  const [amount, setAmount] =
    useState("");

  const [customerName, setCustomerName] =
    useState("");

  const [customerEmail, setCustomerEmail] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await api.post(
        "/payments/initialize",
        {
          amount: Number(amount),
          customerName,
          customerEmail,
        }
      );

      window.location.href =
        response.data.checkoutLink;
    } catch (error) {
      console.log(error);

      alert(
        "Payment initialization failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6 font-[Inter]">
      <div className="w-full max-w-xl bg-[#16161A] rounded-3xl p-10 border border-[#27272A]">
        <h1 className="text-4xl font-bold text-white mb-3 font-[Space_Grotesk]">
          Test Payment
        </h1>

        <p className="text-[#9CA3AF] mb-8">
          Initialize a payment through
          Shapay infrastructure.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none focus:border-[#F5C518] transition text-white placeholder:text-[#5C5C63]"
              placeholder="Ismail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Customer Email
            </label>

            <input
              type="email"
              value={customerEmail}
              onChange={(e) =>
                setCustomerEmail(
                  e.target.value
                )
              }
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none focus:border-[#F5C518] transition text-white placeholder:text-[#5C5C63]"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Amount (₦)
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none focus:border-[#F5C518] transition text-white placeholder:text-[#5C5C63] font-[JetBrains_Mono]"
              placeholder="500"
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-[#F5C518] hover:bg-[#e0b512] transition text-black py-4 rounded-2xl font-semibold text-lg disabled:opacity-50"
          >
            {loading
              ? "Initializing..."
              : "Pay Now"}
          </button>
        </div>
      </div>
    </main>
  );
}