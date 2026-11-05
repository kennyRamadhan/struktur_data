/**
 * Error khusus struktur data.
 * - OVERFLOW  : menambah data ke struktur yang sudah penuh
 * - UNDERFLOW : mengambil data dari struktur yang kosong
 */
export class DataStructureError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DataStructureError';
    this.code = code;
  }
}

export const OVERFLOW = 'OVERFLOW';
export const UNDERFLOW = 'UNDERFLOW';
