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
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-red-400 text-xs text-center px-2">
        カメラを利用できません
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
    <div className="shrink-0 px-4 pb-2">
      <div className="rounded-xl overflow-hidden border border-gray-700 bg-black">
        <div className="relative w-full aspect-[2.4/1] max-h-24">
          <video
            ref={onVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover bg-black"
          />
          <StatusOverlay status={status} />
          <div className="absolute top-1 left-2 z-10 flex items-center gap-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
            <span aria-hidden>📷</span>
            <span>写真記録用</span>
          </div>
        </div>
      </div>
    </div>
  );
}
