"use client";

import React, { useState, useEffect } from "react";
import { Mail, X, Send, Loader2, ExternalLink, Clock } from "lucide-react";
import { useAuthStore } from "@/services/store/authStore";
import { useContactAdminMutation } from "@/services/agentService";
import { toast } from "@/services/store/alertStore";

const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour in ms

export default function FloatingAgentMail() {
  const { role, name, email } = useAuthStore((state) => state);
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [remainingMinutes, setRemainingMinutes] = useState(0);

  const contactMutation = useContactAdminMutation();

  const storageKey = `bluehorizon_last_mail_${email || "agent"}`;

  // Check cooldown on mount and when window opens
  const updateCooldown = () => {
    if (typeof window === "undefined") return;
    const lastTime = localStorage.getItem(storageKey);
    if (lastTime) {
      const elapsed = Date.now() - Number(lastTime);
      if (elapsed < COOLDOWN_MS) {
        const minsLeft = Math.ceil((COOLDOWN_MS - elapsed) / (60 * 1000));
        setRemainingMinutes(minsLeft);
        return;
      }
    }
    setRemainingMinutes(0);
  };

  useEffect(() => {
    updateCooldown();
    const interval = setInterval(updateCooldown, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [email, storageKey]);

  // Only show this floating button when logged in as an Agent
  if (role !== "agent") return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    // Check cooldown before sending
    const lastTime = localStorage.getItem(storageKey);
    if (lastTime) {
      const elapsed = Date.now() - Number(lastTime);
      if (elapsed < COOLDOWN_MS) {
        const minsLeft = Math.ceil((COOLDOWN_MS - elapsed) / (60 * 1000));
        toast.warning(`Please wait ${minsLeft} minute(s) before sending another email to Admin.`);
        return;
      }
    }

    if (!form.subject.trim() || !form.message.trim()) {
      toast.warning("Please fill in both subject and message.");
      return;
    }

    contactMutation.mutate(
      { subject: form.subject.trim(), message: form.message.trim() },
      {
        onSuccess: (res) => {
          if (res.success) {
            // Save timestamp to localStorage
            localStorage.setItem(storageKey, Date.now().toString());
            updateCooldown();

            toast.success("Mail sent to Admin successfully!");
            setForm({ subject: "", message: "" });
            setIsOpen(false);
          } else {
            toast.error(res.error?.details || res.message || "Failed to send email.");
          }
        },
        onError: () => {
          toast.error("An unexpected error occurred while sending email.");
        },
      }
    );
  };

  const adminEmail = "support.bluehorizon2026@gmail.com";
  const mailtoUrl = `mailto:${adminEmail}?subject=${encodeURIComponent(
    form.subject || "Agent Support Inquiry"
  )}&body=${encodeURIComponent(form.message)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

      {/* Floating Popup Window */}
      {isOpen && (
        <div className="mb-4 w-[92vw] sm:w-[380px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-200" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide">Contact Admin Support</h3>
                <p className="text-[10px] text-blue-200/80">Direct Mail Communication</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSend} className="p-4 space-y-3.5 bg-slate-50/40">
            {/* Sender Info Badge */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 text-xs text-blue-900 flex items-center justify-between">
              <span className="font-semibold">From: {name || "Agent"}</span>
              <span className="text-[10px] text-blue-700 font-mono truncate max-w-[150px]">
                {email || ""}
              </span>
            </div>

            {/* ⏱️ Cooldown Notice Banner if sent within 1 hour */}
            {remainingMinutes > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Mail sent recently. Please wait <strong>{remainingMinutes} min(s)</strong> before sending another email.
                </span>
              </div>
            )}

            {/* Subject Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Booking inquiry or system issue"
                disabled={remainingMinutes > 0}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                required
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Message
              </label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Write your email message to admin..."
                disabled={remainingMinutes > 0}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                required
              />
            </div>

            {/* Buttons */}
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="submit"
                disabled={contactMutation.isPending || remainingMinutes > 0}
                className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {contactMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Sending Email...
                  </>
                ) : remainingMinutes > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    Cooldown ({remainingMinutes}m)
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Mail to Admin
                  </>
                )}
              </button>

              <a
                href={mailtoUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[11px] font-semibold transition text-center flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3 text-slate-400" />
                Open in Email App
              </a>
            </div>
          </form>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => {
          updateCooldown();
          setIsOpen(!isOpen);
        }}
        className={`group relative p-3.5 rounded-2xl shadow-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 ${isOpen
            ? "bg-slate-900 text-white"
            : "bg-gradient-to-r from-blue-900 to-indigo-900 text-white hover:shadow-2xl hover:scale-105"
          }`}
        title="Contact Admin via Email"
      >
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
          </span>
        )}

        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <Mail className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
          </>
        )}
      </button>

    </div>
  );
}

