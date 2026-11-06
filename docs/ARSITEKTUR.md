# Arsitektur & Dokumentasi Teknis

## Daftar Isi

1. [Gambaran Umum](#1-gambaran-umum)
2. [Alur Request](#2-alur-request)
3. [Backend](#3-backend)
4. [Frontend](#4-frontend)
5. [Database](#5-database)
6. [Referensi API](#6-referensi-api)
7. [Keamanan & Pembatasan Login](#7-keamanan--pembatasan-login)
8. [Pengujian](#8-pengujian)
9. [Docker](#9-docker)
10. [Konfigurasi](#10-konfigurasi)
11. [Keputusan Desain](#11-keputusan-desain)

---

## 1. Gambaran Umum

```
┌────────────────────────┐   HTTP/JSON    ┌──────────────────────────┐   SQL    ┌──────────────┐
│  Browser               │  + JWT token   │  Node.js (Express)       │ ───────► │   SQLite     │
│  React (Vite)          │ ─────────────► │  ├─ routes/   (API)      │          │   app.db     │
│  ├─ pages/             │ ◄───────────── │  ├─ ds/       (Stack,    │ ◄─────── │  users       │
│  └─ components/        │                │  │             Queue)    │          │  ds_state    │
│     (visualisasi)      │                │  └─ algorithms/          │          │  operation_  │
└────────────────────────┘                └──────────────────────────┘          │  log         │
                                                                                 └──────────────┘
```

| Lapisan | Teknologi | Tanggung jawab |
|---------|-----------|----------------|
| Frontend | React 19, React Router, Vite | Tampilan, form operasi, visualisasi, animasi langkah |
| Backend | Node.js 22+, Express 5 | Autentikasi, menjalankan logika struktur data, API |
| Struktur data | JavaScript murni (class) | `Stack`, `Queue`, beserta algoritma penerapannya |
| Database | SQLite (`node:sqlite`) | User, isi stack/queue per user, riwayat operasi |

**Prinsip utama:** logika struktur data berada di **backend** (`server/src/ds/`). Frontend hanya
menampilkan state yang dikirim backend. Dengan begitu, implementasi struktur data mudah ditemukan, diuji,
dan dinilai.

Dalam mode produksi (dan di Docker), Express juga menyajikan hasil build React, sehingga aplikasi cukup
berjalan di **satu port (3000)**.

---

## 2. Alur Request

Contoh: user menekan tombol **Push** dengan nilai `42`.

```
 Browser                      Express                         SQLite
    │  POST /api/stack/push       │                               │
    │  { "value": "42" }          │                               │
    │  Authorization: Bearer …    │                               │
    │ ──────────────────────────► │                               │
    │                             │ requireAuth: verifikasi JWT   │
    │                             │ SELECT state FROM ds_state ──►│
    │                             │ ◄──────────────── JSON state  │
    │                             │ stack = Stack.fromJSON(state) │
    │                             │ stack.push("42")              │
    │                             │ UPSERT ds_state ─────────────►│
    │                             │ INSERT operation_log ────────►│
    │  { result, message, state } │                               │
    │ ◄────────────────────────── │                               │
    │ React menggambar ulang      │                               │
```

Jika terjadi overflow/underflow, method struktur data melempar `DataStructureError`. Router menangkapnya,
mencatat operasi gagal ke `operation_log`, lalu mengembalikan HTTP **400** dengan pesan error dan state
terkini.

---

## 3. Backend

```
server/
├── src/
│   ├── index.js            # Titik masuk: buka database, jalankan server
│   ├── app.js              # Merakit Express: routes, static file React, error handler
│   ├── config.js           # PORT, JWT_SECRET, DB_PATH, kapasitas
│   ├── db.js               # Skema tabel, trigger, sinkronisasi 4 anggota
│   ├── data/members.js     # ★ Daftar 4 anggota yang boleh login
│   ├── ds/
│   │   ├── Stack.js        # ★ Stack: array statis + penunjuk top
│   │   ├── Queue.js        # ★ Circular queue: front, rear, count
│   │   └── errors.js       # DataStructureError (OVERFLOW / UNDERFLOW)
│   ├── algorithms/
│   │   ├── stackApps.js    # Cek tanda kurung, balik kata
│   │   ├── queueApps.js    # Simulasi antrian loket
│   │   └── compare.js      # Perbandingan FIFO vs LIFO
│   ├── middleware/auth.js  # Verifikasi token JWT
│   └── routes/
│       ├── auth.js         # /api/auth/*
│       ├── structure.js    # /api/stack/* dan /api/queue/* (router generik)
│       └── demos.js        # /api/demo/*
└── test/                   # Unit test (node:test)
```

### Class struktur data

Kedua class punya antarmuka yang konsisten:

| Method | Stack | Queue |
|--------|-------|-------|
| Tambah | `push(value)` | `enqueue(value)` |
| Ambil | `pop()` | `dequeue()` |
| Lihat | `peek()` | `peek()` |
| Status | `isEmpty()`, `isFull()`, `size()` | `isEmpty()`, `isFull()`, `size()` |
| Lainnya | `clear()`, `toArray()` | `clear()`, `toArray()` |
| Serialisasi | `toJSON()`, `Stack.fromJSON(json)` | `toJSON()`, `Queue.fromJSON(json)` |

`toJSON`/`fromJSON` dipakai untuk menyimpan dan memuat state ke/dari database. Pada `Queue`, serialisasi
menyimpan **posisi slot fisik** beserta `front`, `rear`, dan `count`, sehingga kondisi melingkar tetap
terjaga setelah dimuat ulang.

### Algoritma penerapan

Fungsi di `algorithms/` memakai class `Stack`/`Queue` yang sama dan mengembalikan **daftar langkah**
(`steps`). Setiap langkah berisi snapshot isi struktur data dan catatan penjelasan. Frontend memutar
langkah-langkah ini sebagai animasi.

### Router generik

`routes/structure.js` membuat router yang sama untuk stack dan queue berdasarkan konfigurasi:

```js
const STRUCTURES = {
  stack: { Class: Stack, add: 'push', remove: 'pop' },
  queue: { Class: Queue, add: 'enqueue', remove: 'dequeue' },
};
```

---

## 4. Frontend

```
client/src/
├── main.jsx               # Bootstrap React + Router + AuthProvider
├── App.jsx                # Definisi route
├── api.js                 # Pembungkus fetch + token JWT
├── auth.jsx               # AuthContext, login/logout, ProtectedRoute
├── useStructure.js        # Hook: muat state & jalankan operasi stack/queue
├── styles.css             # Seluruh styling (mendukung light & dark mode)
├── pages/
│   ├── Login.jsx
│   ├── Dashboard.jsx      # Menu utama
│   ├── StackPage.jsx      # + demo cek kurung & balik kata
│   ├── QueuePage.jsx      # + demo antrian loket
│   └── ComparePage.jsx
└── components/
    ├── Layout.jsx         # Header, navigasi, footer
    ├── StackView.jsx      # Visualisasi stack vertikal
    ├── QueueView.jsx      # Visualisasi circular queue & barisan antrian
    ├── StepPlayer.jsx     # Pemutar langkah animasi
    ├── LogPanel.jsx       # Riwayat operasi
    └── common.jsx         # Feedback, Stat, CodeBox, Tabs, useDemo
```

| Route | Halaman | Login? |
|-------|---------|--------|
| `/login` | Login | Tidak |
| `/` | Menu Utama | Ya |
| `/stack` | Stack (LIFO) | Ya |
| `/queue` | Queue (FIFO) | Ya |
| `/compare` | FIFO vs LIFO | Ya |

Token JWT disimpan di `localStorage`. Jika API membalas **401** (token habis/tidak valid), token dihapus
dan pengguna diarahkan kembali ke halaman login.

---

## 5. Database

File database dibuat otomatis saat server pertama kali berjalan.

```
┌──────────────────────┐        ┌──────────────────────────┐
│ users                │        │ ds_state                 │
├──────────────────────┤        ├──────────────────────────┤
│ id            PK     │◄──┐    │ user_id    FK → users.id │
│ username      UNIQUE │   ├────│ type       'stack'|'queue│
│ password_hash        │   │    │ state      JSON          │
│ name                 │   │    │ updated_at               │
│ nim                  │   │    │ PK (user_id, type)       │
└──────────────────────┘   │    └──────────────────────────┘
  trigger limit_users:     │    ┌──────────────────────────┐
  maksimal 4 baris         │    │ operation_log            │
                           │    ├──────────────────────────┤
                           │    │ id         PK            │
                           └────│ user_id    FK → users.id │
                                │ type, operation, value   │
                                │ success (1/0), message   │
                                │ created_at               │
                                └──────────────────────────┘
```

Contoh isi kolom `ds_state.state`:

```json
// stack
{ "capacity": 8, "top": 2, "items": ["10", "20", "30"] }

// queue (circular)
{ "capacity": 8, "front": 3, "rear": 1, "count": 7,
  "slots": ["I", "J", null, "D", "E", "F", "G", "H"] }
```

Melihat isi database secara langsung (opsional, butuh [DB Browser for SQLite](https://sqlitebrowser.org/)
atau Node.js):

```bash
node -e "const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync('server/data/app.db');console.table(db.prepare('SELECT id,username,name,nim FROM users').all())"
```

---

## 6. Referensi API

Base URL: `http://localhost:3000/api`. Semua body dan respons berformat JSON.
Selain `POST /auth/login` dan `GET /auth/team`, semua endpoint membutuhkan header:

```
Authorization: Bearer <token>
```

### Autentikasi

**`POST /auth/login`**

```json
// request
{ "username": "312510195", "password": "312510195" }

// 200 OK
{ "token": "eyJhbGciOi...", "user": { "id": 1, "username": "312510195", "name": "Kenny Ramadhan", "nim": "312510195" } }

// 401
{ "error": "Username atau password salah" }
```

**`GET /auth/me`**: data user dari token. **`GET /auth/members`**: daftar 4 anggota (`id`, `name`, `nim`). **`GET /auth/team`** (publik): nama-nama anggota saja, ditampilkan di halaman login dan footer. NIM sengaja tidak disertakan karena dipakai sebagai username.

### Stack & Queue

| Method | Stack | Queue | Body |
|--------|-------|-------|------|
| GET | `/stack` | `/queue` | — (mengembalikan `state` + `logs`) |
| GET | `/stack/logs` | `/queue/logs` | — |
| POST | `/stack/push` | `/queue/enqueue` | `{ "value": "42" }` (maks. 12 karakter) |
| POST | `/stack/pop` | `/queue/dequeue` | — |
| POST | `/stack/peek` | `/queue/peek` | — |
| POST | `/stack/clear` | `/queue/clear` | — |

Contoh respons sukses `POST /stack/pop`:

```json
{
  "result": "30",
  "message": "pop() mengeluarkan \"30\"",
  "state": { "capacity": 8, "top": 1, "items": ["10", "20"], "size": 2, "isEmpty": false, "isFull": false }
}
```

Contoh respons gagal (HTTP 400):

```json
{ "error": "Stack kosong (underflow), tidak bisa pop", "code": "UNDERFLOW", "state": { "...": "..." } }
```

### Demo penerapan

| Endpoint | Body | Respons |
|----------|------|---------|
| `POST /demo/brackets` | `{ "expression": "{[()]}" }` | `{ balanced, message, steps[] }` |
| `POST /demo/reverse` | `{ "text": "STRUKTUR" }` | `{ result, steps[] }` |
| `POST /demo/counter` | `{ "customers": "Andi, Budi, Citra" }` | `{ order[], steps[] }` |
| `POST /demo/compare` | `{ "values": "1, 2, 3" }` | `{ lifo[], fifo[], steps[] }` |

Batasan: ekspresi/teks maks. 30 karakter, daftar maks. 10 item.

### Kode status

| Kode | Arti |
|------|------|
| 200 | Berhasil |
| 400 | Input tidak valid, atau overflow/underflow |
| 401 | Belum login / token tidak valid |
| 404 | Endpoint tidak ditemukan |
| 500 | Kesalahan server |

---

## 7. Keamanan & Pembatasan Login

Pembatasan "hanya 4 orang yang bisa login" diterapkan berlapis:

1. **Tidak ada endpoint registrasi.** User hanya berasal dari [`server/src/data/members.js`](../server/src/data/members.js).
2. **Sinkronisasi saat start.** `db.js` menyamakan tabel `users` dengan `members.js`: user yang tidak ada di
   daftar dihapus, dan data anggota diperbarui.
3. **Trigger database `limit_users`.** SQLite menolak `INSERT` ke tabel `users` jika sudah berisi 4 baris,
   dengan pesan `Maksimal 4 user`.
4. **Validasi jumlah.** Server menolak start jika `members.js` tidak berisi tepat 4 anggota.

Langkah keamanan lain:

- Password disimpan sebagai **hash bcrypt** (cost 10), tidak pernah dalam teks biasa.
- Semua endpoint selain login dan daftar nama anggota dilindungi middleware **JWT** (`middleware/auth.js`). Token berlaku 8 jam.
- Semua query SQL memakai **prepared statement**, sehingga aman dari SQL injection.
- Panjang input dibatasi di server, tidak hanya di form frontend.

---

## 8. Pengujian

```bash
npm test
```

Test memakai test runner bawaan Node.js (`node:test`), jadi tidak perlu library tambahan.

| File | Yang diuji |
|------|-----------|
| `server/test/ds.test.js` | LIFO pada stack, FIFO pada queue, overflow/underflow, sifat melingkar queue, serialisasi `toJSON`/`fromJSON` |
| `server/test/apps.test.js` | Cek tanda kurung (seimbang & tidak), balik kata, simulasi loket, perbandingan FIFO vs LIFO |

---

## 9. Docker

`Dockerfile` memakai **multi-stage build**:

1. **Tahap `client-build`:** install dependency React lalu `vite build` → menghasilkan `client/dist`.
2. **Tahap akhir:** install dependency server (tanpa devDependencies), salin kode server dan hasil build
   React. Image akhir hanya berisi yang dibutuhkan untuk menjalankan aplikasi.

`docker-compose.yml` menjalankan satu service `app` dan menyimpan database di volume `app-data`, sehingga
data tetap ada walaupun container dihapus. Untuk menghapus data juga: `docker compose down -v`.

---

## 10. Konfigurasi

| Variabel | Default | Keterangan |
|----------|---------|------------|
| `PORT` | `3000` | Port server di dalam container / mesin lokal |
| `APP_PORT` | `3000` | (Docker Compose) port di komputer host |
| `JWT_SECRET` | nilai bawaan | Kunci penandatangan token JWT |
| `DB_PATH` | `server/data/app.db` | Lokasi file SQLite |

Kapasitas stack dan queue (`CAPACITY = 8`) diatur di [`server/src/config.js`](../server/src/config.js).

---

## 11. Keputusan Desain

| Keputusan | Alasan |
|-----------|--------|
| Struktur data ditulis manual, bukan `Array.push/pop` | Supaya konsep `top`, `front`, `rear`, overflow, dan underflow terlihat jelas di kode |
| Stack berbasis array statis | Implementasi stack yang paling umum diajarkan; kapasitas tetap memungkinkan demo overflow |
| Queue berbasis circular array | Menghindari pemborosan slot pada queue linear, dan semua operasi tetap O(1) |
| Logika di backend, bukan di React | Implementasi terpusat, mudah diuji, dan state bisa disimpan per user |
| `node:sqlite` bawaan Node.js | Tidak perlu compile modul native (seperti `better-sqlite3`), jadi `npm install` lancar di Windows/Mac/Linux |
| `bcryptjs` (JavaScript murni) | Alasan sama: tanpa compile native |
| Satu container, satu port | Dosen cukup menjalankan `docker compose up` dan membuka satu alamat |
| Algoritma mengembalikan `steps` | Frontend bisa memutar ulang setiap langkah tanpa menduplikasi logika algoritma |
