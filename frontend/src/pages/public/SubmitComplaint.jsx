import React, { useState } from "react";
import api from "../../api/axios.js";

const issueTypes = [
  { value: "incorrect-weight", label: "Incorrect weight or measurement" },
  { value: "expired-certificate", label: "Expired certificate displayed" },
  { value: "missing-verification-mark", label: "No verification mark visible" },
  { value: "suspicious-instrument", label: "Suspicious or tampered instrument" },
  { value: "other", label: "Other" },
];

export default function SubmitComplaint() {
  const [form, setForm] = useState({ name: "", contact: "", issueType: "incorrect-weight", description: "" });
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
          <h2 className="text-xl mb-2">Complaint received</h2>
          <p className="text-sm text-ink/70">
            Reference ID: <span className="font-mono">{submitted._id}</span>
          </p>
          <p className="text-sm text-ink/60 mt-2">The relevant authority will review this report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="text-2xl mb-1">Report an issue</h1>
      <p className="text-ink/60 text-sm mb-6">No account needed. Tell us what you noticed.</p>

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
    </div>
  );
}
