import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import PageHeader from "../../components/PageHeader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { ShopIcon } from "../../components/Icons.jsx";

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
      <PageHeader
        icon={<ShopIcon className="w-5 h-5" />}
        eyebrow="Business dashboard"
        title="Your shops"
        subtitle="Register a shop, add instruments, and book inspections."
        action={
          <Link to="/user/register-shop" className="btn-primary">
            + Register a shop
          </Link>
        }
      />

      {loading && <p className="text-ink/60">Loading…</p>}

      {!loading && shops.length === 0 && (
        <EmptyState
          icon={<ShopIcon className="w-8 h-8" />}
          title="You haven't registered a shop yet."
          action={
            <Link to="/user/register-shop" className="btn-brass">
              Register your first shop
            </Link>
          }
        />
      )}

      <div className="grid gap-4">
        {shops.map((shop) => (
          <Link
            key={shop._id}
            to={`/user/shops/${shop._id}`}
            className="card card-hover flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="page-icon-badge">
                <ShopIcon className="w-5 h-5" />
              </span>
              <div>
                <p className="font-serif text-lg text-inkdeep">{shop.shopName}</p>
                <p className="text-sm text-ink/60">
                  {shop.city}, {shop.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={statusSeal(shop.complianceStatus)}>{shop.complianceStatus.toUpperCase()}</span>
              <span className="btn-outline pointer-events-none">Manage</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
