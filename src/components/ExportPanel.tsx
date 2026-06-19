"use client";

import { useRef } from "react";
import { useApp } from "@/hooks/useAppContext";
import { downloadCSV, downloadJSON } from "@/lib/csv";
import { exportAllData, importAllData } from "@/lib/db";

export function ExportPanel() {
  const { settings, records, refreshAll } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleCSV() {
    downloadCSV(records, `marathon_${settings.startDate}.csv`);
  }

  async function handleJSONExport() {
    const data = await exportAllData();
    downloadJSON(data, `marathon_backup_${settings.startDate}.json`);
  }

  async function handleJSONImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!confirm("現在のデータを上書きします。よろしいですか？")) return;
      await importAllData(data);
      await refreshAll();
      alert("復元しました");
    } catch {
      alert("インポートに失敗しました");
    }
    e.target.value = "";
  }

  return (
    <div className="shrink-0 px-4 py-2 border-t border-gray-800">
      <div className="flex gap-2">
        <button
          onClick={handleCSV}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl text-sm touch-manipulation"
        >
          CSV
        </button>
        <button
          onClick={handleJSONExport}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl text-sm touch-manipulation"
        >
          バックアップ
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl text-sm touch-manipulation"
        >
          復元
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleJSONImport}
          className="hidden"
        />
      </div>
    </div>
  );
}
