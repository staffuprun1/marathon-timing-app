import { detectEventFromBib } from "./bib-event";
import type { AppSettings, TimingRecord } from "./types";
import { getElapsedMs } from "./time";

export function speakRecord(bibNumber: string | null, rank: number, enabled: boolean): void {
  if (!enabled || typeof window === "undefined" || !window.speechSynthesis) return;

  const text = bibNumber
    ? `${bibNumber}番 記録しました。${rank}位`
    : `${rank}位 記録しました`;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 1.2;
  window.speechSynthesis.speak(utterance);
}

export function createRecord(
  settings: AppSettings,
  records: TimingRecord[],
  bibNumber: string | null,
  photoThumb?: string
): TimingRecord {
  const nextRank = records.length > 0 ? Math.max(...records.map((r) => r.rank)) + 1 : 1;
  const bib = bibNumber?.trim() || null;

  return {
    id: crypto.randomUUID(),
    rank: nextRank,
    bibNumber: bib,
    elapsedMs: getElapsedMs(settings.startDate, settings.startTime),
    recordedAt: new Date().toISOString(),
    eventType: detectEventFromBib(bib),
    status: "finished",
    ...(photoThumb ? { photoThumb } : {}),
  };
}

export function reorderRanks(records: TimingRecord[]): TimingRecord[] {
  return records
    .sort((a, b) => a.rank - b.rank)
    .map((record, index) => ({
      ...record,
      rank: index + 1,
    }));
}

export function feedbackRecord(): void {
  if (navigator.vibrate) navigator.vibrate(50);
}
