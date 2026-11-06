/**
 * DAFTAR ANGGOTA KELOMPOK — hanya 4 orang ini yang bisa login.
 *
 * Login memakai NIM sebagai username dan password.
 * Setiap server dijalankan, tabel `users` di SQLite disinkronkan
 * dengan daftar ini (password disimpan dalam bentuk hash bcrypt).
 */
const members = [
  { name: 'Kenny Ramadhan', nim: '312510195', username: '312510195', password: '312510195' },
  { name: 'Ariq Firmansyah', nim: '312510176', username: '312510176', password: '312510176' },
  { name: 'Muhammad Ryno Al Faridz', nim: '312510022', username: '312510022', password: '312510022' },
  { name: 'Dwi Afandi', nim: '312510100', username: '312510100', password: '312510100' },
];

export default members;
