import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
process.env.POSTGRES_DB='test';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: 'postgres',
  password: process.env.DB_PASSWORD,
});

const run = async (file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let statement = '';
  for (let line of lines) {
    line = line.trim();
    statement += ' ' + line;
    if (line.endsWith(';')) {
      await pool.query(statement);
      statement = '';
    }
  }
};

/**
 */
export async function reset() {
  await run('sql/create_schema.sql');
  await run('sql/insert_data.sql');
};

/**
 */
export function close() {
  pool.end();
};
