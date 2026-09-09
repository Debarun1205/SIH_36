import React from "react";
import { ShieldCheckIcon } from "./Icons.jsx";

export default function GovStrip() {
  return (
    <div className="bg-inkdeep text-paper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] sm:text-xs text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-brasslight" />
          <span className="tracking-wide">
            Ministry of Consumer Affairs, Food &amp; Public Distribution · Department of Consumer Affairs
          </span>
        </div>
        <span className="gov-pill">SIH Prototype · Not a live government system</span>
      </div>
    </div>
  );
}
