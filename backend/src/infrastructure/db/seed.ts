import pool from './connection';

const seedRoutes = `
INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
VALUES
  ('R001', 'Container',   'HFO', 2024, 91.0,  5000, 12000, 4500, true),
  ('R002', 'BulkCarrier', 'LNG', 2024, 88.0,  4800, 11500, 4200, false),
  ('R003', 'Tanker',      'MGO', 2024, 93.5,  5100, 12500, 4700, false),
  ('R004', 'RoRo',        'HFO', 2025, 89.2,  4900, 11800, 4300, false),
  ('R005', 'Container',   'LNG', 2025, 90.5,  4950, 11900, 4400, false)
ON CONFLICT (route_id) DO NOTHING;
`;

const seedCompliance = `
INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
VALUES
  ('R001', 2024,  -201500.0),
  ('R002', 2024,  672960.0),
  ('R003', 2024, -1012900.0),
  ('R004', 2025,   5895.2),
  ('R005', 2025, -464100.0)
ON CONFLICT (ship_id, year) DO NOTHING;
`;

async function runSeed(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(seedRoutes);
    await client.query(seedCompliance);
    console.log('✅ Seed data inserted');
  } catch (err) {
    console.error('❌ Seed error:', err);
    throw err;
  } finally {
    client.release();
  }
}

runSeed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
