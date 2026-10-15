# Monorepo Setup Guide

## Prerequisites
- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL >= 14
- Expo CLI (for mobile app)

## Installation & Running

### 1. Web Portal (Admin & Support)
```bash
cd web-portal
npm install
npm run dev
```

### 2. Mobile App (iOS / Android)
```bash
cd mobile-app
npm install
npm run start
```

### 3. Backend REST API
```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```
