import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const roleHome = { user: "/user", citizen: "/citizen", inspector: "/inspector", admin: "/admin" };

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const user = await login(email, password).catch(() => null);
    if (user) navigate(roleHome[user.role] || "/");
  };

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="text-2xl mb-1">Log in</h1>
      <p className="text-ink/60 text-sm mb-6">Access your business, inspector, or admin dashboard.</p>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="field-label">Email</label>
          <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="field-label">Password</label>
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-4">
        New business or seller?{" "}
        <Link to="/register" className="text-brass hover:underline">
          Register here
        </Link>
        . Inspector and admin accounts are created by the department.
      </p>
    </div>
  );
}
