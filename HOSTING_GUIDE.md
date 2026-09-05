# Production Hosting & Deployment Guide

This guide provides complete, step-by-step instructions to deploy both the **Backend** and **Frontend** of the **Shadow Monarch Fashion & Auction Platform**, along with its **MySQL Database**.

---

## Architecture Overview

- **Frontend**: React 19 + Vite SPA (Hosted on **Vercel**, **Netlify**, or **Render Static**)
- **Backend**: Node.js + Express + Socket.IO (Hosted on **Render**, **Railway**, or **VPS**)
- **Database**: MySQL / MariaDB (Hosted on **Railway**, **Aiven**, **TiDB Cloud**, **Clever Cloud**, or **phpMyAdmin / cPanel**)

---

## Step 1: Host the MySQL Database

Before starting the backend, you need a running MySQL database. You can choose any of the free options below:

### Option A: Railway (Fastest & Free)
1. Go to [Railway.app](https://railway.app/) and sign up with GitHub.
2. Click **New Project** → **Provision MySQL**.
3. Once created, click on the MySQL service and go to the **Connect** tab.
4. Copy the **MySQL Connection URL** (e.g., `mysql://root:password@autorack.proxy.rlwy.net:12345/railway`).

### Option B: Aiven or TiDB Cloud (Free Forever)
1. Sign up at [Aiven.io](https://aiven.io/) or [TiDB Cloud](https://tidbcloud.com/).
2. Create a free MySQL service and copy the host, user, password, port, and database name.

### Option C: Traditional cPanel / phpMyAdmin (Shared Hosting / Hostinger)
1. Open your cPanel / hosting dashboard → **MySQL Databases**.
2. Create database `fashion` and a user with full privileges.
3. Open **phpMyAdmin**, click the database, click the **Import** tab, upload `backend/fashion_schema.sql`, and click **Go**.

### Initialize Database Schema & Seed Data (Automated)
If using Railway or a cloud MySQL URL, you can automatically seed all 19 tables, 6 luxury products, categories, and accounts with one command from your local terminal:

```bash
cd backend
# Set your cloud database URL temporarily in .env or run:
MYSQL_URL="your-cloud-mysql-connection-url" npm run db:init
```

---

## Step 2: Host the Backend (Node.js API + WebSockets)

### Recommended: Render.com (Free Web Service)

1. Sign up at [Render.com](https://render.com/) and connect your GitHub account.
2. Click **New +** → **Web Service**.
3. Select your repository: `skabdu007/Fashion`.
4. Configure the settings:
   - **Name**: `fashion-backend`
   - **Region**: Closest to your users (e.g., Frankfurt, Oregon, or Singapore)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add **Environment Variables**:

| Variable Name | Example / Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port assigned by Render |
| `MYSQL_URL` | `mysql://user:pass@host:port/dbname` | Full MySQL connection URI |
| *(Or discrete DB vars)* | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` | If not using a single URL |
| `DB_SSL` | `false` *(or `true` if cloud host requires SSL)* | SSL flag for database |
| `JWT_SECRET_ADMIN` | *(Generate random 32+ char string)* | Admin token secret |
| `JWT_SECRET_CUSTOMER` | *(Generate random 32+ char string)* | Customer token secret |
| `JWT_SECRET_VENDOR` | *(Generate random 32+ char string)* | Vendor token secret |
| `REFRESH_SECRET` | *(Generate random 32+ char string)* | Refresh token secret |
| `CLIENT_URL` | `http://localhost:5173,https://your-frontend.vercel.app` | Comma-separated allowed frontend URLs |

6. Click **Create Web Service**.
7. Once deployed, Render will provide your public backend URL, for example:
   `https://fashion-backend.onrender.com`
8. Verify it works by visiting:
   `https://fashion-backend.onrender.com/health` → Should return `{"status":"ok"}`.

---

## Step 3: Host the Frontend (React / Vite)

### Recommended: Vercel (Fastest & 1-Click)

1. Go to [Vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New Project** → Import `skabdu007/Fashion`.
3. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `frontend`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://fashion-backend.onrender.com/api` | Your live backend URL ending in `/api` |
| `VITE_API_TIMEOUT` | `30000` | 30s timeout for free server cold starts |

5. Click **Deploy**.
6. Vercel will provide your production frontend domain, e.g.:
   `https://fashion-frontend.vercel.app`

*(Note: [frontend/vercel.json](file:///d:/v.7/frontend/vercel.json) is already pre-configured to ensure client-side routing like `/admin/dashboard` or `/customer/login` never 404s on page refresh).*

---

## Step 4: Link Frontend and Backend (Final Step)

1. Copy your new frontend URL from Vercel (e.g. `https://fashion-frontend.vercel.app`).
2. Go back to your backend hosting dashboard on **Render**.
3. Under **Environment Variables**, update `CLIENT_URL` to include your live frontend domain:
   ```env
   CLIENT_URL=https://fashion-frontend.vercel.app,http://localhost:5173
   ```
4. Click **Save Changes**. Render will automatically redeploy with CORS permissions enabled for your live frontend.

---

## Alternative: 1-Click All-in-One Blueprint on Render

The repository includes a root [render.yaml](file:///d:/v.7/render.yaml) file.

1. On [Render.com](https://render.com/), click **New +** → **Blueprint**.
2. Connect `skabdu007/Fashion`.
3. Render will automatically detect both the `fashion-backend` web service and `fashion-frontend` static site from `render.yaml`.
4. Fill in your `MYSQL_URL` and click **Apply**.

---

## Default Seed Credentials for Live Testing

Once deployed, you can test logging into the live site using the pre-seeded accounts:

- **Super Admin**:
  - Email / Username: `admin@fashion.com` or `superadmin`
  - Password: `password123` or `123456`
  - URL: `/admin/login`

- **Customer**:
  - Email: `alex.morgan@gmail.com`
  - Password: `password123` or `123456`
  - URL: `/customer/login`

- **Vendor**:
  - Email: `jean@shadowatelier.com`
  - Password: `password123` or `123456`
  - URL: `/vendor/login`
