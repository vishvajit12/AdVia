# 🚐 AdVia — Smart Transit Ad Network

AdVia turns everyday vehicles (auto-rickshaws, taxis, bikes, delivery vans)
into a moving advertising network. Local businesses book ad campaigns on
specific routes and vehicle types; vehicle owners accept ad jobs and earn
extra income paid directly to their UPI account.

This repository contains a **full-stack, hackathon-ready implementation**:

- **Frontend:** React 18 (Vite) — responsive marketing site + two
  role-based dashboards (Driver, Advertiser), with animations, modals,
  charts, and toasts.
- **Backend:** Node.js + Express REST API with JWT authentication.
- **Database:** MySQL — full relational schema with foreign keys and seed data.
- **AI Module:** A free, rule-based **AI Campaign Advisor** (no paid APIs)
  that recommends vehicle type, count, area, and duration based on
  business type and budget.

---

## 📁 Project Structure

```
advia-platform/
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js      # Register / login / me
│   │   ├── driverController.js    # Driver dashboard, jobs, earnings, profile
│   │   ├── advertiserController.js# Advertiser dashboard, analytics, billing
│   │   ├── campaignController.js  # Create/list/activate/cancel campaigns
│   │   ├── notificationController.js
│   │   └── aiController.js        # AI Campaign Advisor endpoint
│   ├── database/
│   │   └── schema.sql              # Full schema + seed data
│   ├── middleware/
│   │   ├── auth.js                 # JWT auth + role guard
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── advertiserRoutes.js
│   │   ├── campaignRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── aiRoutes.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── campaignAdvisor.js      # AI advisor rule engine
│   │   ├── jobMatcher.js           # Matches drivers to new campaigns
│   │   └── analytics.js            # Impression/QR-scan estimation
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/client.js           # Axios instance + interceptors
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   ├── useReveal.js        # Scroll-reveal animations
│   │   │   └── useNotifications.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx, Footer.jsx, Modal.jsx, Spinner.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── DashboardSidebar.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/ (Login, Register)
│   │   │   ├── driver/ (Dashboard, Jobs, Earnings, Notifications, Profile)
│   │   │   └── advertiser/ (Dashboard, Campaigns, Analytics, Billing, Notifications, NewCampaignModal)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                # Design system + animations
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Tech Stack

| Layer       | Technology                                  |
|-------------|----------------------------------------------|
| Frontend    | React 18, Vite, React Router 6, Axios, react-icons |
| Backend     | Node.js, Express 4                           |
| Database    | MySQL 8 (raw SQL via `mysql2/promise`)       |
| Auth        | JWT (jsonwebtoken) + bcrypt password hashing |
| AI Module   | Local rule-based recommendation engine (no external APIs) |

---

## 🗄️ Database Schema Overview

| Table           | Purpose                                                |
|------------------|---------------------------------------------------------|
| `users`          | All accounts (driver / advertiser / admin) + auth      |
| `drivers`        | Vehicle profile (1-to-1 with `users`)                  |
| `advertisers`    | Business profile (1-to-1 with `users`)                 |
| `campaigns`      | Ad bookings created by advertisers                     |
| `jobs`           | Links a campaign to a driver's vehicle (job offers)    |
| `notifications`  | In-app notifications for any user                      |
| `payments`       | Driver payouts for accepted/completed jobs             |
| `invoices`       | Advertiser billing records per campaign                |

All relationships use proper foreign keys with `ON DELETE CASCADE`.
See [`backend/database/schema.sql`](backend/database/schema.sql) for the
full DDL — it also seeds 3 drivers, 2 advertisers, and sample campaigns.

---

## 🤖 AI Campaign Advisor — How It Works

`backend/utils/campaignAdvisor.js` contains a **knowledge base** mapping
business types (Restaurant, Hotel, Medical/Pharmacy, etc.) to recommended
vehicle types, areas, durations, and tips — written from real OOH
advertising heuristics.

When an advertiser calls `POST /api/ai/advisor` with `{ businessType, budget?, preferredArea? }`:

1. It looks up the business profile.
2. If a budget is given, it computes how many vehicles fit that budget
   at the per-vehicle monthly rate.
3. It returns a full recommendation: vehicle type, count, duration, area,
   estimated cost, **reasoning** (so the advertiser understands *why*),
   and 2–3 actionable tips.

This is **100% local, free, and deterministic** — perfect for offline demos
and judged environments with no internet/API-key requirements. The
"New Campaign" wizard's Step 0 calls this endpoint and lets the advertiser
apply the recommendation with one click (pre-filling the rest of the form),
or skip it entirely.

---

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18
- MySQL ≥ 8 running locally
- npm

### 1. Clone & install dependencies

```bash
git clone <your-repo-url> advia-platform
cd advia-platform

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set up the database

Make sure your local MySQL server is running, then:

```bash
mysql -u root -p < backend/database/schema.sql
```

This creates the `advia_db` database, all tables, and seeds sample data.

> **Demo accounts** (all use password `password123`):
> - Driver: `rajesh.driver@advia.in`
> - Advertiser: `sharma@advia.in`

### 3. Configure environment variables

**Backend** — copy and edit:
```bash
cd backend
cp .env.example .env
```
Edit `.env` and set `DB_PASSWORD` to your local MySQL root password
(and `DB_USER`/`DB_NAME` if different). Also set a strong `JWT_SECRET`.

**Frontend** — copy and edit:
```bash
cd frontend
cp .env.example .env
```
The default `VITE_API_URL=http://localhost:5000/api` works out of the box
if you keep the default backend port.

### 4. Run the app

In one terminal:
```bash
cd backend
npm run dev      # starts on http://localhost:5000
```

In another terminal:
```bash
cd frontend
npm run dev      # starts on http://localhost:5173
```

Visit **http://localhost:5173** — you should see the AdVia landing page.

### 5. Try the flows

- **As a driver:** Log in with the demo driver account → see your
  dashboard, accept job offers, view earnings, edit your profile.
- **As an advertiser:** Log in with the demo advertiser account → click
  "New Campaign" → try the **AI Advisor** (enter a budget, e.g. ₹10,000) →
  apply the recommendation → review → launch. This automatically matches
  verified drivers, creates job offers + notifications, and generates an
  invoice.
- Register a brand-new driver or advertiser account from the landing page
  to test the full registration flow.

---

## 🔌 API Reference (Quick Overview)

All protected routes require `Authorization: Bearer <token>` (returned by
`/auth/login` or `/auth/register`).

| Method | Endpoint                          | Access            | Description |
|--------|------------------------------------|-------------------|-------------|
| POST   | `/api/auth/register`              | Public            | Register driver or advertiser |
| POST   | `/api/auth/login`                 | Public            | Log in, get JWT |
| GET    | `/api/auth/me`                    | Private           | Get current user + profile |
| GET    | `/api/drivers/dashboard`          | Driver            | Stats + active campaigns |
| GET    | `/api/drivers/jobs`                | Driver            | List job offers |
| PUT    | `/api/drivers/jobs/:jobId`          | Driver            | Accept/decline a job |
| GET    | `/api/drivers/earnings`             | Driver            | Monthly earnings + history |
| GET/PUT| `/api/drivers/profile`              | Driver            | View/update vehicle profile |
| GET    | `/api/advertisers/dashboard`       | Advertiser        | Overview stats |
| GET    | `/api/advertisers/analytics`       | Advertiser        | Impressions, QR scans, area breakdown |
| GET    | `/api/advertisers/billing`         | Advertiser        | Invoices |
| GET    | `/api/advertisers/profile`         | Advertiser        | Business profile |
| POST   | `/api/campaigns`                    | Advertiser        | Create (and optionally activate) a campaign |
| GET    | `/api/campaigns`                    | Advertiser        | List campaigns with live stats |
| GET    | `/api/campaigns/:id`                | Advertiser        | Campaign detail + matched jobs |
| PUT    | `/api/campaigns/:id/activate`       | Advertiser        | Activate a draft campaign |
| PUT    | `/api/campaigns/:id/cancel`         | Advertiser        | Cancel a campaign |
| GET    | `/api/notifications`                | Any               | List notifications + unread count |
| PUT    | `/api/notifications/:id/read`       | Any               | Mark one as read |
| PUT    | `/api/notifications/read-all`       | Any               | Mark all as read |
| GET    | `/api/ai/business-types`            | Public            | List business types the advisor knows |
| POST   | `/api/ai/advisor`                   | Advertiser        | Get AI campaign recommendation |

---

## 🎨 Design System

`frontend/src/index.css` defines the full design language:

- **Marketing pages** use a dark "transit network" theme (`--c-navy`,
  neon teal/orange accents).
- **Dashboards** use a calm, light operational surface.
- Signature motif: a dashed **"route dot"** — used for the loading
  spinner and the active-sidebar-link indicator, echoing a vehicle's
  path on a map.
- Includes scroll-reveal animations (`useReveal` hook), card hover
  effects, animated progress bars, step-wizard modals, and toast
  notifications — all fully responsive (mobile/tablet/desktop).

---

## 🧪 How Analytics Are Estimated (Important for Demos)

AdVia doesn't yet have GPS/QR hardware deployed across the fleet. To keep
the dashboards meaningful for a demo, `backend/utils/analytics.js` derives:

```
impressions ≈ accepted_vehicles × 1,500 daily views × days_running
qr_scans    ≈ impressions × 2%
```

This is clearly documented in the Advertiser Analytics page itself, so
judges understand it's a believable estimation model — swapping in real
telemetry later only requires replacing this one module.

---

## 🛣️ Future Scope

- Real GPS tracking + QR-scan hardware integration (replacing the
  estimation model above with live telemetry).
- Driver mobile app (push notifications for job offers).
- Razorpay integration for advertiser payments + automated UPI payouts.
- Admin dashboard for managing driver verification and disputes.
- ML-based route optimization (upgrade from the rule-based advisor to a
  learned model once real campaign-performance data accumulates).

---

## 👥 Team

Built by **Vishvajit Shinde** & **Sanket Tambekar**.
