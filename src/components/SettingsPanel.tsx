"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppContext";

export function SettingsPanel() {
  const { settings, updateSettings } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-gray-300 hover:bg-gray-900"
      >
        <span className="font-semibold">大会設定</span>
        <span className="text-sm text-gray-500">
          {settings.startDate} {settings.startTime}
        </span>
        <span className="text-gray-500">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 bg-gray-900/50">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-400">開始日</span>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => updateSettings({ startDate: e.target.value })}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-lg"
              />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">スタート時刻 (HH:mm:ss)</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="09:00:00"
                value={settings.startTime}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d:]/g, "");
                  updateSettings({ startTime: v });
                }}
                onBlur={(e) => {
                  const v = e.target.value;
                  if (/^\d{1,2}:\d{2}$/.test(v)) {
                    updateSettings({ startTime: `${v}:00` });
                  }
                }}
                className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-lg font-mono"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={settings.congestionMode}
              onChange={(e) => updateSettings({ congestionMode: e.target.checked })}
              className="w-5 h-5 accent-emerald-500"
            />
            <span className="text-white font-medium">ゴール渋滞モード</span>
            <span className="text-xs text-gray-500">（ゼッケン未入力でも記録可）</span>
          </label>

          <label className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              checked={settings.voiceEnabled}
              onChange={(e) => updateSettings({ voiceEnabled: e.target.checked })}
              className="w-5 h-5 accent-emerald-500"
            />
            <span className="text-white font-medium">音声読み上げ</span>
          </label>
        </div>
      )}
    </div>
  );
}
