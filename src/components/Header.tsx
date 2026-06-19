"use client";

import { useApp } from "@/hooks/useAppContext";
import { EVENT_LABELS, type EventType } from "@/lib/types";

const EVENTS: EventType[] = ["5km", "10km", "half", "relay"];

export function Header() {
  const { settings, updateSettings } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-white shrink-0">計測</h1>
        <div className="flex gap-1 overflow-x-auto">
          {EVENTS.map((event) => (
            <button
              key={event}
              onClick={() => updateSettings({ eventType: event })}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                settings.eventType === event
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {EVENT_LABELS[event]}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
