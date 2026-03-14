import pool from './connection';

const migrations = `
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
`;

async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(migrations);
    console.log('✅ Migrations complete');
  } catch (err) {
    console.error('❌ Migration error:', err);
    throw err;
  } finally {
    client.release();
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
