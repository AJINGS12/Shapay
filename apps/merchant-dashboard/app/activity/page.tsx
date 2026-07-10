"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

type ActivityItem = {
  type: string;
  status: string;
  customerName: string;
  amount: number;
  createdAt: string;
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await api.get("/reports/activity");
        setActivities(response.data.activities);
      } catch (error) {
        console.log(error);
      }
    };

    fetchActivities();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-10">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900">Activity</h1>

        <p className="text-gray-500 mt-3 text-lg">
          Full history of merchant events and operational activity.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        {activities.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-gray-100 rounded-2xl p-5"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {activity.customerName}
                  </p>

                  <p className="text-gray-500 text-sm mt-1 capitalize">
                    {activity.type} • {activity.status}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ₦{activity.amount}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}