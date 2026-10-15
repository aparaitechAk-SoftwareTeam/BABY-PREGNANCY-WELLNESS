# API Specification

## Base URL
`https://api.aparaitech.com/api` (Production)  
`http://localhost:3000/api` (Development)

## Core Endpoints
### Authentication
- `POST /auth/login`: User login & JWT token issuance.
- `POST /auth/signup`: Mother / family account registration.
- `POST /auth/forgot-password`: Password recovery email trigger.

### Pregnancy & Tracking
- `GET /pregnancy/week/:week`: Weekly baby development data and tips.
- `POST /tracking/movement`: Log kick/fetal movements.
- `POST /tracking/hydration`: Log daily water intake.
- `POST /tracking/weight`: Log maternal weight.

### Appointments & Reminders
- `GET /appointments`: List upcoming and past doctor appointments.
- `POST /appointments`: Schedule an appointment.
- `GET /reminders`: List medication & wellness alerts.

### Support
- `GET /support/tickets`: List tickets (for support agents & admins).
- `POST /support/tickets/:id/replies`: Add reply or internal note.
