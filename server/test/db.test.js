import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db.js';
import members from '../src/data/members.js';

const tempDb = () => path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sdp-')), 'app.db');

test('database bisa dibuka ulang (server di-restart) tanpa error', () => {
  const file = tempDb();
  openDatabase(file).close();
  openDatabase(file).close();
  const db = openDatabase(file);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM users').get().n, members.length);
  db.close();
});

test('user lama yang tidak ada di members.js dihapus saat sinkronisasi', () => {
  const file = tempDb();
  const db = openDatabase(file);
  db.prepare("UPDATE users SET username = 'user-lama' WHERE id = 1").run();
  db.close();

  const reopened = openDatabase(file);
  const usernames = reopened.prepare('SELECT username FROM users ORDER BY username').all().map((r) => r.username);
  assert.deepEqual(usernames, members.map((m) => m.username).sort());
  reopened.close();
});

test('trigger menolak user ke-5', () => {
  const db = openDatabase(tempDb());
  assert.throws(
    () => db.prepare("INSERT INTO users (username, password_hash, name, nim) VALUES ('x', 'x', 'x', 'x')").run(),
    /Maksimal 4 user/
  );
  db.close();
});
