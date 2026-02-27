# CampusHub Deployment Guide – Yegara Host (Shared Hosting)

This guide walks you through deploying CampusHub to **Yegara Host shared hosting** with cPanel. Tested and verified working.

---

## Prerequisites

- Yegara Host **shared hosting** with cPanel
- **Neon** database (Prisma ORM) — no local PostgreSQL needed
- Domain or subdomain (e.g. `campushub.seidweb.com`)
- **Git Bash** on your PC (for local build)

---

## Overview

CampusHub (TanStack Start) uses one Node.js server for everything:

- **Entry point:** `.output/server/index.mjs`
- **Build output:** `.output/` folder

---

## Step 1: Log into cPanel

1. Go to your cPanel URL (e.g. `https://seidweb.com:2083`)
2. Log in with your cPanel username and password

---

## Step 2: Create Node.js Application

1. In cPanel, find **Setup Node.js App** (under **Software** or **Applications**)
2. Click **Create Application**
3. Configure:
   - **Node.js version:** 20.x or 22.x (latest LTS)
   - **Application root:** `campushub` (creates `/home/youruser/campushub`)
   - **Application URL:** Your subdomain (e.g. `campushub.seidweb.com`)
   - **Application startup file:** `.output/server/index.mjs`
   - **Application mode:** Production
4. Click **Create**

**Note:** Create the subdomain first in cPanel → **Subdomains** if needed.

---

## Step 3: Deploy Your Code (FTP / File Manager)

### 3a. Build locally (on your PC)

In Git Bash, from your project folder:

```bash
cd /c/Users/user/Desktop/Campushub   # or your project path

npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

This creates the `.output/` folder. Fix any Prisma migration errors before continuing (see Troubleshooting).

### 3b. Prepare the zip

Create a zip with these **5 items** at the project root:

| Include | Exclude |
|---------|---------|
| `package.json` | `node_modules` |
| `package-lock.json` | `.git` |
| `prisma/` (folder) | |
| `.output/` (folder) | |
| `.env.example` (optional template) | |

**Do not** zip `.env` — you'll add it on the server.

### 3c. Upload and extract

1. In cPanel, open **File Manager**
2. Go to `/home/youruser/campushub` (replace `youruser` with your cPanel username)
3. **Clear the folder** — delete any existing files (`.output`, `public`, `tmp`, `stderr.log`, etc.)
4. Click **Upload** and upload your zip
5. Right‑click the zip → **Extract**
6. Ensure `package.json` and `.output/` are directly inside `campushub` (not in a subfolder)
7. Optionally delete the zip file to save space

### 3d. Run NPM Install

1. In **Setup Node.js App**, find your application
2. Click **Run NPM Install** (installs `node_modules`)

**Note:** cPanel Terminal often has `npx: command not found`. You can skip `prisma generate` and `prisma migrate deploy` on the server — the app works if your Neon database is already migrated and the build was done locally.

---

## Step 4: Configure Environment (.env)

1. In **File Manager**, go to your application root (`campushub`)
2. Create a new file named `.env` (or copy `.env.example` and rename)
3. Add production values:

```env
# Database (Neon – copy from Neon dashboard)
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Auth
BETTER_AUTH_SECRET=your-32-char-secret
APP_URL=https://campushub.seidweb.com

# OAuth (if using)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Email (Resend)
RESEND_API_KEY=...
EMAIL_FROM="CampusHub <noreply@seidweb.com>"

# Cloudinary (for announcements)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=production
```

**Generate a secret:** `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

**Quotes:** Use quotes only when the value has spaces (e.g. `EMAIL_FROM`). Simple values like URLs and keys don't need quotes.

---

## Step 5: Start the App

1. In **Setup Node.js App**, verify **Application startup file** is `.output/server/index.mjs`
2. Click **Start Application** (or **Restart**)
3. Open your app URL (e.g. `https://campushub.seidweb.com`)

---

## Step 6: SSL (HTTPS)

1. Go to **SSL/TLS Status** or **Let's Encrypt** in cPanel
2. Issue a certificate for your subdomain (e.g. `campushub.seidweb.com`)
3. Ensure `APP_URL` in `.env` uses `https://`

---

## Step 7: OAuth Callback URLs (if using social login)

Add these in each provider's console — **not** in your app code.

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials**
2. Open your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add: `https://campushub.seidweb.com/api/auth/callback/google`
4. Save

**GitHub:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Open your OAuth App
3. Set **Authorization callback URL** to: `https://campushub.seidweb.com/api/auth/callback/github`
4. Save

Replace `campushub.seidweb.com` with your actual domain.

---

## Updating the App

1. **Build locally:**
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```

2. **Prepare zip** with: `package.json`, `package-lock.json`, `prisma/`, `.output/`

3. **Upload** to `/home/youruser/campushub` via File Manager

4. **Extract** — overwrite existing files (or clear folder first)

5. In **Setup Node.js App**, click **Run NPM Install** then **Restart**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App won't start | Check **Setup Node.js App** → Error logs, or `stderr.log` in File Manager |
| 502 / blank page | Ensure startup file is `.output/server/index.mjs` and build completed |
| `npx: command not found` in Terminal | Normal — cPanel Terminal may not have Node. Skip Prisma on server; build locally |
| Database P3005 (schema not empty) | Baseline: run `npx prisma migrate resolve --applied <migration_name>` for each migration |
| Database P3015 (missing migration file) | Remove any empty migration folders in `prisma/migrations/` |
| Database connection failed | Verify `DATABASE_URL` (Neon) and network access |
| OAuth redirect fails | Add callback URLs in Google/GitHub consoles; confirm `APP_URL` matches |

---

## Quick Reference

| Item | Value |
|------|-------|
| Entry file | `.output/server/index.mjs` |
| Build output | `.output/` |
| Database | Neon (cloud) |
| Zip contents | `package.json`, `package-lock.json`, `prisma/`, `.output/` |

---

## Yegara Host Notes

- Shared hosting with cPanel
- Support: 0960 17 00 00, Telegram
- Use **Setup Node.js App** for Node.js apps
- Database: Neon (cloud) — no cPanel database setup needed
