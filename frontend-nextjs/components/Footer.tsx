"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-blue-950 text-slate-400 text-xs py-12 mt-20 border-t border-blue-900/40">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Brand Info */}
        <div className="space-y-3">
          <h3 className="text-white font-bold tracking-wider text-sm font-serif">BLUE HORIZON</h3>
          <p className="text-slate-400/80 leading-relaxed">
            Advanced air ticket analytics system built for efficient flight monitoring and modern travel insights.
          </p>
        </div>

        {/* Center Column: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-bold tracking-wider uppercase text-[10px]">Quick Navigation</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-white transition">Home</Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition">Admin Portal</Link>
            </li>
            
          </ul>
        </div>

        {/* Right Column: Contact & Copyright */}
        <div className="space-y-3 md:text-right">
          <h4 className="text-white font-bold tracking-wider uppercase text-[10px] md:justify-end">System Support</h4>
          <p className="text-slate-400/80">
            For technical inquiries, contact the development operations team.
          </p>
          <div className="text-[11px] text-slate-500 pt-2">
            © {new Date().getFullYear()} Blue Horizon. All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
}