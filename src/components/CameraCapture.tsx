"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { addPhoto } from "@/lib/db";
import { recognizeBibNumbers } from "@/lib/ocr";
import { useApp } from "@/hooks/useAppContext";

export function CameraCapture() {
  const { recordEntry, editRecord, records } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [lastImage, setLastImage] = useState<string | null>(null);
  const [selectedBib, setSelectedBib] = useState("");
  const [lastRecordId, setLastRecordId] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      setOpen(true);
      setCandidates([]);
      setLastImage(null);
      setSelectedBib("");
      setLastRecordId(null);
    } catch {
      alert("カメラへのアクセスが拒否されました");
    }
  }, []);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setOpen(false);
  }, [stream]);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
    }
    return () => {
      if (video) video.srcObject = null;
    };
  }, [stream]);

  const captureAndOCR = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    setLastImage(imageData);
    setProcessing(true);
    setProgress(0);

    try {
      const results = await recognizeBibNumbers(imageData, setProgress);
      setCandidates(results);
      const topBib = results[0] ?? "";
      setSelectedBib(topBib);

      const record = await recordEntry(topBib || null);
      if (record) {
        setLastRecordId(record.id);
        await addPhoto({
          id: crypto.randomUUID(),
          capturedAt: new Date().toISOString(),
          imageData,
          ocrResults: results,
          selectedBib: topBib || undefined,
          timingRecordId: record.id,
        });
      }
    } finally {
      setProcessing(false);
    }
  }, [recordEntry]);

  const applyBib = useCallback(async () => {
    if (!lastRecordId || !selectedBib.trim()) return;
    const record = records.find((r) => r.id === lastRecordId);
    if (record) {
      await editRecord({ ...record, bibNumber: selectedBib.trim() });
    }
  }, [lastRecordId, selectedBib, records, editRecord]);

  return (
    <>
      <button
        onClick={startCamera}
        className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold text-lg py-4 rounded-xl touch-manipulation"
      >
        📷 写真記録（OCR）
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="relative flex-1 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="bg-gray-900 p-4 space-y-3 safe-bottom">
            {processing && (
              <div className="text-center text-emerald-400">
                OCR解析中... {progress}%
              </div>
            )}

            {candidates.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">OCR候補（タップで選択）</p>
                <div className="flex flex-wrap gap-2">
                  {candidates.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedBib(c)}
                      className={`px-4 py-2 rounded-lg font-mono text-lg ${
                        selectedBib === c
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-800 text-gray-300"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={selectedBib}
                  onChange={(e) => setSelectedBib(e.target.value.replace(/\D/g, ""))}
                  placeholder="手動修正"
                  className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white font-mono text-xl text-center"
                />
                <button
                  onClick={applyBib}
                  className="mt-2 w-full bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded-lg font-semibold"
                >
                  ゼッケンを反映
                </button>
              </div>
            )}

            {lastImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lastImage} alt="撮影画像" className="w-full max-h-24 object-contain rounded" />
            )}

            <div className="flex gap-3">
              <button
                onClick={captureAndOCR}
                disabled={processing}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xl py-5 rounded-2xl touch-manipulation"
              >
                撮影＆記録
              </button>
              <button
                onClick={stopCamera}
                className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-bold py-5 rounded-2xl touch-manipulation"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
