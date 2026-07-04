"use client";

import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = "md" 
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} mx-4 overflow-hidden transform transition-all duration-300 scale-100`}>
        {/* Header */}
        <div className="bg-linear-to-r from-blue-900 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-sm tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition rounded-lg p-1 hover:bg-white/10 focus:outline-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content Body */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}