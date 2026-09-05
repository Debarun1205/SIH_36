import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 mt-20 text-center">
      <span className="text-brass text-sm tracking-wide">Legal Metrology · Digital Verification</span>
      <h1 className="text-4xl mt-3 mb-4 leading-tight">
        Every weighing and measuring instrument, verifiably compliant.
      </h1>
      <p className="text-ink/70 max-w-xl mx-auto mb-8">
        MaanDrishti gives businesses, inspectors and citizens one place to register instruments,
        schedule inspections, issue tamper-evident digital certificates, and check compliance
        status instantly by scanning a QR code.
      </p>
      <div className="flex justify-center gap-3">
        <Link to="/register" className="btn-primary">
          Register a business
        </Link>
        <Link to="/verify" className="btn-outline">
          Verify an instrument
        </Link>
      </div>
      <p className="text-sm text-ink/50 mt-6">
        Government official or inspector?{" "}
        <Link to="/register-official" className="text-brass hover:underline">
          Register here
        </Link>
      </p>
    </div>
  );
}