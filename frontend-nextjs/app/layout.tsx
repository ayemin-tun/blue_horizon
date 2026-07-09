import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./provider";
import AlertContainer from "@/components/AlertContainer";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
import React, { Suspense } from 'react';
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Blue Horizon",
    template: "Blue Horizon - %s",
  },
  description: "Explore the world with Blue Horizon. Fly to your dream destinations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[50vh] text-sm text-slate-500">
            Loading Page...
          </div>
        }>
          <Providers>
            <AlertContainer />
            {children}
          </Providers>
        </Suspense>
      </body>
    </html>
  );
}
