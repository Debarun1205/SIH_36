import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { CitizenIcon, FlagIcon, MapPinIcon, ShopIcon } from "../../components/Icons.jsx";

const statusSeal = (status) => {
  const map = {
    compliant: "seal-compliant",
    "non-compliant": "seal-noncompliant",
    pending: "seal-pending",
    unverified: "seal-unverified",
  };
  return map[status] || "seal-unverified";
};

const complaintStatusSeal = (status) => {
  const map = {
    resolved: "seal-compliant",
    "under-review": "seal-pending",
    "inspection-scheduled": "seal-pending",
    submitted: "seal-unverified",
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
      <PageHeader
        icon={<CitizenIcon className="w-5 h-5" />}
        eyebrow="Citizen dashboard"
        title="Browse shops & track reports"
        subtitle="Browse verified shops nearby, or track reports you've filed."
        action={
          <div className="flex gap-2">
            <Link to="/verify" className="btn-outline">
              Scan a QR
            </Link>
            <Link to="/complaint" className="btn-primary">
              + Report an issue
            </Link>
          </div>
        }
      />

      <div className="flex gap-2 mb-6 border-b border-line">
        {[
          ["reports", <FlagIcon key="f" className="w-4 h-4" />, "My reports"],
          ["nearby", <MapPinIcon key="m" className="w-4 h-4" />, "Nearby shops"],
        ].map(([t, icon, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              tab === t ? "border-brass text-inkdeep" : "border-transparent text-ink/50 hover:text-ink/70"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {tab === "reports" && (
        <>
          {loading && <p className="text-ink/60">Loading…</p>}
          {!loading && complaints.length === 0 && (
            <EmptyState
              icon={<FlagIcon className="w-8 h-8" />}
              title="You haven't reported anything yet."
              action={
                <Link to="/complaint" className="btn-brass">
                  Report your first issue
                </Link>
              }
            />
          )}
          <div className="grid gap-3">
            {complaints.map((c) => (
              <div key={c._id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium capitalize">{c.issueType.replace(/-/g, " ")}</p>
                  <span className={complaintStatusSeal(c.status)}>{c.status.replace(/-/g, " ")}</span>
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
        <button onClick={useMyLocation} className="text-xs text-brass hover:underline flex items-center gap-1" disabled={locating}>
          <MapPinIcon className="w-3.5 h-3.5" />
          {locating ? "Locating…" : "Sort by distance from me"}
        </button>
      </div>

      {loading && <p className="text-ink/60">Loading…</p>}

      <div className="grid gap-3">
        {shops.map((s) => (
          <Link key={s._id} to={`/verify/shop/${s.qrId}`} className="card card-hover flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="page-icon-badge">
                <ShopIcon className="w-5 h-5" />
              </span>
              <div>
                <p className="font-medium">{s.shopName}</p>
                <p className="text-sm text-ink/60">
                  {s.category && `${s.category} · `}
                  {s.address}, {s.city}
                  {s.distanceKm != null && ` · ${s.distanceKm.toFixed(1)} km away`}
                </p>
                <p className="text-xs text-ink/40 mt-1">
                  {s.productCount} item{s.productCount === 1 ? "" : "s"} listed
                </p>
              </div>
            </div>
            <span className={statusSeal(s.complianceStatus)}>{s.complianceStatus.toUpperCase()}</span>
          </Link>
        ))}
        {!loading && shops.length === 0 && (
          <EmptyState icon={<ShopIcon className="w-8 h-8" />} title="No shops registered nearby yet." />
        )}
      </div>
    </div>
  );
}
