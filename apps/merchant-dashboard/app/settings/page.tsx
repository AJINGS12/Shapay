"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/merchant/profile");
        setBusinessName(response.data.profile.business_name || "");
        setBusinessEmail(response.data.profile.business_email || "");
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");

    try {
      await api.put("/merchant/profile", {
        businessName,
        businessEmail,
      });

      setMessage("Business profile saved.");
    } catch (error) {
      console.log(error);
      setMessage("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FB] p-10">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900">Settings</h1>

        <p className="text-gray-500 mt-3 text-lg">
          Manage your business profile.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Business Profile
        </h2>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 mb-6">
            {message}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Name
            </label>

            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
              placeholder="Your business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Email
            </label>

            <input
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:border-blue-500"
              placeholder="business@example.com"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}