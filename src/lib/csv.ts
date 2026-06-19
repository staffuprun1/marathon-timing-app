import type { TimingRecord } from "./types";
import { EVENT_LABELS } from "./types";
import { formatElapsedShort, formatRecordTime } from "./time";

export function recordsToCSV(records: TimingRecord[]): string {
  const header = "順位,ゼッケン,種目,タイム,記録時刻,状態";
  const rows = records
    .filter((r) => r.status === "finished" || r.status === "dnf" || r.status === "dns")
    .sort((a, b) => a.rank - b.rank)
    .map((r) => {
      const bib = r.bibNumber ?? "";
      const event = EVENT_LABELS[r.eventType] ?? r.eventType;
      const time =
        r.status === "finished"
          ? formatElapsedShort(r.elapsedMs)
          : r.status.toUpperCase();
      const recordedAt = formatRecordTime(r.recordedAt);
      return `${r.rank},${bib},${event},${time},${recordedAt},${r.status}`;
    });

  const bom = "\uFEFF";
  return bom + [header, ...rows].join("\r\n");
}

export function downloadCSV(records: TimingRecord[], filename: string): void {
  const csv = recordsToCSV(records);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadJSON(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
