-- FuelEU Maritime Database Migration
-- Run with: psql -U postgres -d fueleu_db -f migrate.sql

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id VARCHAR(20) UNIQUE NOT NULL,
  vessel_type VARCHAR(50) NOT NULL,
  fuel_type VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  ghg_intensity DECIMAL(10,4) NOT NULL,
  fuel_consumption DECIMAL(12,2) NOT NULL,
  distance DECIMAL(12,2) NOT NULL,
  total_emissions DECIMAL(12,2) NOT NULL,
  is_baseline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ship compliance table
CREATE TABLE IF NOT EXISTS ship_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  cb_gco2eq DECIMAL(20,4) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ship_id, year)
);

-- Bank entries table
CREATE TABLE IF NOT EXISTS bank_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ship_id VARCHAR(20) NOT NULL,
  year INTEGER NOT NULL,
  amount_gco2eq DECIMAL(20,4) NOT NULL,
  entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('bank', 'apply')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pools table
CREATE TABLE IF NOT EXISTS pools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pool members table
CREATE TABLE IF NOT EXISTS pool_members (
  pool_id UUID REFERENCES pools(id) ON DELETE CASCADE,
  ship_id VARCHAR(20) NOT NULL,
  cb_before DECIMAL(20,4) NOT NULL,
  cb_after DECIMAL(20,4) NOT NULL,
  PRIMARY KEY (pool_id, ship_id)
);

-- Seed data
INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
VALUES
  ('R001', 'Container',   'HFO', 2024, 91.0,  5000, 12000, 4500, true),
  ('R002', 'BulkCarrier', 'LNG', 2024, 88.0,  4800, 11500, 4200, false),
  ('R003', 'Tanker',      'MGO', 2024, 93.5,  5100, 12500, 4700, false),
  ('R004', 'RoRo',        'HFO', 2025, 89.2,  4900, 11800, 4300, false),
  ('R005', 'Container',   'LNG', 2025, 90.5,  4950, 11900, 4400, false)
ON CONFLICT (route_id) DO NOTHING;

INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
VALUES
  ('R001', 2024,  -201500.0),
  ('R002', 2024,  672960.0),
  ('R003', 2024, -1012900.0),
  ('R004', 2025,   5895.2),
  ('R005', 2025, -464100.0)
ON CONFLICT (ship_id, year) DO NOTHING;

SELECT 'Migration and seed complete!' as status;
