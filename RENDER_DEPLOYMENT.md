# Gentleman Gym — Hosting & Deployment Guide (React + Vite + Supabase)

This repository (`gentleman-gym-main/`) is a **React + Vite** single-page application connected to **Supabase** (PostgreSQL, Auth, RLS, RPCs, and Storage buckets).

> **Important:** There is no Django or custom API server in this project. Host the frontend as a **Render Static Site** (or Vercel / Netlify) and keep Supabase as your managed backend.

---

## 1. Repository & Directory Overview

```text
gentleman-gym-main/
├── public/                 # Static assets, fonts, images, robots.txt, sitemap.xml, _redirects
├── src/                    # Public site + lazy-loaded /admin panel + src/services/supabase.js
├── supabase/               # SQL migrations & admin scripts (untracked in Git; run in Supabase SQL Editor)
├── .env.example            # Public client env var template (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── .gitignore              # Excludes .env, .env.*, dist/, node_modules/
├── package.json            # Vite 8 build scripts + Node >=20.19.0 / >=22.12.0 engine pin
├── render.yaml             # Render Static Site Blueprint (build, SPA rewrite, security headers)
├── vercel.json             # Vercel SPA rewrite + security headers
├── vite.config.js          # Vite + Tailwind + dist/404.html fallback copy
├── SETUP.md                # Supabase database, auth, storage & first-admin setup
└── RENDER_DEPLOYMENT.md    # This guide
```

---

## 2. Step 1: Prepare Supabase (Backend)

Complete the steps in **`SETUP.md`** before or alongside deploying the frontend:

1. Create a Supabase project (Mumbai/Singapore region recommended).
2. In **Supabase SQL Editor**, run the 5 migration files in `supabase/migrations/` in numeric order (`000001` through `000005`).
   - Note: `supabase/` is currently untracked in Git (removed in commit `d69dd54`), so keep a safe backup of those SQL scripts if you clone onto another machine.
3. In **Authentication → Sign In / Providers**, turn **OFF** *"Allow new users to sign up"*.
4. Create the first admin user in **Authentication → Users** (with **Auto Confirm User** checked), then run `supabase/scripts/create_first_admin.sql`.
5. Run `supabase/scripts/verify_rls.sql` in the SQL Editor and confirm all checks report `PASS`.
6. Copy your **Project URL** and **anon / publishable key** from **Project Settings → API** (never use `service_role` in `VITE_*` variables).

---

## 3. Step 2: Run & Test Locally

```bash
cd gentleman-gym-main
cp .env.example .env          # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm ci                        # or npm install
npm run dev                   # local dev server at http://localhost:5173
```

Test a production build locally before deploying:

```bash
npm run lint
npm run build                 # outputs static files to dist/
npm run preview               # previews dist/ locally
```

---

## 4. Step 3: Prepare GitHub Repository

Before pushing to GitHub, verify no secrets or build artifacts are tracked:

```bash
git status
```

- Confirm `.env` and `dist/` are **not** listed as tracked files.
- Stage, commit, and push the deployment files to `main`:

```bash
git add .gitignore package.json render.yaml RENDER_DEPLOYMENT.md
git commit -m "Configure Render static site deployment"
git push origin main
```

---

## 5. Step 4: Deploy to Render (Manual Static Site Setup)

In the **Render Dashboard**, choose **New + → Static Site** and connect `sreeananthansj-web/gentleman-gym`.

### Exact Render Dashboard Settings

| Field | Value |
| --- | --- |
| **Service Type** | Static Site |
| **Name** | `gentleman-gym` |
| **Branch** | `main` |
| **Root Directory** | *(leave blank — `gentleman-gym-main` is the repository root)* |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

### Environment Variables (Render Dashboard → Environment)

| Key | Value |
| --- | --- |
| `NODE_VERSION` | `24` *(or any Node `>=20.19.0` / `>=22.12.0` required by Vite 8)* |
| `VITE_SUPABASE_URL` | Your Supabase Project URL (`https://<project-ref>.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase **anon / publishable** key |

> Because Vite injects `VITE_*` variables at **build time**, whenever you add or change an environment variable in Render you must trigger a **Manual Deploy → Clear build cache & deploy**.

### Redirects / Rewrites (Required for Deep Links & `/admin`)

Render Static Sites do **not** read `public/_redirects`. In **Render Dashboard → Redirects/Rewrites**, add:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | **Rewrite** |

This ensures refreshing routes like `/about`, `/facilities`, `/membership`, or `/admin/login` returns HTTP `200` with `index.html` instead of a 404.

### Response Headers (Render Dashboard → Headers)

To match `vercel.json`, add these headers under **Headers** for path `/*`:

- `X-Content-Type-Options`: `nosniff`
- `X-Frame-Options`: `DENY`
- `Referrer-Policy`: `strict-origin-when-cross-origin`
- `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`

*(If you deploy via **New + → Blueprint** using `render.yaml`, the environment keys, SPA rewrite rule, and headers are configured automatically.)*

---

## 6. Step 5: Post-Deploy Configuration & Verification

1. **Update Supabase Site URL & Redirect URLs:**
   In Supabase **Authentication → URL Configuration**:
   - **Site URL:** `https://gentleman-gym.onrender.com` *(or your custom domain)*
   - **Redirect URLs:** `https://gentleman-gym.onrender.com/**` *(plus `http://localhost:5173/**` if testing locally)*
2. **Verify Public Routes & Database Connectivity:**
   - Visit `/` and hard-refresh `/about`, `/facilities`, `/contact`, and `/faq`.
   - Submit a test enquiry on `/contact` (or check trainers/gallery/FAQs load from Supabase rather than fallback data).
3. **Verify Authentication & Admin Media Uploads:**
   - Visit `/admin/enquiries` in a private window — it should redirect to `/admin/login` (not show `SetupNeeded` / `"Backend not connected"`).
   - Sign in at `/admin/login`, confirm the test enquiry appears in `/admin/enquiries`, and test uploading/viewing a trainer or gallery image (`trainer-images` / `gallery-images` buckets).
4. **Custom Domain SEO Updates (before final launch):**
   - Replace `https://YOUR-DOMAIN.example` in `public/sitemap.xml` with your live domain.
   - Add the `Sitemap:` line to `public/robots.txt`.
   - Update `og:image` and `twitter:image` in `index.html` to absolute `https://<your-domain>/images/og-image.jpg` URLs.

---

## 7. Alternative Hosts & Redeploying

- **Redeploying after GitHub changes:** Pushing new commits to `main` triggers an automatic Render Static Site rebuild (`npm ci && npm run build`). Use **Manual Deploy → Clear build cache & deploy** if you update `VITE_*` environment variables.
- **Vercel:** `vercel.json` is already configured with SPA rewrites and security headers. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Project Settings and deploy.
- **Netlify:** `public/_redirects` (`/* /index.html 200`) is included. Set build command `npm run build` and publish directory `dist`, then add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 8. Troubleshooting

| Symptom | Likely Cause & Fix |
| --- | --- |
| Build fails with `SyntaxError` or Node version error | Vite 8 requires Node `>=20.19.0` or `>=22.12.0`. Ensure `NODE_VERSION=24` is set in Render env vars. |
| `/admin` shows **"Backend not connected"** | `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` was missing during build, or a `service_role` key was accidentally used. Set the public `anon` key and redeploy with cache cleared. |
| Refreshing `/about` or `/admin/login` returns 404 | The `/* -> /index.html` **Rewrite** rule is missing in Render **Redirects/Rewrites**. |
| Images fail to upload or display in admin | Confirm `supabase/migrations/20261118000003_storage.sql` ran and `trainer-images` / `gallery-images` buckets exist in Supabase Storage. |
