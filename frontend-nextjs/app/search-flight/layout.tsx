"use client";

import Navbar from "@/components/Navbar";
import BookingStepper from "./components/BookingStepper";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. Main Nav bar */}
      <Navbar isMainPage={false} />

      {/* 2. Main Content Container */}
      <div className="flex flex-1 flex-col w-full max-w-7xl mx-auto py-6">
        
        <BookingStepper />

        <section className="flex-1 w-full overflow-x-hidden bg-slate-50">
          {children}
        </section>
      </div>
    </main>
  );
}