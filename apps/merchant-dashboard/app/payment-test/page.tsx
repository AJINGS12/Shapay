"use client";

import { useState } from "react";
import axios from "axios";

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

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/initialize`,
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
    <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Test Payment
        </h1>

        <p className="text-gray-500 mb-8">
          Initialize a payment through
          Shapay infrastructure.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="Ismail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="test@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₦)
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
              placeholder="500"
            />
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold text-lg"
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