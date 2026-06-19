"use client";

import { useCallback, useEffect, useRef } from "react";
import { captureVideoThumbnail } from "@/lib/image-utils";

export function useCamera(onReady?: (capture: () => string | null) => void) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video) return null;
    return captureVideoThumbnail(video);
  }, []);

  useEffect(() => {
    onReady?.(capture);
  }, [capture, onReady]);

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
        }
      } catch {
        // カメラ未許可でも手動記録は継続
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

  const HiddenVideo = useCallback(
    () => (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="fixed w-px h-px opacity-0 pointer-events-none"
        aria-hidden
      />
    ),
    []
  );

  return { capture, HiddenVideo };
}
