export type EventType = "5km" | "10km" | "half" | "relay";

export type RecordStatus = "finished" | "dnf" | "dns";

export interface TimingRecord {
  id: string;
  rank: number;
  bibNumber: string | null;
  elapsedMs: number;
  recordedAt: string;
  eventType: EventType;
  status: RecordStatus;
  photoId?: string;
}

export interface PhotoRecord {
  id: string;
  capturedAt: string;
  imageData: string;
  ocrResults: string[];
  selectedBib?: string;
  timingRecordId?: string;
}

export interface AppSettings {
  startTime: string;
  startDate: string;
  eventType: EventType;
  congestionMode: boolean;
  voiceEnabled: boolean;
}

export const EVENT_LABELS: Record<EventType, string> = {
  "5km": "5km",
  "10km": "10km",
  half: "ハーフ",
  relay: "リレー",
};

export const DEFAULT_SETTINGS: AppSettings = {
  startTime: "09:00:00",
  startDate: new Date().toISOString().slice(0, 10),
  eventType: "10km",
  congestionMode: false,
  voiceEnabled: true,
};
