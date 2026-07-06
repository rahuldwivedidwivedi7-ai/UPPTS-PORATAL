-- Districts (UP Police Key Districts)
INSERT INTO districts (district_id, district_name, district_code) VALUES
('e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'Lucknow', 'LKO'),
('a4a9db98-0f0e-4ab8-9104-9444bb21f37e', 'Kanpur Nagar', 'KAN'),
('f4534f3b-fa0c-4fa8-bc1c-cfdf47ea87c0', 'Gorakhpur', 'GKP'),
('b45efba3-a4c0-482a-a92c-15a452ef72cd', 'Varanasi', 'VAR'),
('c89dfae2-402a-43df-bc7a-594248ef72ba', 'Prayagraj', 'PRG'),
('d78cfba1-8f0a-429a-9e12-429a98ef72be', 'Ghaziabad', 'GZB');

-- Personnel Profiles (Grade A & B Computer Operators under Tech Services)
INSERT INTO personnel (personnel_id, pno, name, grade, designation, date_of_birth, joining_date, home_district_id, current_district_id, current_posting, mobile_number, email, status) VALUES
-- Operator 1: Amit Kumar (Grade A, Home: Gorakhpur, Posted: Lucknow)
('522dfde5-3b9e-4a6c-b7f5-745c68faedba', '942050012', 'Amit Kumar', 'GRADE_A', 'Computer Operator Grade A', '1994-08-15', '2018-03-10', 
 'f4534f3b-fa0c-4fa8-bc1c-cfdf47ea87c0', 'e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'District Computer Centre, Lucknow Lines', '+919876543210', 'amit.kumar@uppolice.gov.in', 'ACTIVE'),

-- Operator 2: Rakesh Singh (Grade B, Home: Kanpur Nagar, Posted: Prayagraj)
('9b7f5ba4-e0c2-48c6-bb4d-616c6dbe5b84', '952050085', 'Rakesh Singh', 'GRADE_B', 'Computer Operator Grade B', '1995-11-22', '2019-07-15', 
 'a4a9db98-0f0e-4ab8-9104-9444bb21f37e', 'c89dfae2-402a-43df-bc7a-594248ef72ba', 'SSP Office Computer Cell, Prayagraj', '+919876543211', 'rakesh.singh@uppolice.gov.in', 'ACTIVE'),

-- Operator 3: Sita Verma (Grade A, Home: Varanasi, Posted: Ghaziabad)
('234b67fa-3b9e-4a6c-b7f5-234b67faefca', '962050124', 'Sita Verma', 'GRADE_A', 'Computer Operator Grade A', '1996-04-05', '2020-01-20', 
 'b45efba3-a4c0-482a-a92c-15a452ef72cd', 'd78cfba1-8f0a-429a-9e12-429a98ef72be', 'Cyber Cell, Ghaziabad Police Commissionerate', '+919876543212', 'sita.verma@uppolice.gov.in', 'ACTIVE'),

-- Operator 4: Mohammad Anas (Grade B, Home: Lucknow, Posted: Varanasi)
('745c68fa-e0c2-48c6-bb4d-745c68faedba', '972050231', 'Mohammad Anas', 'GRADE_B', 'Computer Operator Grade B', '1997-09-30', '2021-06-18', 
 'e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'b45efba3-a4c0-482a-a92c-15a452ef72cd', 'Computer Section, SP Office Varanasi', '+919876543213', 'mohammad.anas@uppolice.gov.in', 'ACTIVE');

-- Users Logins
-- Password Hash corresponds to: 'SecurePassword123'
INSERT INTO users (user_id, personnel_id, district_id, username, pno_number, full_name, father_name, dob, gender, "rank", posting_district, password_hash, email, mobile_number, role, status) VALUES
-- Computer Operator Logins (Mapped to Personnel records)
('c010a104-e0c2-48c6-bb4d-616c6dbe5b01', '522dfde5-3b9e-4a6c-b7f5-745c68faedba', NULL, '942050012', '942050012', 'Amit Kumar', 'Ramesh Kumar', '1994-08-15', 'MALE', 'Operator Grade A', 'Lucknow', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'amit.kumar@uppolice.gov.in', '+919876543210', 'COMPUTER_OPERATOR', 'ACTIVE'),
('c010a104-e0c2-48c6-bb4d-616c6dbe5b02', '9b7f5ba4-e0c2-48c6-bb4d-616c6dbe5b84', NULL, '952050085', '952050085', 'Rakesh Singh', 'Raju Singh', '1995-11-22', 'MALE', 'Operator Grade B', 'Prayagraj', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'rakesh.singh@uppolice.gov.in', '+919876543211', 'COMPUTER_OPERATOR', 'ACTIVE'),
('c010a104-e0c2-48c6-bb4d-616c6dbe5b03', '234b67fa-3b9e-4a6c-b7f5-234b67faefca', NULL, '962050124', '962050124', 'Sita Verma', 'Kamal Verma', '1996-04-05', 'FEMALE', 'Operator Grade A', 'Ghaziabad', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'sita.verma@uppolice.gov.in', '+919876543212', 'COMPUTER_OPERATOR', 'ACTIVE'),
('c010a104-e0c2-48c6-bb4d-616c6dbe5b04', '745c68fa-e0c2-48c6-bb4d-745c68faedba', NULL, '972050231', '972050231', 'Mohammad Anas', 'Mohammad Ali', '1997-09-30', 'MALE', 'Operator Grade B', 'Varanasi', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'mohammad.anas@uppolice.gov.in', '+919876543213', 'COMPUTER_OPERATOR', 'ACTIVE'),

-- District SP Logins (One for each current district where operators are posted)
('d010a104-e0c2-48c6-bb4d-616c6dbe5b01', NULL, 'e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'sp_lucknow', 'sp_lucknow', 'SP Lucknow', 'NA', '1980-01-01', 'MALE', 'SP', 'Lucknow', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'sp.lko@uppolice.gov.in', '+919876543220', 'DISTRICT_SP', 'ACTIVE'),
('d010a104-e0c2-48c6-bb4d-616c6dbe5b02', NULL, 'c89dfae2-402a-43df-bc7a-594248ef72ba', 'sp_prayagraj', 'sp_prayagraj', 'SP Prayagraj', 'NA', '1980-01-01', 'MALE', 'SP', 'Prayagraj', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'sp.prg@uppolice.gov.in', '+919876543221', 'DISTRICT_SP', 'ACTIVE'),
('d010a104-e0c2-48c6-bb4d-616c6dbe5b03', NULL, 'd78cfba1-8f0a-429a-9e12-429a98ef72be', 'sp_ghaziabad', 'sp_ghaziabad', 'SP Ghaziabad', 'NA', '1980-01-01', 'MALE', 'SP', 'Ghaziabad', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'sp.gzb@uppolice.gov.in', '+919876543222', 'DISTRICT_SP', 'ACTIVE'),
('d010a104-e0c2-48c6-bb4d-616c6dbe5b04', NULL, 'b45efba3-a4c0-482a-a92c-15a452ef72cd', 'sp_varanasi', 'sp_varanasi', 'SP Varanasi', 'NA', '1980-01-01', 'MALE', 'SP', 'Varanasi', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'sp.var@uppolice.gov.in', '+919876543223', 'DISTRICT_SP', 'ACTIVE'),

-- Technical Services Headquarters Administrative Logins
('a010a104-e0c2-48c6-bb4d-616c6dbe5b01', NULL, NULL, 'sp_computer_centre', 'sp_computer_centre', 'SP Computer Centre', 'NA', '1980-01-01', 'MALE', 'SP', 'HQ', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'spcc.hq@uppolice.gov.in', '+919876543224', 'SP_COMPUTER_CENTRE', 'ACTIVE'),
('a010a104-e0c2-48c6-bb4d-616c6dbe5b02', NULL, NULL, 'adg_tech_services', 'adg_tech_services', 'ADG Tech Services', 'NA', '1980-01-01', 'MALE', 'ADG', 'HQ', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'adgts.hq@uppolice.gov.in', '+919876543225', 'ADG_TECHNICAL_SERVICES', 'ACTIVE'),
('a010a104-e0c2-48c6-bb4d-616c6dbe5b04', NULL, NULL, 'ig_tech_services', 'ig_tech_services', 'IG Tech Services', 'NA', '1980-01-01', 'MALE', 'IG', 'HQ', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'igts.hq@uppolice.gov.in', '+919876543227', 'IG_TECHNICAL_SERVICES', 'ACTIVE'),
('a010a104-e0c2-48c6-bb4d-616c6dbe5b05', NULL, NULL, 'hq_reviewer', 'hq_reviewer', 'HQ Reviewer', 'NA', '1980-01-01', 'MALE', 'HQ Reviewer', 'HQ', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'hq.review@uppolice.gov.in', '+919876543228', 'HQ_REVIEWER', 'ACTIVE'),

-- Super Admin Login
('a010a104-e0c2-48c6-bb4d-616c6dbe5b03', NULL, NULL, 'super_admin', 'super_admin', 'Super Admin', 'NA', '1980-01-01', 'MALE', 'Admin', 'HQ', '$2a$10$IRO.4gRDCRZsB.V8g0kbc.krNUpYjPC5SkJICQhLIRldN6897dxze', 'admin.ts@uppolice.gov.in', '+919876543226', 'ADMIN', 'ACTIVE');
