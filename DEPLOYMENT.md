# 🚀 AdVia — Deployment Guide

This guide covers deploying AdVia's backend (Express API), frontend
(React/Vite), and MySQL database to free/low-cost hosting suitable for a
hackathon demo.

---

## Option 1 — Render (Recommended, easiest)

Render can host the backend (Web Service), frontend (Static Site), and a
managed MySQL database (or use a free external MySQL like PlanetScale/
Railway's MySQL — see Option 2 for Railway's built-in MySQL).

### A. Database

Render's free tier doesn't include MySQL directly, so use **Railway** or
**Aiven** for a free MySQL instance, or use Render's PostgreSQL with
minor schema adjustments. The simplest path:

1. Create a free MySQL database on [Railway](https://railway.app) (see
   Option 2 below for exact steps) — you can use Railway *only* for the
   database while hosting the app on Render.
2. Run the schema against it:
   ```bash
   mysql -h <railway-host> -u <user> -p<password> -P <port> <database> < backend/database/schema.sql
   ```

### B. Backend (Web Service)

1. Push this repo to GitHub.
2. On Render: **New → Web Service** → connect your repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
4. Add environment variables (from `backend/.env.example`):
   ```
   PORT=5000
   NODE_ENV=production
   DB_HOST=<your-mysql-host>
   DB_PORT=<your-mysql-port>
   DB_USER=<your-mysql-user>
   DB_PASSWORD=<your-mysql-password>
   DB_NAME=advia_db
   JWT_SECRET=<generate-a-strong-random-string>
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=https://<your-frontend>.onrender.com
   ```
5. Deploy. Note the resulting URL, e.g. `https://advia-api.onrender.com`.

### C. Frontend (Static Site)

1. On Render: **New → Static Site** → same repo.
2. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://advia-api.onrender.com/api
   ```
4. Deploy. Render will give you a URL like `https://advia.onrender.com`.
5. Go back to the backend's `CLIENT_ORIGIN` env var and set it to this
   frontend URL (for CORS), then redeploy the backend.

> ⚠️ Render free-tier web services sleep after inactivity — the first
> request after idling may take ~30s to wake up. Fine for demos.

---

## Option 2 — Railway (backend + MySQL together)

Railway can host the Express backend **and** provide a MySQL database in
the same project, which is convenient.

### A. Create the project

1. Go to [railway.app](https://railway.app) → **New Project**.
2. **Add a MySQL database**: "New" → "Database" → "Add MySQL". Railway
   provisions it and shows connection credentials (host, port, user,
   password, database name) under the "Connect" tab.

### B. Load the schema

From your machine, using the credentials Railway gave you:

```bash
mysql -h <RAILWAY_HOST> -P <RAILWAY_PORT> -u <RAILWAY_USER> -p<RAILWAY_PASSWORD> <RAILWAY_DB> < backend/database/schema.sql
```

> Note: `schema.sql` starts with `CREATE DATABASE advia_db; USE advia_db;`.
> If Railway already assigned you a specific database name, either:
> - Edit the top of `schema.sql` to use Railway's database name instead
>   of `advia_db`, **or**
> - Run it against `advia_db` and then point your backend's `DB_NAME` to
>   `advia_db` (Railway MySQL instances can host multiple databases).

### C. Deploy the backend

1. In the same Railway project: "New" → "GitHub Repo" → select your repo.
2. Set **Root Directory** to `backend`.
3. Railway auto-detects Node — it will run `npm install` and `npm start`.
4. Add environment variables (Settings → Variables). For DB values, use
   Railway's **reference variables** so they auto-link to your MySQL
   service:
   ```
   PORT=5000
   NODE_ENV=production
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=advia_db
   JWT_SECRET=<generate-a-strong-random-string>
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=https://<your-frontend-domain>
   ```
5. Railway will assign a public domain (Settings → Networking → Generate
   Domain), e.g. `https://advia-backend.up.railway.app`.

### D. Deploy the frontend

You can deploy the frontend as a **second Railway service** (Static
build) or use **Render/Netlify/Vercel** for it — all work the same way:

- **Build Command:** `npm install && npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL=https://advia-backend.up.railway.app/api`

If using Railway for the frontend too, add a small static server (e.g.
`serve`) or use Railway's static deploy option, with **Root Directory**
set to `frontend`.

Finally, update the backend's `CLIENT_ORIGIN` to match your deployed
frontend URL and redeploy.

---

## Option 3 — VPS (Ubuntu, full control)

For a VPS (DigitalOcean, AWS EC2, etc.) running Ubuntu 22.04+:

### 1. Install prerequisites

```bash
sudo apt update
sudo apt install -y nodejs npm mysql-server nginx git

# Recommended: use nvm for a modern Node version
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
```

### 2. Set up MySQL

```bash
sudo mysql_secure_installation
sudo mysql -u root -p < /path/to/advia-platform/backend/database/schema.sql
```

### 3. Deploy the backend

```bash
cd /var/www
git clone <your-repo-url> advia-platform
cd advia-platform/backend
npm install --production
cp .env.example .env
nano .env   # fill in DB credentials, JWT_SECRET, CLIENT_ORIGIN=https://yourdomain.com
```

Run with **PM2** so it stays alive and restarts on crash/reboot:

```bash
npm install -g pm2
pm2 start server.js --name advia-api
pm2 save
pm2 startup   # follow the printed instructions to enable on boot
```

The API now runs on `http://localhost:5000`.

### 4. Build & serve the frontend

```bash
cd /var/www/advia-platform/frontend
npm install
cp .env.example .env
nano .env   # set VITE_API_URL=https://yourdomain.com/api
npm run build
```

This produces `frontend/dist/` — a static site.

### 5. Configure Nginx (reverse proxy + static files)

Create `/etc/nginx/sites-available/advia`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend (static build)
    root /var/www/advia-platform/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # Backend API — proxy to Express on port 5000
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Enable it and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/advia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. (Optional) HTTPS with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 7. Updating the deployment

```bash
cd /var/www/advia-platform
git pull
cd backend && npm install && pm2 restart advia-api
cd ../frontend && npm install && npm run build
```

---

## Environment Variable Checklist

| Variable          | Where        | Example                                  |
|--------------------|--------------|-------------------------------------------|
| `DB_HOST`          | backend/.env | `localhost` / Railway host               |
| `DB_PORT`          | backend/.env | `3306`                                    |
| `DB_USER`          | backend/.env | `root`                                    |
| `DB_PASSWORD`      | backend/.env | (your MySQL password)                    |
| `DB_NAME`          | backend/.env | `advia_db`                                |
| `JWT_SECRET`       | backend/.env | (long random string — keep secret!)      |
| `CLIENT_ORIGIN`    | backend/.env | `https://your-frontend-domain`           |
| `VITE_API_URL`     | frontend/.env| `https://your-backend-domain/api`        |

---

## Post-Deployment Smoke Test

After deploying, verify with:

```bash
curl https://your-backend-domain/api/health
# Expect: {"status":"ok","service":"AdVia API","time":"..."}
```

Then open the frontend URL in a browser and:
1. Log in with the seeded demo accounts (`rajesh.driver@advia.in` /
   `sharma@advia.in`, password `password123`).
2. Confirm dashboards load real data (not just spinners/errors).
3. Try the AI Advisor in "New Campaign" to confirm the backend ↔
   frontend connection and CORS are configured correctly.
