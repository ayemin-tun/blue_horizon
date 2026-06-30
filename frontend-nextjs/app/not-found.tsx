'use client';

import Link from 'next/link';
import { useState, useEffect } from "react";
import { useAuthStore } from "@/services/store/authStore";
// ─── Lucide Icons Import ───────────────────────────────────────────────────
import { PlaneTakeoff, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const getValidToken = useAuthStore((state) => state.getValidToken);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    setHasToken(!!getValidToken());
  }, [getValidToken]);

  // Admin ဖြစ်ရင် /admin ကို ပြန်မယ်၊ မဟုတ်ရင် / ကို ပြန်မယ်
  const redirectUrl = hasToken && role === 'admin' ? '/admin' : '/';
  const buttonLabel = hasToken && role === 'admin' ? 'Back to Dashboard' : 'Back to Home';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-slate-50 to-blue-50/30 text-center px-6 relative overflow-hidden">
      
      {/* ── Background Decorative Elements (လေယာဉ်လမ်းကြောင်း ပုံစံနောက်ခံလိုင်းများ) ── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
      
      {/* ── 404 & Plane Animation Section ── */}
      <div className="relative mb-6 select-none">
        {/* 404 စာသားကြီး */}
        <div className="text-[12rem] font-black text-blue-900/4 leading-none tracking-tighter">
          404
        </div>
        
        {/* စာသားအလယ်တည့်တည့်မှာ ပျံတက်နေမယ့် လေယာဉ်အိုင်ကွန် */}
        <div className="absolute inset-0 flex items-center justify-center animate-bounce duration-1000">
          <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-xl shadow-blue-900/5 text-blue-900">
            <PlaneTakeoff className="w-12 h-12 stroke-[1.5]" />
          </div>
        </div>
      </div>

      {/* ── Message ── */}
      <h2 className="text-3xl font-extrabold text-blue-950 mb-3 tracking-tight">
        Lost in the Clouds?
      </h2>
      <p className="text-slate-500 mb-8 max-w-sm text-sm leading-relaxed">
        Oops! The page you are looking for has departed, changed its flight route, or doesn't exist anymore.
      </p>

      {/* ── Action Button ── */}
      <Link
        href={redirectUrl}
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-900/10 active:scale-95 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        {buttonLabel}
      </Link>
    </div>
  );
}