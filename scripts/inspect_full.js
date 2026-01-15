import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fundhub';
const pool = new Pool({ connectionString: DATABASE_URL });

async function inspectFull() {
    try {
        const events = await pool.query("SELECT * FROM events WHERE event_name = 'FundsLocked' LIMIT 3");
        console.log('FUNDS LOCKED ARGS:', JSON.stringify(events.rows.map(r => r.args), null, 2));

        const campaigns = await pool.query('SELECT * FROM campaigns');
        console.log('CAMPAIGNS:', JSON.stringify(campaigns.rows, null, 2));
    } catch (err) {
        console.error('INSPECT FAILED:', err);
    } finally {
        await pool.end();
    }
}

inspectFull();
