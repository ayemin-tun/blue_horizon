"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeBoxProps {
  value: string;
  size?: number;
  showCaption?: boolean;
}

export default function QRCodeBox({ value, size = 96, showCaption = true }: QRCodeBoxProps) {
  return (
    <div className="flex flex-col items-center bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 shrink-0">
      <QRCodeSVG
        value={value}
        size={size}
        bgColor="#ffffff"
        fgColor="#0f172a"
        level="M"
        includeMargin={false}
      />
      {showCaption && (
        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider mt-1.5">
          Scan to Verify
        </span>
      )}
    </div>
  );
}
