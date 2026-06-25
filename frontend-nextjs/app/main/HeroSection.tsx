"use client";

import Image from "next/image";
import logoImg from "@/public/logo.png";
import Navbar from "@/components/Navbar";
export default function HeroSection() {
  return (
    <div
      className="relative h-96 w-full bg-cover bg-center flex flex-col justify-between pb-24 text-white "
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(30, 58, 138, 0.5), rgba(56, 189, 248, 0.25)), url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1600')`
      }}
    >
      {/* 🏷️ Top Left Logo Area nav */}
      <Navbar isMainPage={true}/>

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