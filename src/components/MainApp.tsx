"use client";

import { Header } from "@/components/Header";
import { LiveClock } from "@/components/LiveClock";
import { SettingsPanel } from "@/components/SettingsPanel";
import { RecordInput } from "@/components/RecordInput";
import { RecordList } from "@/components/RecordList";
import { CameraCapture } from "@/components/CameraCapture";
import { ExportPanel } from "@/components/ExportPanel";
import { useApp } from "@/hooks/useAppContext";

export function MainApp() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-emerald-400 text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col max-w-lg mx-auto">
      <Header />
      <LiveClock />
      <SettingsPanel />
      <RecordInput />
      <div className="px-4 pb-2">
        <CameraCapture />
      </div>
      <RecordList />
      <ExportPanel />
    </div>
  );
}
