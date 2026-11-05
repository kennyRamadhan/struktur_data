import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import bcrypt from 'bcryptjs';
import { DB_PATH } from './config.js';
import members from './data/members.js';

const MAX_USERS = 4;

export function openDatabase(file = DB_PATH) {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON;');
  createSchema(db);
  syncMembers(db);
  return db;
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name          TEXT NOT NULL,
      nim           TEXT NOT NULL
    );

    -- Database menolak user ke-5: hanya 4 anggota yang boleh terdaftar.
    CREATE TRIGGER IF NOT EXISTS limit_users
    BEFORE INSERT ON users
    WHEN (SELECT COUNT(*) FROM users) >= ${MAX_USERS}
    BEGIN
      SELECT RAISE(ABORT, 'Maksimal ${MAX_USERS} user');
    END;

    -- Snapshot isi stack / queue milik tiap user (format JSON).
    CREATE TABLE IF NOT EXISTS ds_state (
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL CHECK (type IN ('stack', 'queue')),
      state      TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      PRIMARY KEY (user_id, type)
    );

    -- Riwayat setiap operasi (push, pop, enqueue, dequeue, ...).
    CREATE TABLE IF NOT EXISTS operation_log (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL,
      operation  TEXT NOT NULL,
      value      TEXT,
      success    INTEGER NOT NULL,
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
}

/** Menyamakan tabel users dengan daftar di data/members.js. */
function syncMembers(db) {
  if (members.length !== MAX_USERS) {
    throw new Error(`data/members.js harus berisi tepat ${MAX_USERS} anggota`);
  }

  const usernames = members.map((m) => m.username);
  const placeholders = usernames.map(() => '?').join(', ');
  const upsert = db.prepare(`
    INSERT INTO users (username, password_hash, name, nim)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      name = excluded.name,
      nim = excluded.nim
  `);

  db.exec('BEGIN');
  try {
    db.prepare(`DELETE FROM users WHERE username NOT IN (${placeholders})`).run(...usernames);
    for (const m of members) {
      upsert.run(m.username, bcrypt.hashSync(m.password, 10), m.name, m.nim);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
