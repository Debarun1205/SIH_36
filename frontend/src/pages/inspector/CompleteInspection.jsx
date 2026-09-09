import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios.js";
import EvidenceCapture from "../../components/EvidenceCapture.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { InstrumentIcon, ShieldCheckIcon } from "../../components/Icons.jsx";

export default function CompleteInspection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [checks, setChecks] = useState({}); // instrumentId -> { expectedValue, observedValue, evidence }
  const [inspectorVerdict, setInspectorVerdict] = useState("compliant");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/inspections/mine");
      const insp = data.inspections.find((i) => i._id === id);
      setInspection(insp);
      if (insp?.shop?._id) {
        const instrRes = await api.get(`/instruments/shop/${insp.shop._id}`);
        setInstruments(instrRes.data.instruments);
      }
    })();
  }, [id]);

  const updateCheck = (instrumentId, patch) => {
    setChecks((c) => ({ ...c, [instrumentId]: { ...c[instrumentId], ...patch } }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const measurementChecks = instruments
        .filter((i) => checks[i._id]?.expectedValue !== undefined && checks[i._id]?.observedValue !== undefined)
        .map((i) => ({
          instrument: i._id,
          expectedValue: parseFloat(checks[i._id].expectedValue),
          observedValue: parseFloat(checks[i._id].observedValue),
          unit: checks[i._id].unit || "",
          evidenceImage: checks[i._id].evidence?.image,
          ocrExtractedReading: checks[i._id].evidence?.ocrText,
          ocrValueParsed: checks[i._id].evidence?.ocrValueParsed,
        }));

      const { data } = await api.patch(`/inspections/${id}/complete`, {
        remarks,
        inspectorVerdict,
        measurementChecks,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit inspection");
    } finally {
      setSubmitting(false);
    }
  };

  if (!inspection) return <div className="max-w-3xl mx-auto px-6 py-10 text-ink/60">Loading…</div>;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="card text-center">
          <span className="page-icon-badge mx-auto mb-3">
            <ShieldCheckIcon className="w-5 h-5" />
          </span>
          <h2 className="text-xl mb-2">Inspection recorded</h2>
          <p className="mb-2">
            Result:{" "}
            <span
              className={
                result.inspection.result === "compliant"
                  ? "seal-compliant"
                  : result.inspection.result === "review-required"
                  ? "seal-pending"
                  : "seal-noncompliant"
              }
            >
              {result.inspection.result.toUpperCase()}
            </span>
          </p>
          {result.inspection.result === "review-required" && (
            <p className="text-warn text-sm mb-4">
              The photo's OCR reading didn't match your entered value — this has been sent to the admin
              review queue instead of being auto-approved.
            </p>
          )}
          {result.certificate && (
            <p className="text-sm text-ink/60">
              Certificate issued: <span className="font-mono">{result.certificate.certificateId}</span>
            </p>
          )}
          <button className="btn-primary mt-4" onClick={() => navigate("/inspector")}>
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="page-icon-badge">
          <InstrumentIcon className="w-5 h-5" />
        </span>
        <div>
          <h1 className="text-2xl">Conduct inspection</h1>
          <p className="text-ink/60 text-sm">{inspection.shop?.shopName}</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {instruments.map((inst) => (
          <div key={inst._id} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium">
                {inst.instrumentType} <span className="text-ink/50 font-mono text-sm">({inst.serialNumber})</span>
              </p>
              {inst.verificationStatus === "verified" && (
                <span className="seal-compliant" title="Already verified in a previous inspection - only fill this in if you're re-checking it">
                  Already verified
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="field-label">Expected value</label>
                <input
                  type="number"
                  step="any"
                  className="field-input"
                  onChange={(e) => updateCheck(inst._id, { expectedValue: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Observed value</label>
                <input
                  type="number"
                  step="any"
                  className="field-input"
                  onChange={(e) => updateCheck(inst._id, { observedValue: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Unit</label>
                <input className="field-input" placeholder="kg, L, …" onChange={(e) => updateCheck(inst._id, { unit: e.target.value })} />
              </div>
            </div>
            <EvidenceCapture
              label="Photo of the display reading (OCR will cross-check it)"
              onCapture={(ev) => updateCheck(inst._id, { evidence: ev })}
            />
          </div>
        ))}

        {instruments.length === 0 && (
          <EmptyState icon={<InstrumentIcon className="w-8 h-8" />} title="This shop has no registered instruments yet." />
        )}

        <div className="card">
          <label className="field-label">Your overall verdict</label>
          <select className="field-input mb-4" value={inspectorVerdict} onChange={(e) => setInspectorVerdict(e.target.value)}>
            <option value="compliant">Compliant</option>
            <option value="non-compliant">Non-compliant</option>
          </select>
          <label className="field-label">Remarks</label>
          <textarea className="field-input" rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit inspection"}
        </button>
      </form>
    </div>
  );
}
