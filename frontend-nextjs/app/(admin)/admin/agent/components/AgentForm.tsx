"use client";

import React, { useState } from "react";
import { toast } from "@/services/store/alertStore";
import { KeyRound, Loader2, Mail, Phone, User } from "lucide-react";
import { Agent, AgentPayload } from "@/services/agentService";

interface AgentFormProps {
  initialData?: Agent | null;
  onSubmit: (data: AgentPayload) => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
  isCreateMode?: boolean;
}

export default function AgentForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
  isCreateMode = false
}: AgentFormProps) {

  // Controlled Form State
  const [form, setForm] = useState<AgentPayload>({
    username: initialData?.username ?? "",
    email: initialData?.email ?? "",
    phone_no: initialData?.phone_no ?? "",
    password: "",
    status: initialData?.status ?? "ACTIVE", //default active
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.username.trim() || !form.email.trim()) {
      toast.warning("Username and Email are required.");
      return;
    }

    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Username
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <User className="w-4 h-4" />
          </span>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
          />
        </div>
      </div>

      {/*Email Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. john@bluehorizon.com"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
          />
        </div>
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Phone Number (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <Phone className="w-4 h-4" />
          </span>
          <input
            name="phone_no"
            type="text"
            value={form.phone_no}
            onChange={handleChange}
            placeholder="e.g. 09-xxxxxxxxx"
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-black"
          />
        </div>
      </div>

      {/*Status Toggle Switch Button */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">
          Agent Status
        </label>

        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">
              {form.status === "ACTIVE" ? "Active" : "Inactive"}
            </span>
            <span className="text-[11px] text-slate-400">
              {form.status === "ACTIVE" ? "Agent can log in and access system." : "Agent access will be disabled."}
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => {
              setForm((prev) => ({
                ...prev,
                status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
              }));
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.status === "ACTIVE" ? "bg-green-500" : "bg-slate-200"
              }`}
          >
            <span
              pointer-events-none="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${form.status === "ACTIVE" ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>
      </div>

      {isCreateMode && (
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Initial Password
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
        </div>
      )}

      {/* Preview Section */}
      {(form.username || form.email) && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 pb-3 text-xs space-y-1">
          <p className="text-blue-900 font-bold">Preview:</p>
          <div className="flex items-center justify-between">
            <p className="text-slate-600 font-medium">{form.username || "—"} ({form.email || "—"})</p>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${form.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
              }`}>
              {form.status}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition focus:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 focus:outline-none"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}