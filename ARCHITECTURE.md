# ARCHITECTURE.md

# System Architecture Documentation

This document outlines the architecture style, modular structures, directories, and code layout guidelines for the UP Police Technical Services Headquarters Transfer Management System.

---

## 1. High-Level Technical Stack

- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL (relational storage, constraints, transaction integrity).
- **Frontend**: React, TypeScript, Vite.
- **Styling**: Modern Vanilla CSS with a centralized CSS custom properties variables system for design parameters (colors, padding, spacing).
- **File Storage**: Local directory storage with secure, non-executable routes for testing, abstracting endpoints for future secure cloud storage.

---

## 2. Backend Folder Structure (Clean Layered Architecture)

The backend code is organized into logical layers: HTTP transport, Business Logic, and Data Access, ensuring separation of concerns and testability.

```
backend/
├── src/
│   ├── config/                  # Global settings, DB connection pool, environment validations
│   │   ├── db.ts                # PostgreSQL connection pooling and test configurations
│   │   ├── env.ts               # Validates process.env parameters using Zod/TS guards
│   │   └── mailer.ts            # SMTP transport credentials and settings
│   ├── constants/               # System enums, error configurations, configuration limits
│   │   ├── error-codes.ts       # Centralized application error identifiers
│   │   └── system-roles.ts      # Defines access constants (COMPUTER_OPERATOR, DISTRICT_SP, etc.)
│   ├── controllers/             # HTTP Controllers (interface adapters)
│   │   │                        # Extract params, parse files, route to relevant service, format response
│   │   ├── auth.controller.ts
│   │   ├── personnel.controller.ts
│   │   ├── transfer.controller.ts
│   │   └── audit.controller.ts
│   ├── middlewares/             # Pre-request pipeline processors
│   │   ├── auth.middleware.ts   # Parses JWT, validates active session status
│   │   ├── rbac.middleware.ts   # Matches role permissions against the requested route
│   │   ├── validator.middleware.ts # Uses schema models to validate body payload
│   │   ├── rate-limiter.ts      # Enforces rate limiting on login/OTP calls
│   │   └── error.middleware.ts  # Catches system exceptions and formats JSON responses
│   ├── models/                  # Types and request schema definitions
│   │   ├── dto/                 # Zod validation schemas for requests
│   │   └── entities.ts          # Database row definitions mapping to PostgreSQL tables
│   ├── repositories/            # Data Access Layer (executes raw SQL queries)
│   │   ├── user.repository.ts
│   │   ├── personnel.repository.ts
│   │   ├── transfer.repository.ts
│   │   ├── order.repository.ts
│   │   └── audit.repository.ts
│   ├── services/                # Business Logic Layer (validates state transitions, processes rules)
│   │   ├── auth.service.ts      # Password matching, JWT signing, OTP dispatch
│   │   ├── transfer.service.ts  # Submission, validation of target districts, draft checks
│   │   ├── workflow.service.ts  # Logic for forward, return, and SP-level rejections
│   │   ├── pdf-order.service.ts # Compiles PDFs, generates verification QR Codes
│   │   └── audit.service.ts     # Records transactions to the audit ledger
│   ├── utils/                   # General utility functions
│   │   ├── hash.util.ts
│   │   └── qr.util.ts
│   ├── routes/                  # Maps Express URLs to controllers
│   │   ├── index.ts             # Aggregate Router
│   │   ├── auth.routes.ts
│   │   ├── transfer.routes.ts
│   │   └── report.routes.ts
│   ├── app.ts                   # Express server initialization setup
│   └── server.ts                # Listens on port, triggers startup DB checks
├── migrations/                  # SQL files representing database migrations (up/down scripts)
├── tests/                       # Test Suites
│   ├── unit/                    # Unit tests for services and helpers
│   ├── integration/             # Integration tests checking route responses and DB integrity
│   └── setup.ts                 # Test database configuration bootstrapper
├── tsconfig.json                # TypeScript compiler config
├── package.json
└── README.md
```

---

## 3. Frontend Folder Structure (Domain/Feature-Driven Design)

The frontend is organized by domain features, grouping components, custom hooks, and pages that belong to the same module together.

```
frontend/
├── public/                      # Static files (icons, default assets, offline files)
├── src/
│   ├── assets/                  # CSS styles, images, global font configurations
│   │   └── styles/
│   │       ├── variables.css    # Centralized layout margins, variables, color system (Deep Blue/Khaki)
│   │       └── global.css       # App resets, basic form field stylings, animations
│   ├── components/              # Shared components (independent UI widgets)
│   │   ├── common/              # Simple reusable controls
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Timeline.tsx     # Generic vertical progress list component
│   │   ├── layout/              # Structural components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── AppContainer.tsx
│   │   └── feedback/            # Messages, loaders, overlay wrappers
│   │       ├── Loader.tsx
│   │       └── Dialog.tsx
│   ├── context/                 # Global Context stores
│   │   ├── AuthContext.tsx      # Evaluates token, login, logout, current role permission maps
│   │   └── ThemeContext.tsx     # Configures dark/light theme properties
│   ├── features/                # Functional domains
│   │   ├── auth/                # Login features, password resetting components
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── ForgotPasswordPage.tsx
│   │   │   └── hooks/           # useLogin, useResetPassword logic
│   │   ├── dashboard/           # Displays widgets tailored to user roles
│   │   ├── transfers/           # Operator Request Wizard, tracking views
│   │   │   ├── pages/
│   │   │   │   ├── NewRequestPage.tsx
│   │   │   │   └── RequestTrackingPage.tsx
│   │   │   └── components/
│   │   │       ├── Dropzone.tsx
│   │   │       └── RequestDetails.tsx
│   │   ├── approvals/           # Actions console for SP/ADG roles
│   │   │   ├── pages/
│   │   │   │   └── ApprovalsDashboard.tsx
│   │   │   └── components/
│   │   │       └── ActionDrawer.tsx
│   │   └── admin/               # Administration CRUD boards (User edit, audit search grids)
│   ├── hooks/                   # App-wide global utility hooks
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   ├── routes/                  # Navigation rules
│   │   ├── PrivateRoute.tsx     # Validates current user role before rendering sub-pages
│   │   └── index.tsx            # Main router configurations
│   ├── services/                # API communication layers
│   │   ├── api-client.ts        # Axios configuration with interceptors (attaches JWT, handles 401s)
│   │   ├── auth.api.ts
│   │   ├── transfer.api.ts
│   │   └── audit.api.ts
│   ├── types/                   # Shared TypeScript models and interface declarations
│   │   ├── auth.d.ts
│   │   └── transfer.d.ts
│   ├── utils/                   # Shared formatting helpers
│   │   └── date.util.ts
│   ├── App.tsx                  # Base application wrapper component
│   └── main.tsx                 # Bootstraps React DOM mount
├── tests/                       # Testing configurations
│   ├── unit/                    # React Component unit test specs
│   └── e2e/                     # Automated user-flow tests (Playwright)
├── vite.config.ts               # Vite configuration parameters
├── tsconfig.json                # TS compiler configuration
├── package.json
└── README.md
```
