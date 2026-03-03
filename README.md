# Trade Blueprint — Calculator Suite

Custom-built estimating calculators for trade contractors.  
Built by Southern View Development.

## What's Inside

| Route | Calculator |
|-------|-----------|
| `/` | Main storefront / landing page |
| `/roofing` | Roofing estimate calculator |
| `/hvac` | HVAC load & sizing calculator |
| `/electrical` | Panel load & job bid estimator |
| `/plumbing` | Fixture units & job bid estimator |
| `/concrete` | Yardage, rebar & pour cost calculator |
| `/painting` | Room-by-room paint & labor estimator |
| `/fencing` | Linear footage, posts & gate calculator |
| `/landscaping` | Material volumes, pavers & sod estimator |
| `/solar` | System sizing, ROI & financing calculator |

---

## Deploy to Vercel (Step by Step)

### Step 1: Push to GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** button (top right) → **New repository**
3. Name it `trade-blueprint` (or whatever you want)
4. Keep it **Public** or **Private** (either works)
5. Click **Create repository**
6. GitHub will show you instructions — you need to upload this folder:

**Option A — Using GitHub.com (easiest):**
- On your new repo page, click **"uploading an existing file"**
- Drag and drop ALL the files/folders from this project
- Click **Commit changes**

**Option B — Using command line (if you have git installed):**
```bash
cd trade-blueprint
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trade-blueprint.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Sign Up**
2. Sign up with your **GitHub account** (this connects them)
3. Click **Add New → Project**
4. You'll see your GitHub repos — click **Import** next to `trade-blueprint`
5. Vercel auto-detects it's a Vite project — leave all settings as default
6. Click **Deploy**
7. Wait ~60 seconds — it builds and gives you a live URL like:
   `https://trade-blueprint.vercel.app`

**That's it. Your site is live.**

### Step 3 (Later): Custom Domain

When you're ready to buy a domain:
1. Buy from [Namecheap](https://namecheap.com) or [Cloudflare](https://cloudflare.com) (~$12/year)
2. In Vercel dashboard → your project → **Settings → Domains**
3. Add your domain (e.g. `tradeblueprint.com`)
4. Vercel shows you DNS records to add at your domain registrar
5. Add them, wait 5-10 minutes, done

---

## Local Development (Optional)

If you want to run it on your computer first:

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Tech Stack

- **React 18** — UI framework
- **React Router** — Page navigation
- **Vite** — Build tool
- **Vercel** — Hosting (free tier)
