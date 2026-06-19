"use client";

import { useCallback } from "react";
import { useApp } from "@/hooks/useAppContext";

export function Footer() {
  const {
    records,
    recordEntry,
    photoRecordEntry,
    undoLast,
    clearAllRecords,
  } = useApp();

  const handleRecord = useCallback(async () => {
    await recordEntry();
  }, [recordEntry]);

  const handlePhoto = useCallback(async () => {
    await photoRecordEntry();
  }, [photoRecordEntry]);

  const handleUndo = useCallback(async () => {
    if (records.length === 0) return;
    await undoLast();
  }, [records.length, undoLast]);

  return (
    <footer className="fixed bottom-0 inset-x-0 z-40 bg-gray-950/95 backdrop-blur border-t-2 border-gray-700 safe-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-4 gap-1 px-2 py-2">
          <button
            onClick={handleRecord}
            className="flex flex-col items-center justify-center bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 rounded-xl touch-manipulation min-h-[56px]"
          >
            <span className="text-base">記録</span>
          </button>
          <button
            onClick={handlePhoto}
            className="flex flex-col items-center justify-center bg-blue-700 hover:bg-blue-600 active:bg-blue-800 text-white font-bold py-3 rounded-xl touch-manipulation min-h-[56px]"
          >
            <span className="text-sm leading-tight text-center">写真<br />記録</span>
          </button>
          <button
            onClick={handleUndo}
            disabled={records.length === 0}
            className="flex flex-col items-center justify-center bg-amber-700 hover:bg-amber-600 active:bg-amber-800 disabled:opacity-40 disabled:pointer-events-none text-white font-bold py-3 rounded-xl touch-manipulation min-h-[56px]"
          >
            <span className="text-base">Undo</span>
          </button>
          <button
            onClick={clearAllRecords}
            disabled={records.length === 0}
            className="flex flex-col items-center justify-center bg-red-900 hover:bg-red-800 active:bg-red-950 disabled:opacity-40 disabled:pointer-events-none text-red-100 font-bold py-3 rounded-xl touch-manipulation min-h-[56px]"
          >
            <span className="text-xs leading-tight text-center">ログ<br />削除</span>
          </button>
        </div>
      </footer>
  );
}
