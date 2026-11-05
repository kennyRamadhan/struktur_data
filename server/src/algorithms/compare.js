import Stack from '../ds/Stack.js';
import Queue from '../ds/Queue.js';

/**
 * Membandingkan FIFO (Queue) dengan LIFO (Stack) memakai data yang sama.
 * Fase 1: semua data dimasukkan ke stack dan queue.
 * Fase 2: semua data dikeluarkan — urutan keluarnya berbeda.
 */
export function compareFifoLifo(values) {
  const capacity = Math.max(values.length, 1);
  const stack = new Stack(capacity);
  const queue = new Queue(capacity);
  const stackOut = [];
  const queueOut = [];
  const steps = [];

  const snapshot = (phase, note) => ({
    phase,
    note,
    stack: stack.toArray(),
    queue: queue.toArray(),
    stackOut: [...stackOut],
    queueOut: [...queueOut],
  });

  for (const value of values) {
    stack.push(value);
    queue.enqueue(value);
    steps.push(snapshot('masuk', `"${value}" masuk: push ke stack, enqueue ke queue`));
  }
  while (!stack.isEmpty()) {
    const fromStack = stack.pop();
    const fromQueue = queue.dequeue();
    stackOut.push(fromStack);
    queueOut.push(fromQueue);
    steps.push(snapshot('keluar', `Stack pop → "${fromStack}", Queue dequeue → "${fromQueue}"`));
  }

  return { lifo: stackOut, fifo: queueOut, steps };
}
