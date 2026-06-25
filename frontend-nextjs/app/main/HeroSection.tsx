"use client";

import Image from "next/image";
import logoImg from "@/public/logo.png";
export default function HeroSection() {
  return (
    <div
      className="relative h-96 w-full bg-cover bg-center flex flex-col justify-between pt-5 pb-24 text-white px-6 md:px-12"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 58, 138, 0.5), rgba(56, 189, 248, 0.25)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1600')`
      }}
    >
      {/* 🏷️ Top Left Logo Area */}
      <div className="flex items-center gap-3 self-start">
        {/* Logo Icon */}
        <div className="relative h-10 w-10">
          <Image
            src={logoImg}
            alt="Blue Horizon Logo"
            priority
            className="h-full w-full object-contain filter brightness-0 invert"
          />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-wider leading-none mb-1">BLUE HORIZON</h2>
          <p className="text-[10px] text-blue-100/70 tracking-wide">Air ticket analysis system</p>
        </div>
      </div>

      {/* 💬 Center Quote Area */}
      <div className="w-full flex justify-center text-center px-4">
        <p className="max-w-xl text-base md:text-lg font-serif italic text-white leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
          "Comfort, safety, and unmatched reliability. Your next journey starts with Blue Horizon."
        </p>
      </div>

      {/* Layout Spacer */}
      <div className="h-4 hidden md:block" />
    </div>
  );
}