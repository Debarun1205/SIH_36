<div align="center">

# MaanVerify

### Online Verification System for Weighing and Measuring Instruments

**SIH prototype (PS SIH26036 · Ministry of Consumer Affairs, Dept. of Consumer Affairs)**

[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)
[![Node](https://img.shields.io/badge/node-20.x-339933?logo=node.js&logoColor=white)](#tech-stack)
[![NestJS](https://img.shields.io/badge/backend-NestJS-E0234E?logo=nestjs&logoColor=white)](#tech-stack)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb&logoColor=white)](#tech-stack)


A digital lifecycle platform for legal-metrology verification: businesses register
instruments, inspectors are matched by location/time slot, tamper-evident digital
certificates are issued with QR codes, and citizens can instantly verify a shop's
compliance status.

**Everything here runs on free tiers and free/open-source tooling — no paid API keys
required anywhere in the stack.**

</div>

## What's built vs. what's a lightweight stand-in

The full "MaanVerify" vision (see the two spec docs this was built from) describes a
video-based AI evidence-verification engine (AEVE) using YOLO + OpenCV + a Python
FastAPI microservice to analyze inspection videos frame-by-frame. That's genuinely out
of scope for a 9-day, zero-budget hackathon build — training/hosting real object
detection models, video processing infra, and a separate Python service would eat the
whole timeline and doesn't run on Render/Vercel free tiers.

This prototype implements the **same spirit** — an independent, evidence-based check
that flags disagreement for human review instead of trusting the inspector blindly —
with a free substitute:

- Inspector uploads a **photo** (not video) of the instrument's display reading.
- **Tesseract.js** (free, runs entirely in the browser, no API key) OCRs the photo.
- The OCR reading is cross-checked against what the inspector typed in; a mismatch
  routes the case to an admin **review queue** instead of auto-approving.
- A simple **image-sharpness heuristic** (canvas-based Laplacian variance, no ML
  model) flags obviously blurry evidence photos before submission.
- Every certificate is chained with a **SHA-256 hash** referencing the previous
  certificate's hash — a lightweight, dependency-free stand-in for anchoring records
  on a real blockchain ledger, with the same tamper-evidence property.
- GIS uses **Leaflet + OpenStreetMap** (free, no Google Maps billing).

If you later get real compute budget, the `evaluateMeasurementCheck` function in
`backend/controllers/inspectionController.js` is the seam where you'd swap in a real
CV/video pipeline without touching the rest of the app.

## Architecture

```
SIH_36/
├── backend/     Node.js + Express + MongoDB (Mongoose) REST API
└── frontend/    React + Vite + Tailwind CSS
```

**Roles:** `user` (shop/business owner), `citizen` (consumer), `inspector`, `admin`
(government/department staff). JWT-based auth with role-based access control on
every protected route. `user` and `citizen` are open self-signup; `inspector`
and `admin` accounts can only be created by an existing admin.

**Two ways a shop gets inspected:**
1. **Self-service booking** — shop owner browses open inspector time slots
   (nearest-first if they share their location) and books one directly.
2. **Hand-down / assignment** — shop owner just "requests" an inspection with
   no slot picked (`Application` model). An admin sees the queue, gets a
   ranked shortlist of inspectors (same city first, then distance, then
   lowest current workload), picks one, and assigns a date/time in one step —
   this is the government-staff-driven assignment path from the PRD (FR-05).

**Core flow:** user registers a shop → adds instruments (with optional nameplate OCR)
→ either books a slot themselves or requests an inspection for admin hand-down →
inspector conducts the inspection, entering measurements and photographing the display
→ system cross-checks OCR vs. declared reading → compliant results auto-issue a
tamper-evident certificate with QR → citizens (with or without an account) scan
the QR to verify instantly, and can optionally create a citizen account to track
the status of complaints they've filed.

**Government dashboard** (the `admin` role) covers: live compliance summary,
an 8-week verification-trends chart, the assignment queue above, a GIS
compliance map (Leaflet/OSM), inspector account management, configurable
per-instrument tolerance rules, the OCR-conflict review queue, and citizen
complaint triage.

## Local setup

### Backend
```bash
cd backend
cp .env.example .env     # fill in MONGO_URI (MongoDB Atlas free tier) and JWT_SECRET
npm install
npm run dev               # http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

### First admin account
There's no public admin signup (by design — admins create inspector accounts, and
someone needs to be the first admin). Easiest path: register a normal account via the
UI, then in MongoDB Atlas's data browser manually change that user's `role` field from
`"user"` to `"admin"`.

## Free-tier tech stack

| Layer | Choice | Why it's free |
|---|---|---|
| Frontend hosting | Vercel | Free tier for personal/hackathon projects |
| Backend hosting | Render | Free web service tier |
| Database | MongoDB Atlas | Free M0 cluster (512MB) |
| OCR | Tesseract.js | Runs client-side in the browser, no API key |
| Maps | Leaflet + OpenStreetMap | Free, no billing account needed |
| QR codes | `qrcode` npm package | Generated server-side, no external service |
| Auth | JWT + bcrypt | Self-hosted, no third-party auth service |

See `DEPLOYMENT.md` for step-by-step hosting instructions.
