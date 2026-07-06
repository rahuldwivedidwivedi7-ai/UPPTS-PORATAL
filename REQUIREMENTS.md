# REQUIREMENTS.md

# Technical Services Headquarters Transfer Management System - Requirements

This portal is designed to automate the transfer application and approval workflow for police personnel under the **Technical Services Headquarters, Uttar Pradesh**.

---

## 1. Scope & Jurisdiction

- **Target Headquarters**: Technical Services Headquarters, UP.
- **Eligible Personnel**: The system is restricted exclusively to:
  - **Computer Operator Grade A**
  - **Computer Operator Grade B**
- **Excluded Features**:
  - No Range (DIG) workflow stages.
  - No Zone (ADG Zone) workflow stages.
  - No Police Headquarters (PHQ) routing.
  - No dynamic vacancy counting or sanctioned strength ledger management.

---

## 2. User Roles & Authentication

The system supports the following 5 distinct roles:

1. **Computer Operator (Grade A / B)**:
   - Registers profile details (employee number/PNO, name, joining date, current district).
   - Submits transfer applications, including target district, reasons, and a single file attachment.
   - Saves drafts of applications prior to submission.
   - Edits and resubmits applications returned for correction.
   - Monitors status progress on a real-time status tracker.
   - Downloads generated transfer orders upon final approval.
2. **District SP**:
   - Reviews requests originating from their specific district.
   - Action: **Recommend & Forward**, **Reject**, or **Return for Correction**.
3. **SP Computer Centre**:
   - Admin reviewer located at Technical Services HQ.
   - Action: **Verify & Forward** (sends verified files to ADG), or **Return for Correction**.
4. **ADG Technical Services**:
   - Final approval authority for Technical Services.
   - Action: **Approve** (triggers order generation) or **Reject** (terminates request).
5. **Super Admin**:
   - Configuration management (districts, system settings).
   - Manages user accounts, active statuses, and reviews the security audit log.

---

## 3. System Modules

### 3.1 Authentication
- Login via Username/PNO and Password.
- Dual-factor Verification (OTP) via Email.
- Secure lockout rules: locks user accounts for 15 minutes after 5 failed login attempts.

### 3.2 Transfer Request Management
- Creation of draft request.
- Submission validation: prevents requesting transfer to the current district.
- Single attachment limit: allows upload of one consolidated document (PDF or JPEG) under 5MB.
- File check routines: validates magic numbers (mimetype verification) and runs files through an anti-malware verification utility.

### 3.3 Approval Workflow Engine
- Sequences applications strictly: `Operator` $\rightarrow$ `District SP` $\rightarrow$ `SP Computer Centre` $\rightarrow$ `ADG Technical Services`.
- Terminating state: Any rejection at the District SP or ADG TS level terminates the request immediately (status `REJECTED`).
- Return logic: Returns send applications back to `DRAFT` status. Any resubmission must route through the District SP again.

### 3.4 Transfer Order Module
- Triggers upon ADG Technical Services approval.
- Auto-generates a unique sequential transfer order code.
- Builds a PDF order document detailing the officer, from/to districts, and date.
- Embeds a unique verification QR code leading to a secure portal validation link.

### 3.5 System Audit Ledger
- Immutable system audit logs tracking login timestamps, active IP addresses, changed values, and approval actions.
- Displays logs on a filterable query board accessible only to Admins.
