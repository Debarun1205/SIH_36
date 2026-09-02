import React, { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const statusColor = { compliant: "#3F6B4A", "non-compliant": "#9B3B3B", pending: "#A6631E", unverified: "#8A8577" };

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");

  const tabs = [
    ["overview", "Overview"],
    ["map", "Map"],
    ["inspectors", "Inspectors"],
    ["tolerance", "Tolerance rules"],
    ["review", "Review queue"],
    ["complaints", "Complaints"],
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-1">Admin dashboard</h1>
      <p className="text-ink/60 text-sm mb-6">Compliance monitoring, inspector management, and configuration.</p>

      <div className="flex gap-1 mb-6 border-b border-line flex-wrap">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === key ? "border-brass text-inkdeep" : "border-transparent text-ink/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview />}
      {tab === "map" && <MapView />}
      {tab === "inspectors" && <Inspectors />}
      {tab === "tolerance" && <ToleranceRules />}
      {tab === "review" && <ReviewQueue />}
      {tab === "complaints" && <Complaints />}
    </div>
  );
}

function Overview() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/inspections/analytics").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-ink/60">Loading…</p>;
  const s = data.summary;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          ["Total shops", s.totalShops],
          ["Compliant", s.compliantShops],
          ["Non-compliant", s.nonCompliantShops],
          ["Pending", s.pendingShops],
          ["Certificates issued", s.totalCertificates],
        ].map(([label, value]) => (
          <div key={label} className="card text-center">
            <p className="text-3xl font-serif text-inkdeep">{value}</p>
            <p className="text-xs text-ink/60 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg mb-3">Flags for attention</h2>
      <div className="grid gap-2">
        {data.flags.map((f, idx) => (
          <div key={idx} className="card !p-3 flex items-center justify-between">
            <span className="text-sm">{f.message}</span>
            <span
              className={
                f.severity === "high" ? "seal-noncompliant" : f.severity === "medium" ? "seal-pending" : "seal-unverified"
              }
            >
              {f.severity}
            </span>
          </div>
        ))}
        {data.flags.length === 0 && <p className="text-ink/50 text-sm">No anomalies detected right now.</p>}
      </div>
    </div>
  );
}

function MapView() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    api.get("/shops").then((res) => setShops(res.data.shops.filter((s) => s.location?.lat)));
  }, []);

  const center = shops.length ? [shops[0].location.lat, shops[0].location.lng] : [22.5726, 88.3639]; // default: Kolkata

  return (
    <div className="card !p-0 overflow-hidden">
      <MapContainer center={center} zoom={11} style={{ height: "500px", width: "100%" }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {shops.map((s) => (
          <CircleMarker
            key={s._id}
            center={[s.location.lat, s.location.lng]}
            radius={8}
            pathOptions={{ color: statusColor[s.complianceStatus] || "#8A8577", fillOpacity: 0.7 }}
          >
            <Popup>
              <strong>{s.shopName}</strong>
              <br />
              {s.complianceStatus}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

function Inspectors() {
  const [inspectors, setInspectors] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", city: "", state: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => api.get("/admin/users", { params: { role: "inspector" } }).then((res) => setInspectors(res.data.users));

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/admin/inspectors", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        baseLocation: { city: form.city, state: form.state },
      });
      setForm({ name: "", email: "", password: "", phone: "", city: "", state: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create inspector account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={submit} className="card space-y-3 h-fit">
        <h3 className="font-serif text-lg mb-1">Add inspector</h3>
        <input className="field-input" placeholder="Name" value={form.name} onChange={set("name")} required />
        <input className="field-input" placeholder="Email" type="email" value={form.email} onChange={set("email")} required />
        <input className="field-input" placeholder="Temporary password" type="password" value={form.password} onChange={set("password")} required />
        <input className="field-input" placeholder="Phone" value={form.phone} onChange={set("phone")} />
        <div className="grid grid-cols-2 gap-3">
          <input className="field-input" placeholder="Base city" value={form.city} onChange={set("city")} />
          <input className="field-input" placeholder="Base state" value={form.state} onChange={set("state")} />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating…" : "Create inspector account"}
        </button>
      </form>

      <div>
        <h3 className="font-serif text-lg mb-3">Current inspectors</h3>
        <div className="grid gap-2">
          {inspectors.map((i) => (
            <div key={i._id} className="card !p-3">
              <p className="font-medium text-sm">{i.name}</p>
              <p className="text-xs text-ink/60">{i.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToleranceRules() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState({ instrumentType: "", toleranceErrorPercent: "", notes: "" });
  const [error, setError] = useState("");

  const load = () => api.get("/tolerance-rules").then((res) => setRules(res.data.rules));

  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/tolerance-rules", { ...form, toleranceErrorPercent: parseFloat(form.toleranceErrorPercent) });
      setForm({ instrumentType: "", toleranceErrorPercent: "", notes: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save rule");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form onSubmit={submit} className="card space-y-3 h-fit">
        <h3 className="font-serif text-lg mb-1">Set tolerance rule</h3>
        <p className="text-xs text-ink/60 mb-2">
          Configured per instrument type instead of a hard-coded universal limit — set this per your applicable
          Legal Metrology rules.
        </p>
        <input className="field-input" placeholder="Instrument type (e.g. Electronic Weighing Scale)" value={form.instrumentType} onChange={set("instrumentType")} required />
        <input className="field-input" placeholder="Tolerance error % (e.g. 1.5)" type="number" step="any" value={form.toleranceErrorPercent} onChange={set("toleranceErrorPercent")} required />
        <input className="field-input" placeholder="Notes (optional)" value={form.notes} onChange={set("notes")} />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full">Save rule</button>
      </form>

      <div>
        <h3 className="font-serif text-lg mb-3">Configured rules</h3>
        <table className="ledger-table">
          <thead>
            <tr>
              <th>Instrument type</th>
              <th>Tolerance</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r._id}>
                <td>{r.instrumentType}</td>
                <td>{r.toleranceErrorPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReviewQueue() {
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    api.get("/inspections/review-queue").then((res) => setInspections(res.data.inspections));
  }, []);

  return (
    <div className="grid gap-3">
      {inspections.map((insp) => (
        <div key={insp._id} className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">{insp.shop?.shopName}</p>
            <span className="seal-pending">REVIEW REQUIRED</span>
          </div>
          <p className="text-sm text-ink/60 mb-2">Inspector: {insp.inspector?.name}</p>
          {insp.measurementChecks?.map((c, idx) => (
            <div key={idx} className="text-sm border-t border-line pt-2 mt-2">
              <p>
                Inspector-declared: <span className="font-mono">{c.observedValue}</span> · OCR-read:{" "}
                <span className="font-mono">{c.ocrExtractedReading || "n/a"}</span>
              </p>
              {c.evidenceImage && <img src={c.evidenceImage} alt="evidence" className="w-24 h-24 mt-2 rounded-sm border border-line" />}
            </div>
          ))}
        </div>
      ))}
      {inspections.length === 0 && <p className="text-ink/50 text-center py-8">No cases pending review.</p>}
    </div>
  );
}

function Complaints() {
  const [complaints, setComplaints] = useState([]);

  const load = () => api.get("/complaints").then((res) => setComplaints(res.data.complaints));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/complaints/${id}`, { status });
    load();
  };

  return (
    <div className="grid gap-3">
      {complaints.map((c) => (
        <div key={c._id} className="card">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium capitalize">{c.issueType.replace(/-/g, " ")}</p>
            <select className="field-input !w-auto !py-1 text-sm" value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)}>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under review</option>
              <option value="inspection-scheduled">Inspection scheduled</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <p className="text-sm text-ink/70">{c.description}</p>
        </div>
      ))}
      {complaints.length === 0 && <p className="text-ink/50 text-center py-8">No complaints filed yet.</p>}
    </div>
  );
}
