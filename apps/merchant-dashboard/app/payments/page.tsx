"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "../../lib/api";

type Payment = {
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
};

function PaymentsContent() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");

  const [payments, setPayments] =
    useState<Payment[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");

  const createCheckout = async () => {
    try {
      const response = await api.post(
        "/payments/create-checkout",
        {
          amount: Number(amount),
          customerName,
          email,
        }
      );

      window.open(response.data.checkoutLink, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("/reports/payments");

        setPayments(response.data.payments);
      } catch (error) {
        console.log(error);
      }
    };

    fetchPayments();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-10">
      {/* HEADER */}

      <div className="mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-5xl font-bold text-gray-900">
              Payments
            </h1>

            <p className="text-gray-500 mt-3 text-lg">
              Monitor merchant payment
              transactions and statuses.
            </p>
          </div>

          <button
            onClick={createCheckout}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold shadow-lg"
          >
            Generate Payment Checkout
          </button>
        </div>
      </div>

      {paymentStatus === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-2xl p-5 mb-8">
          Payment completed successfully!
        </div>
      )}

      {paymentStatus === "pending" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-5 mb-8">
          Payment is still processing. Please refresh in a moment.
        </div>
      )}

      {paymentStatus === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-5 mb-8">
          Something went wrong confirming your payment.
        </div>
      )}

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Create Payment Checkout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border border-gray-200 rounded-2xl px-5 py-4 outline-none"
          />
        </div>

        <button
          onClick={createCheckout}
          className="mt-6 bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold shadow-lg"
        >
          Generate Checkout
        </button>
      </div>

      {/* PAYMENTS TABLE */}

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
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
                    <td className="py-5 font-medium text-gray-900">
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
    </main>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500 text-xl">Loading...</p>
        </main>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}