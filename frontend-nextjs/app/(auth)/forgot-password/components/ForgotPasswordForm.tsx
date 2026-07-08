"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Link from "next/link";
import { useForgotPasswordMutation } from "@/services/auth/authService";
import { toast } from "@/services/store/alertStore";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [uiError, setUiError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleRequestToAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);
    setIsSuccess(false);

    try {
      const response: any = await forgotPasswordMutation.mutateAsync({ email: email.trim() });
      
      // Checking Unified ApiResponse Format from Python Backend
      if (response && response.success === false) {
        const backendError = response.error?.details || "Request failed";
        setUiError(backendError);
      } else {
        toast.success("Password reset request sent successfully!");
        setIsSuccess(true);
        setEmail(""); 
      }
    } catch (error: any) {
      const networkError = 
        error?.data?.error?.details || 
        error?.response?.data?.error?.details ||
        "An unexpected network error occurred.";
      setUiError(networkError);
    }
  };

  return (
    <div className="mx-full w-full max-w-md space-y-8">

      <div>
        <h2 className="text-3xl font-serif font-bold text-blue-950">Forgot Password</h2>
        <p className="mt-2 text-sm text-slate-500">Access the air ticket system</p>
        <div className="mt-4 h-[2px] w-full bg-slate-200" />
      </div>

      {uiError && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm rounded-md font-medium">
          ⚠️ {uiError}
        </div>
      )}

      {isSuccess && (
        <div className="p-3 bg-green-50 text-green-700 border border-green-200 text-sm rounded-md font-medium">
          ✅ Request submitted successfully! Please wait for admin approval.
        </div>
      )}

      <form onSubmit={handleRequestToAdmin} className="space-y-6">
        
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="example@bluehorizon.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={forgotPasswordMutation.isPending}
          required
        />

        <div className="space-y-4 pt-2">
          
          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full rounded-md bg-blue-800 py-3 text-center text-sm font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-400"
          >
            {forgotPasswordMutation.isPending ? "Submitting..." : "Request to Admin"}
          </button>
          
          <p className="text-sm text-center text-slate-600">
            Try one more time?{" "}
            <Link href="/login" className="font-semibold text-blue-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>

      <div className="pt-6">
        <div className="h-[2px] w-full bg-slate-200 mb-4" />
        <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
          Password request is forwarded to the helpdesk. If you do not receive a response shortly, 
          please contact IT Support at{" "}
          <a href="mailto:support@bluehorizon.com" className="underline font-semibold hover:text-blue-950">
            support@bluehorizon.com
          </a>.
        </p>
      </div>

    </div>
  );
}