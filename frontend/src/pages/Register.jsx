import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  const submit = async (e) => {
    e.preventDefault();
    const user = await register(form).catch(() => null);
    if (user) navigate("/user");
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="text-2xl mb-1">Register your business</h1>
      <p className="text-ink/60 text-sm mb-6">
        Create an account to register instruments and track verification status.
      </p>

      <form onSubmit={submit} className="card space-y-4">
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
          <input
            className="field-input"
            type="password"
            minLength={6}
            value={form.password}
            onChange={set("password")}
            required
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink/60 mt-4">
        Already registered?{" "}
        <Link to="/login" className="text-brass hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
