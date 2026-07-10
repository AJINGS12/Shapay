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
    <main className="min-h-screen bg-[#0A0A0B] p-6 md:p-10 font-[Inter]">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white font-[Space_Grotesk] tracking-tight">
          Settings
        </h1>

        <p className="text-[#9CA3AF] mt-3 text-lg">
          Manage your business profile.
        </p>
      </div>

      <div className="bg-[#16161A] rounded-3xl p-8 border border-[#27272A] max-w-xl">
        <h2 className="text-2xl font-bold text-white mb-6 font-[Space_Grotesk]">
          Business Profile
        </h2>

        {message && (
          <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 text-[#F5C518] rounded-2xl p-4 mb-6">
            {message}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Business Name
            </label>

            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white placeholder:text-[#5C5C63] focus:border-[#F5C518] transition"
              placeholder="Your business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Business Email
            </label>

            <input
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 outline-none text-white placeholder:text-[#5C5C63] focus:border-[#F5C518] transition"
              placeholder="business@example.com"
            />
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-[#F5C518] hover:bg-[#e0b512] transition text-black px-6 py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}