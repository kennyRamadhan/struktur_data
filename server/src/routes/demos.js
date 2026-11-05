import { Router } from 'express';
import { checkBrackets, reverseText } from '../algorithms/stackApps.js';
import { simulateCounter } from '../algorithms/queueApps.js';
import { compareFifoLifo } from '../algorithms/compare.js';

const MAX_TEXT = 30;
const MAX_ITEMS = 10;

/** Memecah input "A, B, C" menjadi ['A', 'B', 'C']. */
function parseList(input) {
  return String(input ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function demoRoutes() {
  const router = Router();

  router.post('/brackets', (req, res) => {
    const expression = String(req.body?.expression ?? '');
    if (!expression.trim()) return res.status(400).json({ error: 'Ekspresi tidak boleh kosong' });
    if (expression.length > MAX_TEXT) return res.status(400).json({ error: `Maksimal ${MAX_TEXT} karakter` });
    res.json(checkBrackets(expression));
  });

  router.post('/reverse', (req, res) => {
    const text = String(req.body?.text ?? '');
    if (!text) return res.status(400).json({ error: 'Teks tidak boleh kosong' });
    if ([...text].length > MAX_TEXT) return res.status(400).json({ error: `Maksimal ${MAX_TEXT} karakter` });
    res.json(reverseText(text));
  });

  router.post('/counter', (req, res) => {
    const customers = parseList(req.body?.customers);
    if (customers.length === 0) return res.status(400).json({ error: 'Masukkan minimal 1 nama pelanggan' });
    if (customers.length > MAX_ITEMS) return res.status(400).json({ error: `Maksimal ${MAX_ITEMS} pelanggan` });
    res.json(simulateCounter(customers));
  });

  router.post('/compare', (req, res) => {
    const values = parseList(req.body?.values);
    if (values.length === 0) return res.status(400).json({ error: 'Masukkan minimal 1 data' });
    if (values.length > MAX_ITEMS) return res.status(400).json({ error: `Maksimal ${MAX_ITEMS} data` });
    res.json(compareFifoLifo(values));
  });

  return router;
}
