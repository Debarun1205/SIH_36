import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const statusSeal = (status) => {
  const map = {
    compliant: "seal-compliant",
    "non-compliant": "seal-noncompliant",
    pending: "seal-pending",
    unverified: "seal-unverified",
  };
  return map[status] || "seal-unverified";
};

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("reports");

  useEffect(() => {
    api.get("/complaints/mine").then((res) => {
      setComplaints(res.data.complaints);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl">Citizen dashboard</h1>
          <p className="text-ink/60 text-sm">Browse verified shops nearby, or track reports you've filed.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/verify" className="btn-outline">
            Scan a QR
          </Link>
          <Link to="/complaint" className="btn-primary">
            + Report an issue
          </Link>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-line">
        {["reports", "nearby"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px ${
              tab === t ? "border-brass text-inkdeep" : "border-transparent text-ink/50"
            }`}
          >
            {t === "nearby" ? "Nearby shops" : "My reports"}
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <>
          {loading && <p className="text-ink/60">Loading…</p>}
          {!loading && complaints.length === 0 && (
            <div className="card text-center py-12">
              <p className="text-ink/60 mb-4">You haven't reported anything yet.</p>
              <Link to="/complaint" className="btn-brass">
                Report your first issue
              </Link>
            </div>
          )}
          <div className="grid gap-3">
            {complaints.map((c) => (
              <div key={c._id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium capitalize">{c.issueType.replace(/-/g, " ")}</p>
                  <span className={statusSeal(c.status)}>{c.status.replace(/-/g, " ")}</span>
                </div>
                <p className="text-sm text-ink/70 mb-1">{c.description}</p>
                {c.shop && (
                  <p className="text-xs text-ink/50">
                    Shop: {c.shop.shopName} · {c.shop.city}
                  </p>
                )}
                {c.resolutionNotes && (
                  <p className="text-xs text-ok mt-2 border-t border-line pt-2">Resolution: {c.resolutionNotes}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "nearby" && <NearbyShopsTab />}
    </div>
  );
}

function NearbyShopsTab() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  const load = (lat, lng) => {
    setLoading(true);
    api.get("/shops/nearby", { params: lat ? { lat, lng } : {} }).then((res) => {
      setShops(res.data.shops);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        load(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={useMyLocation} className="text-xs text-brass hover:underline" disabled={locating}>
          {locating ? "Locating…" : "Sort by distance from me"}
        </button>
      </div>

      {loading && <p className="text-ink/60">Loading…</p>}

      <div className="grid gap-3">
        {shops.map((s) => (
          <Link key={s._id} to={`/verify/shop/${s.qrId}`} className="card flex items-center justify-between hover:border-brass">
            <div>
              <p className="font-medium">{s.shopName}</p>
              <p className="text-sm text-ink/60">
                {s.category && `${s.category} · `}
                {s.address}, {s.city}
                {s.distanceKm != null && ` · ${s.distanceKm.toFixed(1)} km away`}
              </p>
              <p className="text-xs text-ink/40 mt-1">{s.productCount} item{s.productCount === 1 ? "" : "s"} listed</p>
            </div>
            <span className={statusSeal(s.complianceStatus)}>{s.complianceStatus.toUpperCase()}</span>
          </Link>
        ))}
        {!loading && shops.length === 0 && <p className="text-ink/50 text-center py-8">No shops registered nearby yet.</p>}
      </div>
    </div>
  );
}
