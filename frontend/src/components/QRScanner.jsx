import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

// Scans a QR code with the device camera and returns the decoded text.
// Expected payload is a verify URL like ".../verify/shop/<qrId>" - the parent
// component is responsible for parsing that into type + id.
export default function QRScanner({ onResult, onError }) {
  const containerId = "qr-reader-region";
  const scannerRef = useRef(null);
  const [active, setActive] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const start = async () => {
    setErr("");
    try {
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      setActive(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          onResult?.(decodedText);
          scanner.stop().then(() => setActive(false));
        },
        () => {} // ignore per-frame "no QR found" noise
      );
    } catch (e) {
      setErr("Could not access camera. Check browser permissions, or use manual entry below.");
      onError?.(e);
      setActive(false);
    }
  };

  const stop = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {});
    }
    setActive(false);
  };

  return (
    <div>
      <div id={containerId} className="w-full max-w-sm mx-auto rounded-sm overflow-hidden border border-line" />
      {err && <p className="text-danger text-sm mt-2">{err}</p>}
      <div className="mt-3 flex justify-center gap-3">
        {!active ? (
          <button className="btn-brass" onClick={start}>
            Start camera scan
          </button>
        ) : (
          <button className="btn-outline" onClick={stop}>
            Stop scanning
          </button>
        )}
      </div>
    </div>
  );
}
