import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function RegisterShop() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    shopName: "",
    category: "",
    licenseNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    lat: "",
    lng: "",
  });
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
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/shops", {
        ...form,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lng: form.lng ? parseFloat(form.lng) : undefined,
      });
      navigate(`/user/shops/${data.shop._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not register shop");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-2xl mb-1">Register a shop</h1>
      <p className="text-ink/60 text-sm mb-6">This creates the shop's digital identity and QR code.</p>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="field-label">Shop name</label>
          <input className="field-input" value={form.shopName} onChange={set("shopName")} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Category</label>
            <input className="field-input" placeholder="e.g. Grocery, Fuel Station" value={form.category} onChange={set("category")} />
          </div>
          <div>
            <label className="field-label">License number</label>
            <input className="field-input" value={form.licenseNumber} onChange={set("licenseNumber")} />
          </div>
        </div>
        <div>
          <label className="field-label">Address</label>
          <input className="field-input" value={form.address} onChange={set("address")} required />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="field-label">City</label>
            <input className="field-input" value={form.city} onChange={set("city")} required />
          </div>
          <div>
            <label className="field-label">State</label>
            <input className="field-input" value={form.state} onChange={set("state")} required />
          </div>
          <div>
            <label className="field-label">Pincode</label>
            <input className="field-input" value={form.pincode} onChange={set("pincode")} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="field-label mb-0">Coordinates (helps match nearby inspectors)</label>
            <button type="button" onClick={useMyLocation} className="text-xs text-brass hover:underline">
              Use my current location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <input className="field-input" placeholder="Latitude" value={form.lat} onChange={set("lat")} />
            <input className="field-input" placeholder="Longitude" value={form.lng} onChange={set("lng")} />
          </div>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Registering…" : "Register shop"}
        </button>
      </form>
    </div>
  );
}
