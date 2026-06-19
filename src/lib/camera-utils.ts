async function getCameraStream(): Promise<MediaStream> {
  const attempts: MediaStreamConstraints[] = [
    {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    },
    { video: { facingMode: "environment" }, audio: false },
    { video: true, audio: false },
  ];

  let lastError: unknown;
  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}

async function bindStreamToVideo(
  video: HTMLVideoElement,
  stream: MediaStream
): Promise<void> {
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("metadata timeout")), 8000);

    function onReady() {
      clearTimeout(timeout);
      video.removeEventListener("loadedmetadata", onReady);
      resolve();
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      clearTimeout(timeout);
      resolve();
    } else {
      video.addEventListener("loadedmetadata", onReady);
    }
  });

  await video.play();
}

export { getCameraStream, bindStreamToVideo };
