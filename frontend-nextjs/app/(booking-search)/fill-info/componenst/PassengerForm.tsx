"use client";

import { useState, useEffect } from "react";
import { PassengerInfo } from "@/services/store/bookingStore";
import { formatDob, parseDob } from "@/utils/timeHelper";
import DatePicker from "react-datepicker";
import NrcSelector from "./NrcSelector";

interface PassengerFormProps {
  index: number;
  seatLabel: string;
  value: PassengerInfo;
  onChange: (updated: PassengerInfo) => void;
  onValidate: (index: number, missingFields: string[]) => void;
}

export default function PassengerForm({ index, seatLabel, value, onChange, onValidate }: PassengerFormProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const handleField = (field: keyof PassengerInfo, val: string) => {
    onChange({ ...value, [field]: val });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // ─── 💡 Validation Controller ───
  useEffect(() => {
    const missing: string[] = [];

    if (!value.name.trim()) missing.push("Full Name");

    const isNrcValid = value.nrc === "Applying" || (!!value.nrc && value.nrc.length >= 10);
    if (!isNrcValid) missing.push("NRC");

    if (!value.dob) {
      missing.push("Date of Birth");
    } else {
      const date = parseDob(value.dob);
      if (date && date > new Date()) missing.push("Date of Birth (cannot be in the future)");
    }

    if (!value.gender) missing.push("Gender");

    if (!value.phone.trim()) {
      missing.push("Phone Number");
    } else {
      const phoneRegex = /^(09|\+959)\d{7,9}$/;
      if (!phoneRegex.test(value.phone.trim().replace(/[-\s]/g, ""))) {
        missing.push("Phone Number (invalid format)");
      }
    }

    onValidate(index, missing);
  }, [value]);

  // ─── Field-level error checks (used for inline messages) ───
  const getFieldError = (field: string): string => {
    // Explicit errors first (e.g. format errors from onBlur)
    if (errors[field]) return errors[field];
    // Then check touched + empty/invalid
    if (!touched[field]) return "";
    switch (field) {
      case "name":
        return !value.name.trim() ? "Full Name is required." : "";
      case "nrc": {
        const valid = value.nrc === "Applying" || (!!value.nrc && value.nrc.length >= 10);
        return !valid ? "NRC is required." : "";
      }
      case "dob":
        if (!value.dob) return "Date of Birth is required.";
        const d = parseDob(value.dob);
        return d && d > new Date() ? "Date of Birth cannot be in the future." : "";
      case "gender":
        return !value.gender ? "Gender is required." : "";
      case "phone":
        if (!value.phone.trim()) return "Phone Number is required.";
        const phoneRegex = /^(09|\+959)\d{7,9}$/;
        return !phoneRegex.test(value.phone.trim().replace(/[-\s]/g, "")) ? "Invalid phone number format." : "";
      default:
        return "";
    }
  };

  const getInputClass = (fieldName: string) => {
    const baseClass = "w-full border rounded-lg px-3 py-2.5 text-xs font-medium placeholder:text-slate-300 focus:outline-none transition bg-white ";
    const hasError = !!getFieldError(fieldName);
    if (hasError) return baseClass + "border-rose-400 bg-rose-50/40 text-rose-900 ring-1 ring-rose-200";
    return baseClass + "border-slate-200 text-slate-800 focus:border-blue-700 focus:ring-1 focus:ring-blue-700/20";
  };

  const ErrorMsg = ({ field }: { field: string }) => {
    const msg = getFieldError(field);
    if (!msg) return null;
    return <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><span>⚠</span> {msg}</p>;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-blue-900 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Passenger {index + 1}</p>
          <p className="text-sm font-bold text-white"><span className="text-blue-200">{seatLabel}</span></p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
          <input
            type="text"
            placeholder="e.g. Ko Aung Kyaw"
            value={value.name}
            onChange={(e) => handleField("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={getInputClass("name")}
          />
          <ErrorMsg field="name" />
        </div>

        <div className="sm:col-span-2">
          <NrcSelector
            value={value.nrc}
            onChange={(compiledNrc) => handleField("nrc", compiledNrc)}
          />
          <ErrorMsg field="nrc" />
        </div>

        {/* Date of Birth */}
        <div className="dob-field">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Date of Birth *</label>
          <DatePicker
            selected={parseDob(value.dob)}
            onChange={(date: Date | null) => {
              handleField("dob", formatDob(date));
              setTouched(p => ({ ...p, dob: true }));
              let msg = "";
              if (date && date > new Date()) msg = "Date of Birth cannot be in the future.";
              setErrors(p => ({ ...p, dob: msg }));
            }}
            onCalendarClose={() => handleBlur("dob")}
            maxDate={new Date()}
            placeholderText="Select date" dateFormat="dd/MM/yyyy" showYearDropdown showMonthDropdown dropdownMode="select" yearDropdownItemNumber={100} scrollableYearDropdown wrapperClassName="w-full" className={getInputClass("dob")} autoComplete="off" />
          <ErrorMsg field="dob" />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender *</label>
          <div className="relative">
            <select
              value={value.gender}
              onChange={(e) => { handleField("gender", e.target.value); setTouched(p => ({ ...p, gender: true })); }}
              onBlur={() => handleBlur("gender")}
              className={getInputClass("gender") + " appearance-none pr-8"}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {/* custom arrow, same in every browser */}
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <ErrorMsg field="gender" />
        </div>

        {/* Phone */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number *</label>
          <input
            type="tel"
            placeholder="e.g. 09XXXXXXXXX"
            value={value.phone}
            onChange={(e) => handleField("phone", e.target.value)}
            onBlur={(e) => {
              handleBlur("phone");
              const phoneRegex = /^(09|\+959)\d{7,9}$/;
              const msg = phoneRegex.test(e.target.value.trim().replace(/[-\s]/g, "")) ? "" : "Invalid phone number.";
              setErrors(p => ({ ...p, phone: msg }));
            }}
            className={getInputClass("phone")}
          />
          <ErrorMsg field="phone" />
        </div>
      </div>
    </div>
  );
}