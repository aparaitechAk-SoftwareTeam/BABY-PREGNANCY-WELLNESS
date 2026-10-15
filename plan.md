# APARAITECH SOFTWARE
### Baby & Pregnancy Wellness Tracking Application
**Product Implementation Plan & Roadmap (PRD v1.0 Aligned)**  
*Confidential — Internal Engineering & Product Document*

---

## 1. Project Overview & Scope
- **Company**: Aparaitech Software (Pune, Maharashtra)
- **Application Type**: Maternal & Pregnancy Wellness Companion
- **Platforms**: Mobile (React Native / Expo iOS & Android), Web Portal, Backend API (NestJS + Prisma PostgreSQL)
- **Core Positioning**: A private, non-diagnostic wellness and educational tracking application designed to help expecting parents monitor milestones, record baby movements, manage clinic visits and reminders, and generate clinical summaries for their healthcare providers.

---

## 2. Frontend Component Audit & Current Implementation Status

This matrix audits all frontend screens and components required by **PRD v1.0 (`document.txt`)**:

| Module & Screen | PRD Reference | Component / Screen Path | Status | Implementation Details |
| :--- | :--- | :--- | :--- | :--- |
| **Welcome / Splash** | Sec 4 & 21 | `/(auth)/welcome.tsx` | ✅ **Completed** | Auto-sliding carousel, category cards, maternal aesthetics. |
| **User Sign In** | Sec 5.1 & 21 | `/(auth)/login.tsx` | ✅ **Completed** | Email/Phone modes, social auth (Google, Apple), clean layout. |
| **User Registration** | Sec 5.1 & 21 | `/(auth)/signup.tsx` | ✅ **Completed** | Role selector (`Mother`, `Caregiver`), terms checkbox, immediate redirect to pregnancy setup. |
| **Password Reset** | Sec 5.1 & 21 | `/(auth)/forgot-password.tsx` | ✅ **Completed** | Recovery email submission with confirmation feedback state. |
| **Mother Onboarding Setup** | Sec 5.2 & 21 | `/(onboarding)/pregnancy-setup.tsx` | ✅ **Completed** | **Full clinical setup**: EDD/LMP timeline, gestational week stepper, **Height**, **Current & Pre-Weight**, **Age**, **Blood Group (Rh)**, **Doctor Name**, **Hospital Name**, Doctor Phone, Emergency Contact, and safety statement. |
| **Mother Home Dashboard** | Sec 6 & 21 | `/(mother)/index.tsx` | ✅ **Completed** | `HeaderProfileBar`, `PregnancyWeekCard`, `BabyDevelopmentCard`, `QuickTrackActions`, `TodayRemindersCard`, `ClinicalEscalationBanner`. |
| **Week-by-Week Explorer** | Sec 7 & 21 | `/pregnancy/week/[week].tsx` | ✅ **Completed** | 40-week fetal development guides, fruit/vegetable comparisons, body changes, trimester checklists. |
| **Caregiver Dashboard** | Sec 3 & 12 | `/(caregiver)/index.tsx` | ✅ **Completed** | Fixed tab bar height/insets; live sync of mother's week, weight, height, age, due date, and blood type. |
| **Caregiver Navigation Bar** | Sec 3 & 12 | `/(caregiver)/_layout.tsx` | ✅ **Completed** | Lifted from bottom bezel, safe area insets handled, 22px icons, clear labels. |
| **Mother Profile & Details** | Sec 14 & 21 | `/(mother)/profile.tsx` | ✅ **Completed** | Gestational timeline, health metrics, partner invite code, doctor & hospital card, profile edit trigger. |
| **Appointments & Doctor Visits** | Sec 9, 10 & 21 | `/(mother)/calendar.tsx`<br>`/appointments/form.tsx`<br>`/appointments/index.tsx` | ✅ **Completed** | Full appointment form with pre-filled Doctor & Hospital name, reminder toggles, list screen with filtering, and multi-dashboard sync. |
| **Smart Reminders System** | Sec 10 & 21 | `TodayRemindersCard.tsx`<br>`/reminders/index.tsx` | ✅ **Completed** | Full standalone reminders page (appointments, vitamins, hydration, quiet hours) + live sync to Home Dashboard. |
| **Baby Kick Counter Module** | Sec 8 & 21 | `/tracking/movement.tsx` | ✅ **Completed** | Full Cardiff Count-to-10 movement timer, 1-tap counter button, clinical escalation alert, and session history. |
| **Hydration Tracker** | Sec 9 & 21 | `/tracking/water.tsx` | ✅ **Completed** | Full hydration tracker with daily goal, quick presets (+250ml, +350ml, +500ml), custom ml entry, and reminder toggles. |
| **Weight Progression** | Sec 9 & 21 | `/tracking/weight.tsx` | ✅ **Completed** | Maternal gestational weight curve tracker with baseline comparisons, kg/lbs toggles, and trimester benchmark guidance. |
| **Symptoms & Mood Logger** | Sec 9 & 21 | `/tracking/symptoms.tsx`<br>`/tracking/mood.tsx` | ✅ **Completed** | Categorized symptom logging with severity, red-flag urgent triage banner, and daily mood diary check-in. |
| **Clinical Reports & PDF Export** | Sec 11 & 21 | `/(mother)/reports.tsx`<br>`/reports/preview.tsx`<br>`/reports/history.tsx` | ✅ **Completed** | Filterable clinical summaries, doctor-ready printable PDF preview, archive history, and WhatsApp/Email export. |
| **Partner & Family Sharing** | Sec 12 & 21 | `/partner/index.tsx`<br>`/partner/manage-access.tsx`<br>`/partner/permissions.tsx` | ✅ **Completed** | 6-character pairing code generation (`MOM-8492`), WhatsApp sharing, caregiver management, and granular permission switches. |
| **Sleep & Maternal Notes** | Sec 9 & 21 | `/tracking/sleep.tsx`<br>`/tracking/notes.tsx` | ✅ **Completed** | Maternal sleep tracker with SOS position guide, doctor questions list, and searchable pregnancy journal. |
| **App Settings & Policies** | Sec 14 & 19 | `/settings/index.tsx` | ✅ **Completed** | Notification preferences, data encryption, medical non-diagnostic disclaimer, and sign out controls. |

---

## 3. Comparison & Focus: Appointments & Doctor Reminder Integration

### 🔍 PRD Requirement Analysis (`document.txt` Sections 6, 9 & 10)
According to the PRD:
1. **Section 6 (Home Dashboard)**:
   - "Today’s Reminders: Appointments, medicine reminders only when user manually configures them, hydration and custom tasks."
2. **Section 9 (Maternal Wellness Tracking - Appointments)**:
   - "Date, time, clinic/doctor name, note and reminder."
3. **Section 10 (Reminders & Notifications)**:
   - "Appointment reminders, user-configured hydration reminders, custom wellness task reminders."

### 💡 The Core Workflow Connection
When a new mother completes the **Pregnancy Setup Form**, she registers her primary:
- **Doctor / OB-GYN Name** (e.g. `Dr. Priya Sharma`)
- **Hospital / Clinic Name** (e.g. `Apollo Cradle Maternity Hospital`)
- **Doctor Phone Number** (e.g. `+91 98765 43210`)

### ⚡ What Must Be Implemented in Frontend for Appointments:
1. **Auto-Populate Doctor & Hospital**:
   - When opening **Add Appointment Form** (`/appointments/form.tsx` or calendar modal), the form should **automatically pre-fill** the mother's registered **Doctor Name** and **Hospital / Clinic Name**.
   - The user should be able to keep the default primary doctor/hospital or tap/type to change it for specialized visits (e.g., Ultrasound Sonography Clinic, Pathology Lab, Blood Test Center).
2. **Appointment Categories**:
   - Routine Prenatal Checkup
   - Ultrasound / Anomaly Scan (Level II)
   - Blood Test / Glucose Tolerance Screening (GTT)
   - Nutrition & Diet Consultation
   - Pediatric / Hospital Tour
3. **Reminder Timing Configuration**:
   - Notification 1 day before (at 9:00 AM)
   - Notification 2 hours before
   - Custom notes & questions to ask the doctor
4. **Three-Way Real-Time Synchronization**:
   - **Mother Dashboard** (`TodayRemindersCard.tsx`): Upcoming appointment banner displays the next visit with doctor & hospital name.
   - **Mother Calendar** (`/(mother)/calendar.tsx`): Full timeline of scheduled checkups.
   - **Caregiver Calendar** (`/(caregiver)/calendar.tsx`): Shared access so the caregiver/partner knows when and where the mother needs support.

---

## 4. Phase-by-Phase Execution Plan

### 🚀 Phase 1: Authentication & Maternal Onboarding (Completed ✅)
- [x] **Step 1.1**: Welcome screen with interactive feature carousel.
- [x] **Step 1.2**: Sign In screen with compact layout, email/phone modes, and social auth.
- [x] **Step 1.3**: Sign Up screen with role selector (`Mother`, `Caregiver`) and automatic redirection to pregnancy onboarding.
- [x] **Step 1.4**: Password recovery screen.
- [x] **Step 1.5**: **Pregnancy Setup Screen** (`/(onboarding)/pregnancy-setup.tsx`)
  - Calculation by **Estimated Due Date (EDD)** or **Last Menstrual Period (LMP)**.
  - Automatic calculation of current pregnancy week & day (e.g. *Week 20, Day 2*).
  - Baby fruit/vegetable development badge & 40-week progress bar.
  - Maternal baseline: **Height**, **Pre-Pregnancy Weight**, **Current Weight**, **Age**, **Blood Group (Rh)**.
  - Clinical details: **Doctor Name**, **Hospital Name**, Doctor Phone, Upcoming visit note.
  - Emergency contact name, relationship, and phone number.
  - AsyncStorage persistence & state hydration on launch.

---

### 🌸 Phase 2: Core Maternal & Caregiver Dashboards (Completed ✅)
- [x] **Step 2.1**: **Mother Home Dashboard** (`/(mother)/index.tsx`)
  - Pregnancy Week Card, Baby Development Card, Quick Actions bar, Today's Routine & Reminders, Safety Escalation Banner.
- [x] **Step 2.2**: **Week-by-Week Educational Explorer** (`/pregnancy/week/[week].tsx`)
  - 40-week milestone library, anatomical development, maternal body changes, doctor visit preparation checklist.
- [x] **Step 2.3**: **Caregiver Experience & Shared Readiness Hub** (`/(caregiver)/`)
  - Redesigned bottom navigation bar with safe-area insets, raised height, legible icons and labels.
  - Live sync of mother's stats: week, weight, height, age, due date, and blood type.
  - **Labor & Birth Readiness Hub** (`app/(caregiver)/birth-readiness.tsx`): Emergency hospital navigation, direct OB-GYN hotline dialing, 5-1-1 clinical labor timing guide, partner bag co-checklist, and mother's birth plan advocacy.
  - **Shared Medical Vault & Reports Hub** (`app/(caregiver)/reports.tsx`): Direct access to mother-authorized ultrasound scans, lab panels, prescriptions, and doctor-ready consultation reports with PDF preview and WhatsApp forwarding.
  - **Caregiver Home Readiness Card** (`app/(caregiver)/index.tsx`): Embedded hospital bag progress bar and 5-1-1 triage shortcut.
- [x] **Step 2.4**: **Mother Profile** (`/(mother)/profile.tsx`)
  - Added Health & Clinical Care Team section with quick "Edit Pregnancy & Doctor Information" trigger.

---

### 📅 Phase 3: Appointments, Doctor Reminders & Calendar (Completed ✅)
- [x] **Step 3.1**: **Centralized Appointment Store** (`store/appointment.store.ts`)
  - Store for appointments with AsyncStorage persistence.
  - Pre-loads default Doctor & Hospital from `pregnancyStore.profile`.
- [x] **Step 3.2**: **Add / Edit Appointment Form Component** (`/appointments/form.tsx`)
  - Pre-filled Doctor Name & Hospital/Clinic Name with option to override.
  - Date & Time selector, appointment category pills (Routine, Scan, Lab, Consult, Nutrition).
  - Notes for doctor & questions to ask during consultation.
  - Reminder notification settings (1 day before, 2 hours before, both).
- [x] **Step 3.3**: **Appointments List & Calendar Screen** (`/appointments/index.tsx` & `/(mother)/calendar.tsx`)
  - Full appointments list with Upcoming vs Past filter tabs, category filter chips, and Call Clinic button.
  - Connected `/(mother)/calendar.tsx` to the appointment store and form navigation.
- [x] **Step 3.4**: **Sync to Home Dashboard & Caregiver Calendar**
  - Updated `TodayRemindersCard.tsx` on Mother Dashboard to reflect the earliest upcoming visit with doctor & hospital name.
  - Updated `(caregiver)/calendar.tsx` to display the synced appointments so the caregiver stays informed.
- [x] **Step 3.5**: **Smart Reminders Screen** (`/reminders/index.tsx`)
  - Standalone reminders page for doctor visits, prenatal vitamins & folic acid, hydration alerts, and quiet sleep hours.
- [x] **Step 3.6**: **Top Horizontal Appointment Announcement Banner** (`components/dashboard/UpcomingAppointmentAnnouncement.tsx`)
  - Prominent horizontal alert card on **Mother Dashboard** (`app/(mother)/index.tsx`), **Caregiver Dashboard** (`app/(caregiver)/index.tsx`), and **Family Dashboard** (`app/(family)/index.tsx`).
  - Alerts: `🚨 TODAY'S CLINICAL APPOINTMENT` or `📅 UPCOMING APPOINTMENT ANNOUNCEMENT`.
  - Displays attending Doctor Name, Hospital/Clinic Name, Time, Appointment Category, and Preparation notes.
  - Action buttons: direct `Call Clinic` dialer and `Checklist & Questions` navigation.
- [x] **Step 3.7**: **Emergency SOS Buttons & Rapid Obstetric Triage Protocol** (`components/common/EmergencySOSModal.tsx`)
  - **Mother Dashboard Header**: Red SOS button with pulsing indicator next to notifications & partner status bar.
  - **Mother Dashboard Body**: 24/7 Maternal Safety Banner with `🚨 Emergency SOS Triage` quick launch button.
  - **Mother Profile Header & Section**: Dedicated SOS pill in Profile header row + full-width `🚨 TRIGGER EMERGENCY SOS PROTOCOL` card in Medical Emergency Protocol section.
  - **Caregiver Dashboard**: Prominent SOS button in top welcome header for immediate emergency intervention.
  - **Emergency SOS Modal (`EmergencySOSModal.tsx`)**: 1-tap call to Hospital Triage, National Ambulance (`108`), Partner / Emergency contact, SMS broadcast with GPS coordinates, and red-flag symptom guide (bleeding, rigid abdominal pain, reduced kicks, pre-eclampsia signs).

---

### 🩺 Phase 4: Daily Maternal Wellness Tracking Modules (Completed ✅)
- [x] **Step 4.1**: **Baby Kick Counter Module** (`/tracking/movement.tsx` & `/tracking/movement-history.tsx`)
  - 1-Tap circular counter button with Cardiff Count-to-10 progress ring.
  - Live session stopwatch timer (MM:SS), start/pause/reset/save controls.
  - Clinical escalation alert for reduced fetal movements with direct emergency dialer.
  - Persistent session history with AsyncStorage and historical session review screen.
- [x] **Step 4.2**: **Hydration Tracker** (`/tracking/water.tsx`)
  - Daily water glass target (2500ml default) with quick intake chips (+250ml, +350ml, +500ml).
  - Custom ml entry modal, today's water diary, and reminder toggle.
- [x] **Step 4.3**: **Maternal Weight Progression** (`/tracking/weight.tsx`)
  - Weight log with trimester benchmark guidance, baseline pre-pregnancy comparison, and kg/lbs toggle.
- [x] **Step 4.4**: **Symptoms & Mood Logger** (`/tracking/symptoms.tsx` & `/tracking/mood.tsx`)
  - Categorized maternal symptoms with severity levels and urgent red-flag clinical escalation banner.
  - Daily mood check-in (emoji spectrum, energy levels) and private pregnancy diary.
- [x] **Step 4.5**: **Sleep Tracker & Notes** (`/tracking/sleep.tsx` & `/tracking/notes.tsx`)
  - Maternal sleep tracker with left-side sleeping (SOS) medical guidance and awakening counter.
  - Categorized pregnancy notes, doctor questions checklist, and baby nursery planning journal.
- [x] **Step 4.6**: **Today's Routine & Tasks Full Tracking Module** (`/routine/index.tsx`, `store/routine.store.ts`)
  - Centralized persistent store (`AsyncStorage`) tracking daily habits with auto-reset on new day.
  - Dedicated **Today's Routine Screen** (`app/routine/index.tsx`) with progress ring, morning/afternoon/evening/night segmentation, clinical rationale accordion, and "Add Custom Task" modal.
  - **Mother Track Tab** (`app/(mother)/track.tsx`): Integrated `RoutineTrackerCard` at top of the screen alongside Kicks, Hydration, Weight, and Symptoms.
  - **Mother Dashboard** (`TodayRemindersCard.tsx`): Dynamic checklist connected to live store with "View All ›" navigation.
  - **Mother Profile** (`app/(mother)/profile.tsx`): Added "Daily Routine & Habits" section card.
  - **Caregiver Dashboard** (`app/(caregiver)/index.tsx`): Live monitoring card of Mother's daily routine progress and completed habits.
- [x] **Step 4.7**: **Maternal Step Counter & Physical Activity Tracker** (`/tracking/steps.tsx`, `store/steps.store.ts`)
  - Apple Health & Google Fit inspired activity ring showing daily steps, distance (km), active walking time (min), and pregnancy-adjusted calories burned.
  - Trimester-based walking targets (Gentle 3,500, Standard ACOG 5,000, Active 6,500 steps) with custom goal modal.
  - Live Prenatal Walk Session Recorder with stopwatch, pace, and step ticker.
  - 7-Day Weekly History SVG Bar Chart with target achievement indicators.
  - Obstetric walking guidelines and ACOG maternal safety red-flag warnings (bleeding, contractions, calf pain).
  - Quick Track Actions horizontal scroll bar with `Daily Steps` tile on Mother Dashboard.
  - `StepCounterCard` embedded in Mother Track Tab (`app/(mother)/track.tsx`).
  - Mother's daily steps and mobility indicator embedded on Caregiver Dashboard.
- [x] **Step 4.8**: **Unified Mother Track Tab & Date-Stamped Health History** (`app/(mother)/track.tsx`, `components/tracking/NotesCard.tsx`)
  - Added **Notes & Doctor Questions Card** (`NotesCard.tsx`) directly to Mother Track tab with private journal preview, doctor question chips, and link to `/tracking/notes`.
  - Upgraded **`WeightLogCard.tsx`** with date stamps (*"Recorded on Thu, Oct 15 • Week 20"*), recent weigh-in date history (*Oct 15, Oct 08, Oct 01*), and direct button to full weight curve timeline.
  - Upgraded **`HydrationTrackerCard.tsx`** with current date stamp and 1-tap navigation to daily water diary & history (`/tracking/water`).
  - Upgraded **`KickCounterCard.tsx`** with direct navigation to Kick count sessions history (`/tracking/movement-history`).
  - Added **Sleep & Mood Wellbeing Quick Tiles** to ensure 100% of maternal tracking modules are accessible from the Track tab.
- [x] **Step 4.9**: **Notifications Center & Caregiver Frontend Polish** (`app/notifications/index.tsx`, `store/notification.store.ts`, `app/(caregiver)/`)
  - **Notifications Center (`/notifications`)**:
    - Centralized notifications hub with 5 filter categories (`All`, `Clinical Visits`, `Daily Routine`, `Baby Milestones`, `Family Sync`).
    - Live unread badges, mark individual/all as read, delete alert, and 1-tap actionable routing.
    - Header bell button in Mother Dashboard (`HeaderProfileBar.tsx`) and Caregiver Dashboard dynamically linked with real-time unread badge counter.
  - **Caregiver Frontend Complete Sync (`app/(caregiver)/`)**:
    - **Caregiver Calendar (`calendar.tsx`)**: Replaced hardcoded dates with live dynamic month, current week, and synchronized appointment timeline.
    - **Caregiver Reports (`reports.tsx`)**: Dynamic gestational week (`Week 20`), days remaining (`140 Days Left`), maternal progress percentage, and recent consultation report dates.
    - **Caregiver Health Track (`track.tsx`)**: Live sync with Mother's daily steps (`useStepsStore`), routine habit checklist (`useRoutineStore`), and maternal clinical vitals.
    - **Caregiver Profile (`profile.tsx`)**: Linked notifications center and added 1-tap Emergency SOS modal trigger.
- [x] **Step 4.10**: **P1 Core Additions: Smart Pregnancy Timeline & Medical Document Vault** (`app/timeline/index.tsx`, `app/vault/index.tsx`, `components/dashboard/SmartTimelineCard.tsx`)
  - **Smart Pregnancy Timeline (`/timeline`)**:
    - Unified care map combining clinical doctor appointments, planned diagnostic tests (GTT, Anomaly Scan, Tdap, GBS swab), gestational milestones (Halfway, Viability, Full Term), and daily routine habits.
    - Filter tabs (`All`, `Visits`, `Tests & Vaccines`, `Milestones`, `Habits`), search bar, and interactive completion checkmarks.
    - Dashboard card (`SmartTimelineCard.tsx`) embedded on Mother Home Dashboard displaying next clinical event, remaining daily habits, and 1-tap launchers.
  - **Medical Document Vault (`/vault`)**:
    - Secure, encrypted repository for ultrasound sonography scans, doctor prescriptions, lab blood panels, and immunization records.
    - Quick stats summary (Total files, Ultrasounds, Lab tests, Shared files).
    - Category pills (`All`, `Ultrasounds`, `Prescriptions`, `Lab Reports`, `Vaccines`, `Discharge`).
    - Selective Caregiver Sharing toggle per document (Private vs Shared with Partner).
    - Document upload modal with doctor notes, clinical summary, and report preview modal.
- [x] **Step 4.11**: **P2 Features: Family Task Coordination & Regional Languages Audio Guides** (`app/partner/tasks.tsx`, `store/family-tasks.store.ts`, `app/education/audio-guides.tsx`, `store/language.store.ts`)
  - **Family Task Coordination (`/partner/tasks`)**:
    - Interactive task delegation allowing mothers to assign specific support tasks to partners/caregivers (e.g. arranging transport, picking up pharmacy prescriptions, packing hospital bag essentials).
    - Quick preset templates for 1-tap delegation.
    - Priority badges (`URGENT`, `HIGH`, `MEDIUM`, `LOW`), due dates, and completion checkoffs.
    - Integrated "Assigned Tasks for You" card embedded on Caregiver Home Dashboard (`(caregiver)/index.tsx`) allowing partners to check off tasks in real time.
  - **Regional Languages & Audio Guides (`/education/audio-guides`)**:
    - Multi-language clinical audio education supporting **English**, **हिंदी (Hindi)**, and **मराठी (Marathi)**.
    - Interactive audio player with Play/Pause, 10s skip/rewind, elapsed time scrubber, and clinical narrator credentials (*Dr. Priya Sharma*).
    - 4 evidence-based audio tracks: *Trimester 2 Nutrition & Iron Absorption*, *Cardiff Count-to-10 Movement Practice*, *Safe Prenatal Breathing & Pelvic Relaxation*, and *Recognizing Urgent Maternal Warning Signs*.
    - Interactive read-along transcript accordion in each selected language.
- [x] **Step 4.12**: **P3 Features: Birth Preparation & Postpartum Journey** (`app/birth-prep/index.tsx`, `store/birth-prep.store.ts`)
  - **Hospital Bag Readiness Checklist**:
    - Categorized packing lists for Mother (7 essentials), Baby (6 essentials), Partner (5 items), and Delivery Documents (5 records).
    - Progress indicator (*"14 of 23 packed (61%)"*), essential badges, checkoffs, and custom item creation.
  - **Birth Plan Organizer**:
    - Interactive preferences for Labor Room Companion, Pain Management (Epidural, Water labor, Breathing), Delivery & Cord Clamping, and special wishes for the obstetrician.
  - **Postpartum Recovery Guide**:
    - Clinical healing stages for Lochia bleeding (Rubra, Serosa, Alba) with red-flag saturation alerts.
    - Early Colostrum & Breastfeeding latch guidance.
    - Postpartum Baby Blues vs Postpartum Depression emotional healing support.

---

- [x] **Step 5.1**: **PDF Report Generator & History Upgrade** (`/(mother)/reports.tsx`, `/reports/preview.tsx`, `/reports/history.tsx`)
  - **Date Range Filters**: 7-Day Routine Checkup, 30-Day Monthly Review, Trimester, and Full Term.
  - **Live Tracked Data**: Automatically calculates Cardiff kick duration, weight trajectory, hydration rate, and step averages.
  - **Visual Trend Progression**: Cardiff Reactivity Bar Chart, Gestational Weight Milestone Curve, and Red-Flag Safety Clearance.
  - **Questions for the Doctor**: Interactive checklist of clinical inquiries tailored to trimester + custom question input that prints on the consultation report.
  - **OB-GYN Ruled Clinical Notes Area**: Dedicated space for doctor's handwritten prescriptions and follow-up plan.
  - **Multi-Channel Export**: Direct WhatsApp sharing, native share dialog, and local PDF download.
  - **Searchable Archive**: Persistent report history with category filters (Routine, Monthly, Ultrasound, Trimester).
- [x] **Step 5.2**: **Partner & Family Pairing** (`/partner/index.tsx`, `/partner/manage-access.tsx`, `/partner/permissions.tsx`)
  - 6-character pairing code display (`MOM-8492`), 1-tap copy, and WhatsApp invitation dispatcher.
  - Caregiver management screen with access revocation controls and activity audit logs.
  - Granular privacy switches per health category (milestones, appointments, kicks, SOS alerts).
- [x] **Step 5.3**: **Settings & Policies** (`/settings/index.tsx`)
  - Integrated settings hub with notification toggles, medical non-diagnostic disclaimers, and account sign out.

---

## 5. Technical Architecture Overview

```
 mobile-app/ (Expo & React Native)
 ├── app/
 │   ├── (auth)/             -> Welcome, Login, Signup, Forgot Password
 │   ├── (onboarding)/       -> Pregnancy Setup (Full Maternal & Doctor baseline)
 │   ├── (mother)/           -> Home Dashboard, Calendar, Reports, Profile
 │   ├── (caregiver)/        -> Caregiver Home (live mother sync), Calendar, Reports, Profile
 │   ├── tracking/           -> Kick Counter, History, Hydration, Weight, Symptoms, Mood, Sleep, Notes
 │   ├── appointments/       -> Appointment Form (Doctor/Hospital pre-fill), List
 │   ├── partner/            -> Partner Sync, Manage Caregivers, Permissions
 │   ├── reports/            -> Report Preview, History Archive
 │   └── settings/           -> App Settings, Privacy, Medical Disclaimers
 ├── components/
 │   ├── dashboard/          -> PregnancyWeekCard, BabyDevelopmentCard, TodayRemindersCard, QuickTrackActions
 │   ├── caregiver/          -> CaregiverStatsCard, CaregiverStatusBanner
 │   └── pregnancy/          -> WeeklyChecklistCard, BabyGrowthHero
 └── store/
     ├── auth.store.ts       -> User session, role, token, hydration
     ├── pregnancy.store.ts  -> Timeline, Height, Weight, Doctor, Hospital, Emergency
     └── appointment.store.ts-> Appointments list, doctor/hospital pre-fill, reminders
```

---

## 6. Execution Roadmap & Milestones

```
[Completed]  Phase 1: Auth & Comprehensive Maternal Setup (EDD/LMP, Height, Weight, Doctor, Hospital)
[Completed]  Phase 2: Home Dashboard, Caregiver Nav/Sync, Week-by-Week Guides
[Completed]  Phase 3: Appointments & Doctor Reminders (Pre-filled Doctor/Hospital Form & Multi-Sync)
[Completed]  Phase 4: Fetal Kick Counter & Wellness Logs (Hydration, Weight, Symptoms, Sleep, Notes)
[Completed]  Phase 5: Clinician PDF Export & Partner Circle Sharing (Invite Code, Permissions, Preview)
[Upcoming]   Phase 6: Backend API Sync & Security Compliance
```
