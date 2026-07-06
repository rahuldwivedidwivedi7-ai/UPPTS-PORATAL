# UI_UX.md

# UI/UX Specifications

---

## 1. Design Principles

- **Focus**: UP Police Technical Services Headquarters Branding (Deep Blue and Khaki colors).
- **Usability**: Clean interfaces, responsive views (works on desktops, laptops, tablets, and phones).
- **Navigation**: Dashboard-driven, sidebar navigation with instant visibility into pending actions.
- **Micro-interactions**: Subtle state-change transitions, inline verification notifications, clear status indicators.

---

## 2. Frontend Screen List

The system comprises the following dedicated screens:

### 1. Unified Authentication Interface
- **Layout**: Clean card split layout. Logo of UP Police Technical Services on one side, login inputs on the other.
- **Elements**:
  - Username or Employee Number field.
  - Password field with show/hide toggle.
  - OTP modal overlay (appears upon valid password submission).
  - "Forgot Password" self-service path triggering email reset.
- **Validation**: Inline errors for missing fields or password strength. Rate limit feedback display.

### 2. Computer Operator Dashboard
- **Layout**: Dynamic modular grid containing widgets and request lists.
- **Widgets**:
  - **Quick Stats**: Cards showing *My Active Applications*, *Pending Reviews*, *Last Decision*.
  - **Action Cards**: Primary button link to "Submit New Transfer Request".
  - **Profile Summary card**: Read-only display of PNO, Name, Grade (Grade A/B), Current Posting District.
  - **Recent Request Grid**: List showing current stage in workflow (e.g., *District SP Review*) with a vertical timeline popover.

### 3. Transfer Request Submission Screen
- **Layout**: Two-column layout separating profile preview from request form parameters.
- **Form Controls**:
  - **Source District (Read-Only)**: Automatically derived from the operator's personnel file.
  - **Target District (Dropdown)**: List of valid districts (filtering out the source district).
  - **Reason for Transfer (Textarea)**: Enforces a minimum of 30 characters.
  - **Document Attachments (Drag-and-Drop Area)**: Restricts inputs to single consolidated PDF/JPEG documents. Max file size: 5MB.
- **Action Buttons**:
  - "Save Draft" - Preserves inputs in database as draft.
  - "Submit Request" - Submits request and routes to the District SP. Locks fields for editing.

### 4. Application Status & Timeline Tracking Screen
- **Layout**: Focused timeline display layout detailing chronological movement.
- **Features**:
  - **Vertical Progress Indicator**: Steps highlight active, finished, or rejected states.
  - **Status States**:
    - `Submitted` $\rightarrow$ `Under District Review` $\rightarrow$ `Under Headquarter Review` $\rightarrow$ `Awaiting ADG Approval` $\rightarrow$ `Order Generated`.
  - **Activity Log Table**: Lists historic transitions, showing the action role (e.g., District SP), remarks, dates.

### 5. District SP Review Dashboard & Details View
- **Dashboard Summary**:
  - Numeric counters: *Pending Recommendations*, *Total Processed*.
- **Pending Requests Datatable**:
  - Columns: PNO Number, Operator Name, Grade, Date Submitted, Actions.
- **Detailed Request Modal / Drawer**:
  - Split interface showing applicant information (left) and attached document view frame + actions panel (right).
  - **Action Drawer Form**:
    - Option select: `Recommend & Forward` (forward to HQ), `Reject Request` (terminal state), `Return for Correction` (sends back to operator).
    - Remarks/Comments input: Required for Reject/Return actions. Enforces accountability.

### 6. SP Computer Centre Verification Panel
- **Dashboard Summary**:
  - Numeric counters: *Forwarded Files*, *Awaiting Verification*.
- **Pending Files Table**:
  - Displays list of requests recommended by District SPs.
- **Actions Drawer**:
  - Option select: `Verify & Forward` (forward to ADG), `Return for Correction` (sends back to operator).
  - Remarks input: Must contain administrative justification.

### 7. ADG Technical Services Final Approval Console
- **Interface**: Clean, high-contrast decision board.
- **Core View**:
  - List of verified requests awaiting final approval.
- **Action Dashboard**:
  - Toggle buttons: `Approve` or `Reject`.
  - Remarks box (Optional for approve, mandatory for reject).
  - Single-click action triggers order generation routine.

### 8. Transfer Order Screen
- **Layout**: Full-screen document preview screen.
- **Features**:
  - **PDF Renderer**: Renders compiled transfer order containing seal, generated serial code, QR verification block, and issued date.
  - **Verification Link Details**: Visible URL showing verification routing.
  - **Actions**: "Download PDF", "Print Order".

### 9. System Administration and Audit Panel (Admin)
- **Features**:
  - **User Configuration Board**: Table to create and edit accounts.
  - **Audit Logs View**: Dynamic filter inputs (User, Action Type, Module, Date Range). Datatable renders actions, IP addresses, change details.
  - **System Configurations**: Manage parameters like allowed file types, session timeouts, and maximum file size limitations.
