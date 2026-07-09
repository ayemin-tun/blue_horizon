"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/services/store/authStore";

interface ProfileDropdownProps {
  isMainPage?: boolean;
}

export default function ProfileDropdown({ isMainPage = false }: ProfileDropdownProps) {
  const router = useRouter();
  const name = useAuthStore((state) => state.name);
  const role = useAuthStore((state) => state.role);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const logout = useAuthStore((state) => state.logout);

  // Dropdown Close from outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setIsOpen(false);
    
    // ⚠️ router.push
    window.location.href = "/login";
  };

  // (Routes)
  const isAdmin = role?.toLowerCase() === "admin";
  
  const profileHref = isAdmin ? "/admin/edit_profile" : "/agent/edit_profile";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Circle Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none transition active:scale-95 block"
      >
        <div className={`h-9 w-9 rounded-full border-2 flex items-center justify-center overflow-hidden bg-slate-100 ${isMainPage ? "border-white/80" : "border-blue-900/20"
          }`}>
          <svg
            className={`h-6 w-6 ${isMainPage ? "text-blue-950" : "text-slate-600"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5-4-8-4z" />
          </svg>
        </div>
      </button>

      {/* Dropdown Box Menu*/}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl border border-slate-200 text-slate-800 text-xs overflow-hidden z-50">
          {/* Header / Account Name */}
          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b border-slate-100">
            <span className="font-bold text-slate-700">{name || "User"}</span>
            <span className={`font-semibold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ${isAdmin ? "bg-red-500 text-white" : "bg-blue-600 text-white"
              }`}>
              {role || "agent"}
            </span>
          </div>

          {/* Menu Items */}
          {/* Edit Profile: Click for Agent */}
          <Link
            href={profileHref}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 border-b border-slate-100 transition"
          >
            Edit Profile
          </Link>

          {isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 border-b border-slate-100 transition"
            >
              Admin Dashboard
            </Link>
          ) : (
            <Link
              href="/agent/booking"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 border-b border-slate-100 transition"
            >
              My Bookings
            </Link>
          )}

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 font-bold text-red-600 hover:bg-red-50/50 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}