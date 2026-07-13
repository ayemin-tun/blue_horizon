"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AdminSidebar from "./components/AdminSideBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // h-screen နဲ့ overflow-hidden ပေးပြီး main layout ကြီး တစ်ခုလုံး မရွေ့အောင် ပိတ်ထားမယ်
    <main className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden relative">
      
      {/* ၁။ Top Navbar (အပေါ်မှာ မြဲနေမယ်) */}
      <Navbar isMainPage={false} />

      {/* Floating button show on mobile */}
      <div className="md:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-blue-900 text-white p-3.5 rounded-full shadow-xl active:scale-95 transition"
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex flex-1 h-full w-full min-h-0 relative">
        
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <section className="flex-1 p-4 md:p-5 w-full h-full overflow-y-auto overflow-x-hidden content-container">
          {children}
        </section>

      </div>
    </main>
  );
}