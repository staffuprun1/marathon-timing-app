"use client";

import { useState } from "react";
import { useApp } from "@/hooks/useAppContext";
import { TimePicker } from "@/components/TimePicker";

export function SettingsPanel() {
  const { settings, updateSettings } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-800 shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 flex items-center gap-2 text-left text-gray-300 hover:bg-gray-900 touch-manipulation"
      >
        <span className="font-semibold shrink-0">大会設定</span>
        <span className="flex-1 text-sm text-gray-500 truncate text-right">
          {settings.startDate} {settings.startTime.slice(0, 5)}
        </span>
        <span className="text-gray-500 shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 bg-gray-900/50">
          <label className="block">
            <span className="text-xs text-gray-400">開始日</span>
            <input
              type="date"
              value={settings.startDate}
              onChange={(e) => updateSettings({ startDate: e.target.value })}
              className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-lg"
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">スタート時刻</span>
            <div className="mt-1">
              <TimePicker
                value={settings.startTime}
                onChange={(startTime) => updateSettings({ startTime })}
              />
            </div>
          </label>

          <div className="space-y-1 pt-1 border-t border-gray-800">
            <label className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                checked={settings.congestionMode}
                onChange={(e) => updateSettings({ congestionMode: e.target.checked })}
                className="w-5 h-5 accent-emerald-500"
              />
              <span className="text-white font-medium">ゴール渋滞モード</span>
              <span className="text-xs text-gray-500">（空欄可）</span>
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
        </div>
      )}
    </div>
  );
}
