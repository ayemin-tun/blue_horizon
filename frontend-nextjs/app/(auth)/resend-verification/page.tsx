// frontend-nextjs/app/resend-verification/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

// Adjust this to match wherever your backend base URL is defined elsewhere
// in the frontend (e.g. an existing lib/api.ts or .env NEXT_PUBLIC_API_URL).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type FormState = "idle" | "loading" | "success" | "error";

interface ApiResponse {
  success: boolean;
  message: string;
  data: { email: string } | null;
  error: { code: string; details: string } | null;
}

export default function ResendVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setState("error");
      setMessage("Please enter your email address.");
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const json: ApiResponse = await res.json();

      if (json.success) {
        setState("success");
        setMessage(json.message || "Verification email sent. Please check your inbox.");
      } else {
        setState("error");
        setMessage(json.error?.details || json.message || "Could not resend verification email.");
      }
    } catch {
      setState("error");
      setMessage("Could not reach the server. Please check your connection and try again.");
    }
  };

  return (
    <div className="mx-full w-full max-w-md space-y-8 mx-auto">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-lg font-bold text-slate-900 mb-2 text-center">
          Resend verification email
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6 text-center">
          Enter the email address you registered with and we&apos;ll send you a new verification link.
        </p>

        {state === "success" ? (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-6">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-blue-900 text-white text-sm font-bold rounded-md hover:bg-slate-800 transition active:scale-[0.98]"
            >
              Back to login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 text-sm border border-slate-200 text-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                disabled={state === "loading"}
              />
            </div>

            {state === "error" && (
              <p className="text-xs font-medium text-red-600">{message}</p>
            )}

            <button
              type="submit"
              disabled={state === "loading"}
              className="w-full py-3 bg-blue-900 text-white text-sm font-bold rounded-md hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state === "loading" ? "Sending..." : "Send verification link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}