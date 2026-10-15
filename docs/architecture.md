# Architecture Overview

## Monorepo Layout
- **mobile-app/**: React Native / Expo Router application for mothers, partners, and family members (iOS & Android).
- **web-portal/**: React + Vite + Tailwind CSS admin and customer support dashboard.
- **backend/**: NestJS + Prisma REST API handling business logic, authentication, and PostgreSQL data persistence.
- **docs/**: Architectural diagrams, API specs, role definitions, and onboarding documentation.

## System Design
- **Authentication**: JWT-based authentication with role-based access control (RBAC).
- **Database**: PostgreSQL managed with Prisma ORM.
- **API**: RESTful endpoints with standard responses and error handling.
