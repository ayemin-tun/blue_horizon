"use client";

import Image from "next/image";
import Link from "next/link";
import logoImg from "@/public/logo.png";
import ProfileSection from "./ProfileSection"; 

interface NavbarProps {
  isMainPage?: boolean;
}

export default function Navbar({ isMainPage = false }: NavbarProps) {
  return (
    <nav
      className={`flex items-center justify-between w-full px-6 md:px-12 pt-4 pb-4 transition-all duration-300 relative z-50 ${
        isMainPage
          ? "bg-transparent text-white"
          : "bg-white text-blue-950 shadow-sm border-b border-slate-100"
      }`}
    >
      {/* Left Side: Brand Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image
            src={logoImg}
            alt="Blue Horizon Logo"
            priority
            className={`h-full w-full object-contain transition-all ${
              isMainPage ? "filter brightness-0 invert" : ""
            }`}
          />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-wider leading-none mb-1">
            BLUE HORIZON
          </h2>
          <p className={`text-[10px] tracking-wide ${isMainPage ? "text-blue-100/70" : "text-slate-500"}`}>
            Air ticket analysis system
          </p>
        </div>
      </Link>

      {/* Right Side: Profile Section */}
      <ProfileSection isMainPage={isMainPage} />
      
    </nav>
  );
}