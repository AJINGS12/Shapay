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
    <main className="min-h-screen bg-[#0A0A0B] p-6 md:p-10 font-[Inter]">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-[Space_Grotesk] tracking-tight">
          Activity
        </h1>

        <p className="text-[#9CA3AF] mt-3 text-lg">
          Full history of merchant events and operational activity.
        </p>
      </div>

      <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A]">
        {activities.length === 0 ? (
          <p className="text-[#9CA3AF]">No activity yet.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border border-[#27272A] rounded-2xl p-5"
              >
                <div>
                  <p className="font-semibold text-white">
                    {activity.customerName}
                  </p>

                  <p className="text-[#9CA3AF] text-sm mt-1 capitalize">
                    {activity.type} • {activity.status}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-white font-[JetBrains_Mono]">
                    ₦{activity.amount}
                  </p>

                  <p className="text-sm text-[#9CA3AF] mt-1">
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