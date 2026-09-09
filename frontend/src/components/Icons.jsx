import React from "react";

// A small, consistent set of stroke icons (24x24, currentColor) so every page
// draws from the same visual vocabulary instead of ad-hoc emoji/characters.
// Kept as plain inline SVG - no icon library dependency, no build step.

const base = "w-5 h-5";

export const ShopIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9.5 5 4h14l1 5.5" />
    <path d="M4 9.5a2 2 0 004 0 2 2 0 004 0 2 2 0 004 0 2 2 0 004 0" />
    <path d="M5 10v9h14v-9" />
    <path d="M10 19v-5h4v5" />
  </svg>
);

export const InstrumentIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="13" r="7" />
    <path d="M9 3h6" />
    <path d="M12 13l3-3" />
  </svg>
);

export const CertificateIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="5" />
    <path d="M9 12.5L7 21l5-2.5L17 21l-2-8.5" />
  </svg>
);

export const InspectorIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    <path d="M9.5 14.5l2 2 3-3.5" />
  </svg>
);

export const CitizenIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.2" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
);

export const GovIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10l8-5 8 5" />
    <path d="M5 10v9M9 10v9M15 10v9M19 10v9" />
    <path d="M3 19h18" />
  </svg>
);

export const MapPinIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-6.1 7-11.5A7 7 0 005 9.5C5 14.9 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </svg>
);

export const CalendarIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5.5" width="16" height="15" rx="1.5" />
    <path d="M4 10h16M8 3.5v4M16 3.5v4" />
  </svg>
);

export const FlagIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 21V4" />
    <path d="M5 5h13l-3 4 3 4H5" />
  </svg>
);

export const ProductIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12.5V19a1 1 0 01-1 1H5a1 1 0 01-1-1v-6.5" />
    <path d="M3 8l1.5-4h15L21 8" />
    <path d="M3 8h18v3a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 01-2 2 2 2 0 01-2-2V8z" />
  </svg>
);

export const ChatIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5h16v10H8l-4 4V5z" />
  </svg>
);

export const ShieldCheckIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
    <path d="M9 12.3l2 2 4-4.5" />
  </svg>
);

export const TrendIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 17l6-6 4 4 8-9" />
    <path d="M15 6h6v6" />
  </svg>
);

export const BellIcon = ({ className = base }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
    <path d="M10 19a2 2 0 004 0" />
  </svg>
);
