import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fundhub';
const pool = new Pool({ connectionString: DATABASE_URL });

async function inspectKeys() {
    try {
        const events = await pool.query("SELECT args FROM events WHERE event_name = 'FundsLocked' LIMIT 1");
        if (events.rows.length > 0) {
            console.log('KEYS IN ARGS:', Object.keys(events.rows[0].args));
            console.log('FULL ARGS:', JSON.stringify(events.rows[0].args, null, 2));
        } else {
            console.log('No FundsLocked events found.');
        }
    } catch (err) {
        console.error('INSPECT FAILED:', err);
    } finally {
        await pool.end();
    }
}

inspectKeys();
