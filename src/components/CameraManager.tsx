"use client";

import { useEffect } from "react";
import { useApp } from "@/hooks/useAppContext";
import { useCamera, type CameraStatus } from "@/hooks/useCamera";

function StatusOverlay({ status }: { status: CameraStatus }) {
  if (status === "loading") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400 text-xs">
        起動中...
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-red-400 text-[10px] text-center px-2">
        カメラエラー
      </div>
    );
  }
  return null;
}

export function CameraManager() {
  const { registerPhotoCapture } = useApp();
  const { onVideoRef, status, capture } = useCamera();

  useEffect(() => {
    registerPhotoCapture(capture);
  }, [capture, registerPhotoCapture]);

  return (
    <div
      className="fixed z-30 right-3 w-36 rounded-xl overflow-hidden border-2 border-blue-500 shadow-xl shadow-black/60 bg-black"
      style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="relative w-full aspect-[4/3]">
        <video
          ref={onVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover bg-black"
        />
        <StatusOverlay status={status} />
        <div className="absolute top-0 inset-x-0 z-10 bg-black/60 text-white text-[10px] text-center py-0.5 font-semibold">
          📷 プレビュー
        </div>
      </div>
    </div>
  );
}
