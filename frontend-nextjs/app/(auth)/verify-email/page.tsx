// frontend-nextjs/app/verify-email/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type VerifyState = "loading" | "success" | "error";

interface ApiResponse {
  success: boolean;
  message: string;
  data: { email: string } | null;
  error: { code: string; details: string } | null;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState<string>("Verifying your email address...");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This link is missing a verification token. Please use the link from your email.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/verify-email?token=${encodeURIComponent(token)}`,
          { method: "GET" }
        );
        const json: ApiResponse = await res.json();

        if (json.success) {
          setState("success");
          setMessage(json.message);
          setEmail(json.data?.email ?? null);
        } else {
          setState("error");
          setMessage(json.error?.details || json.message || "Verification failed.");
        }
      } catch {
        setState("error");
        setMessage("Could not reach the server. Please check your connection and try again.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          {state === "loading" && (
            <div className="w-14 h-14 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin" />
          )}
          {state === "success" && (
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
          {state === "error" && (
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-lg font-bold text-slate-900 mb-2">
          {state === "loading" && "Verifying your email"}
          {state === "success" && "Email verified"}
          {state === "error" && "Verification failed"}
        </h1>

        {/* Message */}
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {message}
          {state === "success" && email ? ` (${email})` : ""}
        </p>

        {/* Actions */}
        {state === "success" && (
          <button
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition active:scale-[0.98]"
          >
            Go to login
          </button>
        )}

        {state === "error" && (
          <button
            onClick={() => router.push("/resend-verification")}
            className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition active:scale-[0.98]"
          >
            Request a new link
          </button>
        )}
      </div>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary in the App Router
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}