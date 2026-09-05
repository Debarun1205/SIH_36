import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

const issueTypes = [
  { value: "incorrect-weight", label: "Incorrect weight or measurement" },
  { value: "expired-certificate", label: "Expired certificate displayed" },
  { value: "missing-verification-mark", label: "No verification mark visible" },
  { value: "suspicious-instrument", label: "Suspicious or tampered instrument" },
  { value: "other", label: "Other" },
];

const statusSeal = (status) => {
  const map = {
    resolved: "seal-compliant",
    "under-review": "seal-pending",
    "inspection-scheduled": "seal-pending",
    submitted: "seal-unverified",
  };
  return map[status] || "seal-unverified";
};

export default function SubmitComplaint() {
  const { user } = useAuth();
  const [tab, setTab] = useState("submit");
  const [form, setForm] = useState({
    name: user?.role === "citizen" ? user.name : "",
    contact: user?.role === "citizen" ? user.phone || "" : "",
    issueType: "incorrect-weight",
    description: "",
  });
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/complaints", form);
      setSubmitted(data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit complaint");
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 px-6 text-center">
        <div className="card">
          <h2 className="text-xl mb-2">Report received</h2>
          <p className="text-sm text-ink/70">
            Reference ID: <span className="font-mono">{submitted._id}</span>
          </p>
          <p className="text-xs text-ink/50 mt-1">Save this ID — you'll need it to check the status later.</p>
          <p className="text-sm text-ink/60 mt-3">The relevant authority will review this report.</p>
          {user?.role === "citizen" && (
            <Link to="/citizen" className="text-brass text-sm hover:underline mt-3 inline-block">
              Track it on your dashboard
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="text-2xl mb-1">Report an issue</h1>
      <p className="text-ink/60 text-sm mb-6">No account needed. Tell us what you noticed.</p>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setTab("submit")}
          className={`flex-1 py-2 text-sm rounded-sm border ${
            tab === "submit" ? "bg-ink text-paper border-ink" : "border-line text-ink/60"
          }`}
        >
          Submit a report
        </button>
        <button
          type="button"
          onClick={() => setTab("track")}
          className={`flex-1 py-2 text-sm rounded-sm border ${
            tab === "track" ? "bg-ink text-paper border-ink" : "border-line text-ink/60"
          }`}
        >
          Track a report
        </button>
      </div>

      {tab === "submit" ? (
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="field-label">Your name (optional)</label>
            <input className="field-input" value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="field-label">Contact (optional)</label>
            <input className="field-input" value={form.contact} onChange={set("contact")} placeholder="Phone or email" />
          </div>
          <div>
            <label className="field-label">Issue type</label>
            <select className="field-input" value={form.issueType} onChange={set("issueType")}>
              {issueTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea
              className="field-input"
              rows={4}
              value={form.description}
              onChange={set("description")}
              required
            />
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button className="btn-primary w-full">Submit report</button>
        </form>
      ) : (
        <TrackReportForm />
      )}
    </div>
  );
}

function TrackReportForm() {
  const [refId, setRefId] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const track = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await api.get(`/complaints/track/${refId.trim()}`);
      setResult(data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || "No report found with that reference ID");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={track} className="card space-y-3">
        <label className="field-label">Reference ID</label>
        <input
          className="field-input font-mono text-sm"
          placeholder="Paste the ID you were given after submitting"
          value={refId}
          onChange={(e) => setRefId(e.target.value)}
          required
        />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Checking…" : "Check status"}
        </button>
      </form>

      {result && (
        <div className="card mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium capitalize">{result.issueType.replace(/-/g, " ")}</p>
            <span className={statusSeal(result.status)}>{result.status.replace(/-/g, " ")}</span>
          </div>
          {result.shop && (
            <p className="text-xs text-ink/50 mb-2">
              Shop: {result.shop.shopName} · {result.shop.city}
            </p>
          )}
          <p className="text-xs text-ink/40">Filed {new Date(result.createdAt).toLocaleDateString()}</p>
          {result.resolutionNotes && (
            <p className="text-xs text-ok mt-2 border-t border-line pt-2">Resolution: {result.resolutionNotes}</p>
          )}
        </div>
      )}
    </div>
  );
}
