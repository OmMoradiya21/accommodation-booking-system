# Accommodation Booking System

A full-stack accommodation and reservation management system built with **NestJS**, **React**, **PostgreSQL**, and **PrimeFlex**, featuring multi-company workspaces and granular Role-Based Access Control (RBAC).

---

## Features

- **Company Workspaces**: Multi-tenant workspace scoping where bookings, customers, and data are isolated per company.
- **Accommodations Management**: Manage accommodation properties, locations, and nightly pricing.
- **Bookings & Approvals**: Schedule reservations for customers with live stay duration and cost calculation, plus a dedicated approval workflow (`Pending`, `Approved`, `Declined`).
- **Customer Management**: Company-scoped customer directory and contact information.
- **RBAC & Permissions**: Granular permissions (`read`, `create`, `update`, `delete`, `approve`) assigned via roles.
- **Modern UI**: Built with React 19, Vite, PrimeReact, and PrimeFlex utility styling.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, PrimeReact, PrimeFlex, React Router |
| **Backend** | NestJS, TypeScript, TypeORM, Passport JWT, class-validator |
| **Database** | PostgreSQL |

---

## Project Structure

```text
accommodation-booking-system/
├── client/          # Frontend application (React + Vite)
│   ├── src/
│   │   ├── components/  # Page components & management views
│   │   ├── context/     # Global auth & workspace state
│   │   ├── lib/         # Axios client & API interceptors
│   │   └── types.model.ts
│   └── package.json
└── server/          # Backend API (NestJS + TypeORM)
    ├── src/
    │   ├── auth/        # JWT auth & guards
    │   ├── companies/   # Company workspace module
    │   ├── customers/   # Customers module
    │   ├── accommodations/ # Inventory module
    │   ├── bookings/    # Bookings & approval module
    │   ├── roles/       # Roles module
    │   ├── permissions/ # Permissions constants & guards
    │   └── migrations/  # Initial schema & seed data
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- **PostgreSQL** running locally

---

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE accommodation_booking_system;
```

---

### 2. Backend Setup (`server`)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   HOST=localhost

   DB_PORT=5432
   DB_NAME=accommodation_booking_system
   DB_USERNAME=postgres
   DB_PASSWORD=your_postgres_password
   NODE_ENV=development

   JWT_ACCESS_TOKEN_SECRET=your_jwt_secret
   JWT_ACCESS_TOKEN_EXPIRATION_MS=120000
   JWT_REFRESH_TOKEN_SECRET=your_refresh_secret
   JWT_REFRESH_TOKEN_EXPIRATION_MS=604800000
   ```

4. Run database migrations to seed initial roles, permissions, and demo users:
   ```bash
   npm run migration:run
   ```

5. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   The API will run at `http://localhost:5000/api`.

---

### 3. Frontend Setup (`client`)

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:5173`.

---

## Demo Accounts

The initial database seed includes demo accounts:

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123` | Full system access, all companies & settings |
| **Manager** | `jane@example.com` | `user123` | Assigned company management & booking approvals |

---

## Useful Scripts

### Backend (`server/`)
- `npm run start:dev`: Run backend with hot reload
- `npm run build`: Compile NestJS project
- `npm run migration:run`: Execute pending database migrations
- `npm run lint`: Run oxlint on backend code

### Frontend (`client/`)
- `npm run dev`: Start Vite development server
- `npm run build`: Build production client bundle
- `npm run lint`: Run oxlint on frontend code
