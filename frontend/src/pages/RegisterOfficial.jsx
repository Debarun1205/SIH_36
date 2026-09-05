import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterOfficial() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("inspector"); // "inspector" | "admin"
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [location, setLocation] = useState({ city: "", state: "", lat: "", lng: "" });
  const [slots, setSlots] = useState([{ date: "", startTime: "09:00", endTime: "10:00" }]);
  const [submitted, setSubmitted] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setLoc = (k) => (e) => setLocation({ ...location, [k]: e.target.value });

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation((l) => ({ ...l, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) }));
    });
  };

  const updateSlot = (idx, k, v) => {
    setSlots((s) => s.map((slot, i) => (i === idx ? { ...slot, [k]: v } : slot)));
  };
  const addSlot = () => setSlots((s) => [...s, { date: "", startTime: "09:00", endTime: "10:00" }]);
  const removeSlot = (idx) => setSlots((s) => s.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      role,
      ...(role === "inspector"
        ? {
            baseLocation: {
              city: location.city,
              state: location.state,
              lat: location.lat ? parseFloat(location.lat) : undefined,
              lng: location.lng ? parseFloat(location.lng) : undefined,
            },
            slots,
          }
        : {}),
    };
    const user = await register(payload).catch(() => null);
    if (user && role === "admin") navigate("/admin");
    if (user && role === "inspector") setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-16 px-6 text-center">
        <div className="card">
          <h2 className="text-xl mb-2">Registration received</h2>
          <p className="text-sm text-ink/70">
            Your inspector account has been created with your location and availability on file. A
            government admin needs to approve your account before you can access the inspector
            dashboard — you can log in any time to check your status.
          </p>
          <Link to="/login" className="btn-primary mt-4 inline-block">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl mb-1">Government & Inspector registration</h1>
      <p className="text-ink/60 text-sm mb-6">
        This is separate from business/citizen sign-up. Government accounts are restricted to
        authorized personnel; inspector accounts require admin approval before use.
      </p>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setRole("inspector")}
          className={`flex-1 py-2 text-sm rounded-sm border ${
            role === "inspector" ? "bg-ink text-paper border-ink" : "border-line text-ink/60"
          }`}
        >
          Inspector
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`flex-1 py-2 text-sm rounded-sm border ${
            role === "admin" ? "bg-ink text-paper border-ink" : "border-line text-ink/60"
          }`}
        >
          Government Official
        </button>
      </div>

      <form onSubmit={submit} className="card space-y-4">
        {role === "admin" && (
          <p className="text-xs text-warn bg-[#FBF3E6] border border-warn/30 rounded-sm px-3 py-2">
            Government registration is restricted to one authorized departmental email. Anyone else
            submitting this form will be rejected.
          </p>
        )}

        <div>
          <label className="field-label">Full name</label>
          <input className="field-input" value={form.name} onChange={set("name")} required />
        </div>
        <div>
          <label className="field-label">Email</label>
          <input className="field-input" type="email" value={form.email} onChange={set("email")} required />
        </div>
        <div>
          <label className="field-label">Phone</label>
          <input className="field-input" value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input className="field-input" type="password" minLength={6} value={form.password} onChange={set("password")} required />
        </div>

        {role === "inspector" && (
          <>
            <div className="border-t border-line pt-4">
              <div className="flex items-center justify-between">
                <label className="field-label mb-0">Your base location</label>
                <button type="button" onClick={useMyLocation} className="text-xs text-brass hover:underline">
                  Use my current location
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <input className="field-input" placeholder="City" value={location.city} onChange={setLoc("city")} required />
                <input className="field-input" placeholder="State" value={location.state} onChange={setLoc("state")} required />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <input className="field-input" placeholder="Latitude (optional)" value={location.lat} onChange={setLoc("lat")} />
                <input className="field-input" placeholder="Longitude (optional)" value={location.lng} onChange={setLoc("lng")} />
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <label className="field-label">Your available time slots</label>
              <div className="space-y-2">
                {slots.map((slot, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="date"
                      className="field-input"
                      value={slot.date}
                      onChange={(e) => updateSlot(idx, "date", e.target.value)}
                      required
                    />
                    <input
                      type="time"
                      className="field-input"
                      value={slot.startTime}
                      onChange={(e) => updateSlot(idx, "startTime", e.target.value)}
                      required
                    />
                    <input
                      type="time"
                      className="field-input"
                      value={slot.endTime}
                      onChange={(e) => updateSlot(idx, "endTime", e.target.value)}
                      required
                    />
                    {slots.length > 1 && (
                      <button type="button" onClick={() => removeSlot(idx)} className="text-danger text-sm px-1">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addSlot} className="text-xs text-brass hover:underline mt-2">
                + Add another slot
              </button>
            </div>
          </>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Submitting…" : role === "admin" ? "Register as government official" : "Submit for approval"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-4">
        Registering a business or as a citizen instead?{" "}
        <Link to="/register" className="text-brass hover:underline">
          Go here
        </Link>
      </p>
    </div>
  );
}
