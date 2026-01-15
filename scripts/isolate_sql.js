import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fundhub';
const pool = new Pool({ connectionString: DATABASE_URL });

async function findMissing() {
    const queries = [
        { name: 'Pledged (Events)', sql: "SELECT network, args->>'token' as token, SUM((args->>'amount')::NUMERIC) as raised FROM events WHERE event_name = 'FundsLocked' GROUP BY network, args->>'token'" },
        { name: 'Total Campaigns', sql: "SELECT COUNT(*) FROM campaigns" },
        { name: 'Active Campaigns', sql: "SELECT COUNT(*) FROM campaigns WHERE active = true" },
        { name: 'Total Backers', sql: "SELECT COUNT(DISTINCT LOWER(args->>'donor')) FROM events WHERE event_name = 'FundsLocked'" }
    ];

    for (const q of queries) {
        try {
            console.log(`Testing: ${q.name}...`);
            await pool.query(q.sql);
            console.log(`  SUCCESS: ${q.name}`);
        } catch (err) {
            console.error(`  FAILED: ${q.name}`);
            console.error(`  Error: ${err.message}`);
        }
    }
    await pool.end();
}

findMissing();
