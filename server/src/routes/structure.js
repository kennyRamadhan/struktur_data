import { Router } from 'express';
import Stack from '../ds/Stack.js';
import Queue from '../ds/Queue.js';
import { DataStructureError } from '../ds/errors.js';
import { CAPACITY } from '../config.js';

const MAX_VALUE_LENGTH = 12;

/**
 * Konfigurasi tiap struktur data: class yang dipakai dan
 * operasi apa saja yang tersedia (nama operasi → method class).
 */
const STRUCTURES = {
  stack: { Class: Stack, add: 'push', remove: 'pop' },
  queue: { Class: Queue, add: 'enqueue', remove: 'dequeue' },
};

/** Ringkasan state untuk dikirim ke frontend. */
function describe(ds) {
  return { ...ds.toJSON(), size: ds.size(), isEmpty: ds.isEmpty(), isFull: ds.isFull(), items: ds.toArray() };
}

/**
 * Router generik untuk stack & queue.
 * Alur setiap operasi: muat state dari SQLite → jalankan method
 * struktur data → simpan state baru + catat ke operation_log.
 */
export default function structureRoutes(db, type) {
  const { Class, add, remove } = STRUCTURES[type];
  const router = Router();

  const selectState = db.prepare('SELECT state FROM ds_state WHERE user_id = ? AND type = ?');
  const saveState = db.prepare(`
    INSERT INTO ds_state (user_id, type, state) VALUES (?, ?, ?)
    ON CONFLICT(user_id, type) DO UPDATE SET state = excluded.state, updated_at = datetime('now', 'localtime')
  `);
  const insertLog = db.prepare(
    'INSERT INTO operation_log (user_id, type, operation, value, success, message) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const selectLogs = db.prepare(
    'SELECT id, operation, value, success, message, created_at FROM operation_log WHERE user_id = ? AND type = ? ORDER BY id DESC LIMIT 15'
  );

  const load = (userId) => {
    const row = selectState.get(userId, type);
    return row ? Class.fromJSON(JSON.parse(row.state)) : new Class(CAPACITY);
  };

  /** Menjalankan satu operasi lalu menyimpan hasil & log-nya. */
  const run = (req, res, operation, action, { mutates = true, value = null } = {}) => {
    const userId = req.user.id;
    const ds = load(userId);
    try {
      const { result, message } = action(ds);
      if (mutates) saveState.run(userId, type, JSON.stringify(ds.toJSON()));
      insertLog.run(userId, type, operation, value ?? result ?? null, 1, message);
      res.json({ result, message, state: describe(ds) });
    } catch (err) {
      if (!(err instanceof DataStructureError)) throw err;
      insertLog.run(userId, type, operation, value, 0, err.message);
      res.status(400).json({ error: err.message, code: err.code, state: describe(ds) });
    }
  };

  router.get('/', (req, res) => {
    res.json({ state: describe(load(req.user.id)), logs: selectLogs.all(req.user.id, type) });
  });

  router.get('/logs', (req, res) => {
    res.json({ logs: selectLogs.all(req.user.id, type) });
  });

  router.post(`/${add}`, (req, res) => {
    const value = String(req.body?.value ?? '').trim();
    if (!value) return res.status(400).json({ error: 'Nilai tidak boleh kosong' });
    if (value.length > MAX_VALUE_LENGTH) {
      return res.status(400).json({ error: `Nilai maksimal ${MAX_VALUE_LENGTH} karakter` });
    }
    run(req, res, add, (ds) => ({ result: ds[add](value), message: `${add}("${value}") berhasil` }), { value });
  });

  router.post(`/${remove}`, (req, res) => {
    run(req, res, remove, (ds) => {
      const result = ds[remove]();
      return { result, message: `${remove}() mengeluarkan "${result}"` };
    });
  });

  router.post('/peek', (req, res) => {
    run(req, res, 'peek', (ds) => {
      const result = ds.peek();
      return { result, message: `peek() melihat "${result}"` };
    }, { mutates: false });
  });

  router.post('/clear', (req, res) => {
    run(req, res, 'clear', (ds) => {
      ds.clear();
      return { result: null, message: `${type} dikosongkan` };
    });
  });

  return router;
}
