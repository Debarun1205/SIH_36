import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios.js";
import EvidenceCapture from "../../components/EvidenceCapture.jsx";

export default function ShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [tab, setTab] = useState("instruments");
  const [applications, setApplications] = useState([]);

  const load = async () => {
    const [shopRes, instrRes, certRes, appRes] = await Promise.all([
      api.get(`/shops/${id}`),
      api.get(`/instruments/shop/${id}`),
      api.get(`/certificates/shop/${id}`),
      api.get(`/applications/mine`),
    ]);
    setShop(shopRes.data.shop);
    setInstruments(instrRes.data.instruments);
    setCertificates(certRes.data.certificates);
    setApplications(appRes.data.applications.filter((a) => a.shop?._id === id));
  };

  useEffect(() => {
    load();
  }, [id]);

  const loadSlots = async () => {
    const params = shop?.location?.lat ? { lat: shop.location.lat, lng: shop.location.lng } : { city: shop.city, state: shop.state };
    const { data } = await api.get("/slots/available", { params });
    setSlots(data.slots);
  };

  useEffect(() => {
    if (shop && tab === "book") loadSlots();
  }, [shop, tab]);

  if (!shop) return <div className="max-w-4xl mx-auto px-6 py-10 text-ink/60">Loading…</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl">{shop.shopName}</h1>
          <p className="text-ink/60 text-sm">
            {shop.address}, {shop.city}, {shop.state}
          </p>
        </div>
        {shop.qrCode && (
          <img src={shop.qrCode} alt="Shop QR" className="w-24 h-24 border border-line rounded-sm" />
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-line">
        {["instruments", "book", "apply", "certificates"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px ${
              tab === t ? "border-brass text-inkdeep" : "border-transparent text-ink/50"
            }`}
          >
            {t === "book" ? "Book a slot myself" : t === "apply" ? "Request inspection" : t}
          </button>
        ))}
      </div>

      {tab === "instruments" && <InstrumentsTab shopId={id} instruments={instruments} onAdded={load} />}
      {tab === "book" && <BookTab shopId={id} slots={slots} onBooked={load} />}
      {tab === "apply" && <ApplyTab shopId={id} applications={applications} onApplied={load} />}
      {tab === "certificates" && <CertificatesTab certificates={certificates} />}
    </div>
  );
}

function InstrumentsTab({ shopId, instruments, onAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ instrumentType: "", manufacturer: "", modelNumber: "", serialNumber: "", capacity: "" });
  const [evidence, setEvidence] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/instruments", {
        shopId,
        ...form,
        nameplateImage: evidence?.image,
        ocrExtractedText: evidence?.ocrText,
      });
      setShowForm(false);
      setForm({ instrumentType: "", manufacturer: "", modelNumber: "", serialNumber: "", capacity: "" });
      setEvidence(null);
      onAdded();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add instrument");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button className="btn-brass" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add instrument"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card space-y-4 mb-6">
          <p className="text-sm text-ink/60">
            Tip: upload a photo of the instrument's nameplate — on-device OCR will read it, and you can
            copy details into the fields below.
          </p>
          <EvidenceCapture label="Nameplate photo (optional)" onCapture={setEvidence} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Instrument type</label>
              <input className="field-input" value={form.instrumentType} onChange={set("instrumentType")} required placeholder="e.g. Electronic Weighing Scale" />
            </div>
            <div>
              <label className="field-label">Capacity</label>
              <input className="field-input" value={form.capacity} onChange={set("capacity")} placeholder="e.g. 50 kg" />
            </div>
            <div>
              <label className="field-label">Manufacturer</label>
              <input className="field-input" value={form.manufacturer} onChange={set("manufacturer")} />
            </div>
            <div>
              <label className="field-label">Model number</label>
              <input className="field-input" value={form.modelNumber} onChange={set("modelNumber")} />
            </div>
            <div className="col-span-2">
              <label className="field-label">Serial number</label>
              <input className="field-input" value={form.serialNumber} onChange={set("serialNumber")} required />
            </div>
          </div>
          {error && <p className="text-danger text-sm">{error}</p>}
          <button className="btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save instrument"}
          </button>
        </form>
      )}

      <table className="ledger-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Serial No.</th>
            <th>Status</th>
            <th>QR</th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((i) => (
            <tr key={i._id}>
              <td>{i.instrumentType}</td>
              <td className="font-mono">{i.serialNumber}</td>
              <td className="capitalize">{i.verificationStatus}</td>
              <td>{i.qrCode && <img src={i.qrCode} className="w-10 h-10" alt="qr" />}</td>
            </tr>
          ))}
          {instruments.length === 0 && (
            <tr>
              <td colSpan={4} className="text-ink/50 py-6 text-center">
                No instruments registered yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function BookTab({ shopId, slots, onBooked }) {
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  const book = async (slotId) => {
    setBooking(slotId);
    setError("");
    try {
      await api.post("/inspections/book", { shopId, slotId });
      onBooked();
    } catch (err) {
      setError(err.response?.data?.message || "Could not book this slot");
    } finally {
      setBooking(null);
    }
  };

  return (
    <div>
      {error && <p className="text-danger text-sm mb-3">{error}</p>}
      <div className="grid gap-3">
        {slots.map((s) => (
          <div key={s._id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">
                {new Date(s.date).toLocaleDateString()} · {s.startTime}–{s.endTime}
              </p>
              <p className="text-sm text-ink/60">
                Inspector: {s.inspector?.name} · {s.city}, {s.state}
                {s.distanceKm != null && ` · ${s.distanceKm.toFixed(1)} km away`}
              </p>
            </div>
            <button className="btn-brass" onClick={() => book(s._id)} disabled={booking === s._id}>
              {booking === s._id ? "Booking…" : "Book"}
            </button>
          </div>
        ))}
        {slots.length === 0 && <p className="text-ink/50 text-center py-8">No open inspection slots nearby right now.</p>}
      </div>
    </div>
  );
}

function ApplyTab({ shopId, applications, onApplied }) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasPending = applications.some((a) => a.status === "pending");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/applications", { shopId, notes });
      setNotes("");
      onApplied();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-ink/60 mb-4">
        Prefer not to pick a slot yourself? Request an inspection and the department will match you
        with the nearest available inspector based on your location and their current workload.
      </p>

      {!hasPending && (
        <form onSubmit={submit} className="card space-y-3 mb-6">
          <label className="field-label">Notes for the inspector (optional)</label>
          <textarea className="field-input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Request inspection"}
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {applications.map((a) => (
          <div key={a._id} className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-ink/60">Requested {new Date(a.createdAt).toLocaleDateString()}</p>
              {a.notes && <p className="text-sm">{a.notes}</p>}
              {a.assignedInspection && (
                <p className="text-sm text-ok mt-1">
                  Assigned to {a.assignedInspection.inspector?.name} ·{" "}
                  {a.assignedInspection.slot && new Date(a.assignedInspection.slot.date).toLocaleDateString()}{" "}
                  {a.assignedInspection.slot?.startTime}
                </p>
              )}
            </div>
            <span className={a.status === "assigned" ? "seal-compliant" : "seal-pending"}>{a.status}</span>
          </div>
        ))}
        {applications.length === 0 && <p className="text-ink/50 text-center py-8">No inspection requests yet.</p>}
      </div>
    </div>
  );
}

function CertificatesTab({ certificates }) {
  return (
    <div className="grid gap-4">
      {certificates.map((c) => (
        <div key={c._id} className="card flex items-center justify-between">
          <div>
            <p className="font-mono text-sm">{c.certificateId}</p>
            <p className="text-sm text-ink/60">
              Valid: {new Date(c.issueDate).toLocaleDateString()} – {new Date(c.validUntil).toLocaleDateString()}
            </p>
            <span className={c.status === "active" ? "seal-compliant" : "seal-noncompliant"}>{c.status}</span>
          </div>
          {c.qrCode && <img src={c.qrCode} className="w-20 h-20" alt="certificate qr" />}
        </div>
      ))}
      {certificates.length === 0 && <p className="text-ink/50 text-center py-8">No certificates issued yet.</p>}
    </div>
  );
}
