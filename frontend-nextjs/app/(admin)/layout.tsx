"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import AdminSidebar from "./components/AdminSideBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* ၁။ Top Navbar */}
      <Navbar isMainPage={false} />

      {/* Floating button show on mobile */}
      <div className="md:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-blue-900 text-white p-3.5 rounded-full shadow-xl active:scale-95 transition"
        >
          {sidebarOpen ? (
            /* Close Icon X */
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            /* Hamburger Menu Icon */
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ၂။ Main Dashboard Layout Container */}
      <div className="flex flex-1 w-full relative">
        
        {/* Left side: Sidebar Component pass state*/}
        <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        {/* Right Side: Panel  */}
        <section className="flex-1 p-4 md:p-8 bg-slate-50 w-full overflow-x-hidden">
          {children}
        </section>

      </div>
    </main>
  );
}