"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { captureVideoThumbnail } from "@/lib/image-utils";

interface CameraPreviewProps {
  ready: boolean;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    return captureVideoThumbnail(video);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setActive(true);
          setError(false);
        }
      } catch {
        setError(true);
        setActive(false);
      }
    }

    start();

    function handleVisibility() {
      if (document.visibilityState === "visible" && videoRef.current && streamRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const CameraPreview = useCallback(
    ({ ready }: CameraPreviewProps) => (
      <div
        className="fixed z-30 right-3 w-36 aspect-[4/3] rounded-xl overflow-hidden border-2 border-blue-500 shadow-xl shadow-black/60 bg-gray-900"
        style={{ bottom: "calc(80px + env(safe-area-inset-bottom, 0px))" }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${active ? "opacity-100" : "opacity-0"}`}
        />
        {!active && !error && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
            {ready ? "カメラ起動中..." : ""}
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 text-[10px] text-center px-2">
            カメラ未許可
          </div>
        )}
        <div className="absolute top-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5 font-semibold tracking-wide">
          📷 プレビュー
        </div>
      </div>
    ),
    [active, error]
  );

  return { capture, CameraPreview };
}
