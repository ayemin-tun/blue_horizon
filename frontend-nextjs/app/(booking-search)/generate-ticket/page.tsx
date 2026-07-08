"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/services/store/bookingStore";
import { formatDuration, formatDisplayTime, formatDisplayDate } from "@/utils/timeHelper";
import { buildBookingPayload, saveConfirmedTicketToLocalStorage } from "@/utils/ticketHelper";
import BarcodeStrip from "./components/BarcodeStrip";
import { toast } from "@/services/store/alertStore";
import { useCreateBookingMutation } from "@/services/BookingService";

export default function GenerateTicketPage() {
  const router = useRouter();
  const {
    selectedFlight,
    seatClass,
    selectedSeats,
    passengers,
    seatCount,
    reset,
  } = useBookingStore();

  const [isVisible, setIsVisible] = useState(false);
  const [showJson, setShowJson] = useState(false);

  // State Management 
  const [isIssued, setIsIssued] = useState(false); // To check if the ticket has been issued successfully
  const [ticketId, setTicketId] = useState<string | null>(null); // Ticket Code provided by the backend
  const [backendPayload, setBackendPayload] = useState<any>(null);

  const createBookingMutation = useCreateBookingMutation();
  // Redirect guard
  useEffect(() => {
    if (!selectedFlight || passengers.length === 0 || !passengers[0].name) {
      router.replace("/fill-info");
    } else {
      // Build the payload structural format beforehand and store it in state
      setBackendPayload(buildBookingPayload());
      setIsVisible(true);
    }
  }, [selectedFlight, passengers, router]);

  const handleBackToInfo = () => {
    router.push("/fill-info");
  };

  const handleIssueTicket = async () => {
    createBookingMutation.mutate(backendPayload, {
      onSuccess: (result) => {
        if (result.success) {
          toast.success("Ticket Issued Successfully!");
          setTicketId(result.data.ticket_id);
          setIsIssued(true);
          useBookingStore.getState().setIsIssued(true);
          saveConfirmedTicketToLocalStorage(result.data);
        } else {
          toast.error(`Booking Failed: ${result.error?.details || result.message}`);
        }
      },
      onError: (error) => {
        console.error("Mutation Error:", error);
        toast.error("Internal Server Error. Please check your backend connections.");
      }
    });
  };

  if (!selectedFlight || !backendPayload) return null;

  // Derive loading status dynamically directly via TanStack state machine flags
  const isLoading = createBookingMutation.isPending;

  const price = seatClass === "business" ? selectedFlight.business_price : selectedFlight.economy_price;
  const totalPrice = price * seatCount;

  const formattedDate = formatDisplayDate(selectedFlight.flight_date);

  return (
    <div className={`space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

      {/* 🟢 Dynamic Status Banners */}
      {!isIssued ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 font-bold">⚠️</div>
          <div>
            <p className="text-sm font-bold text-amber-800">Review Booking Details</p>
            <p className="text-xs text-amber-600 mt-0.5">Please verify that all information is accurate. Click "Issue Ticket" to finalize and generate your pass.</p>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 font-bold">✓</div>
          <div>
            <p className="text-sm font-bold text-emerald-800">Ticket Issued Successfully!</p>
            <p className="text-xs text-emerald-600 mt-0.5">Your booking transaction has been finalized. Have a wonderful and safe flight!</p>
          </div>
        </div>
      )}

      {/* ── Boarding Pass Card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden">
        {/* Top Header */}
        <div className={`${isIssued ? "bg-blue-900" : "bg-slate-700"} px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-500`}>
          <div>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">
              Blue Horizon Airways — {isIssued ? "Boarding Pass" : "Booking Preview"}
            </p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-3xl font-black text-white">{selectedFlight.departure_city}</p>
                <p className="text-xs text-blue-300 font-semibold">
                  {formatDisplayTime(selectedFlight.departure_time)}
                </p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-blue-300">{formatDuration(selectedFlight.duration)}</span>
                <div className="flex items-center gap-1 w-20">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-300" />
                  <div className="flex-1 h-px bg-blue-500" />
                  <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
                </div>
              </div>
              <div>
                <p className="text-3xl font-black text-white">{selectedFlight.arrival_city}</p>
                <p className="text-xs text-blue-300 font-semibold">
                  {formatDisplayTime(selectedFlight.arrival_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket ID Area */}
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-widest">Ticket ID</p>
            {isIssued && ticketId ? (
              <>
                <p className="text-xl font-black text-white tracking-widest animate-pulse">{ticketId}</p>
                <BarcodeStrip value={ticketId} />
              </>
            ) : (
              <p className="text-xs font-bold text-slate-300 italic bg-slate-800/60 px-3 py-1.5 rounded-md">PENDING ISSUE</p>
            )}
          </div>
        </div>

        {/* Dynamic Tear Line */}
        <div className="flex items-center">
          <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 -ml-2.5 shrink-0" />
          <div className="flex-1 border-t-2 border-dashed border-slate-200 mx-2" />
          <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 -mr-2.5 shrink-0" />
        </div>

        {/* Flight Details & Passenger Rows */}
        <div className="px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5 border-b border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Airline</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedFlight.airline_name}</p>
            <p className="text-[10px] text-slate-400">{selectedFlight.flight_no}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{formattedDate}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class</p>
            <span className={`inline-block mt-0.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${seatClass === "business" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
              {seatClass}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seats</p>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {selectedSeats.map((s, idx) => (
                <span key={idx} className="text-[10px] font-bold bg-blue-900 text-white px-2.5 py-0.5 rounded-full">
                  {isIssued ? "Assigned" : "Auto-Assign"}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Passengers Listing */}
        <div className="px-8 py-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Passenger Details</p>
          <div className="space-y-3">
            {passengers.map((p, i) => (
              <div key={i} className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-sm font-bold text-slate-800 truncate">{p.name}</span>
                <span className="text-[10px] text-slate-500 font-medium">NRC: <span className="font-bold text-slate-700">{p.nrc || "N/A"}</span></span>
                <span className="text-[10px] text-slate-500 font-medium capitalize">{p.gender} · DOB: {p.dob}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Price Section */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Passengers</p>
                <p className="font-bold text-slate-800 mt-0.5">{seatCount}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Amount</p>
              <p className="text-2xl font-black text-blue-900">MMK {totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Payload Preview Box for debug only*/}
      {/* <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg print:hidden">
        <button type="button" onClick={() => setShowJson(!showJson)} className="w-full flex items-center justify-between px-6 py-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/50 transition">
          <span className="flex items-center gap-2"><span className="font-mono text-emerald-400">{"{ }"}</span>Request Body Payload</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{showJson ? "Hide ▲" : "Show ▼"}</span>
        </button>
        {showJson && (
          <div className="border-t border-slate-800 p-6 bg-slate-950 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-[350px]">
            <pre>{JSON.stringify(backendPayload, null, 2)}</pre>
          </div>
        )}
      </div> */}

      <div className="bg-amber-50 border border-amber-100 rounded-xl px-6 py-4 text-xs space-y-1 print:hidden">
        <p className="font-bold text-amber-800 mb-2">⚠ Important Notes</p>
        <p className="text-amber-700">• Please arrive at the airport at least 2 hours before departure.</p>
        <p className="text-amber-700">• Carry a printed or digital copy of this ticket along with valid ID.</p>
        <p className="text-amber-700">• This ticket is non-refundable and non-transferable.</p>
        {isIssued && ticketId && (
          <p className="text-amber-700">
            • Ticket ID: <strong className="text-amber-800">{ticketId}</strong>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pb-8 print:hidden">
        {!isIssued ? (
          <>
            <button
              onClick={handleBackToInfo}
              disabled={isLoading}
              className="w-full flex-1 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleIssueTicket}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-blue-900 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-blue-950 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Issuing Ticket..." : "Issue Ticket"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => window.print()}
              className="flex-1 py-3.5 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              Print Boarding Pass
            </button>
            <button
              onClick={() => { reset(); router.push("/"); }}
              className="flex-1 py-3.5 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              Book Another Flight
            </button>
          </>
        )}
      </div>
    </div>
  );
}