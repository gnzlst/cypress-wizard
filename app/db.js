import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = __dirname + "/data.sqlite";

export async function initDb() {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  )`);
  const row = await db.get("SELECT id FROM users WHERE username = ?", "alice");
  if (!row) {
    await db.run("INSERT INTO users (username,password) VALUES (?,?)", "alice", "password");
  }
  return db;
}
