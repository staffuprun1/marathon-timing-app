"use client";

import { useEffect, useState } from "react";
import { formatElapsed, getCurrentClock, getElapsedMs } from "@/lib/time";
import { useApp } from "@/hooks/useAppContext";

export function LiveClock() {
  const { settings } = useApp();
  const [clock, setClock] = useState("");
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function tick() {
      setClock(getCurrentClock());
      setElapsed(formatElapsed(getElapsedMs(settings.startDate, settings.startTime)));
    }
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [settings.startDate, settings.startTime]);

  return (
    <div className="shrink-0 text-center py-1.5 border-b border-gray-800/50">
      <div className="text-xs text-gray-500">{clock}</div>
      <div className="text-3xl font-mono font-bold text-emerald-400 tracking-wider">
        {elapsed}
      </div>
    </div>
  );
}
