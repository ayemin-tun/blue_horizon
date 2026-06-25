"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Link from "next/link";
import { useLoginMutation } from "@/services/auth/authService";
import { useAuthStore } from "@/services/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "@/services/store/alertStore";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  // Error Handle state
  const [uiError, setUiError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

      // Hadle serverside alert message from middleware.ts
    const searchParams = useSearchParams();
    const alertType = searchParams.get("alert_action");
    useEffect(() => {
        if (alertType === "unauthorized") {
            toast.warning("You are not authorized, please login first");
        } else if (alertType === "forbidden") {
            toast.warning("You are not authorized to access this page");
        }
    }, [alertType]);

  const router = useRouter();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);
    try {
      const result = await loginMutation.mutateAsync({ email, password });

      if (result.success) {
        toast.success("Login Successful!");

        // cookie store because next js middleware does not use zustand localStorage
        document.cookie = `token=${(result.data as any)?.access_token}; path=/; max-age=3600`;
        document.cookie = `name=${(result.data as any).username}; path=/; max-age=3600`;
        document.cookie = `role=${(result.data as any).role}; path=/; max-age=3600`;

        setAuth(
          (result.data as any)?.access_token,
          3600000,
          (result.data as any).username || "Unknown user",
          (result.data as any).role || "user"
        );

        if ((result.data as any).role == 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }

      } else {
        setUiError(result.error?.details || result.message);
      }
    } catch (error) {
      setUiError("An unexpected error occurred. Please try again.")
    }

  };

  return (
    <div className="mx-full w-full max-w-md space-y-8">

      {/* Form Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-blue-950">Sign In</h2>
        <p className="mt-2 text-sm text-slate-500">Access the air ticket system</p>
        <div className="mt-4 h-[2px] w-full bg-slate-200" />
      </div>

      {/* ⚠️ Error Box  */}
      {uiError && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm rounded-md font-medium">
          ⚠️ {uiError}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email Address */}

        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="example@bluehorizon.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <Input
          id="password"
          label='Password'
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Checkbox & Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            Remember this device
          </label>
          <Link href="/forgot-password" className="font-medium text-blue-700 hover:underline">
            Forgot password
          </Link>
        </div>

        {/* Secure Login Button */}
        <button
          type="submit"
          className="w-full rounded-md bg-blue-800 py-3 text-center text-sm font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          Secure Login
        </button>

        <p className="text-sm text-center text-slate-600">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-blue-700 hover:underline">
            Register
          </Link>
        </p>
      </form>

      {/* Bottom Restricted Notice */}
      <div className="pt-6">
        <div className="h-[2px] w-full bg-slate-200 mb-4" />
        <div className="text-center space-y-1">
          <p className="text-xs font-bold tracking-widest text-blue-800 uppercase">
            Blue Horizon - Restricted Access
          </p>
          <p className="text-[11px] text-slate-500">
            Unauthorised access is prohibited and monitored
          </p>
        </div>
      </div>

    </div>
  );
}