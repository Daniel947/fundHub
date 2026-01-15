import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fundhub';
const pool = new Pool({ connectionString: DATABASE_URL });

async function inspect() {
    try {
        const campaigns = await pool.query('SELECT * FROM campaigns LIMIT 5');
        console.log('CAMPAIGNS:', JSON.stringify(campaigns.rows, null, 2));

        const events = await pool.query('SELECT * FROM events LIMIT 5');
        console.log('EVENTS:', JSON.stringify(events.rows, null, 2));

        const counts = await pool.query('SELECT count(*) FROM campaigns');
        console.log('COUNT:', counts.rows[0].count);
    } catch (err) {
        console.error('INSPECT FAILED:', err);
    } finally {
        await pool.end();
    }
}

inspect();
