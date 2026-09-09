# Deployment Guide

This walks through: (1) pushing the code to your GitHub repo via Git Bash,
(2) setting up a free MongoDB Atlas database, (3) deploying the backend to
Render, (4) deploying the frontend to Vercel.

---

## 1. Push to GitHub via Git Bash

You already have the empty repo at `https://github.com/Debarun1205/SIH_36`.
After you extract/download this project folder onto your machine:

```bash
cd path/to/SIH_36          # cd into the extracted project folder
git init
git add .
git commit -m "Initial commit: MaanDrishti prototype (backend + frontend)"
git branch -M main
git remote add origin https://github.com/Debarun1205/SIH_36.git
git push -u origin main
```

If Git Bash asks for credentials and your password doesn't work, GitHub now
requires a **Personal Access Token** instead of your account password:
GitHub → Settings → Developer settings → Personal access tokens → Generate new
token (classic) → check the `repo` scope → use that token as your password
when Git Bash prompts you.

If the repo already has a README/commit from GitHub's web UI and push is
rejected, run `git pull origin main --allow-unrelated-histories` first, resolve
any conflict, then push again.

**Team workflow after this:** each teammate clones with
`git clone https://github.com/Debarun1205/SIH_36.git`, creates a branch per
feature (`git checkout -b feature/inspector-dashboard`), and opens a pull
request back into `main` — much safer than everyone pushing straight to `main`
during a hackathon.

---

## 2. MongoDB Atlas (free database)

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free
   account.
2. Create a free **M0** cluster (any nearby region).
3. Database Access → Add New Database User → set a username/password (save
   these — you'll need them in the connection string).
4. Network Access → Add IP Address → **Allow Access from Anywhere**
   (`0.0.0.0/0`) — simplest for a hackathon prototype; tighten later if needed.
5. Clusters → Connect → Drivers → copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add a database name before the `?`, e.g. `.../sih36?retryWrites=true...` —
   this becomes your `MONGO_URI`.

---

## 3. Backend on Render

1. Go to https://render.com and sign in with GitHub.
2. New → Web Service → connect your `SIH_36` repository.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
4. Add environment variables (Render dashboard → Environment):
   ```
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<any long random string>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=<your Vercel URL — add this after step 4 below, then redeploy>
   PORT=5000
   ```
5. Deploy. Render gives you a URL like `https://sih36-backend.onrender.com`.
   Test it: visiting `https://sih36-backend.onrender.com/api/health` should
   return `{"status":"healthy",...}`.

> **Free tier note:** Render's free web services spin down after 15 minutes of
> inactivity and take ~30–50 seconds to wake up on the next request. For a
> live demo, open the backend URL a minute before you present to "warm it up."

---

## 4. Frontend on Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. Add New → Project → import your `SIH_36` repository.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Environment Variables:
   ```
   VITE_API_URL=https://sih36-backend.onrender.com/api
   ```
   (use your actual Render URL from step 3, with `/api` appended)
5. Deploy. Vercel gives you a URL like `https://sih-36.vercel.app`.
6. Go back to Render → Environment → set `CLIENT_URL` to this Vercel URL
   (this controls CORS and the base URL baked into generated QR codes) → the
   service will auto-redeploy.

---

## 5. Verify the deployed app end-to-end

1. Open your Vercel URL → Register a business account.
2. Register a shop, add an instrument.
3. In MongoDB Atlas's data browser, manually set one user's `role` to
   `"admin"` (see README) — use this account to log in and create an
   **inspector** account from the admin dashboard.
4. Log in as the inspector, add an availability slot for today/tomorrow in
   the same city as your test shop.
5. Log in as the business user, book that slot.
6. Log in as the inspector, complete the inspection with a measurement and a
   photo — a compliant result should issue a certificate with a QR code.
7. Open `/verify` (no login needed) and scan or paste the shop/certificate ID
   to confirm public verification works.

---

## Redeploying after code changes

Both Render and Vercel auto-deploy on every push to `main`:

```bash
git add .
git commit -m "describe your change"
git push
```

No manual redeploy step needed once the initial setup above is done.
