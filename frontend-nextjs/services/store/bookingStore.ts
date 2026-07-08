import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FlightResult {
  flight_instance_id: number;
  airline_name: string;
  flight_no: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  departure_city: string;
  arrival_city: string;
  flight_date: string;
  economy_price: number;
  business_price: number;
  seats_available: number;
  economy_seats_available?: number;
  business_seats_available?: number;
}

// ─── Passenger Info ────────────────────────────────────────────────────────
export interface PassengerInfo {
  name: string;
  nrc: string;       // NRC or Passport number
  dob: string;       // YYYY-MM-DD
  gender: "male" | "female" | "other" | "";
  phone: string;
}

// ─── Booking Store State ───────────────────────────────────────────────────
interface BookingState {
  // Step 1 — Flight + class selection
  selectedFlight: FlightResult | null;
  seatClass: "economy" | "business" | null;

  // Step 2 — Seat count and chosen seat labels
  seatCount: number;
  selectedSeats: string[]; // e.g. ["12A", "12B"]

  // Step 3 — Passenger info (one per seat)
  passengers: PassengerInfo[];

  // Step 4 — Generated ticket
  ticketId: string | null;
  isIssued: boolean;
  setIsIssued: (status: boolean) => void;

  // ─── Actions ──────────────────────────────────────────────────────────
  setFlight: (flight: FlightResult, seatClass: "economy" | "business") => void;
  setSeats: (count: number, seats: string[]) => void;
  setPassengers: (passengers: PassengerInfo[]) => void;
  setTicketId: (id: string) => void;
  reset: () => void;
}

const emptyPassenger = (): PassengerInfo => ({
  name: "",
  nrc: "",
  dob: "",
  gender: "",
  phone: "",
});

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      // ── Initial State ────────────────────────────────────────────────
      selectedFlight: null,
      seatClass: null,
      seatCount: 1,
      selectedSeats: [],
      passengers: [emptyPassenger()],
      ticketId: null,

      // ── Step 1: Save flight + class, reset downstream state ──────────
      setFlight: (flight, seatClass) =>
        set({
          selectedFlight: flight,
          seatClass,
          // Reset downstream when a new flight is picked
          seatCount: 1,
          selectedSeats: [],
          passengers: [emptyPassenger()],
          ticketId: null,
        }),

      // ── Step 2: Save seats, resize passengers array accordingly ──────
      setSeats: (count, seats) =>
        set((state) => {
          // Preserve existing passenger data when going back/forward
          const existing = state.passengers || [];
          const passengers: PassengerInfo[] = Array.from(
            { length: count },
            (_, i) => {
              const current = existing[i];
              return current && current.name !== undefined ? current : emptyPassenger();
            }
          );
          return { seatCount: count, selectedSeats: seats, passengers };
        }),

      // ── Step 3: Save passenger info ───────────────────────────────────
      setPassengers: (passengers) => set({ passengers }),

      // ── Step 4: Save ticket ID ────────────────────────────────────────
      setTicketId: (ticketId) => set({ ticketId }),
      isIssued: false,
      setIsIssued: (status) => set({ isIssued: status }),
      // ── Full reset ────────────────────────────────────────────────────
      reset: () =>
        set({
          selectedFlight: null,
          seatClass: null,
          seatCount: 1,
          selectedSeats: [],
          passengers: [emptyPassenger()],
          isIssued: false,
          ticketId: null,
        }),
    }),
    {
      name: "bluehorizon-booking", // localStorage key
    }
  )
);