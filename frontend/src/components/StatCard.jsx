import React from "react";

export default function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      {icon && <span className="text-brass inline-block mb-1">{icon}</span>}
      <p className="stat-value">{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}
