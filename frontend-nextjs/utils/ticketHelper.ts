import { useBookingStore } from "@/services/store/bookingStore";

// ─── ၁။ Ticket ID Generator ───
export function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "BH-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ─── ၂။ Save Ticket to LocalStorage & Payload Builder ───
export function saveTicketToLocalStorage(ticketId: string) {
  // Zustand Store ထဲက လက်ရှိ State တွေကို ဆွဲထုတ်ယူမယ်
  const state = useBookingStore.getState();
  const currentFlight = state.selectedFlight;
  const currentClass = state.seatClass;
  const currentSeats = state.selectedSeats;
  const currentPassengers = state.passengers;
  
  const currentPrice =
    currentClass === "business"
      ? currentFlight?.business_price ?? 0
      : currentFlight?.economy_price ?? 0;

  // 💡 Backend format နှင့် တစ်ထပ်တည်းကျသော Payload တည်ဆောက်ခြင်း
  const bookingData = {
    ticket_id: ticketId,
    flight_instance_id: currentFlight?.flight_instance_id, // 👈 အရေးကြီးဆုံး Foreign Key ID ပါဝင်ပါသည်
    flight_no: currentFlight?.flight_no,
    airline_name: currentFlight?.airline_name,
    departure_city: currentFlight?.departure_city,
    arrival_city: currentFlight?.arrival_city,
    departure_time: currentFlight?.departure_time,
    arrival_time: currentFlight?.arrival_time,
    flight_date: currentFlight?.flight_date,
    seat_class: currentClass,
    seat_count: currentPassengers.length,
    total_price: currentPrice * currentPassengers.length,
    passengers: currentPassengers.map((p, idx) => ({
      name: p.name,
      nrc: p.nrc,
      dob: p.dob,
      gender: p.gender,
      phone: p.phone,
      seat: currentSeats[idx] || "Auto-Assigned",
    })),
    booked_at: new Date().toISOString(),
  };

  // LocalStorage ထဲသို့ သွားရောက်သိမ်းဆည်းခြင်း (Avoid Duplicates)
  if (typeof window !== "undefined") {
    const existing = JSON.parse(
      localStorage.getItem("bluehorizon-tickets") || "[]"
    );
    
    if (!existing.find((b: { ticket_id: string }) => b.ticket_id === ticketId)) {
      existing.push(bookingData);
      localStorage.setItem("bluehorizon-tickets", JSON.stringify(existing));
    }
  }

  return bookingData;
}