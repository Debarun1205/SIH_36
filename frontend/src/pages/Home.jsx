import React from "react";
import { Link } from "react-router-dom";
import { ShopIcon, InspectorIcon, CertificateIcon } from "../components/Icons.jsx";

const steps = [
  {
    icon: <ShopIcon className="w-6 h-6" />,
    title: "Register",
    text: "Businesses register their shop and instruments; citizens can sign up to track reports they file.",
  },
  {
    icon: <InspectorIcon className="w-6 h-6" />,
    title: "Get inspected",
    text: "An inspector verifies each instrument on-site — matched to you by location and availability.",
  },
  {
    icon: <CertificateIcon className="w-6 h-6" />,
    title: "Verify instantly",
    text: "A tamper-evident certificate with a QR code lets anyone confirm compliance in seconds.",
  },
];

export default function Home() {
  return (
    <div>
      <div className="hero-pattern border-b border-line">
        <div className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center animate-fade-up">
         <div className="w-16 h-16 rounded-2xl bg-white border-2 border-brass shadow-soft flex items-center justify-center mx-auto mb-5 overflow-hidden">
            <img src="/logo.png" alt="MaanDrishti logo" className="w-full h-full object-cover" />
          </div>

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
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.title} className="card-official animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <span className="page-icon-badge mb-3">{s.icon}</span>
              <p className="text-brass font-serif text-sm mb-1">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="text-lg mb-1.5">{s.title}</h3>
              <p className="text-sm text-ink/60">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mt-10">
          <span className="seal-badge bg-paperdim text-ink/70 border-line">Legal Metrology Act, 2009 aligned</span>
          <span className="seal-badge bg-paperdim text-ink/70 border-line">Tamper-evident certificates</span>
          <span className="seal-badge bg-paperdim text-ink/70 border-line">Free, open verification for citizens</span>
        </div>
      </div>
    </div>
  );
}
