# API.md

# API Specifications

Base URL:
`/api/v1`

Authentication:
All protected endpoints require a JWT token passed in the `Authorization` header as:
`Authorization: Bearer <JWT_TOKEN>`

Standard Response Format:
```json
{
  "success": true,
  "message": "Status description message",
  "data": {}
}
```

---

## 1. Authentication Module

### Login
- **Endpoint**: `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "operator_pno123",
    "password": "SecurePassword123"
  }
  ```
- **Response (Success - OTP Triggered)**:
  ```json
  {
    "success": true,
    "message": "OTP sent to registered email and mobile.",
    "data": {
      "username": "operator_pno123",
      "otp_expires_at": "2026-07-02T17:35:00Z"
    }
  }
  ```

### Verify OTP
- **Endpoint**: `POST /auth/verify-otp`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "operator_pno123",
    "otp_code": "123456"
  }
  ```
- **Response (Success - JWT Issued)**:
  ```json
  {
    "success": true,
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "user_id": "4020a104-e0c2-48c6-bb4d-616c6dbe5b84",
        "username": "operator_pno123",
        "role": "COMPUTER_OPERATOR",
        "name": "Amit Kumar"
      }
    }
  }
  ```

### Logout
- **Endpoint**: `POST /auth/logout`
- **Access**: Protected (All Roles)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Logout successful."
  }
  ```

---

## 2. Master Configurations Module

### Get Districts List
- **Endpoint**: `GET /districts`
- **Access**: Protected (All Roles)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Districts list retrieved.",
    "data": [
      {
        "district_id": "673cf970-e4b2-4d0d-9b56-fb264fdbe3b9",
        "district_name": "Lucknow",
        "district_code": "LKO"
      },
      {
        "district_id": "7a2cbfe5-3b9e-4a6c-b7f5-234b67faefca",
        "district_name": "Kanpur Nagar",
        "district_code": "KAN"
      }
    ]
  }
  ```

---

## 3. Personnel Module

### Get Profile
- **Endpoint**: `GET /personnel/profile`
- **Access**: Protected (COMPUTER_OPERATOR)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Profile retrieved.",
    "data": {
      "personnel_id": "a90bbfe5-3b9e-4a6c-b7f5-234b67faefca",
      "pno": "PNO1234509",
      "name": "Amit Kumar",
      "grade": "GRADE_A",
      "designation": "Computer Operator Grade A",
      "date_of_birth": "1994-08-15",
      "joining_date": "2018-03-10",
      "mobile_number": "+919876543210",
      "email": "amit.kumar@uppolice.gov.in",
      "home_district": {
        "district_id": "893df870-e4b2-4d0d-9b56-fb264fdbe3a8",
        "district_name": "Gorakhpur",
        "district_code": "GKP"
      },
      "current_district": {
        "district_id": "673cf970-e4b2-4d0d-9b56-fb264fdbe3b9",
        "district_name": "Lucknow",
        "district_code": "LKO"
      },
      "current_posting": "District Computer Centre, Lucknow Lines"
    }
  }
  ```

---

## 4. Transfer Request Module

### Create Transfer Request
- **Endpoint**: `POST /transfer-requests`
- **Access**: Protected (COMPUTER_OPERATOR)
- **Request (Multipart Form-Data)**:
  - `target_district_id`: `"7a2cbfe5-3b9e-4a6c-b7f5-234b67faefca"`
  - `transfer_category`: `"MEDICAL"`
  - `reason`: `"Applying for transfer due to family medical requirements."`
  - `action`: `"SUBMIT"` or `"DRAFT"`
  - `files`: `[One or more supporting attachment files, max 5MB each]`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Transfer request submitted successfully.",
    "data": {
      "request_id": "522dfde5-3b9e-4a6c-b7f5-745c68faedba",
      "status": "PENDING",
      "current_stage": "DISTRICT_SP_REVIEW"
    }
  }
  ```

### Get My Requests
- **Endpoint**: `GET /transfer-requests/my`
- **Access**: Protected (COMPUTER_OPERATOR)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Requests retrieved.",
    "data": [
      {
        "request_id": "522dfde5-3b9e-4a6c-b7f5-745c68faedba",
        "transfer_category": "MEDICAL",
        "target_district_name": "Kanpur Nagar",
        "application_date": "2026-07-02T17:30:00Z",
        "status": "PENDING",
        "current_stage": "DISTRICT_SP_REVIEW"
      }
    ]
  }
  ```

### Get Request Details
- **Endpoint**: `GET /transfer-requests/:id`
- **Access**: Protected (All Roles - Subject to administrative context checks)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Request details retrieved.",
    "data": {
      "request_id": "522dfde5-3b9e-4a6c-b7f5-745c68faedba",
      "personnel": {
        "name": "Amit Kumar",
        "pno": "PNO1234509",
        "designation": "Computer Operator Grade A"
      },
      "source_district_name": "Lucknow",
      "target_district_name": "Kanpur Nagar",
      "transfer_category": "MEDICAL",
      "reason": "Applying for transfer due to family medical requirements.",
      "status": "PENDING",
      "current_stage": "DISTRICT_SP_REVIEW",
      "application_date": "2026-07-02T17:30:00Z",
      "documents": [
        {
          "document_id": "90ccfe5-3b9e-4a6c-b7f5-234b67faefca",
          "file_name": "medical_certificate.pdf",
          "file_path": "/uploads/documents/medical_certificate_123.pdf",
          "file_size": 1542321,
          "mime_type": "application/pdf"
        }
      ]
    }
  }
  ```

### Get Request History
- **Endpoint**: `GET /transfer-requests/:id/history`
- **Access**: Protected (All Authorized Roles)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Request history timeline retrieved.",
    "data": [
      {
        "approval_id": "b32dfde5-3b9e-4a6c-b7f5-745c68faed12",
        "action": "SUBMIT",
        "from_stage": "DRAFT",
        "to_stage": "DISTRICT_SP_REVIEW",
        "action_by": "Amit Kumar (Computer Operator)",
        "remarks": "Initial submission",
        "action_ip": "192.168.1.102",
        "action_date": "2026-07-02T17:30:00Z"
      },
      {
        "approval_id": "c45dfde5-3b9e-4a6c-b7f5-745c68faed34",
        "action": "RECOMMEND",
        "from_stage": "DISTRICT_SP_REVIEW",
        "to_stage": "SP_CC_REVIEW",
        "action_by": "S.P. Lucknow (District SP)",
        "remarks": "Highly recommended and forwarded.",
        "action_ip": "10.45.2.14",
        "action_date": "2026-07-02T17:42:00Z"
      }
    ]
  }
  ```

### Edit/Update Request
- **Endpoint**: `PUT /transfer-requests/:id`
- **Access**: Protected (COMPUTER_OPERATOR - Only allowed if status is `DRAFT` or `RETURNED`)
- **Request (Multipart Form-Data)**:
  - `target_district_id`: `"7a2cbfe5-3b9e-4a6c-b7f5-234b67faefca"`
  - `transfer_category`: `"MEDICAL"`
  - `reason`: `"Updated reason details..."`
  - `action`: `"SUBMIT"` (moves stage to `DISTRICT_SP_REVIEW` and status to `PENDING`)
  - `files`: `[Optional new attachments to append]`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Transfer request updated and submitted.",
    "data": {
      "request_id": "522dfde5-3b9e-4a6c-b7f5-745c68faedba",
      "status": "PENDING",
      "current_stage": "DISTRICT_SP_REVIEW"
    }
  }
  ```

---

## 5. Approval & Workflow Module

### Get Pending Requests
- **Endpoint**: `GET /approvals/pending`
- **Access**: Protected (DISTRICT_SP, SP_COMPUTER_CENTRE, ADG_TECHNICAL_SERVICES)
- **Query Filters**: `page`, `limit`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Pending requests list retrieved.",
    "data": {
      "requests": [
        {
          "request_id": "522dfde5-3b9e-4a6c-b7f5-745c68faedba",
          "applicant_name": "Amit Kumar",
          "pno": "PNO1234509",
          "designation": "Computer Operator Grade A",
          "source_district_name": "Lucknow",
          "target_district_name": "Kanpur Nagar",
          "transfer_category": "MEDICAL",
          "application_date": "2026-07-02T17:30:00Z"
        }
      ],
      "total_count": 1
    }
  }
  ```

### Action Transfer Request
- **Endpoint**: `POST /approvals/:requestId/action`
- **Access**: Protected (DISTRICT_SP, SP_COMPUTER_CENTRE, ADG_TECHNICAL_SERVICES)
- **Request Body**:
  ```json
  {
    "action": "RECOMMEND", 
    "remarks": "Details verified and forwarded for Technical Services HQ review."
  }
  ```
  *Allowed Actions per Role:*
  - **DISTRICT_SP**: `RECOMMEND`, `REJECT`, `RETURN`.
  - **SP_COMPUTER_CENTRE**: `VERIFY`, `RETURN`.
  - **ADG_TECHNICAL_SERVICES**: `APPROVE`, `REJECT`.
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Action recorded. Request progressed in workflow.",
    "data": {
      "request_id": "522dfde5-3b9e-4a6c-b7f5-745c68faedba",
      "status": "PENDING",
      "current_stage": "SP_CC_REVIEW"
    }
  }
  ```

---

## 6. Dashboard & Utilities Module

### Get Dashboard Statistics
- **Endpoint**: `GET /dashboard/stats`
- **Access**: Protected (All Roles - Response structure varies dynamically by role)
- **Response (Success - SP / ADG HQ Context)**:
  ```json
  {
    "success": true,
    "message": "Dashboard statistics retrieved.",
    "data": {
      "pending_count": 14,
      "approved_count": 85,
      "returned_count": 5,
      "rejected_count": 8,
      "total_processed": 98,
      "recent_activities": [
        {
          "message": "Amit Kumar's request verified by SP Computer Centre.",
          "timestamp": "2026-07-02T17:42:00Z"
        }
      ]
    }
  }
  ```

### Download Transfer Order PDF
- **Endpoint**: `GET /orders/:id/download`
- **Access**: Protected (All Authorized Roles)
- **Response**: Binary stream of PDF order.

### Verify Transfer Order (Public QR Verification)
- **Endpoint**: `GET /orders/verify/:qrCode`
- **Access**: Public
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Transfer order is authentic.",
    "data": {
      "order_number": "TS/TR/2026/001",
      "order_date": "2026-07-02",
      "employee_name": "Amit Kumar",
      "employee_number": "PNO1234509",
      "designation": "Computer Operator Grade A",
      "transferred_from": "Lucknow",
      "transferred_to": "Kanpur Nagar",
      "signed_by": "ADG Technical Services"
    }
  }
  ```

---

## 7. Notifications & Audits

### Get My Notifications
- **Endpoint**: `GET /notifications`
- **Access**: Protected (All Roles)
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Notifications retrieved.",
    "data": [
      {
        "notification_id": "90bbfe5-3b9e-4a6c-b7f5-234b67faefca",
        "subject": "Application Status Update",
        "message": "Your transfer request has been recommended by the District SP.",
        "read_status": false,
        "sent_at": "2026-07-02T17:40:00Z"
      }
    ]
  }
  ```

### Get Audit Logs
- **Endpoint**: `GET /audit-logs`
- **Access**: Protected (ADMIN)
- **Query Filters**: `user_id`, `module_name`, `action_type`, `start_date`, `end_date`
- **Response (Success)**:
  ```json
  {
    "success": true,
    "message": "Audit logs retrieved.",
    "data": [
      {
        "audit_id": "01bfe5-3b9e-4a6c-b7f5-234b67fae324",
        "username": "sp_lucknow",
        "action_type": "RECOMMEND_TRANSFER",
        "module_name": "TRANSFER",
        "details": {
          "request_id": "522dfde5-3b9e-4a6c-b7f5-745c68faedba",
          "from_stage": "DISTRICT_SP_REVIEW",
          "to_stage": "SP_CC_REVIEW"
        },
        "ip_address": "10.45.2.14",
        "created_at": "2026-07-02T17:40:00Z"
      }
    ]
  }
  ```
