import { ReactNode } from 'react';

export default function PasswordRequestLayout({ children }: { children: ReactNode }) {
  return (
    <div className="p-2 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="border-b border-slate-200 mb-6 pb-6">
        <h1 className="text-2xl font-bold text-blue-950 font-serif">Blue Horizon · Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
           Route demand, seasonal trend, agent and airline performance — computed from confirmed bookings.
        </p>
      </div>

      <main>{children}</main>
    </div>
  );
}