# AparaiTech Maternal Care & Pregnancy Wellness
## Project Completion Audit & Next Process Roadmap

---

## 1. Executive Summary & Completion Percentages

| Component | Technology Stack | Completion % | Current Status |
| :--- | :--- | :---: | :--- |
| **Mobile App (Frontend)** | React Native (Expo SDK 52), Zustand, TypeScript | **85%** | All 25+ screens completed, UI/UX polished, Auth & Onboarding integrated live with backend & Neon DB. Local-first tracking active. |
| **Web Portal (Admin)** | React 18, Vite, Tailwind CSS, TypeScript | **75%** | Complete UI for Admin, User Management, Content CMS, Role RBAC, Audit Logs. Currently connected to mock data services. |
| **Backend API & DB** | NestJS, Prisma ORM, Neon PostgreSQL, Brevo SMTP | **50%** | Live Neon PostgreSQL connection, Auth & Email OTP flow complete, Pregnancy Profile persistence live. Tracking & Reminders modules scaffolded. |
| **Total Project Overall** | **Full Stack System** | **~70%** | **Core Foundation & Maternal Onboarding Live. Ready for Phase 2 Tracking API & Sync.** |

---

## 2. Detailed Breakdown by Platform

### 📱 A. Mobile Application (85% Complete)
* **Completed (100%)**:
  - **Authentication Suite**: Welcome Splash, Sign In, Registration (Mother / Caregiver), Email OTP Verification, Resend Countdown, Password Reset.
  - **Validation & Security**: Strict `@gmail.com` enforcement, 8–16 char strong password rules (1 uppercase, 1 lowercase, 1 number, 1 symbol).
  - **Onboarding Experience**: Complete clinical setup form (Gestational week stepper, EDD/LMP dates, Height, Weight, Blood Group, Doctor, Hospital, Emergency Contact).
  - **Interactive OTP Box**: Clickable, tap-to-focus on mobile, error styling, and 1-tap "Clear & re-enter code" button.
  - **Maternal Home Dashboard**: Gestational timeline progress, 40-week baby size card, quick trackers, reminders summary.
  - **Tracking Modules**:
    - Cardiff Count-to-10 Movement / Kick Counter with timer & history.
    - Hydration tracker with daily target & quick presets (+250ml, +350ml, +500ml).
    - Gestational weight progression curve.
    - Symptoms & Mood logger with clinical red-flag alert banner.
    - Sleep tracker with SOS lateral tilt guide & maternal clinical notes.
  - **Clinical Reports & Sharing**: Filterable medical summary, printable PDF preview, WhatsApp/Email export, Caregiver pairing code (`MOM-XXXX`).
  - **Caregiver Dashboard**: Fixed bottom bezel, real-time sync with mother's physical metrics.

* **Remaining for Mobile (15%)**:
  - Connect tracking screens (Kicks, Water, Weight, Symptoms) to backend sync endpoints once backend models are finalized.
  - Push notification listener (Expo Notifications) for scheduled pill & appointment reminders.

---

### 💻 B. Web Portal / Admin Dashboard (75% Complete)
* **Completed (100%)**:
  - Full modern admin dashboard layout with responsive sidebar and navigation.
  - **User & Patient Management**: View mothers, caregivers, doctors, account status, and verification badges.
  - **Maternal Content CMS**: Week-by-week guides (Weeks 1–40), articles, fruit/vegetable size comparisons.
  - **Security & Access**: Role-based access control (RBAC), Admin/Support roles, audit log viewer.
  - **Engagement**: Announcement broadcasting system, FAQ management, support ticket desk.

* **Remaining for Web Portal (25%)**:
  - Switch service endpoints from `mocks/` to live NestJS backend endpoints (`/api/admin/*`, `/api/users/*`).
  - Web admin login session persistence via JWT cookies / localStorage.

---

### ⚙️ C. Backend API & PostgreSQL Database (50% Complete)
* **Completed (100%)**:
  - **Database Architecture**: Neon Cloud PostgreSQL connected via Prisma ORM with connection pooling & SSL.
  - **Prisma Schema Synced**: `User`, `OtpCode`, `PregnancyProfile` models deployed.
  - **Authentication Module**:
    - `POST /api/auth/signup`
    - `POST /api/auth/verify-otp`
    - `POST /api/auth/resend-otp`
    - `POST /api/auth/signin`
    - `POST /api/auth/forgot-password`
    - `POST /api/auth/reset-password`
  - **Maternal Pregnancy Module**:
    - `PUT /api/pregnancy/profile` (Live persistence of height, weight, due date, blood group, doctor, partner)
    - `POST /api/pregnancy/setup`
    - `GET /api/pregnancy/profile`
    - `GET /api/pregnancy/week/:week`
  - **Security**: JWT authentication guard with authorization header and fallback user-identifier support.
  - **Brevo SMTP Email Service**: Dynamic HTML emails with verification codes sent directly to Gmail inboxes.

* **Remaining for Backend (50%)**:
  - Expand Prisma schema for daily tracking:
    - `KickLog` (movement count, duration, session date)
    - `WaterLog` (daily intake in ml)
    - `WeightLog` (date, weight, note)
    - `SymptomLog` (symptom name, severity, notes)
    - `Appointment` (doctor, hospital, date, time, reminder)
  - Implement controllers and services for `appointments`, `tracking`, `reminders`, `reports`, and `family-sharing`.

---

## 3. Step-by-Step Next Process Roadmap

```
+---------------------------------------------------------------------------------+
|                                 PHASE 1 (ACTIVE)                                |
|  - Live Neon PostgreSQL Connected                                               |
|  - Auth & Gmail OTP Verification Live                                           |
|  - Pregnancy Setup Form Persisting to Database                                  |
|  - OTP Tap & Editing Bug Fixed                                                  |
+---------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                                 PHASE 2 (NEXT)                                  |
|  1. Daily Maternal Tracking Backend & DB Models                                 |
|     - Add KickLog, WaterLog, WeightLog, SymptomLog to Prisma                    |
|     - Run prisma db push to Neon PostgreSQL                                     |
|     - Build NestJS Tracking Service & Controllers                               |
|  2. Connect Mobile Tracking Screens to Live Endpoints                           |
|     - Kick counter sync                                                         |
|     - Daily water intake sync                                                   |
|     - Weight log entry sync                                                     |
+---------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                                    PHASE 3                                      |
|  1. Appointments & Reminders Synchronization                                    |
|     - Clinic visit booking & doctor reminder scheduling                         |
|     - Local & Push notifications for pill/water/appointment alerts              |
|  2. Caregiver Live Sync                                                         |
|     - Real-time family pairing code linking in database                         |
+---------------------------------------------------------------------------------+
                                        |
                                        v
+---------------------------------------------------------------------------------+
|                                    PHASE 4                                      |
|  1. Web Portal Integration with Backend APIs                                    |
|  2. Automated PDF Medical Report Cloud Generation                               |
|  3. Production Deployment & Mobile App Store Preparation                       |
+---------------------------------------------------------------------------------+
```

### Detailed Next Steps (Priority Ordered):

#### Step 1: Database Tracking Models (Prisma)
Add the tracking models to `backend/prisma/schema.prisma`:
- **`KickSession`**: `id`, `userId`, `kickCount`, `durationSeconds`, `createdAt`
- **`WaterIntake`**: `id`, `userId`, `amountMl`, `date`
- **`WeightEntry`**: `id`, `userId`, `weightKg`, `gestationalWeek`, `date`
- **`SymptomEntry`**: `id`, `userId`, `symptoms` (array), `severity`, `notes`, `date`
- **`Appointment`**: `id`, `userId`, `doctorName`, `hospitalName`, `scheduledAt`, `notes`
Run `npx prisma db push` to synchronize with Neon.

#### Step 2: Implement Backend Tracking Controller & Service
- Build `backend/src/tracking/` endpoints:
  - `POST /api/tracking/kicks` & `GET /api/tracking/kicks`
  - `POST /api/tracking/water` & `GET /api/tracking/water/today`
  - `POST /api/tracking/weight` & `GET /api/tracking/weight/history`
  - `POST /api/tracking/symptoms` & `GET /api/tracking/symptoms`

#### Step 3: Wire Mobile Tracking API Handlers
- Update `mobile-app/services/api/tracking.api.ts` to call backend endpoints when the mother records a kick session, drinks water, or logs weight.
- Mobile store keeps local offline cache so tracking works with or without internet connection.

#### Step 4: Appointments & Reminders Backend Sync
- Implement `backend/src/appointments/` and `backend/src/reminders/`.
- Wire `appointments/form.tsx` and `calendar.tsx` to save and read doctor visits.

#### Step 5: Web Admin Portal Live Connection
- Connect Web Portal to `backend/src/users` and `backend/src/pregnancy-content` so medical admins can edit week-by-week fetal guides and view patient analytics in real time.

---

## 4. Current Environment & Active Services

- **Git Branch**: `Pvan_Mali`
- **GitHub Repository**: `https://github.com/aparaitechAk-SoftwareTeam/BABY-PREGNANCY-WELLNESS.git`
- **Backend API URL**: `http://localhost:3000/api` (Local) / `http://192.168.1.5:3000/api` (LAN)
- **Database**: Neon Cloud PostgreSQL (`ep-morning-sound-b4hkmmfi-pooler.c-6.us-east-2.aws.neon.tech`)
- **Email Service**: Brevo SMTP (Transactional OTP delivery)
- **Expo Dev Server**: Running on Tunnel (`npx expo start --tunnel`)
- **Web Admin Portal**: Running on Vite (`npm run dev`)
