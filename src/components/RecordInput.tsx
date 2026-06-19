"use client";

import { useCallback, useRef } from "react";
import { useApp } from "@/hooks/useAppContext";
import { detectEventFromBib } from "@/lib/bib-event";

export function RecordInput() {
  const { settings, bibInput, setBibInput, flash, recordEntry } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        recordEntry();
        inputRef.current?.focus();
      }
    },
    [recordEntry]
  );

  const detectedEvent = bibInput.trim()
    ? detectEventFromBib(bibInput.trim())
    : null;

  return (
    <div
      className={`shrink-0 px-4 py-2 transition-colors duration-150 ${flash ? "bg-emerald-900/50" : ""}`}
    >
      <label htmlFor="bib-input" className="block text-sm text-gray-400 mb-1">
        ゼッケン番号
        {settings.congestionMode && (
          <span className="ml-2 text-amber-400">（渋滞モード: 空欄可）</span>
        )}
      </label>
      <input
        ref={inputRef}
        id="bib-input"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        autoFocus
        value={bibInput}
        onChange={(e) => setBibInput(e.target.value.replace(/\D/g, ""))}
        onKeyDown={handleKeyDown}
        placeholder="番号を入力 → Enter"
        className="w-full bg-gray-800 border-2 border-gray-600 focus:border-emerald-500 rounded-xl px-4 py-3 text-3xl font-mono font-bold text-white text-center tracking-widest outline-none"
      />
      {detectedEvent && detectedEvent !== "unknown" && (
        <div className="mt-2 text-center text-emerald-400 font-semibold text-lg">
          種目: {detectedEvent}
        </div>
      )}
    </div>
  );
}
