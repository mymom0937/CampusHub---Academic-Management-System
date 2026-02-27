# CampusHub Deployment Guide – Yegara Host (Shared Hosting)

This guide walks you through deploying CampusHub to **Yegara Host shared hosting** with cPanel. You use **Setup Node.js App** (or similar) in cPanel — the same way you deployed your Express + React + MySQL app.

---

## Prerequisites

- Yegara Host **shared hosting** with cPanel
- **Neon** database (Prisma ORM) — no local PostgreSQL needed
- Domain or subdomain (e.g. `campushub.seidweb.com` or `seidweb.com`)
- GitHub repository with your CampusHub code
- **Git Bash** on your PC (for local build, if you build locally)

---

## Overview

CampusHub (TanStack Start) is similar to your Express + React app: one Node.js server serves everything. The main difference:

- **Entry point:** `node .output/server/index.mjs` (instead of `node server.js`)
- **Build output:** `.output/` folder (instead of `dist/` or `build/`)

---

## Step 1: Log into cPanel

1. Go to your cPanel URL (e.g. `https://seidweb.com:2083` or the URL Yegara gave you)
2. Log in with your cPanel username and password

---

## Step 2: Create Node.js Application

1. In cPanel, find **Setup Node.js App** (under **Software** or **Applications**)
2. Click **Create Application**
3. Configure:
   - **Node.js version:** 20.x (or latest LTS)
   - **Application root:** e.g. `campushub` (creates `/home/youruser/campushub`)
   - **Application URL:** Choose subdomain (e.g. `campushub.seidweb.com`) or domain
   - **Application startup file:** `.output/server/index.mjs` (we'll set this after the first build)
   - **Application mode:** Production

4. Click **Create**

---

## Step 3: Deploy Your Code

**Option A – Git**

1. In cPanel, open **Git™ Version Control**
2. Click **Create**
3. **Repository URL:** `https://github.com/mymom0937/CampusHub---Academic-Management-System.git`
4. **Repository Path:** `/home/seidweyg/campushub` (same as your Node.js app root)
5. Clone the repository
6. Then run build on the server (see Step 4)

**Option B – FTP / File Manager** (recommended if you used this before)

### 3a. Build locally (on your PC)

In Git Bash, from your project folder:

```bash
cd /c/Users/user/Desktop/Campushub   # or your project path

npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

This creates the `.output/` folder.

### 3b. Prepare the zip

Create a zip with these files/folders:

| Include | Exclude |
|---------|---------|
| `package.json` | `node_modules` |
| `package-lock.json` | `.git` |
| `prisma/` | `src/` (optional — not needed at runtime) |
| `.output/` | `*.log` |
| `.env.example` (as template) | |

**Important:** Do **not** zip `.env` with real secrets. You'll add `.env` on the server in Step 5.

### 3c. Upload and extract

1. In cPanel, open **File Manager**
2. Go to `/home/seidweyg/campushub` (your app root)
3. If the folder has default files, delete them or upload into an empty folder
4. Click **Upload**
5. Upload your zip file
6. Right‑click the zip → **Extract**
7. Move extracted files to the root of `campushub` (so `package.json` and `.output/` are directly inside `campushub`)

### 3d. Run NPM Install on the server

1. In **Setup Node.js App**, find your `campushub.seidweb.com` app
2. Click **Run NPM Install** (installs `node_modules`)
3. Open **Terminal** in cPanel and run:

```bash
cd ~/campushub
npx prisma generate
npx prisma migrate deploy
```

(If Terminal is not available, skip `prisma migrate deploy` if your Neon schema is already up to date.)

---

## Step 4: Build on the Server (Git only)

If you used **Option A (Git)**, build on the server:

1. Open **Terminal** in cPanel
2. Run:

```bash
cd ~/campushub
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

Or use **Run NPM Install** and **Run NPM Script** (build) in Setup Node.js App if available.

---

## Step 5: Configure Environment

1. In **File Manager**, go to your application root (`campushub`)
2. Create or edit `.env` (copy from `.env.example` if it exists)
3. Set production values:

```env
# Database (Neon – from Neon dashboard)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Auth
BETTER_AUTH_SECRET="your-32-char-secret"
APP_URL="https://campushub.seidweb.com"

# OAuth (if using)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Email (Resend)
RESEND_API_KEY="..."
EMAIL_FROM="CampusHub <noreply@seidweb.com>"

# Cloudinary (for announcements)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

NODE_ENV="production"
```

Generate a secret locally: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

---

## Step 6: Set Startup File and Start App

1. In **Setup Node.js App**, find your application
2. Set **Application startup file** to: `.output/server/index.mjs`
3. Click **Run NPM Install** (if you haven't already)
4. Click **Start Application** (or **Restart**)

---

## Step 7: SSL (HTTPS)

Your cPanel shows SSL as **Active** for the primary domain. For a subdomain:

1. Go to **SSL/TLS Status** or **Let's Encrypt** in cPanel
2. Issue a certificate for `campushub.seidweb.com` (or your app URL)
3. Update `APP_URL` in `.env` to use `https://`

---

## Step 8: OAuth Callback URLs

For Google and GitHub OAuth, add in each provider's console:

- `https://campushub.seidweb.com/api/auth/callback/google`
- `https://campushub.seidweb.com/api/auth/callback/github`

(Replace with your actual app URL.)

---

## Updating the App

**If using Git:**

```bash
cd ~/campushub
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
```

Then in **Setup Node.js App**, click **Restart**.

**If using FTP:** Upload changed files, run build on server if needed, then restart.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App won't start | Check **Setup Node.js App** → Error logs |
| 502 / blank page | Ensure startup file is `.output/server/index.mjs` and build completed |
| Database connection failed | Verify `DATABASE_URL` (Neon) and that Neon allows connections from your host |
| OAuth redirect fails | Confirm callback URLs and `APP_URL` match your domain |
| Build fails on server | Check Node version (20+), run `npm install` first |

---

## Differences from Your Express + React App

| | Express + React + MySQL | CampusHub (TanStack Start) |
|---|---|---|
| Entry file | `server.js` or `app.js` | `.output/server/index.mjs` |
| Build output | `dist/` or `build/` | `.output/` |
| Database | MySQL (cPanel) | Neon (cloud PostgreSQL) |
| Rest | Same: Node.js app in cPanel | Same |

---

## Yegara Host Notes

- Shared hosting with cPanel
- Support: 0960 17 00 00, Telegram
- Use **Setup Node.js App** for Node.js apps
- Database: Neon (cloud) — no cPanel database setup needed
