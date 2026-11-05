import Stack from '../ds/Stack.js';

const PAIRS = { ')': '(', ']': '[', '}': '{' };
const OPENERS = new Set(Object.values(PAIRS));

/**
 * Aplikasi Stack #1: memeriksa apakah tanda kurung seimbang.
 * Kurung buka di-push, kurung tutup mem-pop dan dicocokkan.
 * Mengembalikan langkah-langkah agar prosesnya bisa divisualisasikan.
 */
export function checkBrackets(expression) {
  const stack = new Stack(Math.max(expression.length, 1));
  const steps = [];

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    if (OPENERS.has(char)) {
      stack.push(char);
      steps.push({ index: i, char, action: 'push', stack: stack.toArray(), note: `"${char}" kurung buka → push` });
    } else if (PAIRS[char]) {
      if (stack.isEmpty()) {
        steps.push({ index: i, char, action: 'error', stack: stack.toArray(), note: `"${char}" tidak punya pasangan (stack kosong)` });
        return { balanced: false, steps, message: `Tidak seimbang: "${char}" di posisi ${i + 1} tidak punya pasangan` };
      }
      const top = stack.pop();
      if (top !== PAIRS[char]) {
        steps.push({ index: i, char, action: 'error', stack: stack.toArray(), note: `pop "${top}" tidak cocok dengan "${char}"` });
        return { balanced: false, steps, message: `Tidak seimbang: "${top}" ditutup dengan "${char}" di posisi ${i + 1}` };
      }
      steps.push({ index: i, char, action: 'pop', stack: stack.toArray(), note: `"${char}" cocok dengan "${top}" → pop` });
    } else {
      steps.push({ index: i, char, action: 'skip', stack: stack.toArray(), note: `"${char}" bukan kurung, dilewati` });
    }
  }

  if (!stack.isEmpty()) {
    return { balanced: false, steps, message: `Tidak seimbang: masih ada ${stack.size()} kurung buka yang belum ditutup` };
  }
  return { balanced: true, steps, message: 'Seimbang: semua kurung punya pasangan' };
}

/**
 * Aplikasi Stack #2: membalik kata.
 * Semua huruf di-push, lalu di-pop satu per satu → urutan terbalik (LIFO).
 */
export function reverseText(text) {
  const chars = [...text];
  const stack = new Stack(Math.max(chars.length, 1));
  const steps = [];
  let output = '';

  for (const char of chars) {
    stack.push(char);
    steps.push({ phase: 'push', char, stack: stack.toArray(), output, note: `push "${char}"` });
  }
  while (!stack.isEmpty()) {
    const char = stack.pop();
    output += char;
    steps.push({ phase: 'pop', char, stack: stack.toArray(), output, note: `pop "${char}" → tambahkan ke hasil` });
  }

  return { result: output, steps };
}
