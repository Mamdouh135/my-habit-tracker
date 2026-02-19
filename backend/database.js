import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './habits.db',
    driver: sqlite3.Database
  });
}

export async function initDb() {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS habit_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habitId INTEGER NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY(habitId) REFERENCES habits(id)
    );
  `);

  // add `tutorialSeen` column to users if missing (safe for existing DB)
  const tableSql = (await db.get("SELECT sql FROM sqlite_master WHERE tbl_name='users' AND type='table'"))?.sql || '';
  if (!/tutorialSeen/i.test(tableSql)) {
    try {
      await db.exec(`ALTER TABLE users ADD COLUMN tutorialSeen INTEGER DEFAULT 0`);
    } catch (e) {
      // ignore if unable to alter (e.g., older DB state)
      console.warn('Could not add tutorialSeen column to users table:', e.message || e);
    }
  }

  return db;
}
