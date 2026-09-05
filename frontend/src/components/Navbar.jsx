import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const roleHome = { user: "/user", citizen: "/citizen", inspector: "/inspector", admin: "/admin" };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-line bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to={user ? roleHome[user.role] : "/"} className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full border-2 border-brass flex items-center justify-center text-brass font-serif font-semibold text-sm">
            MV
          </span>
          <span className="font-serif text-lg text-inkdeep">MaanDrishti</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/verify" className="text-ink/70 hover:text-ink">
            Verify an instrument
          </Link>
          <Link to="/complaint" className="text-ink/70 hover:text-ink">
            Report an issue
          </Link>
          {user ? (
            <>
              <span className="text-ink/50">|</span>
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
