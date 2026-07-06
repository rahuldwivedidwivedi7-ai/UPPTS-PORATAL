-- Add new profile fields to the users table
ALTER TABLE users
ADD COLUMN address VARCHAR(255) NULL,
ADD COLUMN aadhaar_number VARCHAR(12) UNIQUE NULL,
ADD COLUMN emergency_contact VARCHAR(15) NULL,
ADD COLUMN profile_photo_url VARCHAR(512) NULL,
ADD COLUMN batch_year INT NULL,
ADD COLUMN employee_category VARCHAR(50) NULL,
ADD COLUMN current_posting_date DATE NULL,
ADD COLUMN home_district_id VARCHAR(36) NULL,
ADD COLUMN joining_date DATE NULL;

-- Create the user_documents table
CREATE TABLE user_documents (
    document_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    document_type ENUM('AADHAAR', 'SERVICE_CERTIFICATE', 'MEDICAL_CERTIFICATE', 'SPOUSE_POSTING', 'DISABILITY', 'OTHER') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_user_documents_user ON user_documents(user_id);
