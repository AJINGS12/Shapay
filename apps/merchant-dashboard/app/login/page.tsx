"use client";

import { useState } from "react";

import Link from "next/link";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../firebase";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin =
    async () => {
      try {
        setLoading(true);

        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        router.push("/");
      } catch (error: any) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center p-10">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-blue-600">
            Shapay
          </h1>

          <p className="text-gray-500 mt-4">
            Merchant Infrastructure Platform
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <input
              type="email"
              placeholder="merchant@example.com"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-4 rounded-2xl font-semibold shadow-lg"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 font-semibold"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}