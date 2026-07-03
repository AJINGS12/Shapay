"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Payment = {
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] =
    useState<Payment[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/reports/payments"
        );

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
        <h1 className="text-5xl font-bold text-gray-900">
          Payments
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          Monitor merchant payment
          transactions and statuses.
        </p>
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