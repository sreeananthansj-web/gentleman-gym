# Gentleman Gym — Backend & Admin Setup

Everything below is done by you in your own Supabase and hosting accounts. Nothing in this repository
contains a password or a secret key.

## 1. Create the Supabase project
1. Sign in at <https://supabase.com> → **New project** (pick a region near India, e.g. Mumbai/Singapore, and save the database password somewhere safe).
2. When it is ready: **Project Settings → API**. Copy the **Project URL** and the **anon / publishable key**.

## 2. Create the database
Open **SQL Editor** and run these files from `supabase/migrations/` **in order** (paste, then Run):

1. `20261118000001_core_schema.sql`
2. `20261118000002_rls_policies.sql`
3. `20261118000003_storage.sql`
4. `20261118000004_enquiry_rpc_and_stats.sql`
5. `20261118000005_seed_existing_content.sql` (copies the trainer, gallery images and FAQs already on your site into the database; membership plans are NOT seeded because the site shows no prices)

CLI alternative: `supabase link --project-ref <ref>` then `supabase db push`.

## 3. Configure Authentication
**Authentication → Sign In / Providers**
- Turn **OFF** "Allow new users to sign up" (there must be no public registration).
- Keep Email provider enabled; keep "Confirm email" as you like (the admin is created pre-confirmed).

**Authentication → URL Configuration**: set **Site URL** to your live domain (e.g. `https://www.yourgym.com`).

## 4. Create the first administrator
1. **Authentication → Users → Add user → Create new user**
   - Email: `admin@gentlemangym.com` (or your real email)
   - Password: choose your own strong password (12+ characters)
   - Tick **Auto Confirm User**
2. **SQL Editor** → run `supabase/scripts/create_first_admin.sql` (edit the email inside if you used another). It gives that user the `super_admin` role. Only this SQL step can create admins — no one can promote themselves from the website.

Change the password later at **/admin/settings**, or in Authentication → Users. To add another admin, repeat step 4 (use role `admin` in the insert).

## 5. Storage
Migration 3 already creates two buckets, `trainer-images` and `gallery-images`: public read (so the website can show the pictures), 5 MB limit, JPEG/PNG/WebP only, and upload/replace/delete limited to admins. Check **Storage** to confirm both exist.

## 6. Run locally
```bash
cp .env.example .env        # fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install                 # required once: adds @supabase/supabase-js and refreshes package-lock.json
npm run dev
```
Public site: `http://localhost:5173` · Admin: `http://localhost:5173/admin/login`.
Without the two env variables the public site still works exactly as before (built-in content, WhatsApp-only enquiry form) and `/admin` shows a setup notice.

## 7. Verify security (do this before launch)
Run `supabase/scripts/verify_rls.sql` in the SQL Editor. Every line should say PASS (it rolls back and leaves no data). Then in a private browser window: visiting `/admin/enquiries` must redirect to the login page.

## 8. Deploy
**Vercel** (config included): import the repo → framework Vite → add env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` → Deploy. `vercel.json` already handles page refreshes on deep links and sets basic security headers. **Netlify**: `public/_redirects` is included; build command `npm run build`, publish directory `dist`.
**Domain**: add it under the host's Domains settings, point your DNS as instructed, then update the Supabase **Site URL** (step 3).

## 9. Production checklist
- [ ] Public sign-ups disabled in Supabase Auth
- [ ] Only the anon key is in the hosting env vars; service_role key is nowhere in the project
- [ ] `verify_rls.sql` shows all PASS
- [ ] Strong, unique admin password; consider enabling MFA/leaked-password protection in Auth settings
- [ ] Supabase **Pro** plan or a scheduled export if you need automatic backups
- [ ] Test the contact form on the live site, then confirm the row appears in /admin/enquiries
- [ ] Review the updated Privacy Policy text (`src/LegalPage.jsx`) — it now says enquiries are stored in a database; adjust to your own practice
- [ ] Optional hardening: add Cloudflare Turnstile/hCaptcha to the form if spam appears; add a Content-Security-Policy header once the live domain is known

## How spam protection works
The browser cannot write to the `enquiries` table at all. It calls the `submit_enquiry()` database function, which validates every field, drops submissions where a hidden "website" field is filled, and limits each phone number to 3 enquiries/hour, each visitor IP (stored only as a hash) to 5/hour, and the whole site to 300/hour. The form also has a 30-second client cooldown.
