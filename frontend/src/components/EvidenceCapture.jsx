import React, { useState } from "react";
import { createWorker } from "tesseract.js";

// Rough blur/quality heuristic: downsamples the image onto a small canvas and
// measures pixel-to-pixel intensity variance (a cheap stand-in for a Laplacian
// "sharpness" score). No ML model or paid API involved - just enough signal to
// warn an inspector "this photo looks too blurry to trust" before they submit it.
const estimateSharpness = (imgEl) => {
  const canvas = document.createElement("canvas");
  const w = (canvas.width = 200);
  const h = (canvas.height = Math.round((imgEl.naturalHeight / imgEl.naturalWidth) * 200) || 150);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imgEl, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  let variance = 0;
  let count = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      // simple discrete Laplacian
      const lap =
        4 * gray[idx] - gray[idx - 1] - gray[idx + 1] - gray[idx - w] - gray[idx + w];
      variance += lap * lap;
      count++;
    }
  }
  return variance / count; // higher = sharper
};

const parseFirstNumber = (text) => {
  const match = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
};

export default function EvidenceCapture({ label = "Upload evidence photo", onCapture }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | reading | done | error
  const [ocrText, setOcrText] = useState("");
  const [ocrValue, setOcrValue] = useState(null);
  const [sharpness, setSharpness] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setStatus("reading");
      setOcrText("");
      setOcrValue(null);

      const img = new Image();
      img.onload = async () => {
        const sharp = estimateSharpness(img);
        setSharpness(sharp);

        try {
          const worker = await createWorker("eng");
          const { data } = await worker.recognize(dataUrl);
          await worker.terminate();
          const text = data.text.trim();
          const parsed = parseFirstNumber(text);
          setOcrText(text);
          setOcrValue(parsed);
          setStatus("done");
          onCapture?.({
            image: dataUrl,
            ocrText: text,
            ocrValueParsed: parsed,
            sharpness: sharp,
            lowQuality: sharp < 15, // heuristic threshold, tune with real photos
          });
        } catch (err) {
          setStatus("error");
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-line rounded-sm p-4 bg-paperdim/40">
      <label className="field-label">{label}</label>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="text-sm"
      />

      {preview && (
        <div className="mt-3 flex gap-4 items-start">
          <img src={preview} alt="evidence" className="w-32 h-32 object-cover rounded-sm border border-line" />
          <div className="text-sm space-y-1">
            {status === "reading" && <p className="text-ink/60">Reading the photo…</p>}
            {status === "done" && (
              <>
                {ocrValue != null ? (
                  <p className="text-ok font-medium">✅ We read the number {ocrValue} from this photo.</p>
                ) : (
                  <p className="text-warn font-medium">❓ We couldn't clearly read a number from this photo — that's okay, just enter the value manually below.</p>
                )}
                {sharpness !== null && sharpness < 15 && (
                  <p className="text-warn">Photo looks blurry — consider retaking it for a reliable reading.</p>
                )}
                <button type="button" onClick={() => setShowRaw((s) => !s)} className="text-xs text-ink/40 hover:underline">
                  {showRaw ? "Hide technical details" : "Show technical details"}
                </button>
                {showRaw && (
                  <p className="text-xs font-mono text-ink/50 bg-white rounded-sm p-2 border border-line">
                    Raw OCR text: {ocrText || "(none detected)"}
                  </p>
                )}
              </>
            )}
            {status === "error" && <p className="text-danger">Could not read this photo.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
