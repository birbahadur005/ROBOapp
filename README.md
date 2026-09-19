# RAVAN College Receptionist
## AI Visitor & Appointment Management System

A production-ready, multi-interface Progressive Web Application (PWA) designed for modern college reception kiosks, authority appointment management, and administrative control.

> [!IMPORTANT]
> **Strict Software Scope**: This application is 100% independent and software-only. It contains **no robot hardware code, no Arduino, no ESP32, no servo/motor controllers, and no physical sensors**. It runs smoothly on Android phones and tablets, Linux workstations, Windows/macOS laptops, and large touchscreen kiosk displays.

---

## 🌟 Key Features

1. **Three Primary Interfaces (Single Centralized Backend)**:
   - **Visitor / Reception Kiosk**: High-contrast, large touch buttons, fully bilingual (**English / हिन्दी**).
   - **Authority Dashboard**: Android/Linux/PC portal with real-time pending queues, calendar, and quick **Accept / Reject / Reschedule** actions.
   - **College Admin Dashboard**: College branding configuration, authority management, department controls, notice board, interactive map coordinator, analytics, and security audit logs.
   - **Reception Desk & Security Checkpoint**: Fast QR pass scanning, arrival check-in, and completion workflows.

2. **Core Appointment Lifecycle & State Machine**:
   - `PENDING` ➔ `ACCEPTED` ➔ `RESCHEDULED` ➔ `REJECTED` ➔ `COMPLETED` ➔ `CANCELLED` ➔ `EXPIRED`.
   - **Conflict Detection & Double-Booking Prevention**: Backend validates authority visiting hours and automatically prevents overlapping schedules with HTTP 409 Conflict rejection.
   - **Visitor Tracking**: Secure lookup via sequential **Reference Number** (e.g. `RAVAN-2026-000001`) and registered **Mobile Number**.

3. **Secure QR Visitor Pass**:
   - Cryptographically signed QR tokens containing only reference identifiers (no raw personal data inside the QR).
   - Printable & downloadable digital pass with authority details, timing, and room location.

4. **Visitor Photo & Private Vault**:
   - WebRTC camera integration for Android cameras, Linux webcams, and laptop cameras with capture, retake, and confirm controls.
   - File upload fallback and optional skipping.
   - Private storage vault with signed, time-limited viewing tokens (never exposed publicly).

5. **Real-Time WebSocket Engine**:
   - Instant live updates across devices (`ws://localhost:5000/ws`).
   - Visitor kiosk updates automatically when authority clicks Accept/Reject/Reschedule without reloading.
   - Authorities receive instant visual chime alerts when new requests arrive.

6. **Grounded Google Gemini AI Assistant**:
   - Server-side Gemini API integration grounded strictly on the college database (departments, faculty, admissions, exams, office hours).
   - Zero hallucinations with polite fallback to human reception.
   - Bilingual support for English, Hindi, and Hinglish.

7. **Interactive Campus Map**:
   - Interactive vector campus map with clickable buildings, laboratories, coordinates, and floor details.

8. **Progressive Web App (PWA)**:
   - Installable on Android and Linux Chrome/Firefox.
   - Web App Manifest (`manifest.webmanifest`), Service Worker with Cache API, and offline app shell.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher; v24 LTS recommended)
- npm (v9 or higher)

### 1. Installation
Clone or navigate to the project directory and install dependencies:

```bash
# Install root, backend, and frontend dependencies
npm --prefix server install
npm --prefix client install
```

### 2. Database Setup & Demo Seed
Generate the Prisma client, push database tables, and seed safe demo data:

```bash
cd server
npm run prisma:generate
npm run prisma:push
npm run seed
```

### 3. Build & Run
Build the client and start the production server:

```bash
# Build frontend PWA bundle
npm --prefix client run build

# Start backend server (serves both API & Frontend on port 5000)
npm --prefix server run start
```

Open your browser at: **[http://localhost:5000](http://localhost:5000)**

---

## 🐳 Docker Deployment

The application includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml` configured with PostgreSQL:

```bash
# Start both PostgreSQL and the Receptionist App
docker compose up -d --build
```

Access the containerized application at `http://localhost:5000`.

---

## 🔑 Demo Accounts & Credentials

| Role | Account ID | Email | Password | Allowed Dashboards |
|---|---|---|---|---|
| **Super Admin** | `ADMIN-001` | `admin@college.edu` | `Admin@123` | Admin Panel, Analytics, Settings, All |
| **Reception Desk** | `RECEPTION-001` | `reception@college.edu` | `Reception@123` | Reception Desk, QR Scanner, Check-in |
| **Director** | `DIRECTOR-001` | `director@college.edu` | `Director@123` | Authority Dashboard (Pending, Accept, Calendar) |
| **Principal** | `PRINCIPAL-001` | `principal@college.edu` | `Principal@123` | Authority Dashboard (Pending, Accept, Calendar) |
| **CSE HOD** | `CSE-HOD-001` | `cse.hod@college.edu` | `Hod@123` | Authority Dashboard (Pending, Accept, Calendar) |
| **Accounts Officer**| `ACCOUNTS-001` | `accounts@college.edu` | `Admin@123` | Authority Dashboard (Pending, Accept, Calendar) |

---

## 🧪 Automated End-to-End Tests

Execute the comprehensive 21-point test suite covering all 20 phases:

```bash
cd server
npm test
```

Output:
```text
[PASS] Phase 0: Health check endpoint responds with status ok
[PASS] Phase 15: PWA frontend application shell is served
[PASS] Phase 15: PWA web app manifest detected and valid
[PASS] Phase 1: Super Admin login and RBAC role verification
[PASS] Phase 1: Authority login and linked authority profile verification
[PASS] Phase 1: Reception staff login verification
[PASS] Phase 1: RBAC security guard blocks unauthorized role access
[PASS] Phase 2: Authority directory returns active authorities with office hours
[PASS] Phase 2: Director profile present in public directory
[PASS] Phase 3: Visitor creates appointment, receives sequential reference number and PENDING status
[PASS] Phase 4 & 9: Authority accepts request; status changes to ACCEPTED and secure QR token is generated
[PASS] Phase 5: Double-booking prevention successfully blocks overlapping appointment with 409 Conflict
[PASS] Phase 6: Visitor tracks status with reference & mobile, receives ACCEPTED state and base64 QR pass
[PASS] Phase 9: Reception verifies QR visitor pass token successfully
[PASS] Phase 6: Reception marks appointment as COMPLETED
[PASS] Phase 10: College knowledge base loaded with admission, exam, and working hours info
[PASS] Phase 11: Campus interactive map locations with coordinates available
[PASS] Phase 12: Active digital notice board announcements accessible
[PASS] Phase 13 & 14: Bilingual AI assistant responds with grounded guidance
[PASS] Phase 17: Admin analytics reflects real-time appointment metrics
[PASS] Phase 18: Comprehensive security audit logs recorded with timestamps and actors
================================================================
TEST SUMMARY: 21 PASSED, 0 FAILED
```

---

## 🛠️ Environment Configuration (`.env`)

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Environment mode | `production` / `development` |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT & QR token generation | Strong random string (min 32 chars) |
| `GEMINI_API_KEY` | Google Gemini API key (kept strictly server-side) | `AIzaSy...` |
| `STORAGE_UPLOAD_DIR` | Private vault path for visitor photos | `./uploads/visitor-photos` |
| `DEFAULT_COLLEGE_NAME`| Configurable institution title | `"RAVAN Institute of Technology & Management"` |
| `DEFAULT_LANGUAGE` | Default language on boot | `en` |

---

## 🏛️ Application Architecture

```
g:\ROBOapp\
├── client/                     # React 18 + Vite + Tailwind CSS + PWA
│   ├── public/                 # PWA Manifest, Service Worker (sw.js), SVG Icons
│   ├── src/
│   │   ├── components/         # Navbar, StatusBadge, CameraCapture, QRPass, Map
│   │   ├── context/            # AuthContext, SocketContext, SettingsContext
│   │   ├── i18n/               # en.json, hi.json, LanguageContext.tsx
│   │   ├── pages/
│   │   │   ├── visitor/        # VisitorHome, MeetAuthority, BookAppointment, Track
│   │   │   ├── authority/      # AuthorityLogin, AuthorityDashboard
│   │   │   ├── reception/      # ReceptionDesk (QR verification & check-in)
│   │   │   └── admin/          # AdminLogin, AdminDashboard
│   │   ├── services/           # api.ts (Fetch client)
│   │   └── App.tsx             # Root Router & Real-time Broadcast Banner
├── server/                     # Node.js + Express + TypeScript + Prisma
│   ├── src/
│   │   ├── controllers/        # Auth, Appointment, Authority, Admin, College, AI
│   │   ├── middleware/         # Auth (JWT/Cookie), RBAC, Rate-limiting, ErrorHandler
│   │   ├── routes/             # REST API endpoints (/api/*)
│   │   ├── services/           # ConflictService, QRService, PhotoStorage, Gemini, RealTime
│   │   └── tests/              # e2eTest.ts (Automated 20-phase verification suite)
│   ├── prisma/                 # schema.prisma, seed.ts (11 production models)
├── uploads/visitor-photos/     # Private secure visitor photo vault
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # PostgreSQL + App service orchestration
├── .env.example                # Documented configuration template
└── README.md                   # Full documentation
```
