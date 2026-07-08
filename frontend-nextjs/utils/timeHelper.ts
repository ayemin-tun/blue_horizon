/**
 * 24-hour time string (e.g., "14:30" or "08:05") to
 * 12-hour AM/PM string (e.g., "02:30 PM" or "08:05 AM") Change Helper
 */
export const formatDisplayTime = (timeStr: string | undefined | null): string => {
  if (!timeStr) return "—:—";
  
  try {
    const [hrs, mins] = timeStr.split(":").map(Number);
    
    if (isNaN(hrs) || isNaN(mins)) return timeStr;

    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHrs = hrs % 12 || 12; 
    
    return `${String(displayHrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${ampm}`;
  } catch (error) {
    console.error("Error formatting time:", error);
    return timeStr; 
  }
};

export const formatDuration = (duration: string) => {
  const [h, m] = duration.split(":").map(Number);
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}min`);
  return parts.join(" ") || duration;
};

export const  parseDob = (dob: string): Date | null => {
  if (!dob) return null;
  const [y, m, d] = dob.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export const formatDob = (date: Date | null): string => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}