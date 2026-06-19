const THUMB_WIDTH = 300;
const JPEG_QUALITY = 0.65;

export function captureVideoThumbnail(video: HTMLVideoElement): string | null {
  if (!video.videoWidth || !video.videoHeight) return null;

  const canvas = document.createElement("canvas");
  const scale = THUMB_WIDTH / video.videoWidth;
  canvas.width = THUMB_WIDTH;
  canvas.height = Math.round(video.videoHeight * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}
