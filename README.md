# MaanVerify — Online Verification System for Weighing & Measuring Instruments

SIH prototype (PS SIH26036 · Ministry of Consumer Affairs, Dept. of Consumer Affairs).
A digital lifecycle platform for legal-metrology verification: businesses register
instruments, inspectors are matched by location/time slot, tamper-evident digital
certificates are issued with QR codes, and citizens can instantly verify a shop's
compliance status.

**Everything here runs on free tiers and free/open-source tooling — no paid API keys
required anywhere in the stack.**

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

**Roles:** `user` (shop/business owner), `citizen` (consumer), `inspector`,
`admin` (government official). JWT-based auth with role-based access control
on every protected route.

**Registration is split into two separate flows:**
- `/register` — open to **business owners** and **citizens**. Anyone can sign
  up as either.
- `/register-official` — for **inspectors** and **government officials**,
  kept deliberately separate from the public flow:
  - **Government/admin** registration is hard-restricted to one email address
    (`debarunbanerjee1205@gmail.com`, set in `authController.js`) — anyone
    else requesting the admin role is rejected outright.
  - **Inspector** registration is open, but requires the inspector's base
    location and at least one initial availability time slot up front, and
    the account starts in a `pending` approval state. A pending inspector can
    log in, but sees an "approval pending" screen instead of the dashboard
    until a government admin approves them from the **Inspector Approvals**
    tab. Only shop registration remains locked to the `user` role alone —
    citizens never see a "register a shop" option anywhere in the UI.

**Three ways a shop gets inspected**, all feeding the same `Inspection` model:
1. **Self-service booking** — shop owner browses open inspector time slots
   and books one directly.
2. **Hand-down / assignment** — shop owner requests an inspection with no
   slot picked; an admin sees the queue, gets a ranked shortlist of
   inspectors (same city → distance → lowest workload), and assigns one.
3. **Inspector self-serve** — an approved inspector browses shops that still
   need verification (nearest-first, from their own registered base
   location) and picks one to inspect using one of their own open slots.

**What citizens can do:** browse nearby shops (sorted by distance if they
share their location) with each shop's compliance status and the items it
sells, without needing an account; scan a QR or paste an ID to verify any
shop/instrument/certificate instantly; optionally create a citizen account to
track the status of complaints they've filed over time.

**What shop owners can do:** register their shop (and only their shop — this
is enforced at both the API route and the frontend route level), add
instruments with optional nameplate OCR, **list the items they sell** (shown
to citizens browsing nearby and on the shop's public QR page), and choose
between booking a slot themselves or requesting hand-down assignment.

**Government official/inspector registration is discoverable** from the
Login page, Register page, and homepage — all link to `/register-official`.

**Inspector registration now also requires a government ID photo** (uploaded
as part of the same form, stored alongside their location and slots) — an
admin reviews this thumbnail directly in the Inspector Approvals tab before
approving or rejecting the account.

**Context-aware chatbot:** every logged-in role gets a floating assistant
(bottom-right corner). It's role-scoped *by construction*, not just by
prompt instruction — the backend (`chatController.js`) builds a small context
string per request using only data the requesting `req.user` is entitled to
(their own shops, their own complaints, their own assignments, or
platform-wide aggregates for admins) and that's the only data ever handed to
the model. A shop owner's assistant session cannot see another shop's data,
citizen complaint details, or inspector/government information, and vice
versa. It uses Groq's free-tier API (`GROQ_API_KEY` in `.env` — get one free
at console.groq.com) rather than a paid LLM API.

**Government dashboard** (the `admin` role) covers: live compliance summary,
an 8-week verification-trends chart, inspector approval queue (with ID photo
review), the hand-down assignment queue, a GIS compliance map (Leaflet/OSM),
inspector account management, configurable per-instrument tolerance rules,
the OCR-conflict review queue, and citizen complaint triage.
an 8-week verification-trends chart, inspector approval queue, the
hand-down assignment queue, a GIS compliance map (Leaflet/OSM), inspector
account management, configurable per-instrument tolerance rules, the
OCR-conflict review queue, and citizen complaint triage.

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
