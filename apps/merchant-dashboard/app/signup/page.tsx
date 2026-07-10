"use client";

import { useState } from "react";

import Link from "next/link";

import {
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../firebase";

import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [businessName,
    setBusinessName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSignup =
    async () => {
      try {
        setLoading(true);

        await createUserWithEmailAndPassword(
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
    <main className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-10 font-[Inter]">
      <div className="w-full max-w-md bg-[#16161A] rounded-3xl p-10 border border-[#27272A]">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold text-[#F5C518] font-[Space_Grotesk] tracking-tight">
            Shapay
          </h1>

          <p className="text-[#9CA3AF] mt-4">
            Create your merchant account
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
              Business Name
            </label>

            <input
              type="text"
              placeholder="Your Business"
              value={businessName}
              onChange={(e) =>
                setBusinessName(
                  e.target.value
                )
              }
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 text-white placeholder:text-[#5C5C63] outline-none focus:border-[#F5C518] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
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
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 text-white placeholder:text-[#5C5C63] outline-none focus:border-[#F5C518] transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9CA3AF] mb-2">
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
              className="w-full bg-[#0A0A0B] border border-[#27272A] rounded-2xl px-5 py-4 text-white placeholder:text-[#5C5C63] outline-none focus:border-[#F5C518] transition"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-[#F5C518] hover:bg-[#e0b512] transition text-black py-4 rounded-2xl font-semibold disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[#9CA3AF]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#F5C518] font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}