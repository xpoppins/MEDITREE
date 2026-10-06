# MEDITREE - Deployment Guide

## Overview

MEDITREE is a full-stack MERN application:
- **Frontend**: React + Vite (deploy to Vercel/Netlify)
- **Backend**: Node.js + Express (deploy to Render/Railway)
- **Database**: MongoDB Atlas (free M0 cluster)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / Log in
3. Create a new project → "meditree"
4. Build Database → Choose **M0 FREE** tier
5. Select cloud provider + region closest to your users
6. Click "Create Cluster" (wait 1-3 minutes)

### Create Database User
1. Left sidebar → **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `meditree_admin`
4. Password: (generate a strong one, save it!)
5. Privileges: **Read and write to any database**
6. Click **Add User**

### Whitelist IP
1. Left sidebar → **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (0.0.0.0/0)
3. Confirm

### Get Connection String
1. Left sidebar → **Database** → Click **Connect**
2. Choose **Connect your application**
3. Driver: **Node.js**, Version: **3.6 or later**
4. Copy the string:
   ```
   mongodb+srv://meditree_admin:<password>@cluster0.xxxxx.mongodb.net/familyhealth
   ```

---

## Step 2: Deploy Backend (Render - Free)

1. Go to https://render.com → Sign up / Log in
2. Click **New** → **Web Service**
3. Connect your GitHub repo (or upload code)
4. Configure:
   - **Name**: `meditree-api`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://meditree_admin:<password>@cluster0.xxxxx.mongodb.net/familyhealth` |
| `JWT_SECRET` | (generate a long random string) |
| `CLIENT_URL` | `https://your-frontend.vercel.app` |
| `GOOGLE_CLIENT_ID` | (from Google Cloud Console) |

6. Click **Create Web Service**
7. Wait for deploy (5-10 minutes)
8. Your API URL: `https://meditree-api.onrender.com`

---

## Step 3: Deploy Frontend (Vercel - Free)

1. Go to https://vercel.com → Sign up / Log in
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:
   - **Root Directory**: `.` (root, since Vite config is at root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://meditree-api.onrender.com/api` |

6. Click **Deploy**
7. Your app URL: `https://your-app.vercel.app`

---

## Step 4: Update CORS

After frontend is deployed, go back to Render:
1. Open your `meditree-api` service
2. Go to **Environment**
3. Update `CLIENT_URL` to your Vercel URL (e.g., `https://meditree.vercel.app`)
4. Save changes (auto-redeploys)

---

## Step 5: Google Sign-In Setup (Optional)

1. Go to https://console.cloud.google.com/
2. Create a new project → "meditree"
3. Left sidebar → **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure consent screen:
   - User Type: **External**
   - App name: `MEDITREE`
   - User support email: your email
   - Authorized domains: `your-app.vercel.app`
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Authorized JavaScript origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://your-app.vercel.app`
7. Copy the **Client ID**
8. Add to Render environment: `GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`

---

## Step 6: Verify Deployment

1. Open your Vercel URL
2. Click "Create Family" → Fill details → Register
3. You should see the Home page with your family
4. Add a member, add readings, add medicines
5. Check browser DevTools → Network → API calls go to Render URL

---

## Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| MongoDB Atlas M0 | 512 MB storage |
| Render | 750 hours/month (sleeps after 15 min idle) |
| Vercel | 100 GB bandwidth/month |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoServerError: bad auth` | Wrong password in MONGO_URI. URL-encode special characters |
| `ECONNREFUSED` / timeout | Add `0.0.0.0/0` in Atlas Network Access |
| CORS error in browser | `CLIENT_URL` must exactly match frontend URL (no trailing slash) |
| `jwt malformed` | Token missing or `Bearer ` prefix missing |
| 401 after refresh | Token expired, log in again |
| Render slow at first request | Free tier cold start. Ping `/api/health` or wait 30-60s |
| Vite env not working | Must start with `VITE_` and restart dev server |

---

## Production Checklist

- [ ] MongoDB Atlas M0 cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for Render)
- [ ] Backend deployed to Render with all env vars
- [ ] Frontend deployed to Vercel with VITE_API_URL
- [ ] CORS updated with Vercel URL
- [ ] Google Sign-In configured (optional)
- [ ] HTTPS enabled (automatic on Render + Vercel)
- [ ] PWA manifest working (installable on phone)

---

## Quick Commands

```bash
# Local development (2 terminals)
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm install
npm run dev

# Build for production
npm run build

# Deploy backend to Render
git push origin main  # (if connected to GitHub)

# Deploy frontend to Vercel
git push origin main  # (if connected to GitHub)
```

---

## File Structure

```
family-health-tracker/
├── server/                 # Backend (Express + MongoDB)
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── src/                    # Frontend (React + Vite)
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/
│   └── ...
├── public/
│   ├── logo.svg
│   └── manifest.json
├── index.html
├── package.json
└── vite.config.ts
```