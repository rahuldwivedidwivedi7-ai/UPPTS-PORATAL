# Technical Services Headquarters Transfer Management System - Backend

This folder contains the Node.js + Express + TypeScript backend for the Technical Services Headquarters Transfer Management System.

---

## Prerequisites

1. **Node.js**: Ensure Node.js (v20+ recommended, v24 tested) is installed.
2. **PostgreSQL**: Ensure a PostgreSQL instance is running locally or remotely on port 5432.

---

## Installation & Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**:
   Update the [.env](file:///d:/Transfer%20&%20Posting%20Project/backend/.env) file with your database credentials.
   ```env
   DATABASE_URL=postgres://<username>:<password>@<host>:<port>/upp_ts_transfers
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Initialize and Seed Database**:
   Run the database creation, schema migrations, and initial seeding scripts in order:
   - **Step 4.1: Compile the TypeScript codebase**:
     ```bash
     node "node_modules/typescript/bin/tsc"
     ```
   - **Step 4.2: Create target database (if not exists)**:
     ```bash
     node dist/migrations/create-db.js
     ```
   - **Step 4.3: Run migrations (create tables)**:
     ```bash
     node dist/migrations/run-migrations.js
     ```
   - **Step 4.4: Seed data (populate initial districts/operators/logins)**:
     ```bash
     node dist/migrations/run-seed.js
     ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   The server will start listening at: `http://localhost:5000/api/v1`

---

## Folder Structure

The code follows a Clean Layered Architecture:
- [src/config/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/config): Core configuration interfaces (database connection, environment parser, mailer configuration, SMS mock).
- [src/migrations/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/migrations): SQL DDL and Seeding files, plus TS runners.
- [src/models/dto/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/models/dto): Zod request input validation models.
- [src/middlewares/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/middlewares): Middlewares (JWT token validation, RBAC authority check, in-memory rate-limiter, global error wrapper).
- [src/repositories/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/repositories): Data Access layer executing queries against the database pool.
- [src/services/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/services): Auth service containing OTP generation, validation, and JWT signatures.
- [src/controllers/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/controllers): HTTP controller controllers mapping requests to business services.
- [src/routes/](file:///d:/Transfer%20&%20Posting%20Project/backend/src/routes): Express routing mounts.
- [src/app.ts](file:///d:/Transfer%20&%20Posting%20Project/backend/src/app.ts): Express pipeline setup.
- [src/server.ts](file:///d:/Transfer%20&%20Posting%20Project/backend/src/server.ts): Main startup bootstrapper.

---

## Testing API Endpoints (Phase-1 Backend)

Below are the HTTP endpoints and test procedures for verifying correctness:

### 1. Verification Health Check
- **Endpoint**: `GET http://localhost:5000/health`
- **Verification**: Renders application status indicator.
  ```bash
  curl -X GET http://localhost:5000/health
  ```

### 2. Login Credentials Check (Dispatches OTP)
- **Endpoint**: `POST http://localhost:5000/api/v1/auth/login`
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "PNO942050012",
    "password": "SecurePassword123"
  }
  ```
- **Verification**: Sends a mock OTP (visible in the server console log and `/seed.sql` parameters) and returns verification dispatch confirmation.
  ```bash
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"PNO942050012\",\"password\":\"SecurePassword123\"}"
  ```

### 3. Verify OTP & Issue Token
- **Endpoint**: `POST http://localhost:5000/api/v1/auth/verify-otp`
- **Request Headers**: `Content-Type: application/json`
- **Request Body** (replace `otp_code` with the code logged in the server console):
  ```json
  {
    "username": "PNO942050012",
    "otp_code": "123456"
  }
  ```
- **Verification**: Returns a JWT Bearer Token and user metadata.
  ```bash
  curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"PNO942050012\",\"otp_code\":\"123456\"}"
  ```

### 4. Fetch Operator Profile (Protected JWT + RBAC)
- **Endpoint**: `GET http://localhost:5000/api/v1/personnel/profile`
- **Request Headers**: `Authorization: Bearer <JWT_TOKEN_HERE>`
- **Verification**: Verifies that JWT token is successfully validated, role permissions matched, and the joined personnel profile returned.
  ```bash
  curl -X GET http://localhost:5000/api/v1/personnel/profile \
    -H "Authorization: Bearer <INSERT_TOKEN_HERE>"
  ```
