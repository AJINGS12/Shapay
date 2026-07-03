"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Subscription = {
  customerName: string;
  customerEmail: string;
  amount: number;
  interval: string;
  status: string;
  createdAt: string;
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>([]);

  useEffect(() => {
    const fetchSubscriptions =
      async () => {
        try {
          const response =
            await axios.get(
              "http://localhost:5000/reports/subscriptions"
            );

          setSubscriptions(
            response.data.subscriptions
          );
        } catch (error) {
          console.log(error);
        }
      };

    fetchSubscriptions();
  }, []);

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

      {/* TABLE */}

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-4 text-gray-500">
                  Customer
                </th>

                <th className="pb-4 text-gray-500">
                  Email
                </th>

                <th className="pb-4 text-gray-500">
                  Amount
                </th>

                <th className="pb-4 text-gray-500">
                  Interval
                </th>

                <th className="pb-4 text-gray-500">
                  Status
                </th>

                <th className="pb-4 text-gray-500">
                  Created
                </th>
              </tr>
            </thead>

            <tbody>
              {subscriptions.map(
                (
                  subscription,
                  index
                ) => (
                  <tr
                    key={index}
                    className="border-b border-gray-50"
                  >
                    <td className="py-5 font-medium text-gray-900">
                      {
                        subscription.customerName
                      }
                    </td>

                    <td className="py-5 text-gray-600">
                      {
                        subscription.customerEmail
                      }
                    </td>

                    <td className="py-5 text-gray-700">
                      ₦
                      {
                        subscription.amount
                      }
                    </td>

                    <td className="py-5 text-gray-700 capitalize">
                      {
                        subscription.interval
                      }
                    </td>

                    <td className="py-5">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          subscription.status ===
                          "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {
                          subscription.status
                        }
                      </span>
                    </td>

                    <td className="py-5 text-gray-500">
                      {new Date(
                        subscription.createdAt
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