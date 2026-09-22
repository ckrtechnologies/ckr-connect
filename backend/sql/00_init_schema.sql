-- ==============================================================================
-- CHECK ALL SCHEMAS (Run this to verify existing schemas on the database)
-- ==============================================================================
SELECT schema_name 
FROM information_schema.schemata
WHERE schema_name NOT IN (
  'public',
  'auth',
  'storage',
  'realtime',
  'extensions',
  'graphql',
  'graphql_public',
  'pgbouncer',
  'pgsodium',
  'pgsodium_masks',
  'vault',
  'net',
  'pgtle',
  'cron',
  'information_schema',
  '_realtime',
  'supabase_functions'
)
AND schema_name NOT LIKE 'pg\_%'
ORDER BY schema_name;

-- ==============================================================================
-- PROVISION NEW PROJECT: connect
-- ==============================================================================

-- 1. Create Schema and Dedicated Login Role
CREATE SCHEMA IF NOT EXISTS connect;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'connect_user') THEN
        CREATE ROLE connect_user WITH LOGIN PASSWORD 'password@1';
    ELSE
        ALTER ROLE connect_user WITH PASSWORD 'password@1';
    END IF;
END
$$;

-- 2. Grant Schema Access & Set Search Path
GRANT USAGE, CREATE ON SCHEMA connect TO connect_user;
GRANT USAGE ON SCHEMA extensions TO connect_user;
ALTER ROLE connect_user SET search_path TO connect, extensions;

-- 3. Grant Table & Sequence Privileges (Current and Future)
GRANT ALL ON ALL TABLES IN SCHEMA connect TO connect_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA connect TO connect_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA connect GRANT ALL ON TABLES TO connect_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA connect GRANT ALL ON SEQUENCES TO connect_user;

-- 4. Lock Out Public Access (Hardened Security)
REVOKE ALL ON SCHEMA public FROM connect_user;
