import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function InspectorDashboard() {
  const [slots, setSlots] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [tab, setTab] = useState("inspections");

  const load = async () => {
    const [slotRes, inspRes] = await Promise.all([api.get("/slots/mine"), api.get("/inspections/mine")]);
    setSlots(slotRes.data.slots);
    setInspections(inspRes.data.inspections);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-1">Inspector dashboard</h1>
      <p className="text-ink/60 text-sm mb-6">Manage your availability and complete assigned inspections.</p>

      <div className="flex gap-2 mb-6 border-b border-line">
        {["inspections", "slots"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px ${
              tab === t ? "border-brass text-inkdeep" : "border-transparent text-ink/50"
            }`}
          >
            {t === "slots" ? "My availability" : "Assigned inspections"}
          </button>
        ))}
      </div>

      {tab === "inspections" && (
        <div className="grid gap-3">
          {inspections.map((insp) => (
            <div key={insp._id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{insp.shop?.shopName}</p>
                <p className="text-sm text-ink/60">
                  {insp.shop?.city}, {insp.shop?.state} ·{" "}
                  {insp.slot ? `${new Date(insp.slot.date).toLocaleDateString()} ${insp.slot.startTime}` : ""}
                </p>
                <span
                  className={
                    insp.result === "compliant"
                      ? "seal-compliant"
                      : insp.result === "non-compliant"
                      ? "seal-noncompliant"
                      : insp.result === "review-required"
                      ? "seal-noncompliant"
                      : "seal-pending"
                  }
                >
                  {insp.status === "completed" ? insp.result.toUpperCase() : "SCHEDULED"}
                </span>
              </div>
              {insp.status === "scheduled" && (
                <Link to={`/inspector/inspections/${insp._id}`} className="btn-brass">
                  Conduct inspection
                </Link>
              )}
            </div>
          ))}
          {inspections.length === 0 && <p className="text-ink/50 text-center py-8">No inspections assigned yet.</p>}
        </div>
      )}

      {tab === "slots" && <SlotsTab slots={slots} onAdded={load} />}
    </div>
  );
}

function SlotsTab({ slots, onAdded }) {
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "", city: "", state: "", lat: "", lng: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/slots", { ...form, lat: form.lat ? parseFloat(form.lat) : undefined, lng: form.lng ? parseFloat(form.lng) : undefined });
      setForm({ date: "", startTime: "", endTime: "", city: "", state: "", lat: "", lng: "" });
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add slot");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <form onSubmit={submit} className="card space-y-4 mb-6">
        <p className="text-sm text-ink/60">
          Add a time slot and the location you'll be inspecting in — shop owners nearby will see it when booking.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="field-label">Date</label>
            <input type="date" className="field-input" value={form.date} onChange={set("date")} required />
          </div>
          <div>
            <label className="field-label">Start time</label>
            <input type="time" className="field-input" value={form.startTime} onChange={set("startTime")} required />
          </div>
          <div>
            <label className="field-label">End time</label>
            <input type="time" className="field-input" value={form.endTime} onChange={set("endTime")} required />
          </div>
          <div>
            <label className="field-label">City</label>
            <input className="field-input" value={form.city} onChange={set("city")} required />
          </div>
          <div>
            <label className="field-label">State</label>
            <input className="field-input" value={form.state} onChange={set("state")} required />
          </div>
          <div>
            <button type="button" onClick={useMyLocation} className="text-xs text-brass hover:underline mt-6">
              Use my current location
            </button>
          </div>
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary" disabled={submitting}>
          {submitting ? "Adding…" : "Add availability slot"}
        </button>
      </form>

      <table className="ledger-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {slots.map((s) => (
            <tr key={s._id}>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td>
                {s.startTime}–{s.endTime}
              </td>
              <td>
                {s.city}, {s.state}
              </td>
              <td>{s.isBooked ? <span className="seal-pending">Booked</span> : <span className="seal-compliant">Open</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
