const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres:Business123$%^&**(@db.avmoqiwlgkshdyrqxddl.supabase.co:5432/postgres";

const migrations = [
  '005_legacy_parity_tables.sql',
  '006_encounters_and_followups.sql',
  '007_aeterna_runtime_v2.sql',
  '007_sleep_clinic_dme.sql',
  '008_aeterna_agents_seed.sql',
  '009_pft_locations_referrals.sql'
];

async function applyMigrations() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    for (const migration of migrations) {
      console.log(`Applying ${migration}...`);
      const filePath = path.join(__dirname, '../supabase/migrations', migration);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`Successfully applied ${migration}`);
      } catch (err) {
        console.error(`Error applying ${migration}:`, err.message);
        // Continue with other migrations if possible, or decide to halt
      }
    }
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

applyMigrations();
