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
| **Caregiver Family Sharing** | Live MOM-XXXX pairing codes, CaregiverPairing DB table, real-time mother vitals sync | ✅ **Ready** |
| **Appointments Sync** | Live Neon DB appointments module, doctor visits calendar sync | ✅ **Ready** |
| **Web Portal (Admin & Support)** | 100% mock data eradicated, wired to live users, support tickets, content, and notifications | ✅ **Ready** |
| **Database & ORM** | Prisma schema deployed to Neon PostgreSQL with connection pooling & SSL | ✅ **Ready** |

---

## 3. The 2 Remaining Development Tasks to Reach 100% Live Readiness

```
+-----------------------------------------------------------------------------------+
|                        REMAINING 5% DEVELOPMENT PIPELINE                          |
+-----------------------------------------------------------------------------------+
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

### 📌 Task 1: Appointments & Doctor Visits Database Sync (COMPLETED ✅)
* **Status**: Complete in `commit 7f00c0c`.
* `AppointmentsModule`, `AppointmentsService`, `AppointmentsController` running on Neon PostgreSQL.

---

### 📌 Task 2: Caregiver Code Pairing & Live Mother Data Sync (COMPLETED ✅)
* **Status**: Complete.
* **Backend**:
  1. `CaregiverPairing` model added to `schema.prisma` and deployed to Neon PostgreSQL via `npx prisma db push`.
  2. `FamilySharingModule`, `FamilySharingService`, `FamilySharingController` running at:
     * `GET /api/family/my-code` (Mother retrieves active 6-char pairing code and linked circle members)
     * `POST /api/family/generate-code` (Mother generates fresh pairing code)
     * `POST /api/family/pair` (Caregiver enters `MOM-XXXX` code to link)
     * `GET /api/family/status` (Caregiver checks link status)
     * `GET /api/family/mother-data` (Caregiver retrieves complete real-time clinical dataset for the paired mother)
     * `DELETE /api/family/unlink/:id` (Mother/Caregiver unlinks account)
     * `PATCH /api/family/permissions/:id` (Mother updates permissions)
* **Mobile**:
  1. `family.api.ts` & `family.store.ts` created for state and endpoint interactions.
  2. `mobile-app/app/partner/index.tsx` displays live dynamic pairing code from database with instant WhatsApp/SMS share and live connected member list.
  3. `mobile-app/app/(mother)/profile.tsx` displays live database pairing code.
  4. `mobile-app/app/(caregiver)/index.tsx` displays interactive "Link with Mother's Account" card when unpaired, and renders live mother vitals (steps, hydration, sleep, Cardiff kick sessions, clinical red flags) directly from Neon PostgreSQL when paired.
  5. `mobile-app/app/(caregiver)/calendar.tsx` and `track.tsx` synced to display live visits and metrics from the paired mother's record.

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
