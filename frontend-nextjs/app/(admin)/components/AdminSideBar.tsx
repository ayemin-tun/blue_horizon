"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePendingPasswordRequestsCountQuery } from "@/services/passwordRequestService";
interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const pathname = usePathname();

  const { data: pendingRes } = usePendingPasswordRequestsCountQuery();
  
  const pendingCount = pendingRes?.data?.pending_count ?? 0;

  const menuItems = [
    {
      id: "overview",
      label: "System Overview",
      path: "/admin",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      )
    },
    {
      id: "flights",
      label: "Flight Management",
      path: "/admin/flight_mang",
      icon: (
        <svg className="w-4 h-4 relative -rotate-45" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M17.8 19.2L16 11l3.5-3.5c.5-.5.5-1.3 0-1.8s-1.3-.5-1.8 0L14.2 9.2 6 7.4 3.5 9.9l6.5 3.5-3.5 3.5H4.3l-1.8 1.8 3.5.7.7 3.5 1.8-1.8v-2.2l3.5-3.5 3.5 6.5z" />
        </svg>
      )
    },
    {
      id: "schedule",
      label: "Active Schedule",
      path: "/admin/today_schedule",
      icon: (
        <svg className="w-4 h-4 relative " viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      id: "bookings",
      label: "Booking History",
      path: "/admin/booking_history",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: "agents",
      label: "Agent Management",
      path: "/admin/agent",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: "passwords",
      label: "Password Request",
      path: "/admin/password_request",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      showBadge: true 
    },
    {
      id: "forecasting",
      label: "Demand Forecasting",
      path: "/admin/forecast",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      id: "reports",
      label: "Generate Report",
      path: "/admin/generate_report",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col pt-16 md:pt-2 shrink-0
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        md:h-full md:overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <ul className="w-full flex flex-col">
          {menuItems.map((item) => {
            const isActive = item.id === "overview"
              ? pathname === "/admin"
              : pathname.startsWith(item.path);

            return (
              <li key={item.id} className="w-full">
                <Link
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center justify-between px-6 md:px-8 py-3.5 text-xs font-semibold tracking-wide transition-all duration-200 border-b border-slate-100/70 ${
                    isActive
                      ? "bg-blue-900 text-white font-bold"
                      : "text-blue-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <span className={`${isActive ? "text-white" : "text-blue-900/70"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.showBadge && pendingCount > 0 && (
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold rounded-full transition-all duration-300 ${
                      isActive 
                        ? "bg-white text-blue-900 animate-pulse" 
                        : "bg-red-500 text-white"
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}