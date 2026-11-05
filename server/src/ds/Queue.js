import { DataStructureError, OVERFLOW, UNDERFLOW } from './errors.js';

/**
 * QUEUE (Antrian) — prinsip FIFO: First In, First Out.
 * Data yang pertama masuk adalah data yang pertama keluar.
 *
 * Implementasi: CIRCULAR QUEUE (array melingkar) dengan penunjuk
 * `front` (depan) dan `rear` (belakang). Saat penunjuk mencapai ujung
 * array, ia kembali ke index 0 memakai operasi modulo, sehingga slot
 * yang sudah kosong di depan bisa dipakai ulang.
 *
 *   index:   0     1     2     3     4
 *          [   ] [ B ] [ C ] [ D ] [   ]
 *                  ^           ^
 *              front = 1    rear = 3
 *
 * Kompleksitas: enqueue O(1), dequeue O(1), peek O(1).
 */
export default class Queue {
  constructor(capacity = 8) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError('Kapasitas queue harus bilangan bulat >= 1');
    }
    this.capacity = capacity;
    this.slots = new Array(capacity).fill(null);
    this.front = 0;
    this.rear = -1;
    this.count = 0;
  }

  isEmpty() {
    return this.count === 0;
  }

  isFull() {
    return this.count === this.capacity;
  }

  size() {
    return this.count;
  }

  /** Menambahkan data di bagian belakang antrian. */
  enqueue(value) {
    if (this.isFull()) {
      throw new DataStructureError(OVERFLOW, 'Queue penuh (overflow), tidak bisa enqueue');
    }
    this.rear = (this.rear + 1) % this.capacity;
    this.slots[this.rear] = value;
    this.count = this.count + 1;
    return value;
  }

  /** Mengambil dan menghapus data paling depan. */
  dequeue() {
    if (this.isEmpty()) {
      throw new DataStructureError(UNDERFLOW, 'Queue kosong (underflow), tidak bisa dequeue');
    }
    const value = this.slots[this.front];
    this.slots[this.front] = null;
    this.front = (this.front + 1) % this.capacity;
    this.count = this.count - 1;
    return value;
  }

  /** Melihat data paling depan tanpa menghapusnya. */
  peek() {
    if (this.isEmpty()) {
      throw new DataStructureError(UNDERFLOW, 'Queue kosong, tidak ada data untuk dilihat');
    }
    return this.slots[this.front];
  }

  clear() {
    this.slots = new Array(this.capacity).fill(null);
    this.front = 0;
    this.rear = -1;
    this.count = 0;
  }

  /** Isi antrian berurutan dari depan (front) ke belakang (rear). */
  toArray() {
    const result = [];
    for (let i = 0; i < this.count; i++) {
      result[i] = this.slots[(this.front + i) % this.capacity];
    }
    return result;
  }

  toJSON() {
    return {
      capacity: this.capacity,
      front: this.front,
      rear: this.rear,
      count: this.count,
      slots: [...this.slots],
    };
  }

  /** Memulihkan queue persis seperti posisi slot-nya (termasuk letak melingkarnya). */
  static fromJSON(json) {
    const queue = new Queue(json.capacity);
    queue.slots = [...json.slots];
    queue.front = json.front;
    queue.rear = json.rear;
    queue.count = json.count;
    return queue;
  }
}
