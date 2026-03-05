-- 1. Create Tables
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'driver', 'client')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number SERIAL UNIQUE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,

  -- Recipient Info
  recipient_name TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,

  -- Status & Logistics
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'delivered')),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Create basic policies (development only)
DROP POLICY IF EXISTS "Allow full access for now" ON clients;
DROP POLICY IF EXISTS "Allow full access for now" ON deliveries;
DROP POLICY IF EXISTS "Allow full access for now" ON users;

CREATE POLICY "Allow full access for now" ON clients FOR ALL USING (true);
CREATE POLICY "Allow full access for now" ON deliveries FOR ALL USING (true);
CREATE POLICY "Allow full access for now" ON users FOR ALL USING (true);
