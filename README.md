# AparaiTech - Baby & Pregnancy Wellness Tracking Application

A comprehensive full-stack ecosystem for pregnancy tracking, family wellness, and healthcare support.

## Project Structure

```
aparaitech-pregnancy-wellness/
│
├── mobile-app/                         # Android + iOS (React Native / Expo Router)
│   ├── app/                            # Expo Router file-based screens
│   ├── components/                     # Mobile UI widgets
│   ├── hooks/                          # Custom mobile hooks
│   ├── services/                       # API clients & local storage
│   ├── store/                          # Zustand state stores
│   └── package.json
│
├── web-portal/                         # Admin + Support Dashboard (Vite + React + Tailwind)
│   ├── src/                            # Dashboard pages, routes, layouts
│   ├── public/                         # Public assets
│   └── package.json
│
├── backend/                            # Shared REST API (NestJS + Prisma + PostgreSQL)
│   ├── src/                            # NestJS modules, controllers, services
│   ├── prisma/                         # Prisma ORM schema & seed scripts
│   └── package.json
│
├── docs/                               # System Documentation
│   ├── architecture.md                 # System architecture overview
│   ├── api-specification.md            # API endpoints & contracts
│   ├── roles-permissions.md            # Access control matrix
│   └── setup-guide.md                  # Development setup guide
│
├── .gitignore
└── README.md
```

## Quick Start

### Web Portal
```bash
cd web-portal
npm run dev
```

### Mobile App
```bash
cd mobile-app
npm run start
```

### Backend
```bash
cd backend
npm run start:dev
```
