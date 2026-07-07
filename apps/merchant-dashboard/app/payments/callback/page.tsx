"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F7FB]">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-lg">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          Payment Successful
        </h1>

        <p className="text-gray-600 text-lg">
          Your payment was completed successfully.
        </p>

        <p className="text-gray-400 mt-4">
          Redirecting to dashboard...
        </p>
      </div>
    </main>
  );
}