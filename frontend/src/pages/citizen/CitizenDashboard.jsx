import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

const statusSeal = (status) => {
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

  useEffect(() => {
    api.get("/complaints/mine").then((res) => {
      setComplaints(res.data.complaints);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl">Your reports</h1>
          <p className="text-ink/60 text-sm">Track the status of instruments or shops you've reported.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/verify" className="btn-outline">
            Verify a shop
          </Link>
          <Link to="/complaint" className="btn-primary">
            + Report an issue
          </Link>
        </div>
      </div>

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
            {c.shop && <p className="text-xs text-ink/50">Shop: {c.shop.shopName} · {c.shop.city}</p>}
            {c.resolutionNotes && (
              <p className="text-xs text-ok mt-2 border-t border-line pt-2">Resolution: {c.resolutionNotes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
