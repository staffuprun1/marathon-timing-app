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
    <div className="text-center py-2">
      <div className="text-sm text-gray-400">{clock}</div>
      <div className="text-4xl font-mono font-bold text-emerald-400 tracking-wider">
        {elapsed}
      </div>
    </div>
  );
}
