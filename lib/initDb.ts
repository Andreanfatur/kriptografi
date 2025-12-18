import { Client, Pool } from "pg";

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

/**
 * Pastikan database & tabel tersedia
 */
export async function initDatabase(): Promise<Pool> {
  // 1. Koneksi ke database default "postgres"
  const adminClient = new Client({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres",
  });

  await adminClient.connect();

  // 2. Cek database
  const dbCheck = await adminClient.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [DB_NAME]
  );

  if (dbCheck.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`Database ${DB_NAME} dibuat`);
  }

  await adminClient.end();

  // 3. Koneksi ke database target
  const pool = new Pool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
  });

  // 4. Buat tabel jika belum ada
  await pool.query(`
    CREATE TABLE IF NOT EXISTS encryption_keys (
      id SERIAL PRIMARY KEY,
      encrypted_aes_key TEXT NOT NULL,
      iv TEXT NOT NULL,
      public_key TEXT NOT NULL,
      private_key TEXT NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return pool;
}
