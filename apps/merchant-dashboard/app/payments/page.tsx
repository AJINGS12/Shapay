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
    <main className="min-h-screen bg-[#0A0A0B] p-6 md:p-10 font-[Inter]">
      {/* HEADER */}

      <div className="mb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-[Space_Grotesk] tracking-tight">
              Payments
            </h1>

            <p className="text-[#9CA3AF] mt-3 text-lg">
              Monitor merchant payment
              transactions and statuses.
            </p>
          </div>

          <button
            onClick={createCheckout}
            className="bg-[#F5C518] hover:bg-[#e0b512] transition text-black px-6 py-4 rounded-2xl font-semibold"
          >
            Generate Payment Checkout
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

      <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A] mb-10">
        <h2 className="text-2xl font-bold text-white mb-6 font-[Space_Grotesk]">
          Create Payment Checkout
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white placeholder:text-[#5C5C63] focus:border-[#F5C518] transition font-[JetBrains_Mono]"
          />
        </div>

        <button
          onClick={createCheckout}
          className="mt-6 bg-[#F5C518] hover:bg-[#e0b512] transition text-black px-6 py-4 rounded-2xl font-semibold"
        >
          Generate Checkout
        </button>
      </div>

      {/* PAYMENTS TABLE */}

      <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A]">
        {payments.length === 0 ? (
          <p className="text-[#9CA3AF]">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[#27272A]">
                  <th className="pb-4 text-[#9CA3AF] font-normal">
                    Customer
                  </th>

                  <th className="pb-4 text-[#9CA3AF] font-normal">
                    Amount
                  </th>

                  <th className="pb-4 text-[#9CA3AF] font-normal">
                    Status
                  </th>

                  <th className="pb-4 text-[#9CA3AF] font-normal">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map(
                  (payment, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#1C1C21]"
                    >
                      <td className="py-5 font-medium text-white">
                        {
                          payment.customerName
                        }
                      </td>

                      <td className="py-5 text-white font-[JetBrains_Mono]">
                        ₦{payment.amount}
                      </td>

                      <td className="py-5">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            payment.status ===
                            "paid"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="py-5 text-[#9CA3AF]">
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
        )}
      </div>
    </main>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-[#0A0A0B]">
          <p className="text-[#9CA3AF] text-xl">Loading...</p>
        </main>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}