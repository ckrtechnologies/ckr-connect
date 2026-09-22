-- ==============================================================================
-- CKR CONNECT ENTERPRISE CRM — FULL DATABASE DDL & SEED SCRIPT
-- Schema: connect
-- Compatible with PostgreSQL 14+ / Supabase SQL Editor
-- Per docs/SCHEMA.md v1.0, docs/PRD.md v1.0 & docs/AGENTS.md
-- ==============================================================================

-- 1. Ensure required extensions exist in extensions schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- 2. Ensure schema exists
CREATE SCHEMA IF NOT EXISTS connect;

-- Set search_path for execution
SET search_path TO connect, extensions, public;

-- ------------------------------------------------------------------------------
-- 2.1 CLEAN TEARDOWN (Ensures clean recreation if tables existed from earlier run)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS connect.notifications CASCADE;
DROP TABLE IF EXISTS connect.attendance CASCADE;
DROP TABLE IF EXISTS connect.holidays CASCADE;
DROP TABLE IF EXISTS connect.lead_status_history CASCADE;
DROP TABLE IF EXISTS connect.lead_assignment_history CASCADE;
DROP TABLE IF EXISTS connect.lead_interactions CASCADE;
DROP TABLE IF EXISTS connect.leads CASCADE;
DROP TABLE IF EXISTS connect.accounts CASCADE;
DROP TABLE IF EXISTS connect.tags CASCADE;
DROP TABLE IF EXISTS connect.users CASCADE;

DROP TYPE IF EXISTS connect.notification_type CASCADE;
DROP TYPE IF EXISTS connect.attendance_status CASCADE;
DROP TYPE IF EXISTS connect.interaction_type CASCADE;
DROP TYPE IF EXISTS connect.lead_invalid_reason CASCADE;
DROP TYPE IF EXISTS connect.lead_priority CASCADE;
DROP TYPE IF EXISTS connect.lead_status CASCADE;
DROP TYPE IF EXISTS connect.lead_deal_type CASCADE;
DROP TYPE IF EXISTS connect.lead_source CASCADE;
DROP TYPE IF EXISTS connect.tag_type CASCADE;
DROP TYPE IF EXISTS connect.user_status CASCADE;
DROP TYPE IF EXISTS connect.user_role CASCADE;

-- ------------------------------------------------------------------------------
-- 3. CUSTOM ENUM TYPES
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.user_role AS ENUM ('admin', 'bdm');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.user_status AS ENUM ('active', 'suspended', 'resigned', 'inactive');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tag_type' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.tag_type AS ENUM ('product', 'service');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.lead_source AS ENUM (
            'website', 'referral', 'cold_call', 'social_media', 
            'walk_in', 'meta_lead_ads', 'whatsapp_ads', 'bdm_inbound', 'manual_admin', 'other'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_deal_type' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.lead_deal_type AS ENUM ('new_business', 'upsell', 'resell');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.lead_status AS ENUM (
            'new', 'contacted', 'follow_up', 'proposal', 'won', 'lost', 'invalid'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_priority' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.lead_priority AS ENUM ('high', 'medium', 'low');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_invalid_reason' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.lead_invalid_reason AS ENUM (
            'wrong_number', 'duplicate', 'not_interested', 
            'spam', 'out_of_service_area', 'other'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interaction_type' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.interaction_type AS ENUM (
            'call', 'whatsapp', 'email', 'meeting', 'site_visit', 'note'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.attendance_status AS ENUM (
            'present', 'absent', 'half_day', 'leave'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type' AND typnamespace = 'connect'::regnamespace) THEN
        CREATE TYPE connect.notification_type AS ENUM (
            'followup_due', 'followup_overdue', 'lead_assigned', 'system', 'other'
        );
    END IF;
END
$$;

-- ------------------------------------------------------------------------------
-- 4. TABLES
-- ------------------------------------------------------------------------------

-- (1) USERS (Staff Accounts: Admin & BDM)
CREATE TABLE IF NOT EXISTS connect.users (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    employee_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role connect.user_role NOT NULL,
    designation TEXT,
    department TEXT,
    date_of_joining DATE,
    profile_photo_url TEXT,
    sales_target NUMERIC(14, 2) NOT NULL DEFAULT 500000.00,
    status connect.user_status NOT NULL DEFAULT 'active',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    force_password_reset BOOLEAN NOT NULL DEFAULT TRUE,
    has_seen_onboarding BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (2) TAGS (Product/Service Master)
CREATE TABLE IF NOT EXISTS connect.tags (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type connect.tag_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (3) ACCOUNTS (Company/Institution Accounts for Upsell & Resell)
CREATE TABLE IF NOT EXISTS connect.accounts (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT,
    city TEXT,
    created_by UUID NOT NULL REFERENCES connect.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (4) LEADS (Primary Pipeline Entity)
CREATE TABLE IF NOT EXISTS connect.leads (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    name TEXT NOT NULL,
    company_name TEXT,
    account_id UUID REFERENCES connect.accounts(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    email TEXT,
    city TEXT,
    state TEXT,
    source connect.lead_source NOT NULL DEFAULT 'other',
    campaign_ref TEXT,
    tag_id UUID NOT NULL REFERENCES connect.tags(id) ON DELETE RESTRICT,
    sub_requirement TEXT,
    deal_type connect.lead_deal_type NOT NULL DEFAULT 'new_business',
    assigned_to UUID REFERENCES connect.users(id) ON DELETE SET NULL,
    status connect.lead_status NOT NULL DEFAULT 'new',
    priority connect.lead_priority,
    budget NUMERIC(14, 2),
    expected_value NUMERIC(14, 2),
    probability_override INTEGER CHECK (probability_override IS NULL OR (probability_override >= 0 AND probability_override <= 100)),
    won_amount NUMERIC(14, 2),
    next_followup_date DATE,
    last_followup_date DATE,
    followup_count INTEGER NOT NULL DEFAULT 0,
    brd_url TEXT,
    lost_reason TEXT,
    invalid_reason connect.lead_invalid_reason,
    ai_score INTEGER CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 100)),
    ai_score_updated_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES connect.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (5) LEAD INTERACTIONS (Append-Only Calling/Meeting History)
CREATE TABLE IF NOT EXISTS connect.lead_interactions (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES connect.leads(id) ON DELETE CASCADE,
    bdm_id UUID NOT NULL REFERENCES connect.users(id) ON DELETE RESTRICT,
    type connect.interaction_type NOT NULL,
    call_result VARCHAR(50),
    call_result_label VARCHAR(100),
    call_result_type VARCHAR(20) DEFAULT 'positive' CHECK (call_result_type IN ('positive', 'neutral', 'negative')),
    notes TEXT NOT NULL,
    status_snapshot TEXT NOT NULL DEFAULT 'follow_up',
    next_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (6) LEAD ASSIGNMENT HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS connect.lead_assignment_history (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES connect.leads(id) ON DELETE CASCADE,
    assigned_from UUID REFERENCES connect.users(id) ON DELETE SET NULL,
    assigned_to UUID NOT NULL REFERENCES connect.users(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES connect.users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (7) LEAD STATUS HISTORY (Audit Trail)
CREATE TABLE IF NOT EXISTS connect.lead_status_history (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES connect.leads(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID NOT NULL REFERENCES connect.users(id) ON DELETE RESTRICT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (8) ATTENDANCE (Daily Staff Attendance Matrix)
CREATE TABLE IF NOT EXISTS connect.attendance (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    bdm_id UUID NOT NULL REFERENCES connect.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status connect.attendance_status NOT NULL DEFAULT 'present',
    correction_reason TEXT,
    edited_by UUID REFERENCES connect.users(id) ON DELETE SET NULL,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_attendance_bdm_date UNIQUE (bdm_id, date)
);

-- (9) HOLIDAYS (Official Company Holiday Master)
CREATE TABLE IF NOT EXISTS connect.holidays (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_by UUID REFERENCES connect.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- (10) NOTIFICATIONS (In-App Notification Feed)
CREATE TABLE IF NOT EXISTS connect.notifications (
    id UUID PRIMARY KEY DEFAULT extensions.gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES connect.users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES connect.leads(id) ON DELETE SET NULL,
    type connect.notification_type NOT NULL DEFAULT 'other',
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES (Per SCHEMA.md & AGENTS.md §9)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON connect.leads (assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON connect.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_tag_id ON connect.leads (tag_id);
CREATE INDEX IF NOT EXISTS idx_leads_account_id ON connect.leads (account_id);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup_date ON connect.leads (next_followup_date);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON connect.leads (created_at);

CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON connect.lead_interactions (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_bdm_created ON connect.lead_interactions (bdm_id, created_at);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_call_result_type ON connect.lead_interactions (call_result_type);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_created_at ON connect.lead_interactions (created_at);

CREATE INDEX IF NOT EXISTS idx_lead_status_history_lead_id ON connect.lead_status_history (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_assignment_history_lead_id ON connect.lead_assignment_history (lead_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON connect.notifications (user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_accounts_name ON connect.accounts (name);

-- ------------------------------------------------------------------------------
-- 6. TRIGGER FUNCTIONS (Updated Timestamp Management)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION connect.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON connect.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON connect.users
FOR EACH ROW EXECUTE FUNCTION connect.trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_accounts_updated_at ON connect.accounts;
CREATE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON connect.accounts
FOR EACH ROW EXECUTE FUNCTION connect.trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON connect.leads;
CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON connect.leads
FOR EACH ROW EXECUTE FUNCTION connect.trigger_set_updated_at();

-- ------------------------------------------------------------------------------
-- 7. PERMISSIONS & GRANTS FOR connect_user
-- ------------------------------------------------------------------------------
GRANT USAGE, CREATE ON SCHEMA connect TO connect_user;
GRANT USAGE ON SCHEMA extensions TO connect_user;
GRANT ALL ON ALL TABLES IN SCHEMA connect TO connect_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA connect TO connect_user;
GRANT ALL ON ALL ROUTINES IN SCHEMA connect TO connect_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA connect GRANT ALL ON TABLES TO connect_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA connect GRANT ALL ON SEQUENCES TO connect_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA connect GRANT ALL ON ROUTINES TO connect_user;

-- ------------------------------------------------------------------------------
-- 8. INITIAL SEED DATA
-- ------------------------------------------------------------------------------

-- (A) Staff Accounts (Password for all accounts is: password@1)
-- Bcrypt hash generated with cost 10: $2a$10$w85YFmE2R3aK9j7QyZ8O..G2P6yK0P6f1R1sXhG7YmX9P0f1R1sXh
-- We use pgcrypto crypt('password@1', gen_salt('bf', 10)) for verified compatibility
INSERT INTO connect.users (id, employee_id, name, email, phone, password_hash, role, designation, department, sales_target, is_active, force_password_reset, has_seen_onboarding)
VALUES 
    (
        '10000000-0000-0000-0000-000000000001',
        'CKR-ADM-001',
        'Chandan Mallik',
        'chandan@ckrtechnologies.in',
        '+919876543210',
        extensions.crypt('password@1', extensions.gen_salt('bf', 10)),
        'admin',
        'Co-Founder & CTO',
        'Leadership',
        0.00,
        TRUE,
        FALSE,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'CKR-BDM-001',
        'Aarav Sharma',
        'aarav.sharma@ckrtechnologies.in',
        '+919811234567',
        extensions.crypt('password@1', extensions.gen_salt('bf', 10)),
        'bdm',
        'Senior BDM',
        'Sales',
        600000.00,
        TRUE,
        FALSE,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'CKR-BDM-002',
        'Priya Patel',
        'priya.patel@ckrtechnologies.in',
        '+919723456789',
        extensions.crypt('password@1', extensions.gen_salt('bf', 10)),
        'bdm',
        'BDM - Education ERP',
        'Sales',
        500000.00,
        TRUE,
        FALSE,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        'CKR-BDM-003',
        'Rohan Verma',
        'rohan.verma@ckrtechnologies.in',
        '+919654321098',
        extensions.crypt('password@1', extensions.gen_salt('bf', 10)),
        'bdm',
        'BDM - Custom Dev',
        'Sales',
        500000.00,
        TRUE,
        FALSE,
        TRUE
    ),
    (
        '10000000-0000-0000-0000-000000000005',
        'CKR-BDM-004',
        'Ananya Iyer',
        'ananya.iyer@ckrtechnologies.in',
        '+919445678901',
        extensions.crypt('password@1', extensions.gen_salt('bf', 10)),
        'bdm',
        'Associate BDM',
        'Sales',
        400000.00,
        TRUE,
        TRUE,
        FALSE
    )
ON CONFLICT (employee_id) DO NOTHING;

-- (B) Product / Service Masters (Tags)
INSERT INTO connect.tags (id, name, type, is_active)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'School Management ERP', 'product', TRUE),
    ('20000000-0000-0000-0000-000000000002', 'Custom App & Web Dev', 'service', TRUE),
    ('20000000-0000-0000-0000-000000000003', 'Hospital ERP Suite', 'product', TRUE),
    ('20000000-0000-0000-0000-000000000004', 'Warehouse & Inventory ERP', 'product', FALSE),
    ('20000000-0000-0000-0000-000000000005', 'Custom Mobile App Development', 'service', TRUE),
    ('20000000-0000-0000-0000-000000000006', 'Cloud & DevOps Consulting', 'service', TRUE)
ON CONFLICT (name) DO NOTHING;

-- (C) Holidays Master (2026 Calendar)
INSERT INTO connect.holidays (id, date, name, created_by)
VALUES
    ('30000000-0000-0000-0000-000000000001', '2026-01-26', 'Republic Day', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000002', '2026-03-04', 'Holi', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000003', '2026-08-15', 'Independence Day', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000004', '2026-10-02', 'Gandhi Jayanti', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000005', '2026-10-20', 'Dussehra', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000006', '2026-11-08', 'Diwali', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000007', '2026-12-25', 'Christmas', '10000000-0000-0000-0000-000000000001')
ON CONFLICT (date) DO NOTHING;

-- (D) Sample Accounts (Companies)
INSERT INTO connect.accounts (id, name, city, state, created_by)
VALUES
    ('40000000-0000-0000-0000-000000000001', 'Delhi Public School Society', 'New Delhi', 'Delhi', '10000000-0000-0000-0000-000000000001'),
    ('40000000-0000-0000-0000-000000000002', 'Oakridge International Schools', 'Hyderabad', 'Telangana', '10000000-0000-0000-0000-000000000001'),
    ('40000000-0000-0000-0000-000000000003', 'Apex Multispeciality Hospital', 'Pune', 'Maharashtra', '10000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- (E) Sample Leads
INSERT INTO connect.leads (
    id, name, company_name, account_id, phone, email, city, state, 
    source, tag_id, deal_type, assigned_to, status, priority, 
    budget, expected_value, won_amount, next_followup_date, lost_reason, invalid_reason, created_by
)
VALUES
    (
        '50000000-0000-0000-0000-000000000001',
        'Dr. Rajesh Khurana',
        'Delhi Public School',
        '40000000-0000-0000-0000-000000000001',
        '+919812345678',
        'principal@dpsdelhi.edu.in',
        'New Delhi',
        'Delhi',
        'website',
        '20000000-0000-0000-0000-000000000001',
        'new_business',
        '10000000-0000-0000-0000-000000000002',
        'follow_up',
        'high',
        350000,
        320000,
        NULL,
        '2026-09-22',
        NULL,
        NULL,
        '10000000-0000-0000-0000-000000000001'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        'Vikramaditya Roy',
        'Roy Logistics & Cargo',
        NULL,
        '+919876541230',
        'v.roy@roylogistics.in',
        'Mumbai',
        'Maharashtra',
        'referral',
        '20000000-0000-0000-0000-000000000002',
        'new_business',
        '10000000-0000-0000-0000-000000000003',
        'proposal',
        'high',
        750000,
        700000,
        NULL,
        '2026-09-23',
        NULL,
        NULL,
        '10000000-0000-0000-0000-000000000001'
    ),
    (
        '50000000-0000-0000-0000-000000000003',
        'Meenakshi Sundaram',
        'Oakridge International',
        '40000000-0000-0000-0000-000000000002',
        '+919890123456',
        'admin@oakridge.edu.in',
        'Hyderabad',
        'Telangana',
        'cold_call',
        '20000000-0000-0000-0000-000000000001',
        'upsell',
        '10000000-0000-0000-0000-000000000002',
        'won',
        'high',
        450000,
        450000,
        450000,
        NULL,
        NULL,
        NULL,
        '10000000-0000-0000-0000-000000000001'
    ),
    (
        '50000000-0000-0000-0000-000000000004',
        'Manish Kothari',
        'Kothari Agro Commodities',
        NULL,
        '+919714023456',
        'manish@kothariagro.com',
        'Ahmedabad',
        'Gujarat',
        'social_media',
        '20000000-0000-0000-0000-000000000002',
        'new_business',
        '10000000-0000-0000-0000-000000000004',
        'new',
        'medium',
        400000,
        400000,
        NULL,
        '2026-09-23',
        NULL,
        NULL,
        '10000000-0000-0000-0000-000000000001'
    ),
    (
        '50000000-0000-0000-0000-000000000005',
        'Suresh Chandra',
        'Chandra Automotives Pvt Ltd',
        NULL,
        '+919988011223',
        'suresh@chandraauto.co.in',
        'Indore',
        'Madhya Pradesh',
        'website',
        '20000000-0000-0000-0000-000000000005',
        'new_business',
        '10000000-0000-0000-0000-000000000004',
        'lost',
        'low',
        180000,
        180000,
        NULL,
        NULL,
        'Chose a local vendor offering ready-made WordPress template for ₹40,000.',
        NULL,
        '10000000-0000-0000-0000-000000000001'
    ),
    (
        '50000000-0000-0000-0000-000000000006',
        'Amitabh Sen',
        'Kolkata Retail Mart',
        NULL,
        '+919000000000',
        'test@nowhere.com',
        'Kolkata',
        'West Bengal',
        'website',
        '20000000-0000-0000-0000-000000000003',
        'new_business',
        '10000000-0000-0000-0000-000000000003',
        'invalid',
        'low',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'wrong_number',
        '10000000-0000-0000-0000-000000000001'
    )
ON CONFLICT DO NOTHING;

-- (F) Sample Lead Interactions (Telecalling Ledger)
INSERT INTO connect.lead_interactions (
    id, lead_id, bdm_id, type, call_result, call_result_label, call_result_type, 
    notes, status_snapshot, next_action, created_at
)
VALUES
    (
        '60000000-0000-0000-0000-000000000001',
        '50000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        'call',
        'terms_agreed',
        'Terms Agreed / Deal Finalizing',
        'positive',
        'Followed up with Dr. Rajesh Khurana on contract terms. Agreed on ₹3,20,000 for School ERP with biometric integration.',
        'proposal',
        'Send final agreement copy for trustee signatures.',
        '2026-09-22 09:45:00+00'
    ),
    (
        '60000000-0000-0000-0000-000000000002',
        '50000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000003',
        'whatsapp',
        'demo_scheduled',
        'Demo Video Sent / Follow-up Set',
        'positive',
        'Sent UI demo video of driver dispatch app to Vikramaditya Roy. Addressed offline GPS sync query.',
        'proposal',
        'Call at 4:30 PM for architecture review.',
        '2026-09-22 10:30:00+00'
    ),
    (
        '60000000-0000-0000-0000-000000000003',
        '50000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        'call',
        'no_answer',
        'Ringing / No Answer',
        'neutral',
        'Called office reception line, principal was in trustee assembly. Requested return call.',
        'follow_up',
        'Follow up afternoon at 3:00 PM.',
        '2026-09-21 11:20:00+00'
    ),
    (
        '60000000-0000-0000-0000-000000000004',
        '50000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000002',
        'meeting',
        'terms_agreed',
        'Trust Approval / Contract Signed',
        'positive',
        'Final contract signing with Oakridge board. Agreed on ₹4,50,000 complete ERP license.',
        'won',
        'Handover to deployment & engineering team.',
        '2026-09-14 16:00:00+00'
    )
ON CONFLICT DO NOTHING;

-- (G) Lead Status History
INSERT INTO connect.lead_status_history (id, lead_id, old_status, new_status, changed_by, changed_at)
VALUES
    ('70000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'new', 'contacted', '10000000-0000-0000-0000-000000000002', '2026-09-04 11:00:00+00'),
    ('70000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'contacted', 'follow_up', '10000000-0000-0000-0000-000000000002', '2026-09-08 15:20:00+00'),
    ('70000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000003', 'proposal', 'won', '10000000-0000-0000-0000-000000000002', '2026-09-14 16:00:00+00'),
    ('70000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000005', 'contacted', 'lost', '10000000-0000-0000-0000-000000000004', '2026-09-12 14:30:00+00'),
    ('70000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000006', 'new', 'invalid', '10000000-0000-0000-0000-000000000003', '2026-09-16 15:15:00+00')
ON CONFLICT DO NOTHING;

-- (H) Attendance Matrix
INSERT INTO connect.attendance (id, bdm_id, date, check_in_time, check_out_time, status, edited_by, edited_at)
VALUES
    -- Today (2026-09-22)
    ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '2026-09-22', '2026-09-22 09:28:14+00', NULL, 'present', NULL, NULL),
    ('80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '2026-09-22', '2026-09-22 09:45:00+00', NULL, 'present', NULL, NULL),
    ('80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', '2026-09-22', NULL, NULL, 'leave', '10000000-0000-0000-0000-000000000001', '2026-09-22 08:30:00+00'),
    ('80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', '2026-09-22', '2026-09-22 10:05:00+00', NULL, 'half_day', NULL, NULL),
    -- Yesterday (2026-09-21)
    ('80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', '2026-09-21', '2026-09-21 09:30:00+00', '2026-09-21 18:45:00+00', 'present', NULL, NULL),
    ('80000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', '2026-09-21', '2026-09-21 09:20:00+00', '2026-09-21 18:30:00+00', 'present', NULL, NULL),
    ('80000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', '2026-09-21', '2026-09-21 09:55:00+00', '2026-09-21 18:15:00+00', 'present', NULL, NULL),
    ('80000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', '2026-09-21', NULL, NULL, 'absent', NULL, NULL)
ON CONFLICT (bdm_id, date) DO NOTHING;

-- (I) Notifications Feed
INSERT INTO connect.notifications (id, user_id, lead_id, type, message, is_read, created_at)
VALUES
    (
        '90000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000002',
        '50000000-0000-0000-0000-000000000001',
        'followup_due',
        'Follow-up due today with Dr. Rajesh Khurana (Delhi Public School)',
        FALSE,
        '2026-09-22 03:30:00+00'
    ),
    (
        '90000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000003',
        '50000000-0000-0000-0000-000000000002',
        'followup_overdue',
        'OVERDUE: Follow-up was due yesterday with Vikramaditya Roy (Roy Logistics & Cargo)',
        FALSE,
        '2026-09-22 03:30:00+00'
    ),
    (
        '90000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000001',
        '50000000-0000-0000-0000-000000000003',
        'other',
        'Lead Won! Deal closed for ₹4,50,000 (Oakridge International)',
        FALSE,
        '2026-09-14 16:00:00+00'
    )
ON CONFLICT DO NOTHING;

-- Verification summary query
SELECT 'connect tables created successfully' AS status, count(*) AS table_count
FROM information_schema.tables 
WHERE table_schema = 'connect';
