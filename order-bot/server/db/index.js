import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

const databaseUrl = process.env.DATABASE_URL;
const hasDiscreteConfig =
  process.env.DB_HOST &&
  process.env.DB_PORT &&
  process.env.DB_NAME &&
  process.env.DB_USER &&
  process.env.DB_PASSWORD;

if (!databaseUrl && !hasDiscreteConfig) {
  throw new Error(
    'Order-bot database is not configured. Set DATABASE_URL (recommended) or DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD.'
  );
}

const pool = new Pool(
  databaseUrl
    ? {
        connectionString: databaseUrl,
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: isProduction ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (!isProduction) {
      console.log('Executed query', { duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', isProduction ? error?.message : error);
    throw error;
  }
};

export const getClient = () => pool.connect();

export default pool;
