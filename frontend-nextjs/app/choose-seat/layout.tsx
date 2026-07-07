"use client";

import Navbar from "@/components/Navbar";
import BookingStepper from "@/components/BookingStepper";

export default function ChooseSeatLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar isMainPage={false} />
      <div className="flex flex-1 flex-col w-full max-w-7xl mx-auto py-6 px-4">
        <BookingStepper />
        <section className="flex-1 w-full overflow-x-hidden">{children}</section>
      </div>
    </main>
  );
}
