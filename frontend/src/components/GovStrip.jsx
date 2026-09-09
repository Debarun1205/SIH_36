import React from "react";
import { ShieldCheckIcon } from "./Icons.jsx";

export default function GovStrip() {
  return (
    <div className="bg-inkdeep text-paper">
      <div className="max-w-6xl mx-auto px-6 h-9 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
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
