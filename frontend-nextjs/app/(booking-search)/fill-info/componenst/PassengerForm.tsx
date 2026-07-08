import { PassengerInfo } from "@/services/store/bookingStore";
import { formatDob, parseDob } from "@/utils/timeHelper";
import DatePicker from "react-datepicker";

interface PassengerFormProps {
  index: number;
  seatLabel: string;
  value: PassengerInfo;
  onChange: (updated: PassengerInfo) => void;
}

export default function PassengerForm({ index, seatLabel, value, onChange }: PassengerFormProps) {
  const handleField = (field: keyof PassengerInfo, val: string) => {
    onChange({ ...value, [field]: val });
  };

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700/20 transition";

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="bg-blue-900 px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">
            Passenger {index + 1}
          </p>
          <p className="text-sm font-bold text-white">
            Seat <span className="text-blue-200">{seatLabel}</span>
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Ko Aung Kyaw"
            value={value.name}
            onChange={(e) => handleField("name", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* NRC / Passport */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            NRC / Passport No. <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 12/AhMaNa(N)123456"
            value={value.nrc}
            onChange={(e) => handleField("nrc", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Date of Birth — react-datepicker (fixes Safari native date input bugs) */}
        <div className="dob-field">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Date of Birth <span className="text-rose-500">*</span>
          </label>
          <DatePicker
            selected={parseDob(value.dob)}
            onChange={(date: Date | null) => handleField("dob", formatDob(date))}
            maxDate={new Date()}
            placeholderText="Select date"
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            yearDropdownItemNumber={100}
            scrollableYearDropdown
            wrapperClassName="w-full"
            className={inputClass}
            autoComplete="off"
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Gender <span className="text-rose-500">*</span>
          </label>
          <select
            value={value.gender}
            onChange={(e) => handleField("gender", e.target.value)}
            className={inputClass}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="e.g. 09-XXXXXXXXX"
            autoComplete="off"
            value={value.phone}
            onChange={(e) => handleField("phone", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
