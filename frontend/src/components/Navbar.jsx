import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const roleHome = { user: "/user", citizen: "/citizen", inspector: "/inspector", admin: "/admin" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`relative py-1 text-ink/70 hover:text-ink transition-colors ${
        location.pathname === to
          ? "text-ink font-medium after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:bg-brass after:rounded-full"
          : ""
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={user ? roleHome[user.role] : "/"} className="flex items-center gap-2.5">
         <img
            src="/logo.png"
            alt="MaanDrishti logo"
            className="w-9 h-9 rounded-full shadow-sm ring-2 ring-brass/40 object-cover"
          />
          <span className="font-serif text-lg text-inkdeep">MaanDrishti</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {navLink("/verify", "Verify an instrument")}
          {navLink("/complaint", "Report an issue")}
          {user ? (
            <>
              <span className="text-line">|</span>
              <span className="text-ink/70">
                {user.name} <span className="text-ink/40">({user.role})</span>
              </span>
              <button
                className="btn-outline !py-1.5"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !py-1.5">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
