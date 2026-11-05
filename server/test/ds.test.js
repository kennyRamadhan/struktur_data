import { test } from 'node:test';
import assert from 'node:assert/strict';
import Stack from '../src/ds/Stack.js';
import Queue from '../src/ds/Queue.js';
import { OVERFLOW, UNDERFLOW } from '../src/ds/errors.js';

test('Stack: LIFO — data terakhir masuk keluar pertama', () => {
  const s = new Stack(3);
  s.push('A');
  s.push('B');
  s.push('C');
  assert.equal(s.peek(), 'C');
  assert.equal(s.pop(), 'C');
  assert.equal(s.pop(), 'B');
  assert.equal(s.pop(), 'A');
  assert.equal(s.isEmpty(), true);
});

test('Stack: overflow saat penuh dan underflow saat kosong', () => {
  const s = new Stack(2);
  s.push(1);
  s.push(2);
  assert.equal(s.isFull(), true);
  assert.throws(() => s.push(3), { code: OVERFLOW });
  s.clear();
  assert.throws(() => s.pop(), { code: UNDERFLOW });
  assert.throws(() => s.peek(), { code: UNDERFLOW });
});

test('Stack: toJSON/fromJSON mempertahankan isi dan urutan', () => {
  const s = new Stack(4);
  ['x', 'y', 'z'].forEach((v) => s.push(v));
  const copy = Stack.fromJSON(JSON.parse(JSON.stringify(s.toJSON())));
  assert.deepEqual(copy.toArray(), ['x', 'y', 'z']);
  assert.equal(copy.top, 2);
  assert.equal(copy.capacity, 4);
});

test('Queue: FIFO — data pertama masuk keluar pertama', () => {
  const q = new Queue(3);
  q.enqueue('A');
  q.enqueue('B');
  q.enqueue('C');
  assert.equal(q.peek(), 'A');
  assert.equal(q.dequeue(), 'A');
  assert.equal(q.dequeue(), 'B');
  assert.equal(q.dequeue(), 'C');
  assert.equal(q.isEmpty(), true);
});

test('Queue: overflow saat penuh dan underflow saat kosong', () => {
  const q = new Queue(1);
  q.enqueue(1);
  assert.throws(() => q.enqueue(2), { code: OVERFLOW });
  q.dequeue();
  assert.throws(() => q.dequeue(), { code: UNDERFLOW });
});

test('Queue: circular — slot depan yang kosong dipakai ulang', () => {
  const q = new Queue(3);
  q.enqueue('A');
  q.enqueue('B');
  q.enqueue('C');
  q.dequeue(); // A keluar, slot 0 kosong
  q.enqueue('D'); // rear melingkar ke index 0
  assert.equal(q.rear, 0);
  assert.equal(q.front, 1);
  assert.deepEqual(q.slots, ['D', 'B', 'C']);
  assert.deepEqual(q.toArray(), ['B', 'C', 'D']);
});

test('Queue: fromJSON memulihkan posisi melingkar', () => {
  const q = new Queue(3);
  ['A', 'B', 'C'].forEach((v) => q.enqueue(v));
  q.dequeue();
  q.enqueue('D');
  const copy = Queue.fromJSON(JSON.parse(JSON.stringify(q.toJSON())));
  assert.deepEqual(copy.toArray(), ['B', 'C', 'D']);
  assert.equal(copy.dequeue(), 'B');
});
