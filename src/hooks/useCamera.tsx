"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bindStreamToVideo, getCameraStream } from "@/lib/camera-utils";
import { captureVideoThumbnail } from "@/lib/image-utils";

export type CameraStatus = "loading" | "active" | "error";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bindingRef = useRef(false);
  const [status, setStatus] = useState<CameraStatus>("loading");

  const tryBind = useCallback(async () => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream || bindingRef.current) return;

    bindingRef.current = true;
    try {
      await bindStreamToVideo(video, stream);
      setStatus("active");
    } catch {
      setStatus("error");
    } finally {
      bindingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setStatus("loading");
      try {
        const stream = await getCameraStream();
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        await tryBind();
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    init();

    function handleVisibility() {
      if (document.visibilityState !== "visible") return;
      const video = videoRef.current;
      const stream = streamRef.current;
      if (!video || !stream) return;
      if (!video.srcObject) {
        tryBind();
      } else {
        video.play().catch(() => {});
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [tryBind]);

  const onVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (el && streamRef.current) {
        tryBind();
      }
    },
    [tryBind]
  );

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;
    return captureVideoThumbnail(video);
  }, []);

  return { onVideoRef, status, capture };
}
