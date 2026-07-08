-- UP Police Technical Services Headquarters Transfer Management System
-- Schema Initialization Migration for PostgreSQL

-- 1. Master Table: Districts
CREATE TABLE districts (
    district_id VARCHAR(36) PRIMARY KEY,
    district_name VARCHAR(100) UNIQUE NOT NULL,
    district_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Core Table: Personnel
CREATE TABLE personnel (
    personnel_id VARCHAR(36) PRIMARY KEY,
    pno VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    grade VARCHAR(20) NOT NULL CHECK (grade IN ('GRADE_A', 'GRADE_B')),
    designation VARCHAR(100) NOT NULL CHECK (designation IN ('Computer Operator Grade A', 'Computer Operator Grade B')),
    date_of_birth DATE NOT NULL,
    joining_date DATE NOT NULL,
    home_district_id VARCHAR(36) NOT NULL REFERENCES districts(district_id),
    current_district_id VARCHAR(36) NOT NULL REFERENCES districts(district_id),
    current_posting VARCHAR(200) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'RETIRED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Core Table: Users
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    personnel_id VARCHAR(36) UNIQUE NULL REFERENCES personnel(personnel_id) ON DELETE CASCADE,
    district_id VARCHAR(36) NULL REFERENCES districts(district_id),
    username VARCHAR(100) UNIQUE NOT NULL,
    pno_number VARCHAR(50) UNIQUE NULL,
    full_name VARCHAR(150) NOT NULL,
    father_name VARCHAR(150) NULL,
    dob DATE NULL,
    gender VARCHAR(10) NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    "rank" VARCHAR(100) NOT NULL,
    posting_district VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    address VARCHAR(255) NULL,
    aadhaar_number VARCHAR(12) UNIQUE NULL,
    emergency_contact VARCHAR(15) NULL,
    profile_photo_url VARCHAR(512) NULL,
    batch_year INT NULL,
    employee_category VARCHAR(50) NULL,
    current_posting_date DATE NULL,
    home_district_id VARCHAR(36) NULL,
    joining_date DATE NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'APPLICANT', 'DISTRICT_ADMIN', 'DISTRICT_SP', 'TS_UPCC_ADMIN', 'TS_UPCC_SP', 'TS_DIG_IG', 'TSHQ_ADMIN', 'ADG_TS')),
    force_password_change BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    failed_login_attempts INT DEFAULT 0,
    lockout_until TIMESTAMP NULL,
    reporting_authority_user_id VARCHAR(36) NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Self-referential constraint for Users
ALTER TABLE users ADD CONSTRAINT fk_reporting_authority FOREIGN KEY (reporting_authority_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- 4. Core Table: Transfer Requests
CREATE TABLE transfer_requests (
    request_id VARCHAR(36) PRIMARY KEY,
    personnel_id VARCHAR(36) NOT NULL REFERENCES personnel(personnel_id),
    source_district_id VARCHAR(36) NOT NULL REFERENCES districts(district_id),
    preference_1_district_id VARCHAR(36) NOT NULL REFERENCES districts(district_id),
    preference_2_district_id VARCHAR(36) NULL REFERENCES districts(district_id),
    preference_3_district_id VARCHAR(36) NULL REFERENCES districts(district_id),
    transfer_category VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    current_stage VARCHAR(30) DEFAULT 'DRAFT' CHECK (current_stage IN ('DRAFT', 'DISTRICT_ADMIN_SCRUTINY', 'DISTRICT_SP_APPROVAL', 'TS_ADMIN_VERIFICATION', 'SP_TS_APPROVAL', 'DIG_IG_APPROVAL', 'TSHQ_ADMIN_SCRUTINY', 'ADG_FINAL_DECISION', 'APPROVED', 'REJECTED')),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'RETURNED')),
    application_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Core Table: Documents
CREATE TABLE documents (
    document_id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL REFERENCES transfer_requests(request_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Core Table: Approval History (Audit Trail)
CREATE TABLE approval_history (
    approval_id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL REFERENCES transfer_requests(request_id) ON DELETE CASCADE,
    action_by_user_id VARCHAR(36) NOT NULL REFERENCES users(user_id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('SUBMIT', 'RECOMMEND', 'VERIFY', 'APPROVE', 'REJECT', 'RETURN')),
    from_stage VARCHAR(30) NOT NULL CHECK (from_stage IN ('DRAFT', 'DISTRICT_ADMIN_SCRUTINY', 'DISTRICT_SP_APPROVAL', 'TS_ADMIN_VERIFICATION', 'SP_TS_APPROVAL', 'DIG_IG_APPROVAL', 'TSHQ_ADMIN_SCRUTINY', 'ADG_FINAL_DECISION', 'APPROVED', 'REJECTED')),
    to_stage VARCHAR(30) NOT NULL CHECK (to_stage IN ('DRAFT', 'DISTRICT_ADMIN_SCRUTINY', 'DISTRICT_SP_APPROVAL', 'TS_ADMIN_VERIFICATION', 'SP_TS_APPROVAL', 'DIG_IG_APPROVAL', 'TSHQ_ADMIN_SCRUTINY', 'ADG_FINAL_DECISION', 'APPROVED', 'REJECTED')),
    remarks TEXT NULL,
    action_ip VARCHAR(45) NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Core Table: Transfer Orders
CREATE TABLE transfer_orders (
    order_id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(36) UNIQUE NOT NULL REFERENCES transfer_requests(request_id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    order_date TIMESTAMP NOT NULL,
    pdf_path VARCHAR(512) NULL,
    qr_verification_code VARCHAR(100) NULL,
    signed_by VARCHAR(36) NOT NULL REFERENCES users(user_id),
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Core Table: System Audit Logs
CREATE TABLE audit_logs (
    log_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Core Table: User Documents
CREATE TABLE user_documents (
    document_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    document_type VARCHAR(30) NOT NULL CHECK (document_type IN ('AADHAAR', 'SERVICE_CERTIFICATE', 'MEDICAL_CERTIFICATE', 'SPOUSE_POSTING', 'DISABILITY', 'OTHER')),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Optimization
CREATE INDEX idx_personnel_pno ON personnel(pno);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_requests_personnel ON transfer_requests(personnel_id);
CREATE INDEX idx_documents_request ON documents(request_id);
CREATE INDEX idx_approval_history_req ON approval_history(request_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_user_documents_user ON user_documents(user_id);
