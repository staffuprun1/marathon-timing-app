export type EventType =
  | "20km"
  | "親子マラソン"
  | "5km"
  | "10km"
  | "15km"
  | "リレー"
  | "unknown";

export type RecordStatus = "finished" | "dnf" | "dns";

export interface TimingRecord {
  id: string;
  rank: number;
  bibNumber: string | null;
  elapsedMs: number;
  recordedAt: string;
  eventType: EventType;
  status: RecordStatus;
  photoThumb?: string;
}

export interface AppSettings {
  startTime: string;
  startDate: string;
  congestionMode: boolean;
  voiceEnabled: boolean;
}

export const EVENT_LABELS: Record<EventType, string> = {
  "20km": "20km",
  親子マラソン: "親子",
  "5km": "5km",
  "10km": "10km",
  "15km": "15km",
  リレー: "リレー",
  unknown: "—",
};

export const DEFAULT_SETTINGS: AppSettings = {
  startTime: "09:00:00",
  startDate: new Date().toISOString().slice(0, 10),
  congestionMode: false,
  voiceEnabled: true,
};
