"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/hooks/useAppContext";
import { useCamera } from "@/hooks/useCamera";

export function CameraManager() {
  const { registerPhotoCapture } = useApp();
  const { capture, CameraPreview } = useCamera();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    registerPhotoCapture(capture);
  }, [capture, registerPhotoCapture]);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CameraPreview ready={ready} />
  );
}
