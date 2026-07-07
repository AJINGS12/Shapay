"use client";

import {
  Settings,
  Bell,
  Shield,
  Webhook,
  Key,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FB] p-10">
      {/* HEADER */}

      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="text-gray-500 mt-3 text-lg">
          Manage merchant preferences,
          API configuration, and
          operational settings.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* BUSINESS PROFILE */}

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Settings className="text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Business Profile
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>

              <input
                type="text"
                defaultValue="Shapay Merchant"
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Email
              </label>

              <input
                type="email"
                defaultValue="merchant@example.com"
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold">
              Save Changes
            </button>
          </div>
        </div>

        {/* API KEYS */}

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Key className="text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              API Configuration
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public API Key
              </label>

              <input
                type="text"
                defaultValue="pk_test_shapay_123456"
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key
              </label>

              <input
                type="password"
                defaultValue="sk_test_secret"
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold">
              Regenerate Keys
            </button>
          </div>
        </div>

        {/* WEBHOOKS */}

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Webhook className="text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Webhooks
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>

              <input
                type="text"
                defaultValue="https://api.shapay.com/webhooks/nomba"
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-4 rounded-2xl font-semibold">
              Update Webhook
            </button>
          </div>
        </div>

        {/* NOTIFICATIONS */}

        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Bell className="text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Notifications
            </h2>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-5">
              <div>
                <p className="font-semibold text-gray-900">
                  Payment Alerts
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Receive successful payment notifications.
                </p>
              </div>

              <input type="checkbox" defaultChecked />
            </div>

            <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-5">
              <div>
                <p className="font-semibold text-gray-900">
                  Subscription Alerts
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Receive recurring billing notifications.
                </p>
              </div>

              <input type="checkbox" defaultChecked />
            </div>

            <div className="flex items-center justify-between border border-gray-100 rounded-2xl p-5">
              <div>
                <p className="font-semibold text-gray-900">
                  Security Alerts
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Receive webhook and API security updates.
                </p>
              </div>

              <input type="checkbox" defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}