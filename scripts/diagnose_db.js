import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fundhub';
const pool = new Pool({ connectionString: DATABASE_URL });

async function diagnose() {
    try {
        const campaigns = await pool.query('SELECT COUNT(*) FROM campaigns');
        const activeCampaigns = await pool.query('SELECT COUNT(*) FROM campaigns WHERE active = true');
        const events = await pool.query('SELECT COUNT(*) FROM events');
        const fundsLocked = await pool.query("SELECT COUNT(*) FROM events WHERE event_name = 'FundsLocked'");

        console.log('--- DB DIAGNOSIS ---');
        console.log('Total Campaigns:', campaigns.rows[0].count);
        console.log('Active Campaigns:', activeCampaigns.rows[0].count);
        console.log('Total Events:', events.rows[0].count);
        console.log('FundsLocked Events:', fundsLocked.rows[0].count);
        console.log('--- END ---');
    } catch (err) {
        console.error('DB Diagnosis Failed:', err);
    } finally {
        await pool.end();
    }
}

diagnose();
