-- Technical Services Headquarters Transfer Management System
-- Database Seed Data Script (seed.sql)

-- Clear existing data (in reverse dependency order)
TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE transfer_orders CASCADE;
TRUNCATE TABLE approval_history CASCADE;
TRUNCATE TABLE transfer_requests CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE personnel CASCADE;
TRUNCATE TABLE districts CASCADE;

-- 1. Seed Districts (UP Police Key Districts)
INSERT INTO districts (district_id, district_name, district_code) VALUES
('e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'Lucknow', 'LKO'),
('a4a9db98-0f0e-4ab8-9104-9444bb21f37e', 'Kanpur Nagar', 'KAN'),
('f4534f3b-fa0c-4fa8-bc1c-cfdf47ea87c0', 'Gorakhpur', 'GKP'),
('b45efba3-a4c0-482a-a92c-15a452ef72cd', 'Varanasi', 'VAR'),
('c89dfae2-402a-43df-bc7a-594248ef72ba', 'Prayagraj', 'PRG'),
('d78cfba1-8f0a-429a-9e12-429a98ef72be', 'Ghaziabad', 'GZB');

-- 2. Seed Technical Services Personnel (Computer Operators Grade A & B)
INSERT INTO personnel (personnel_id, pno, name, grade, designation, date_of_birth, joining_date, home_district_id, current_district_id, current_posting, mobile_number, email, status) VALUES
-- Operator 1: Amit Kumar (Grade A, Home: Gorakhpur, Posted: Lucknow)
('522dfde5-3b9e-4a6c-b7f5-745c68faedba', 'PNO942050012', 'Amit Kumar', 'GRADE_A', 'Computer Operator Grade A', '1994-08-15', '2018-03-10', 
 'f4534f3b-fa0c-4fa8-bc1c-cfdf47ea87c0', 'e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'District Computer Centre, Lucknow Lines', '+919876543210', 'amit.kumar@uppolice.gov.in', 'ACTIVE'),

-- Operator 2: Rakesh Singh (Grade B, Home: Kanpur Nagar, Posted: Prayagraj)
('9b7f5ba4-e0c2-48c6-bb4d-616c6dbe5b84', 'PNO952050085', 'Rakesh Singh', 'GRADE_B', 'Computer Operator Grade B', '1995-11-22', '2019-07-15', 
 'a4a9db98-0f0e-4ab8-9104-9444bb21f37e', 'c89dfae2-402a-43df-bc7a-594248ef72ba', 'SSP Office Computer Cell, Prayagraj', '+919876543211', 'rakesh.singh@uppolice.gov.in', 'ACTIVE'),

-- Operator 3: Sita Verma (Grade A, Home: Varanasi, Posted: Ghaziabad)
('234b67fa-3b9e-4a6c-b7f5-234b67faefca', 'PNO962050124', 'Sita Verma', 'GRADE_A', 'Computer Operator Grade A', '1996-04-05', '2020-01-20', 
 'b45efba3-a4c0-482a-a92c-15a452ef72cd', 'd78cfba1-8f0a-429a-9e12-429a98ef72be', 'Cyber Cell, Ghaziabad Police Commissionerate', '+919876543212', 'sita.verma@uppolice.gov.in', 'ACTIVE'),

-- Operator 4: Mohammad Anas (Grade B, Home: Lucknow, Posted: Varanasi)
('745c68fa-e0c2-48c6-bb4d-745c68faedba', 'PNO972050231', 'Mohammad Anas', 'GRADE_B', 'Computer Operator Grade B', '1997-09-30', '2021-06-18', 
 'e7d3b10b-0dbd-43cf-bc8b-cf4a85208f2a', 'b45efba3-a4c0-482a-a92c-15a452ef72cd', 'Computer Section, SP Office Varanasi', '+919876543213', 'mohammad.anas@uppolice.gov.in', 'ACTIVE');

-- 3. Seed Users (Logins mapped to roles)
-- Password Hash below corresponds to: 'SecurePassword123' (hashed using bcrypt)
INSERT INTO users (user_id, personnel_id, username, password_hash, email, mobile_number, role, status) VALUES
-- Computer Operator Logins (Mapped to Personnel records)
('c010a104-e0c2-48c6-bb4d-616c6dbe5b01', '522dfde5-3b9e-4a6c-b7f5-745c68faedba', 'PNO942050012', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'amit.kumar@uppolice.gov.in', '+919876543210', 'COMPUTER_OPERATOR', 'ACTIVE'),
('c010a104-e0c2-48c6-bb4d-616c6dbe5b02', '9b7f5ba4-e0c2-48c6-bb4d-616c6dbe5b84', 'PNO952050085', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'rakesh.singh@uppolice.gov.in', '+919876543211', 'COMPUTER_OPERATOR', 'ACTIVE'),
('c010a104-e0c2-48c6-bb4d-616c6dbe5b03', '234b67fa-3b9e-4a6c-b7f5-234b67faefca', 'PNO962050124', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'sita.verma@uppolice.gov.in', '+919876543212', 'COMPUTER_OPERATOR', 'ACTIVE'),
('c010a104-e0c2-48c6-bb4d-616c6dbe5b04', '745c68fa-e0c2-48c6-bb4d-745c68faedba', 'PNO972050231', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'mohammad.anas@uppolice.gov.in', '+919876543213', 'COMPUTER_OPERATOR', 'ACTIVE'),

-- District SP Logins (One for each current district where operators are posted)
('d010a104-e0c2-48c6-bb4d-616c6dbe5b01', NULL, 'sp_lucknow', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'sp.lko@uppolice.gov.in', '+919876543220', 'DISTRICT_SP', 'ACTIVE'),
('d010a104-e0c2-48c6-bb4d-616c6dbe5b02', NULL, 'sp_prayagraj', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'sp.prg@uppolice.gov.in', '+919876543221', 'DISTRICT_SP', 'ACTIVE'),
('d010a104-e0c2-48c6-bb4d-616c6dbe5b03', NULL, 'sp_ghaziabad', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'sp.gzb@uppolice.gov.in', '+919876543222', 'DISTRICT_SP', 'ACTIVE'),
('d010a104-e0c2-48c6-bb4d-616c6dbe5b04', NULL, 'sp_varanasi', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'sp.var@uppolice.gov.in', '+919876543223', 'DISTRICT_SP', 'ACTIVE'),

-- Technical Services Headquarters Administrative Logins
('a010a104-e0c2-48c6-bb4d-616c6dbe5b01', NULL, 'sp_computer_centre', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'spcc.hq@uppolice.gov.in', '+919876543224', 'SP_COMPUTER_CENTRE', 'ACTIVE'),
('a010a104-e0c2-48c6-bb4d-616c6dbe5b02', NULL, 'adg_tech_services', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'adgts.hq@uppolice.gov.in', '+919876543225', 'ADG_TECHNICAL_SERVICES', 'ACTIVE'),

-- Super Admin Login
('a010a104-e0c2-48c6-bb4d-616c6dbe5b03', NULL, 'super_admin', '$2a$12$R9h/lIPzIZf.g3vM1XhJk.f1j2Blyq6yE0MefEwGZ4g.Hk5w6y88S', 'admin.ts@uppolice.gov.in', '+919876543226', 'ADMIN', 'ACTIVE');
