"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/services/store/bookingStore";
import { formatDuration } from "@/utils/timeHelper";
import FlightSummary from "./components/FlightSummary";
import SeatingInfo from "./components/SeatingInfo";


// ─── Main Page ────────────────────────────────────────────────────────────
export default function ChooseSeatPage() {
  const router = useRouter();
  const { selectedFlight, seatClass, seatCount, setSeats } = useBookingStore();

  // Redirect if no flight selected
  useEffect(() => {
    if (!selectedFlight) {
      router.replace("/search-flight");
    }
  }, [selectedFlight, router]);

  // ─── 💡 Dynamic Seat Limit Logic Preparation ───
  // ရွေးချယ်ထားတဲ့ Class အလိုက် Store ထဲက လက်ကျန်ခုံကို လှမ်းယူမယ်
  const availableSeats = selectedFlight
    ? seatClass === "business"
      ? selectedFlight.business_seats_available ?? 0
      : selectedFlight.economy_seats_available ?? 0
    : 0;

  // တစ်ခါဝယ်ရင် အများဆုံး ၅ ခုံ သို့မဟုတ် လေယာဉ်ပေါ်ကျန်တဲ့ခုံ အရေအတွက်အတိုင်းပဲ အများဆုံး ကန့်သတ်မယ်
  const allowedMaxSeats = Math.min(5, availableSeats);

  // Local state for passenger/seat count
  const [count, setCount] = useState(seatCount);

  // အကယ်၍ လက်ရှိရွေးထားတဲ့ count က ကျန်တဲ့ခုံထက် များနေရင် (ဥပမာ- အဟောင်းက ၃ ခုံဖြစ်ပြီး အခုလေယာဉ်ပေါ် ၁ ခုံပဲကျန်တော့ရင်) ၁ ခုံအဖြစ် အလိုအလျောက် ညှိပေးမယ်
  useEffect(() => {
    if (count > allowedMaxSeats && allowedMaxSeats > 0) {
      setCount(allowedMaxSeats);
    }
  }, [allowedMaxSeats, count]);

  const handleContinue = () => {
    const genericSeats = Array.from({ length: count }, (_, idx) => `Seat ${idx + 1} (Airport Check-in)`);
    setSeats(count, genericSeats);
    router.push("/fill-info");
  };

  const handleBack = () => {
    if (selectedFlight) {
      const date = encodeURIComponent(selectedFlight.flight_date);
      const from = encodeURIComponent(selectedFlight.departure_city);
      const to = encodeURIComponent(selectedFlight.arrival_city);
      router.push(`/search-flight?date=${date}&from=${from}&to=${to}`);
    } else {
      router.push("/search-flight");
    }
  };

  if (!selectedFlight) return null;

  const price =
    seatClass === "business"
      ? selectedFlight.business_price
      : selectedFlight.economy_price;
  const totalPrice = price * count;

  return (
    <div className="space-y-6">
      <FlightSummary />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Side: Airport Seating Info ─────────────────────────── */}
        <SeatingInfo/>

        {/* ── Right Panel: Quantity & Price Summary ─────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Seat Count Picker */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 text-center">
              Number of Seats
            </h3>
            <div className="flex items-center justify-between px-4">
              {/* Minus Button */}
              <button
                type="button"
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                disabled={count <= 1}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-blue-900 font-bold hover:bg-slate-50 transition active:scale-90 text-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                −
              </button>
              
              <span className="text-4xl font-extrabold text-blue-900">{count}</span>
              
              {/* Plus Button */}
              <button
                type="button"
                onClick={() => setCount((c) => Math.min(allowedMaxSeats, c + 1))}
                disabled={count >= allowedMaxSeats}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-blue-900 font-bold hover:bg-slate-50 transition active:scale-90 text-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            
            {/* show available seat alert text */}
            <div className="mt-3 text-center space-y-1">
              <p className="text-[10px] text-slate-400">
                You can book up to {allowedMaxSeats} seats at most
              </p>
              <p className="text-[11px] font-bold text-blue-900 bg-blue-50 py-1 px-3 rounded-md inline-block">
                Total Available in {seatClass}: <span className="text-emerald-600">{availableSeats} seat left</span>
              </p>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-blue-900 rounded-xl p-6 text-white shadow-md">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-blue-200">Seat Class</span>
              <span className="font-bold capitalize">{seatClass}</span>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-blue-200">Price per seat</span>
              <span className="font-bold">MMK {price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs mb-4">
              <span className="text-blue-200">Total passengers</span>
              <span className="font-bold">× {count}</span>
            </div>
            <div className="border-t border-blue-700 pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold">Total Amount</span>
              <span className="text-xl font-black">MMK {totalPrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition"
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              disabled={allowedMaxSeats <= 0}
              className="flex-1 py-3 bg-blue-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-950 transition active:scale-95 text-center shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}