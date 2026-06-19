"use client";

import { LiveClock } from "@/components/LiveClock";
import { SettingsPanel } from "@/components/SettingsPanel";
import { RecordInput } from "@/components/RecordInput";
import { RecordList } from "@/components/RecordList";
import { ExportPanel } from "@/components/ExportPanel";
import { Footer } from "@/components/Footer";
import { CameraManager } from "@/components/CameraManager";
import { useApp } from "@/hooks/useAppContext";

export function MainApp() {
  const { loading, records } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-emerald-400 text-xl font-bold">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-gray-950 flex flex-col max-w-lg mx-auto">
      <header className="shrink-0 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">マラソン計測</h1>
        <span className="text-emerald-400 font-bold text-lg">{records.length}件</span>
      </header>
      <LiveClock />
      <SettingsPanel />
      <RecordInput />
      <RecordList />
      <ExportPanel />
      <CameraManager />
      <Footer />
      <div className="shrink-0 h-[72px]" aria-hidden />
    </div>
  );
}
