"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Link from "next/link";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleRequestToAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("request to admin with:", { email });
    // TODO: Connect to Backend API
    alert("forgot password submitted!");
  };

  return (
    <div className="mx-full w-full max-w-md space-y-8">

      {/* Form Header */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-blue-950">Forgot Password</h2>
        <p className="mt-2 text-sm text-slate-500">Access the air ticket system</p>
        <div className="mt-4 h-[2px] w-full bg-slate-200" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleRequestToAdmin} className="space-y-6">
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

        {/* Buttons Section */}
        <div className="space-y-4 pt-2">
          {/* Request to Admin Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-800 py-3 text-center text-sm font-bold tracking-wider text-white uppercase shadow-md transition-all hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            Request to Admin
          </button>

          
          <p className="text-sm text-center text-slate-600">
            Try one more time?{" "}
            <Link href="/" className="font-semibold text-blue-700 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </form>

      {/* Bottom Information Notice */}
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