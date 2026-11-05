import { DataStructureError, OVERFLOW, UNDERFLOW } from './errors.js';

/**
 * STACK (Tumpukan) — prinsip LIFO: Last In, First Out.
 * Data yang terakhir masuk adalah data yang pertama keluar.
 *
 * Implementasi: array statis berkapasitas tetap + penunjuk `top`.
 * Sengaja TIDAK memakai Array.prototype.push/pop bawaan JavaScript,
 * supaya cara kerja stack terlihat jelas.
 *
 *   index:   0     1     2     3   ...
 *          [ A ] [ B ] [ C ] [   ]
 *                       ^
 *                      top = 2
 *
 * Kompleksitas: push O(1), pop O(1), peek O(1).
 */
export default class Stack {
  constructor(capacity = 8) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError('Kapasitas stack harus bilangan bulat >= 1');
    }
    this.capacity = capacity;
    this.items = new Array(capacity).fill(null);
    this.top = -1; // -1 berarti stack kosong
  }

  isEmpty() {
    return this.top === -1;
  }

  isFull() {
    return this.top === this.capacity - 1;
  }

  size() {
    return this.top + 1;
  }

  /** Menambahkan data di posisi paling atas. */
  push(value) {
    if (this.isFull()) {
      throw new DataStructureError(OVERFLOW, 'Stack penuh (overflow), tidak bisa push');
    }
    this.top = this.top + 1;
    this.items[this.top] = value;
    return value;
  }

  /** Mengambil dan menghapus data paling atas. */
  pop() {
    if (this.isEmpty()) {
      throw new DataStructureError(UNDERFLOW, 'Stack kosong (underflow), tidak bisa pop');
    }
    const value = this.items[this.top];
    this.items[this.top] = null;
    this.top = this.top - 1;
    return value;
  }

  /** Melihat data paling atas tanpa menghapusnya. */
  peek() {
    if (this.isEmpty()) {
      throw new DataStructureError(UNDERFLOW, 'Stack kosong, tidak ada data untuk dilihat');
    }
    return this.items[this.top];
  }

  clear() {
    this.items = new Array(this.capacity).fill(null);
    this.top = -1;
  }

  /** Isi stack dari bawah (index 0) sampai top. */
  toArray() {
    const result = [];
    for (let i = 0; i <= this.top; i++) {
      result[i] = this.items[i];
    }
    return result;
  }

  toJSON() {
    return { capacity: this.capacity, top: this.top, items: this.toArray() };
  }

  static fromJSON(json) {
    const stack = new Stack(json.capacity);
    for (const value of json.items) stack.push(value);
    return stack;
  }
}
