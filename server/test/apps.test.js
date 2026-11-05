import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkBrackets, reverseText } from '../src/algorithms/stackApps.js';
import { simulateCounter } from '../src/algorithms/queueApps.js';
import { compareFifoLifo } from '../src/algorithms/compare.js';

test('checkBrackets: ekspresi seimbang', () => {
  assert.equal(checkBrackets('{[(a+b)*c]}').balanced, true);
  assert.equal(checkBrackets('()[]{}').balanced, true);
});

test('checkBrackets: ekspresi tidak seimbang', () => {
  assert.equal(checkBrackets('(]').balanced, false);
  assert.equal(checkBrackets('((a)').balanced, false);
  assert.equal(checkBrackets('a)').balanced, false);
});

test('reverseText membalik kata dengan stack', () => {
  assert.equal(reverseText('STRUKTUR').result, 'RUTKURTS');
});

test('simulateCounter melayani sesuai urutan datang', () => {
  assert.deepEqual(simulateCounter(['Andi', 'Budi', 'Citra']).order, ['Andi', 'Budi', 'Citra']);
});

test('compareFifoLifo: urutan keluar queue sama, stack terbalik', () => {
  const { fifo, lifo } = compareFifoLifo(['1', '2', '3']);
  assert.deepEqual(fifo, ['1', '2', '3']);
  assert.deepEqual(lifo, ['3', '2', '1']);
});
