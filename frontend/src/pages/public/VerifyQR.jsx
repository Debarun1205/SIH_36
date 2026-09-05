import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import QRScanner from "../../components/QRScanner.jsx";

const statusSeal = (status) => {
  const map = {
    compliant: "seal-compliant",
    "non-compliant": "seal-noncompliant",
    pending: "seal-pending",
    unverified: "seal-unverified",
  };
  return map[status] || "seal-unverified";
};

export default function VerifyQR() {
  const { type: routeType, id: routeId } = useParams();
  const navigate = useNavigate();
  const [manualType, setManualType] = useState("shop");
  const [manualId, setManualId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const runVerify = async (type, id) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.get(`/verify/${type}/${id}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find that record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (routeType && routeId) runVerify(routeType, routeId);
  }, [routeType, routeId]);

  const handleScanResult = (decodedText) => {
    // decoded text looks like ".../verify/shop/<qrId>"
    try {
      const url = new URL(decodedText);
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("verify");
      if (idx !== -1 && parts[idx + 1] && parts[idx + 2]) {
        navigate(`/verify/${parts[idx + 1]}/${parts[idx + 2]}`);
        return;
      }
    } catch {
      // not a URL - fall through
    }
    setError("Unrecognized QR code format.");
  };

  const submitManual = (e) => {
    e.preventDefault();
    if (manualId.trim()) navigate(`/verify/${manualType}/${manualId.trim()}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 mt-12">
      <h1 className="text-2xl mb-1">Verify an instrument or shop</h1>
      <p className="text-ink/60 text-sm mb-6">
        Scan the QR code on a shop's compliance certificate, or enter the ID manually.
      </p>

      {!routeType && (
        <div className="card mb-6">
          <QRScanner onResult={handleScanResult} />

          <div className="border-t border-line mt-6 pt-6">
            <form onSubmit={submitManual} className="flex gap-2">
              <select className="field-input w-40" value={manualType} onChange={(e) => setManualType(e.target.value)}>
                <option value="shop">Shop</option>
                <option value="instrument">Instrument</option>
                <option value="certificate">Certificate</option>
              </select>
              <input
                className="field-input flex-1"
                placeholder="Paste ID here"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
              />
              <button className="btn-brass">Check</button>
            </form>
          </div>
        </div>
      )}

      {loading && <p className="text-ink/60">Checking…</p>}
      {error && <p className="text-danger">{error}</p>}

      {result && (
        <div className="card">
          {result.type === "shop" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">{result.shop.shopName}</h2>
                <span className={statusSeal(result.shop.complianceStatus)}>
                  {result.shop.complianceStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-ink/70 mb-4">
                {result.shop.address}, {result.shop.city}, {result.shop.state}
              </p>
              {result.certificate ? (
                <div className="text-sm border-t border-line pt-4">
                  <p>Certificate: <span className="font-mono">{result.certificate.certificateId}</span></p>
                  <p>Valid until: {new Date(result.certificate.validUntil).toLocaleDateString()}</p>
                  <p>
                    Integrity:{" "}
                    {result.certificate.currentlyValid ? (
                      <span className="text-ok">Verified, currently valid</span>
                    ) : (
                      <span className="text-danger">Not currently valid</span>
                    )}
                  </p>
                </div>
              ) : (
                <p className="text-ink/60 text-sm border-t border-line pt-4">No active certificate on record.</p>
              )}
              <div className="mt-4 text-sm">
                <p className="text-ink/60 mb-1">Instruments on record: {result.instruments.length}</p>
              </div>
              {result.products?.length > 0 && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="text-ink/60 text-sm mb-2">Items sold here:</p>
                  <ul className="text-sm space-y-1">
                    {result.products.map((p) => (
                      <li key={p._id} className="flex justify-between">
                        <span>
                          {p.name} {p.category && <span className="text-ink/40">({p.category})</span>}
                        </span>
                        {p.price != null && (
                          <span className="text-ink/60">
                            ₹{p.price} {p.unit}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {result.type === "certificate" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Certificate {result.certificate.certificateId}</h2>
                <span className={result.currentlyValid ? "seal-compliant" : "seal-noncompliant"}>
                  {result.currentlyValid ? "VALID" : "NOT VALID"}
                </span>
              </div>
              <p className="text-sm">Shop: {result.certificate.shop?.shopName}</p>
              <p className="text-sm">Issued: {new Date(result.certificate.issueDate).toLocaleDateString()}</p>
              <p className="text-sm">Valid until: {new Date(result.certificate.validUntil).toLocaleDateString()}</p>
              <p className="text-sm mt-2">
                Tamper check: {result.integrityVerified ? <span className="text-ok">passed</span> : <span className="text-danger">FAILED — record may have been altered</span>}
              </p>
            </>
          )}

          {result.type === "instrument" && (
            <>
              <h2 className="text-xl mb-2">{result.instrument.instrumentType}</h2>
              <p className="text-sm">Serial: {result.instrument.serialNumber}</p>
              <p className="text-sm">Shop: {result.instrument.shop?.shopName}</p>
              <p className="text-sm">
                Status: <span className={statusSeal(result.instrument.verificationStatus)}>{result.instrument.verificationStatus}</span>
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
