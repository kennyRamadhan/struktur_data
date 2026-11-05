/**
 * DAFTAR ANGGOTA KELOMPOK — hanya 4 orang ini yang bisa login.
 *
 * Ubah nama, NIM, username, dan password sesuai anggota kelompok.
 * Setiap server dijalankan, tabel `users` di SQLite disinkronkan
 * dengan daftar ini (password disimpan dalam bentuk hash bcrypt).
 */
const members = [
  { name: 'Anggota Satu', nim: '0000000001', username: 'anggota1', password: 'anggota1' },
  { name: 'Anggota Dua', nim: '0000000002', username: 'anggota2', password: 'anggota2' },
  { name: 'Anggota Tiga', nim: '0000000003', username: 'anggota3', password: 'anggota3' },
  { name: 'Anggota Empat', nim: '0000000004', username: 'anggota4', password: 'anggota4' },
];

export default members;
