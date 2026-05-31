import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "admin1234",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? "5432"),
  database: process.env.DB_NAME ?? "poc_workflow",
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const schema = process.env.DB_SCHEMA ?? "core";

pool.on("connect", (client) => {
  client.query(`SET search_path TO ${schema}, public`).catch((err) => {
    console.error("Failed to set search_path:", err);
  });
});

export async function query(text, params) {
  return pool.query(text, params);
}

export default pool;
