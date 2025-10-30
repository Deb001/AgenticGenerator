# Shift Scheduler Platform

A full‑stack solution for managing retail store shift schedules.  
The backend is a Node.js/Express API powered by PostgreSQL and Sequelize.  
The frontend is a React application. An edge function (Bolt) processes batched SMS notifications.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [Backend](#backend)
  - [Database](#database)
  - [Edge Function](#edge-function)
  - [Frontend (Client)](#frontend-client)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Authentication & Authorization](#authentication--authorization)
- [Scheduling Rules](#scheduling-rules)
- [Testing](#testing)
- [Continuous Integration](#continuous-integration)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

root
├─ src
│  ├─ config          # DB connection (Sequelize)
│  ├─ models          # Store, Employee, Shift
│  ├─ repositories    # Data‑access layer for each model
│  ├─ services        # SchedulingService (core algorithms)
│  ├─ controllers     # ScheduleController (REST endpoints)
│  ├─ middleware      # JWT auth & role‑based ACL
│  ├─ utils           # shiftValidator, notificationQueue
│  ├─ edgeFunctions   # smsNotifier (Bolt edge function)
│  └─ server.js       # Express entry point
├─ migrations          # Sequelize migration files
├─ seeds               # Seed data for stores & employees
├─ client
│  └─ src
│     ├─ index.jsx               # React bootstrap
│     ├─ api/api.js              # Axios wrapper with auth
│     └─ components
│        ├─ ManagerDashboard.jsx
│        └─ EmployeeSchedule.jsx
└─ README.md

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL** >= 13
- **Bolt** CLI (for edge function deployment) – optional for local testing
- **Git** (for version control)

---

## Setup & Installation

### 1. Clone the Repository

git clone https://github.com/your-org/shift-scheduler.git
cd shift-scheduler

### 2. Backend

cd src
npm ci

#### Environment Variables

Create a `.env` file in `src/` (or copy `.env.example` if provided):

# Server
PORT=3000

# JWT
JWT_SECRET=your-very-secret-key
JWT_EXPIRES_IN=1d

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shift_scheduler
DB_USER=postgres
DB_PASSWORD=your_db_password

### 3. Database

Ensure PostgreSQL is running and a database named `shift_scheduler` exists (or change `DB_NAME`).

#### Run Migrations

npx sequelize-cli db:migrate

#### Seed Initial Data

npx sequelize-cli db:seed:all

### 4. Edge Function (SMS Notifier)

The edge function lives in `src/edgeFunctions/smsNotifier.js`.  
To test locally:

cd src/edgeFunctions
npm ci   # installs bolt edge runtime dependencies
npm run dev   # starts a local edge function server (if a script is defined)

For production deployment, use the Bolt CLI:

bolt deploy src/edgeFunctions/smsNotifier.js --name sms-notifier

### 5. Frontend (Client)

cd ../../client
npm ci

Create a `.env` file in `client/` (React expects `REACT_APP_API_URL`):

REACT_APP_API_URL=http://localhost:3000/api

---

## Running the Application

### Backend (API Server)

# From the src directory
npm run dev   # starts server with nodemon on PORT (default 3000)

The API will be reachable at `http://localhost:3000/api`.

### Frontend (React)

# From the client directory
npm start

Open `http://localhost:3001` (or the port shown in the console) to view the UI.

### Edge Function (SMS Notifier)

Deploy as described above, or run locally with the provided script. The notification queue (`src/utils/notificationQueue.js`) automatically pushes messages; the edge function consumes them on a timed batch.

---

## API Reference

All endpoints are prefixed with `/api`.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| `POST` | `/stores` | Manager | Create a new store |
| `GET`  | `/stores` | Manager/Employee | List stores |
| `POST` | `/employees` | Manager | Add an employee |
| `GET`  | `/employees` | Manager/Employee | List employees |
| `POST` | `/shifts` | Manager | Create a shift (validated by `shiftValidator`) |
| `GET`  | `/shifts?storeId=&date=` | Manager/Employee | Retrieve shifts (filterable) |
| `DELETE`| `/shifts/:id` | Manager | Remove a shift |
| `POST` | `/auth/login` | — | Returns JWT (use `Authorization: Bearer <token>` header) |

All request bodies and responses follow JSON format. Validation errors return `400` with an `errors` array.

---

## Authentication & Authorization

- **Authentication**: Header‑based JWT (`Authorization: Bearer <token>`). Tokens are issued by `/auth/login`.
- **Authorization**: Middleware `src/middleware/auth.js` checks the `role` claim (`manager` or `associate`).  
  - Managers can create, edit, and delete stores, employees, and shifts.  
  - Associates can only read their own schedule (`GET /shifts?employeeId=`).

---

## Scheduling Rules

Implemented in `src/utils/shiftValidator.js` and enforced by `SchedulingService`:

1. **Maximum Shifts per Week** – Configurable (default 5).  
2. **No Overlapping Shifts** – Start/End times must not intersect.  
3. **No Consecutive Days** – Employees must have at least one day off between shifts.  

Violations result in a `400` response with a descriptive error message.

---

## Testing

### Backend Tests

cd src
npm test

Tests cover:

- Model definitions & associations
- Repository CRUD operations
- SchedulingService logic
- ShiftValidator edge cases
- Auth middleware role enforcement
- Controller route integration (using supertest)

### Frontend Tests

cd ../../client
npm test

React components are tested with Jest & React Testing Library.

---

## Continuous Integration

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:

1. **Lint** – `npm run lint` (ESLint + Prettier).  
2. **Unit Tests** – Backend and client.  
3. **Build** – Creates production bundles (`npm run build`).  
4. **Docker** – Builds a multi‑stage Docker image for deployment.

The workflow fails on linting errors, failing tests, or build issues, ensuring only production‑ready code is merged.

---

## Contributing

1. Fork the repository.  
2. Create a feature branch (`git checkout -b feat/your-feature`).  
3. Write code following the existing style (ES6 modules, async/await, strict mode).  
4. Add/extend tests for new functionality.  
5. Run the full CI locally (`npm run ci`).  
6. Submit a Pull Request with a clear description and reference to the related issue (e.g., `AI-5`).

Please adhere to the **Code of Conduct** located in `CODE_OF_CONDUCT.md`.

---

## License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.