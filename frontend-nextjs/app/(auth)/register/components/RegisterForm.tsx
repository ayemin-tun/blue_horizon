"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";
import { useRegisterMutation } from "@/services/auth/authService";
import { useRouter } from "next/navigation";
import { toast } from "@/services/store/alertStore";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uiError, setUiError] = useState<string | null>(null); 

  const registerMutation = useRegisterMutation();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setUiError("Passwords do not match!");
      return;
    }
    try {
      const result = await registerMutation.mutateAsync({ 
        username: fullName, 
        email, 
        password 
      });

      if (result.success) {
        toast.success("Registered successfully. Please check your email to verify your account before logging in.");
        router.push("/login");
      } else {
        setUiError(result.error?.details || result.message);
      }
      
    } catch (error) {
      setUiError("An unexpected error occurred. Please try again.")
    }
  };

  return (
    <div className="mx-full w-full max-w-md space-y-6">
      
      {/* Form Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-blue-950">Register</h2>
        <p className="mt-1 text-sm text-slate-500">Access the air ticket system</p>
        <div className="mt-3 h-[2px] w-full bg-slate-200" />
      </div>

      
      {uiError && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-sm rounded-md font-medium">
          ⚠️ {uiError}
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="space-y-4">
        {/* 👤 Full Name */}
        <Input
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        {/* ✉️ Email Address */}
        <Input
          id="email"
          label="Email Address"
          type="email"
          placeholder="example@bluehorizon.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* 🔑 Password */}
        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* 🔒 Confirm Password */}
        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {/* Action Button & Navigation Link */}
        <div className="pt-4 space-y-4">
          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-800 py-3 text-center text-sm font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Create Account
          </button>

          <p className="text-sm text-center text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
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