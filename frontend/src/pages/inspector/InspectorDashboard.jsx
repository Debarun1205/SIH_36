import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function InspectorDashboard() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [nearbyShops, setNearbyShops] = useState([]);
  const [tab, setTab] = useState("inspections");

  const load = async () => {
    const [slotRes, inspRes] = await Promise.all([api.get("/slots/mine"), api.get("/inspections/mine")]);
    setSlots(slotRes.data.slots);
    setInspections(inspRes.data.inspections);
  };

  const loadNearby = async () => {
    const { data } = await api.get("/shops/needing-inspection");
    setNearbyShops(data.shops);
  };

  useEffect(() => {
    if (user?.approvalStatus === "approved") load();
  }, [user]);

  useEffect(() => {
    if (user?.approvalStatus === "approved" && tab === "find") loadNearby();
  }, [tab, user]);

  if (user?.approvalStatus === "pending") {
    return (
      <div className="max-w-md mx-auto mt-16 px-6 text-center">
        <div className="card">
          <h2 className="text-xl mb-2">Approval pending</h2>
          <p className="text-sm text-ink/70">
            Your inspector registration is on file with your location and availability, but a
            government admin hasn't approved your account yet. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  if (user?.approvalStatus === "rejected") {
    return (
      <div className="max-w-md mx-auto mt-16 px-6 text-center">
        <div className="card">
          <h2 className="text-xl mb-2">Registration not approved</h2>
          <p className="text-sm text-ink/70">
            A government admin has not approved this inspector account. Contact the department if
            you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl mb-1">Inspector dashboard</h1>
      <p className="text-ink/60 text-sm mb-6">Manage your availability and complete assigned inspections.</p>

      <div className="flex gap-2 mb-6 border-b border-line">
        {["inspections", "find", "slots"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px ${
              tab === t ? "border-brass text-inkdeep" : "border-transparent text-ink/50"
            }`}
          >
            {t === "slots" ? "My availability" : t === "find" ? "Find shops to inspect" : "Assigned inspections"}
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

      {tab === "find" && <FindShopsTab shops={nearbyShops} mySlots={slots.filter((s) => !s.isBooked)} onAssigned={() => { load(); loadNearby(); }} />}
      {tab === "slots" && <SlotsTab slots={slots} onAdded={load} />}
    </div>
  );
}

function FindShopsTab({ shops, mySlots, onAssigned }) {
  const [selectedShop, setSelectedShop] = useState(null);
  const [slotId, setSlotId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const assign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/inspections/self-assign", { shopId: selectedShop._id, slotId });
      setSelectedShop(null);
      setSlotId("");
      onAssigned();
    } catch (err) {
      setError(err.response?.data?.message || "Could not assign this shop to yourself");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <p className="text-sm text-ink/60 mb-3">Shops needing verification, nearest to you first:</p>
        <div className="grid gap-2">
          {shops.map((s) => (
            <div key={s._id} className="card !p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{s.shopName}</p>
                <p className="text-xs text-ink/60">
                  {s.city}, {s.state}
                  {s.sameCity ? " · same city" : s.distanceKm != null ? ` · ${s.distanceKm.toFixed(1)} km` : ""}
                </p>
              </div>
              <button className="btn-brass !py-1.5" onClick={() => setSelectedShop(s)}>
                Inspect
              </button>
            </div>
          ))}
          {shops.length === 0 && <p className="text-ink/50 text-center py-8">No shops currently need inspection.</p>}
        </div>
      </div>

      <div>
        <h3 className="font-serif text-lg mb-3">
          {selectedShop ? `Pick your slot — ${selectedShop.shopName}` : "Select a shop to self-assign"}
        </h3>
        {selectedShop && (
          <form onSubmit={assign} className="card space-y-3">
            {mySlots.length === 0 && (
              <p className="text-sm text-warn">You have no open slots — add one under "My availability" first.</p>
            )}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {mySlots.map((s) => (
                <label
                  key={s._id}
                  className={`flex items-center border rounded-sm px-3 py-2 text-sm cursor-pointer ${
                    slotId === s._id ? "border-brass bg-paperdim/50" : "border-line"
                  }`}
                >
                  <input type="radio" name="slot" className="mr-2" checked={slotId === s._id} onChange={() => setSlotId(s._id)} />
                  {new Date(s.date).toLocaleDateString()} · {s.startTime}–{s.endTime}
                </label>
              ))}
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button className="btn-primary w-full" disabled={submitting || !slotId}>
              {submitting ? "Assigning…" : "Confirm — inspect this shop"}
            </button>
          </form>
        )}
      </div>
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
