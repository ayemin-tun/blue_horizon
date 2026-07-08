"use client";

import { useState, useEffect } from "react";

// ─── 📊 Myanmar NRC Data Dictionary ────────────────────────────────────────
const nrcCodes = Array.from({ length: 14 }, (_, i) => String(i + 1));

const nrcTypes = [
  { value: "N", label: "N" }, // Citizen
  { value: "E", label: "E" }, // Associate
  { value: "P", label: "P" }  // Naturalized
];

const nrcTownships: { [key: string]: string[] } = {
  "1": ["BaMaNa", "KaMaTa", "MaHaNa", "WaMaNa", "PaTaAh", "HaaPaNa"],
  "2": ["DaMaSa", "HlaBaNa", "KaPaLa", "MaSaNa", "YaDaNa", "LoKaNa"],
  "3": ["BaAhNa", "KaPaTa", "KaKaYa", "LaBaNa", "MaWaTa", "ThaTaNa"],
  "4": ["BaHaNa", "HaPaNa", "KaTaNa", "MaPaNa", "TaTaNa", "WaPaNa"],
  "5": ["AhTaNa", "BaMaNa", "KaNaTa", "MaLaNa", "PaLaBa", "SaKaNa"],
  "6": ["BaAhNa", "KaThaNa", "MaMaNa", "TaPaNa", "ThuMaNa", "YathaNa"],
  "7": ["AhPaNa", "DaO Na", "KaPaTa", "LaPaTa", "MaLaNa", "YaTaNa"],
  "8": ["AhLaNa", "BaKaTa", "GaGaNa", "KaMaNa", "MaBaNa", "TaTaNa"],
  "9": ["AhMaYa", "BaHaNa", "DaThaNa", "KaPaTa", "MaMaNa", "OThaNa"],
  "10": ["BaLaNa", "KaMaNa", "KaThaNa", "MaLaNa", "ThaPaNa", "PaHaNa"],
  "11": ["AhMaNa", "BaMaNa", "GaA Na", "KaMaNa", "MaTaNa", "TaPaNa"],
  "12": ["AhMaNa", "BaHaNa", "DaGaNa", "KaMaYa", "LaThaNa", "PaBeDa", "SaKaNa", "TaMaNa", "OuKaTa", "YaKaNa"],
  "13": ["HaPaNa", "KaLaNa", "KaThaNa", "MaTaNa", "TaYaNa", "YaNaNa"],
  "14": ["AhMaNa", "BaKaNa", "DaDaYa", "KaLaNa", "MaMaNa", "PaThaNa"]
};

interface NrcSelectorProps {
  value: string;
  onChange: (compiledNrc: string) => void;
}

export default function NrcSelector({ value, onChange }: NrcSelectorProps) {
  const [nrcStateCode, setNrcStateCode] = useState("");
  const [nrcTownshipCode, setNrcTownshipCode] = useState("");
  const [nrcType, setNrcType] = useState("N");
  const [nrcNumber, setNrcNumber] = useState("");
  const [isApplying, setIsApplying] = useState(value === "Applying");

  // Pre-fill fields if editing or returning with existing data
  useEffect(() => {
    if (value && value !== "Applying") {
      try {
        const parts = value.split("/");
        if (parts.length === 2) {
          const state = parts[0];
          const remaining = parts[1].split("(");
          const township = remaining[0];
          const typeAndNum = remaining[1].split(")");
          const type = typeAndNum[0];
          const num = typeAndNum[1];

          setNrcStateCode(state);
          setNrcType(type);
          setNrcNumber(num);
          if (nrcTownships[state]?.includes(township)) {
            setNrcTownshipCode(township);
          }
        }
      } catch (e) {
        console.error("Error parsing NRC string", e);
      }
    } else if (value === "Applying") {
      setIsApplying(true);
    }
  }, [value]);

  // Compile individual inputs into a structured string or pass down "Applying" status
  useEffect(() => {
    if (isApplying) {
      onChange("Applying");
    } else if (nrcStateCode && nrcTownshipCode && nrcType && nrcNumber.trim().length === 6) {
      onChange(`${nrcStateCode}/${nrcTownshipCode}(${nrcType})${nrcNumber.trim()}`);
    } else {
      onChange(""); 
    }
  }, [nrcStateCode, nrcTownshipCode, nrcType, nrcNumber, isApplying]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Myanmar NRC Number *</label>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 cursor-pointer select-none">
          <input 
            type="checkbox" 
            checked={isApplying} 
            onChange={(e) => {
              setIsApplying(e.target.checked);
              if (e.target.checked) {
                setNrcStateCode(""); setNrcTownshipCode(""); setNrcNumber("");
              }
            }}
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-900 focus:ring-blue-900" 
          />
          Applying
        </label>
      </div>

      {isApplying ? (
        <div className="w-full bg-slate-50 border border-dashed border-slate-200 text-slate-500 text-xs py-3.5 px-4 rounded-lg font-semibold italic">
          ✨ NRC will be registered as "Applying".
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
          {/* 1. State / Region Code */}
          <select 
            value={nrcStateCode} 
            onChange={(e) => { setNrcStateCode(e.target.value); setNrcTownshipCode(""); }} 
            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white text-slate-800 font-medium focus:border-blue-700 focus:outline-none"
          >
            <option value="">State Code</option>
            {nrcCodes.map(c => <option key={c} value={c}>{c}/</option>)}
          </select>

          {/* 2. Township Code */}
          <select 
            value={nrcTownshipCode} 
            disabled={!nrcStateCode}
            onChange={(e) => setNrcTownshipCode(e.target.value)} 
            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white text-slate-800 font-medium focus:border-blue-700 focus:outline-none disabled:opacity-50"
          >
            <option value="">Township</option>
            {(nrcTownships[nrcStateCode] || []).map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          {/* 3. Type Selection (N, E, P) */}
          <select 
            value={nrcType} 
            onChange={(e) => setNrcType(e.target.value)} 
            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white text-slate-800 font-medium focus:border-blue-700 focus:outline-none"
          >
            {nrcTypes.map(t => <option key={t.value} value={t.value}>({t.label})</option>)}
          </select>

          {/* 4. 6-Digit Serial Number */}
          <input 
            type="text" 
            maxLength={6}
            placeholder="123456" 
            value={nrcNumber} 
            onChange={(e) => setNrcNumber(e.target.value.replace(/\D/g, ""))} 
            className="w-full border border-slate-200 rounded-lg p-2.5 text-xs bg-white text-slate-800 font-medium focus:border-blue-700 focus:outline-none placeholder:text-slate-300" 
          />
        </div>
      )}
    </div>
  );
}