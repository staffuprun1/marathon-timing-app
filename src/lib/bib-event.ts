import type { EventType } from "./types";

export function detectEventFromBib(bib: string | null): EventType {
  if (!bib) return "unknown";
  const num = parseInt(bib, 10);
  if (isNaN(num)) return "unknown";
  if (num >= 300 && num <= 499) return "20km";
  if (num >= 500 && num <= 599) return "親子マラソン";
  if (num >= 600 && num <= 699) return "5km";
  if (num >= 700 && num <= 799) return "10km";
  if (num >= 800 && num <= 899) return "15km";
  if (num >= 900 && num <= 999) return "リレー";
  return "unknown";
}
