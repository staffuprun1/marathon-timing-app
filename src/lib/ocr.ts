import Tesseract from "tesseract.js";

export async function recognizeBibNumbers(
  imageData: string,
  onProgress?: (progress: number) => void
): Promise<string[]> {
  const result = await Tesseract.recognize(imageData, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  const text = result.data.text;
  const candidates = new Set<string>();

  const patterns = [
    /\b(\d{1,5})\b/g,
    /(\d{3,5})/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const num = match[1];
      if (num.length >= 1 && num.length <= 5) {
        candidates.add(num);
      }
    }
  }

  return Array.from(candidates).slice(0, 10);
}
