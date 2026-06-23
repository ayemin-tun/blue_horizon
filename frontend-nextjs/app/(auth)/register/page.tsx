"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/Input";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log("Registering user with:", { fullName, email, password, role: "user" });
    // TODO: Connect to Python API
    alert("Account registration request submitted!");
  };

  return (
    <div className="mx-full w-full max-w-md space-y-6">
      
      {/* Form Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-blue-950">Register</h2>
        <p className="mt-1 text-sm text-slate-500">Access the air ticket system</p>
        <div className="mt-3 h-[2px] w-full bg-slate-200" />
      </div>

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

          {/* ✨ ရှင်းလင်းသွားတဲ့ Already have an account text link */}
          <p className="text-sm text-center text-slate-600">
            Already have an account?{" "}
            <Link href="/" className="font-semibold text-blue-700 hover:underline">
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