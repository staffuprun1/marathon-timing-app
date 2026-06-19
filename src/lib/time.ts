export function parseStartTimestamp(startDate: string, startTime: string): number {
  const parts = startTime.split(":");
  const hours = parseInt(parts[0] ?? "0", 10);
  const minutes = parseInt(parts[1] ?? "0", 10);
  const seconds = parseInt(parts[2] ?? "0", 10);
  const date = new Date(startDate);
  date.setHours(hours, minutes, seconds, 0);
  return date.getTime();
}

export function getElapsedMs(startDate: string, startTime: string): number {
  const start = parseStartTimestamp(startDate, startTime);
  return Math.max(0, Date.now() - start);
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function formatElapsedShort(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function parseElapsedToMs(timeStr: string): number | null {
  const parts = timeStr.trim().split(":");
  if (parts.length < 2 || parts.length > 3) return null;

  let hours = 0;
  let minutes: number;
  let secondsPart: string;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10);
    minutes = parseInt(parts[1], 10);
    secondsPart = parts[2];
  } else {
    minutes = parseInt(parts[0], 10);
    secondsPart = parts[1];
  }

  const [seconds, centiseconds = "0"] = secondsPart.split(".");
  const sec = parseInt(seconds, 10);
  const cs = parseInt(centiseconds.padEnd(2, "0").slice(0, 2), 10);

  if ([hours, minutes, sec, cs].some(isNaN)) return null;

  return (hours * 3600 + minutes * 60 + sec) * 1000 + cs * 10;
}

export function formatRecordTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getCurrentClock(): string {
  return new Date().toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
