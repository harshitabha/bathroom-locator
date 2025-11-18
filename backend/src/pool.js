import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
export const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: process.env.DB_PASSWORD,
});
