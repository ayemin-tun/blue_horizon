"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* ၁။ Top Navbar */}
      <Navbar isMainPage={false} />

        {/* Right Side: Panel  */}
        <section className="min-h-screen bg-[#fcfcfc] font-sans text-gray-800 pb-16">
          {children}
        </section>

    </main>
  );
}