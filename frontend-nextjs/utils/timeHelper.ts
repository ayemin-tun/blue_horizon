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