# AparaiTech Maternal Care & Pregnancy Wellness
## Final Process to 100% Production Readiness (Development Roadmap)

---

## 1. Executive Summary

* **Current Code Development Status**: **~90% Complete**
* **Target**: **100% Production-Ready Codebase**
* **Target Delivery Scope**: All user features persisting to the cloud database, full caregiver-to-mother account pairing, protected web admin sessions, and Google social login.

---

## 2. Current Status Snapshot

| Module / Platform | Current Status | State |
| :--- | :--- | :---: |
| **Mobile App (UI & Tracking)** | 21 screens, custom brand assets, 0 mock data, kicks/hydration/weight/symptoms/steps/sleep live | ✅ **Ready** |
| **Authentication & OTP** | Email signup/login, Brevo SMTP OTP, password reset, Neon PostgreSQL | ✅ **Ready** |
| **Maternal Profile Setup** | Setup form saves height, weight, due date, doctor info directly to Neon DB | ✅ **Ready** |
| **Web Portal (Admin & Support)** | 100% mock data eradicated, wired to live users, support tickets, content, and notifications | ✅ **Ready** |
| **Database & ORM** | Prisma schema deployed to Neon PostgreSQL with connection pooling & SSL | ✅ **Ready** |

---

## 3. The 4 Remaining Development Tasks to Reach 100% Live Readiness

```
+-----------------------------------------------------------------------------------+
|                        REMAINING 10% DEVELOPMENT PIPELINE                         |
+-----------------------------------------------------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
        v                                                                   v
+-------------------------------+                         +---------------------------------+
|  TASK 1: APPOINTMENTS SYNC    |                         |  TASK 2: CAREGIVER PAIRING     |
|  - NestJS AppointmentsModule  |                         |  - NestJS FamilySharingModule   |
|  - Save & read doctor visits  |                         |  - Link MOM-XXXX codes in DB    |
|  - Sync to mobile calendar    |                         |  - Live partner dashboard sync  |
+-------------------------------+                         +---------------------------------+
        |                                                                   |
        +---------------------------------+---------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                                                   |
        v                                                                   v
+-------------------------------+                         +---------------------------------+
|  TASK 3: ADMIN AUTH GUARD     |                         |  TASK 4: GOOGLE SOCIAL LOGIN    |
|  - Web Portal login screen    |                         |  - POST /api/auth/google        |
|  - Protect /admin & /support  |                         |  - Verify Google ID tokens      |
|  - JWT session persistence    |                         |  - Connect mobile Google button |
+-------------------------------+                         +---------------------------------+
```

---

### 📌 Task 1: Appointments & Doctor Visits Database Sync
* **Objective**: Ensure that clinic visits, ultrasound appointments, and reminders created on the mobile app are permanently saved in Neon PostgreSQL (not just local phone memory).
* **Backend Deliverables**:
  1. Build `AppointmentsService` & `AppointmentsController` in `backend/src/appointments/`.
  2. Implement endpoints:
     * `POST /api/appointments` (Create clinic/doctor visit)
     * `GET /api/appointments` (Retrieve upcoming and past appointments for current user)
     * `PUT /api/appointments/:id` (Update appointment details/notes)
     * `DELETE /api/appointments/:id` (Cancel/delete appointment)
  3. Register `AppointmentsModule` in `backend/src/app.module.ts`.
* **Mobile Deliverables**:
  1. Update `store/appointment.store.ts` to call backend endpoints.
  2. Keep local AsyncStorage cache for instant offline access with background sync.

---

### 📌 Task 2: Caregiver Code Pairing (Family Sharing)
* **Objective**: Link the mother's 6-character pairing code (`MOM-XXXX`) in the database so that when a partner/caregiver signs up and enters the code, their app immediately reflects the mother's real-time vitals.
* **Backend Deliverables**:
  1. Add `CaregiverPairing` relation in Prisma schema:
     * Fields: `id`, `motherId`, `caregiverId`, `pairingCode`, `status`, `permissions`, `createdAt`.
  2. Build `FamilySharingService` & `FamilySharingController` in `backend/src/family-sharing/`:
     * `POST /api/family/generate-code` (Generate and persist mother's unique code)
     * `POST /api/family/pair` (Caregiver enters code to link accounts)
     * `GET /api/family/mother-data` (Caregiver retrieves mother's live metrics)
     * `DELETE /api/family/unlink/:id` (Mother revokes caregiver access)
* **Mobile Deliverables**:
  1. Update `app/partner/index.tsx` to submit code to `POST /api/family/pair`.
  2. Caregiver Home Dashboard (`app/(caregiver)/index.tsx`) pulls live data from `/api/family/mother-data`.

---

### 📌 Task 3: Admin Web Portal Authentication Guard
* **Objective**: Protect the Admin Panel and Support Desk so visitors must log in with authorized admin/support credentials before accessing patient and system data.
* **Web Portal Deliverables**:
  1. Build `/login` page with email & password form.
  2. Integrate with `POST /api/auth/signin`.
  3. Implement `AuthGuard` route wrapper: redirect unauthenticated visitors to `/login`.
  4. Store JWT securely in localStorage/cookies with automatic header injection via Axios interceptor.
  5. Add "Log Out" button in header/sidebar clearing session and redirecting to `/login`.

---

### 📌 Task 4: Google Social Authentication
* **Objective**: Enable 1-tap sign-in and registration using Google accounts on the mobile app.
* **Backend Deliverables**:
  1. Install `google-auth-library` in `backend`.
  2. Add `POST /api/auth/google` endpoint in `AuthModule`.
  3. Verify Google ID token, extract name/email/avatar, find or create `User` in Neon DB, and return JWT.
* **Mobile Deliverables**:
  1. Connect Google button on `app/(auth)/login.tsx` and `signup.tsx` to trigger Google OAuth flow and send token to the backend.

---

## 4. Final Pre-Live Verification Checklist

Before deploying the codebase:
- [ ] **Typecheck Verification**:
  - `web-portal`: `npx tsc -b` &rarr; 0 errors
  - `backend`: `npx tsc --noEmit` &rarr; 0 errors
  - `mobile-app`: `npx tsc --noEmit` &rarr; 0 errors
- [ ] **Database Integrity**:
  - `npx prisma db push` verified with Neon PostgreSQL pooler.
- [ ] **Environment Variables Audit**:
  - Verified `DATABASE_URL`, `JWT_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`.
- [ ] **Clean Git Working Tree**:
  - All changes pushed to GitHub remote branch `Pvan_Mali`.

---

## 5. Execution Order

```
Step 1: Task 1 -> Appointments Database Sync (Backend API + Mobile Store)
Step 2: Task 2 -> Caregiver Family Sharing (Pairing code link in Neon DB)
Step 3: Task 3 -> Web Portal Auth Guard (Login screen & protected routes)
Step 4: Task 4 -> Google Social Authentication (Token verification endpoint)
Step 5: Full verification & 100% production-ready sign-off
```
