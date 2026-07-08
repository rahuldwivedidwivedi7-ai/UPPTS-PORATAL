-- Districts (UP Police Key Districts)
INSERT INTO districts (district_id, district_name, district_code) VALUES
('e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'Lucknow', 'LKO'),
('a4a9db98-0f0e-4ab8-9104-9444bb21f37e', 'Kanpur Nagar', 'KAN'),
('f4534f3b-fa0c-4fa8-bc1c-cfdf47ea87c0', 'Gorakhpur', 'GKP'),
('b45efba3-a4c0-482a-a92c-15a452ef72cd', 'Varanasi', 'VAR'),
('c89dfae2-402a-43df-bc7a-594248ef72ba', 'Prayagraj', 'PRG'),
('d78cfba1-8f0a-429a-9e12-429a98ef72be', 'Ghaziabad', 'GZB');

-- Super Admin Login (Master Account)
-- Password Hash corresponds to: 'SecurePassword123'
INSERT INTO users (user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, "rank", posting_district, password_hash, email, mobile_number, role, status) VALUES
('a010a104-e0c2-48c6-bb4d-616c6dbe5b03', NULL, NULL, 'super_admin', 'super_admin', 'Super Admin', 'NA', '1980-01-01', 'MALE', 'Admin', 'HQ', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'admin.ts@uppolice.gov.in', '+919876543226', 'SUPER_ADMIN', 'ACTIVE');

