import { useBookingStore } from "@/services/store/bookingStore";
import { useAuthStore } from "@/services/store/authStore";

export function buildBookingPayload() {
  const state = useBookingStore.getState();
  const currentFlight = state.selectedFlight;
  const currentClass = state.seatClass;
  const currentPassengers = state.passengers;
  const agent_id = useAuthStore.getState().userId;

  const currentPrice =
    currentClass === "business"
      ? currentFlight?.business_price ?? 0
      : currentFlight?.economy_price ?? 0;

  return {
    flight_instance_id: currentFlight?.flight_instance_id,
    user_id: agent_id, 
    seat_class: currentClass,
    total_price: currentPrice * currentPassengers.length,
    passengers: currentPassengers.map((p) => ({
      name: p.name,
      nrc: p.nrc,
      dob: p.dob,
      gender: p.gender,
      phone: p.phone
    })),
    booked_at: new Date().toISOString(),
  };
}

// Store token on local store when api is get ticket
export function saveConfirmedTicketToLocalStorage(backendResponseData: any) {
  if (typeof window !== "undefined") {
    const existing = JSON.parse(
      localStorage.getItem("bluehorizon-tickets") || "[]"
    );
    
    // check duplicate base on ticket
    if (!existing.find((b: any) => b.ticket_id === backendResponseData.ticket_id)) {
      existing.push(backendResponseData);
      localStorage.setItem("bluehorizon-tickets", JSON.stringify(existing));
    }
  }
}