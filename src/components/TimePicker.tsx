"use client";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** HH:mm:ss 形式を input[type=time] 用に正規化 */
export function normalizeTimeValue(value: string): string {
  const parts = value.split(":");
  const h = String(parseInt(parts[0] ?? "0", 10)).padStart(2, "0");
  const m = String(parseInt(parts[1] ?? "0", 10)).padStart(2, "0");
  const s = String(parseInt(parts[2] ?? "0", 10)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** input[type=time] の値を HH:mm:ss 形式に変換 */
export function parseTimeInputValue(value: string): string {
  const parts = value.split(":");
  const h = String(parseInt(parts[0] ?? "0", 10));
  const m = String(parseInt(parts[1] ?? "0", 10)).padStart(2, "0");
  const s = String(parseInt(parts[2] ?? "0", 10)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  className = "",
  id,
}: TimePickerProps) {
  return (
    <input
      id={id}
      type="time"
      step={1}
      value={normalizeTimeValue(value)}
      onChange={(e) => onChange(parseTimeInputValue(e.target.value))}
      disabled={disabled}
      className={`w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-lg font-mono appearance-none ${className}`}
    />
  );
}
