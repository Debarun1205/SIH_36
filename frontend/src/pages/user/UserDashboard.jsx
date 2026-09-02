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

export default function UserDashboard() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/shops/mine");
    setShops(data.shops);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl">Your shops</h1>
          <p className="text-ink/60 text-sm">Register a shop, add instruments, and book inspections.</p>
        </div>
        <Link to="/user/register-shop" className="btn-primary">
          + Register a shop
        </Link>
      </div>

      {loading && <p className="text-ink/60">Loading…</p>}

      {!loading && shops.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-ink/60 mb-4">You haven't registered a shop yet.</p>
          <Link to="/user/register-shop" className="btn-brass">
            Register your first shop
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {shops.map((shop) => (
          <div key={shop._id} className="card flex items-center justify-between">
            <div>
              <p className="font-serif text-lg text-inkdeep">{shop.shopName}</p>
              <p className="text-sm text-ink/60">
                {shop.city}, {shop.state}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={statusSeal(shop.complianceStatus)}>{shop.complianceStatus.toUpperCase()}</span>
              <Link to={`/user/shops/${shop._id}`} className="btn-outline">
                Manage
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
