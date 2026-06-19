"use client";

import { useCallback, useRef, useState } from "react";
import { useApp } from "@/hooks/useAppContext";

export function RecordInput() {
  const { settings, bibInput, setBibInput, recordEntry } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [flash, setFlash] = useState(false);

  const handleRecord = useCallback(async () => {
    if (!settings.congestionMode && !bibInput.trim()) {
      inputRef.current?.focus();
      return;
    }
    const result = await recordEntry();
    if (result) {
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
      if (navigator.vibrate) navigator.vibrate(50);
    }
    inputRef.current?.focus();
  }, [bibInput, recordEntry, settings.congestionMode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleRecord();
      }
    },
    [handleRecord]
  );

  return (
    <div className={`px-4 py-4 space-y-4 transition-colors duration-200 ${flash ? "bg-emerald-900/40" : ""}`}>
      <div>
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
          placeholder="番号を入力"
          className="w-full bg-gray-800 border-2 border-gray-600 focus:border-emerald-500 rounded-xl px-4 py-4 text-3xl font-mono text-white text-center tracking-widest outline-none transition-colors"
        />
      </div>

      <button
        onClick={handleRecord}
        className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-2xl py-6 rounded-2xl shadow-lg shadow-emerald-900/30 transition-colors select-none touch-manipulation"
      >
        記録
      </button>
    </div>
  );
}
