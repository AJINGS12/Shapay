"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";


function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "success";
  const message =
    searchParams.get("message") ||
    "Your payment was completed successfully.";

  const isSuccess =
    status.toLowerCase() === "success" ||
    status === "true";


  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push("/");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [router, isSuccess]);


  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F5F7FB] p-4">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-lg w-full">

        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✓
            </div>

            <h1 className="text-4xl font-bold text-green-600 mb-4">
              Payment Successful
            </h1>

            <p className="text-gray-600 text-lg">
              {message}
            </p>

            <p className="text-gray-400 mt-6 text-sm animate-pulse">
              Redirecting to dashboard...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✕
            </div>

            <h1 className="text-4xl font-bold text-red-600 mb-4">
              Payment Failed
            </h1>

            <p className="text-gray-600 text-lg mb-6">
              {message}
            </p>

            <Link
              href="/"
              className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium"
            >
              Return Home
            </Link>
          </>
        )}

      </div>
    </main>
  );
}


export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          Loading payment status...
        </main>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}