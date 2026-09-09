import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ShopIcon, CitizenIcon } from "../components/Icons.jsx";

export default function Register() {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "user" });

  const submit = async (e) => {
    e.preventDefault();
    const user = await register(form).catch(() => null);
    if (user) navigate(user.role === "citizen" ? "/citizen" : "/user");
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-md mx-auto mt-16 px-6">
      <h1 className="text-2xl mb-1">Create an account</h1>
      <p className="text-ink/60 text-sm mb-6">
        Register instruments and track verification status, or sign up to track your complaints.
      </p>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={() => setForm({ ...form, role: "user" })}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-md border transition-colors ${
            form.role === "user" ? "bg-ink text-paper border-ink shadow-soft" : "border-line text-ink/60 hover:border-ink/30"
          }`}
        >
          <ShopIcon className="w-4 h-4" />
          Business / Shop Owner
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, role: "citizen" })}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-md border transition-colors ${
            form.role === "citizen" ? "bg-ink text-paper border-ink shadow-soft" : "border-line text-ink/60 hover:border-ink/30"
          }`}
        >
          <CitizenIcon className="w-4 h-4" />
          Citizen / Consumer
        </button>
      </div>

      <form onSubmit={submit} className="card-official space-y-4">
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
      <p className="text-sm text-ink/60 mt-1">
        Government official or inspector?{" "}
        <Link to="/register-official" className="text-brass hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
