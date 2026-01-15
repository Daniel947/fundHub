import pkg from 'pg';
const { Pool } = pkg;

const DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/fundhub';
const pool = new Pool({ connectionString: DATABASE_URL });

async function simulateStats() {
    try {
        const pledgedRes = await pool.query(`
            SELECT 
                network,
                args->>'token' as token,
                SUM((args->>'amount')::NUMERIC) as raised
            FROM events 
            WHERE event_name = 'FundsLocked'
            GROUP BY network, args->>'token'
        `);

        const countsRes = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM campaigns) as total_campaigns,
                (SELECT COUNT(*) FROM campaigns WHERE active = true) as active_campaigns,
                (SELECT COUNT(DISTINCT LOWER(args->>'donor')) FROM events WHERE event_name = 'FundsLocked') as total_backers
        `);

        const result = {
            pledged: pledgedRes.rows,
            counts: {
                totalCampaigns: parseInt(countsRes.rows[0].total_campaigns),
                activeCampaigns: parseInt(countsRes.rows[0].active_campaigns),
                totalBackers: parseInt(countsRes.rows[0].total_backers)
            }
        };

        console.log('API RESPONSE SIMULATION:');
        console.log(JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('SIMULATION FAILED:', err);
    } finally {
        await pool.end();
    }
}

simulateStats();
