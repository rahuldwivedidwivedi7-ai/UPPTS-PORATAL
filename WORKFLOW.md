# WORKFLOW.md

# Transfer Request Workflow Specification

This document details the state machine transitions, actions, and constraints governing the lifecycle of a transfer application.

---

## 1. Workflow Pipeline

```
[ COMPUTER OPERATOR ]
   │
   ├── (Create Draft) ──────────────► [ DRAFT ]
   │                                     │
   └── (Submit Request)                  │
          │                              ▼
          └──────────────────────► [ DISTRICT_SP_REVIEW ]
                                         │
                 ┌───────────────────────┼──────────────────────┐
                 ▼                       ▼                      ▼
             (Reject)                 (Return)              (Recommend)
                 │                       │                      │
                 ▼                       ▼                      ▼
           [ REJECTED ]              [ DRAFT ]           [ SP_CC_REVIEW ]
         (Workflow Ends)         (Operator Edits                 │
                                  & Resubmits)                   │
                                                                 │
                                         ┌───────────────────────┴──────────┐
                                         ▼                                  ▼
                                      (Return)                           (Verify)
                                         │                                  │
                                         ▼                                  ▼
                                     [ DRAFT ]                       [ ADG_TS_REVIEW ]
                                 (Operator Edits                            │
                                  & Resubmits)                              │
                                                                            │
                                                     ┌──────────────────────┴──────────┐
                                                     ▼                                 ▼
                                                  (Reject)                         (Approve)
                                                     │                                 │
                                                     ▼                                 ▼
                                               [ REJECTED ]                    [ ORDER_GENERATION ]
                                             (Workflow Ends)                   (Status: APPROVED)
```

---

## 2. Stage Details and Transitions

### Stage 1: DRAFT
- **Initiator**: Computer Operator.
- **Allowed Actions**:
  - `Save Draft`: Keeps application in `DRAFT` status. Form fields can be edited.
  - `Submit`: Validates inputs and transitions the request.
- **Resulting Stage**: `DISTRICT_SP_REVIEW` (Status: `PENDING`).

### Stage 2: DISTRICT_SP_REVIEW
- **Reviewer**: District SP of the operator's current posting district.
- **Allowed Actions**:
  - `Recommend`: Approves the transfer recommendation at the district level. Transitions request to `SP_CC_REVIEW` (Status: `PENDING`).
  - `Reject`: Terminates the request immediately. Transitions request to `REJECTED` (Status: `REJECTED`). The workflow ends.
  - `Return for Correction`: Reverts the application. Transitions request to `DRAFT` (Status: `RETURNED`). Generates an in-app notification to the operator with remarks.
- **Constraint**: Rejection at this level terminates the workflow immediately.

### Stage 3: SP_CC_REVIEW
- **Reviewer**: SP Computer Centre at Technical Services Headquarters.
- **Allowed Actions**:
  - `Verify & Forward`: Confirms eligibility, document validity, and administrative criteria. Transitions request to `ADG_TS_REVIEW` (Status: `PENDING`).
  - `Return for Correction`: Reverts the application back to the operator for adjustments. Transitions request to `DRAFT` (Status: `RETURNED`).
- **Constraint**: Returns route the request back to `DRAFT` state. **The operator must resubmit the corrected application through their District SP again.**

### Stage 4: ADG_TS_REVIEW
- **Reviewer**: ADG Technical Services (Final Authority).
- **Allowed Actions**:
  - `Approve`: Confirms final administrative approval. Transitions request to `APPROVED` (triggers order generation).
  - `Reject`: Transitions request to `REJECTED` (Status: `REJECTED`). The workflow ends.

### Stage 5: ORDER_GENERATION
- **System Action**: Automagically triggers after ADG approval.
- **Process**:
  - Generates serial Order Number (`TS/TR/{Year}/{Sequence}`).
  - Generates QR-Code validation token and compiles a secure PDF.
  - Transitions request to `APPROVED` (Status: `APPROVED`). Dispatches notifications to the operator and District SP.

---

## 3. Core Business Logic Rules

1. **Rejection Rule**: If a District SP or the ADG Technical Services rejects an application, the status is set to `REJECTED`. The request is locked and cannot be modified, forwarded, or reactivated.
2. **Resubmission Rule**: When an application is returned at any stage (District SP or SP CC), it returns to `DRAFT` status and is assigned a `RETURNED` status state. Once edited by the operator, **resubmission starts the workflow over from the beginning (District SP level)**. The request cannot bypass the District SP.
3. **Audit Rule**: Every action (`SUBMIT`, `RECOMMEND`, `VERIFY`, `APPROVE`, `REJECT`, `RETURN`) must insert an immutable entry in the `approval_history` table containing the user ID, role, action, remarks, and time.
