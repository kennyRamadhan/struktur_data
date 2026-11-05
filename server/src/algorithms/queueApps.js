import Queue from '../ds/Queue.js';

/**
 * Aplikasi Queue: simulasi antrian loket.
 * Semua pelanggan datang (enqueue) lalu dilayani satu per satu (dequeue)
 * sesuai urutan kedatangan — yang datang duluan dilayani duluan (FIFO).
 */
export function simulateCounter(customers) {
  const queue = new Queue(Math.max(customers.length, 1));
  const steps = [];
  const served = [];

  for (const name of customers) {
    queue.enqueue(name);
    steps.push({ phase: 'datang', name, queue: queue.toArray(), served: [...served], note: `${name} datang dan masuk antrian (enqueue)` });
  }
  let ticket = 1;
  while (!queue.isEmpty()) {
    const name = queue.dequeue();
    served.push({ ticket, name });
    steps.push({ phase: 'dilayani', name, queue: queue.toArray(), served: [...served], note: `${name} dilayani di loket (dequeue) — urutan ke-${ticket}` });
    ticket++;
  }

  return { order: served.map((s) => s.name), steps };
}
