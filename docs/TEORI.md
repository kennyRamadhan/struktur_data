# Teori: Stack, Queue, LIFO, dan FIFO

Dokumen ini menjelaskan konsep struktur data yang diimplementasikan di aplikasi, beserta kaitannya dengan kode program.

## Daftar Isi

1. [Struktur Data Linear](#1-struktur-data-linear)
2. [Stack (LIFO)](#2-stack-lifo)
3. [Queue (FIFO)](#3-queue-fifo)
4. [Circular Queue](#4-circular-queue)
5. [Perbandingan Stack dan Queue](#5-perbandingan-stack-dan-queue)
6. [Penerapan di Aplikasi](#6-penerapan-di-aplikasi)

---

## 1. Struktur Data Linear

Struktur data linear menyimpan elemen secara berurutan: setiap elemen punya satu elemen sebelum dan satu
elemen sesudahnya (kecuali elemen pertama dan terakhir). **Stack** dan **Queue** termasuk struktur data
linear. Perbedaannya ada pada **aturan di ujung mana data boleh masuk dan keluar**.

| Istilah | Kepanjangan | Arti | Struktur data |
|---------|-------------|------|---------------|
| **LIFO** | Last In, First Out | Yang terakhir masuk, pertama keluar | Stack |
| **FIFO** | First In, First Out | Yang pertama masuk, pertama keluar | Queue |

---

## 2. Stack (LIFO)

### Konsep

Stack (tumpukan) seperti **tumpukan piring**: piring baru diletakkan di atas, dan piring yang diambil juga dari
atas. Semua operasi hanya terjadi di **satu ujung** yang disebut **TOP**.

```
          push(D)                  pop() → D
            │                          ▲
            ▼                          │
        ┌───────┐                  ┌───────┐
  TOP → │   D   │                  │       │
        ├───────┤              TOP→├───────┤
        │   C   │                  │   C   │
        ├───────┤                  ├───────┤
        │   B   │                  │   B   │
        ├───────┤                  ├───────┤
        │   A   │                  │   A   │
        └───────┘                  └───────┘
```

### Operasi

| Operasi | Fungsi | Kompleksitas |
|---------|--------|--------------|
| `push(x)` | Menambah `x` di posisi TOP | O(1) |
| `pop()` | Mengambil dan menghapus elemen TOP | O(1) |
| `peek()` | Melihat elemen TOP tanpa menghapus | O(1) |
| `isEmpty()` | Apakah stack kosong (`top == -1`) | O(1) |
| `isFull()` | Apakah stack penuh (`top == capacity - 1`) | O(1) |
| `size()` | Jumlah elemen (`top + 1`) | O(1) |

### Implementasi dengan array

Aplikasi ini memakai **array statis berkapasitas tetap** dan sebuah variabel penunjuk **`top`**
(lihat [`server/src/ds/Stack.js`](../server/src/ds/Stack.js)).

- Saat stack kosong, `top = -1`.
- **push:** `top` dinaikkan 1, lalu data disimpan di `items[top]`.
- **pop:** data di `items[top]` diambil, lalu `top` diturunkan 1.

```
push(x):
  if top == capacity - 1 → OVERFLOW
  top = top + 1
  items[top] = x

pop():
  if top == -1 → UNDERFLOW
  x = items[top]
  top = top - 1
  return x
```

### Kondisi khusus

| Kondisi | Penyebab | Penanganan di aplikasi |
|---------|----------|------------------------|
| **Overflow** | `push` saat stack penuh | Pesan "Stack penuh (overflow)", data tidak ditambahkan |
| **Underflow** | `pop`/`peek` saat stack kosong | Pesan "Stack kosong (underflow)" |

Kedua kondisi melempar `DataStructureError` ([`errors.js`](../server/src/ds/errors.js)) dan tetap dicatat di
riwayat operasi sebagai operasi **gagal**.

### Contoh di dunia nyata

- Tombol **Undo** (Ctrl+Z) di aplikasi pengolah kata
- Tombol **Back** di browser
- **Call stack** saat fungsi dipanggil secara rekursif
- Pengecekan **tanda kurung** pada compiler

---

## 3. Queue (FIFO)

### Konsep

Queue (antrian) seperti **antrian kasir**: orang baru berdiri di belakang, dan yang dilayani adalah orang
paling depan. Data **masuk dari REAR** (belakang) dan **keluar dari FRONT** (depan).

```
   dequeue() ◄──  ┌───┬───┬───┬───┐  ◄── enqueue(E)
                  │ A │ B │ C │ D │
                  └───┴───┴───┴───┘
                   FRONT       REAR
```

### Operasi

| Operasi | Fungsi | Kompleksitas |
|---------|--------|--------------|
| `enqueue(x)` | Menambah `x` di belakang (REAR) | O(1) |
| `dequeue()` | Mengambil dan menghapus elemen depan (FRONT) | O(1) |
| `peek()` | Melihat elemen FRONT tanpa menghapus | O(1) |
| `isEmpty()` | Apakah queue kosong (`count == 0`) | O(1) |
| `isFull()` | Apakah queue penuh (`count == capacity`) | O(1) |
| `size()` | Jumlah elemen (`count`) | O(1) |

### Contoh di dunia nyata

- Antrian loket bank atau kasir
- Antrian dokumen di **printer**
- Antrian proses di **CPU scheduling** (round robin)
- Antrian pesan (message queue) antar server

---

## 4. Circular Queue

### Masalah pada queue linear biasa

Jika queue memakai array biasa, setiap `dequeue` membuat `front` bergeser ke kanan. Slot di sebelah kiri
`front` menjadi kosong tetapi **tidak bisa dipakai lagi**. Akibatnya queue bisa dianggap "penuh" padahal
masih ada slot kosong.

```
Queue linear setelah 3x dequeue:
  ┌───┬───┬───┬───┬───┐
  │   │   │   │ D │ E │   ← rear sudah di ujung, "penuh",
  └───┴───┴───┴───┴───┘     padahal 3 slot kiri kosong
                F   R
```

Solusi lain adalah menggeser semua elemen ke kiri setiap kali `dequeue`, tetapi itu membuat `dequeue`
menjadi **O(n)**.

### Solusi: array melingkar

Pada **circular queue**, ujung array dianggap tersambung ke awal array. Penunjuk bergerak dengan operasi
**modulo**:

```
rear  = (rear + 1)  % capacity
front = (front + 1) % capacity
```

Saat `rear` sudah di index terakhir, langkah berikutnya kembali ke **index 0** dan memakai slot yang sudah
kosong. Semua operasi tetap **O(1)**.

```
Kapasitas 8. Enqueue A–H (penuh), dequeue 3x (A, B, C keluar), lalu enqueue I dan J:

 index:   0     1     2     3     4     5     6     7
        ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
        │  I  │  J  │     │  D  │  E  │  F  │  G  │  H  │
        └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
                 ▲           ▲
               REAR        FRONT

 Urutan antrian (front → rear): D, E, F, G, H, I, J
```

Kondisi ini bisa dicoba langsung di halaman **Queue**. Lihat juga
[screenshot](screenshots/05-queue-circular.png).

### Pseudo-code

```
enqueue(x):
  if count == capacity → OVERFLOW
  rear = (rear + 1) % capacity
  slots[rear] = x
  count = count + 1

dequeue():
  if count == 0 → UNDERFLOW
  x = slots[front]
  front = (front + 1) % capacity
  count = count - 1
  return x
```

Variabel `count` dipakai untuk membedakan kondisi **kosong** dan **penuh**, karena pada keduanya posisi
`front` dan `rear` bisa terlihat sama.

---

## 5. Perbandingan Stack dan Queue

| Aspek | Stack | Queue |
|-------|-------|-------|
| Prinsip | LIFO | FIFO |
| Ujung yang dipakai | Satu ujung (TOP) | Dua ujung (FRONT & REAR) |
| Penunjuk | `top` | `front`, `rear` |
| Tambah data | `push` | `enqueue` |
| Ambil data | `pop` | `dequeue` |
| Urutan keluar | **Kebalikan** urutan masuk | **Sama** dengan urutan masuk |
| Kompleksitas operasi | O(1) | O(1) |

**Contoh:** data `1, 2, 3, 4, 5` dimasukkan berurutan, lalu semuanya dikeluarkan.

| Struktur | Urutan keluar |
|----------|---------------|
| Stack (LIFO) | `5, 4, 3, 2, 1` |
| Queue (FIFO) | `1, 2, 3, 4, 5` |

Simulasi ini tersedia di halaman **FIFO vs LIFO**
([`compare.js`](../server/src/algorithms/compare.js)).

---

## 6. Penerapan di Aplikasi

### 6.1 Cek tanda kurung seimbang (Stack)

File: [`server/src/algorithms/stackApps.js`](../server/src/algorithms/stackApps.js) → `checkBrackets()`

Algoritma:

1. Baca ekspresi karakter demi karakter.
2. Jika kurung buka `(`, `[`, `{` → **push** ke stack.
3. Jika kurung tutup `)`, `]`, `}`:
   - Jika stack kosong → **tidak seimbang** (kurung tutup tanpa pasangan).
   - **pop** stack; jika kurung yang di-pop bukan pasangannya → **tidak seimbang**.
4. Karakter lain dilewati.
5. Setelah selesai, ekspresi **seimbang** jika stack kosong.

| Ekspresi | Hasil | Alasan |
|----------|-------|--------|
| `{[(a+b)*c]-d}` | Seimbang | Semua kurung punya pasangan yang benar |
| `(]` | Tidak seimbang | `(` ditutup dengan `]` |
| `((a)` | Tidak seimbang | Satu `(` tidak pernah ditutup |
| `a)` | Tidak seimbang | `)` tidak punya pasangan |

Stack cocok untuk masalah ini karena kurung yang **terakhir dibuka harus yang pertama ditutup** (LIFO).

### 6.2 Membalik kata (Stack)

File: [`stackApps.js`](../server/src/algorithms/stackApps.js) → `reverseText()`

Semua huruf di-push, lalu di-pop satu per satu. Karena LIFO, huruf terakhir keluar pertama:
`STRUKTUR` → `RUTKURTS`.

### 6.3 Simulasi antrian loket (Queue)

File: [`server/src/algorithms/queueApps.js`](../server/src/algorithms/queueApps.js) → `simulateCounter()`

Pelanggan datang lalu **enqueue**, kemudian dilayani satu per satu dengan **dequeue**. Pelanggan yang
datang lebih dulu dilayani lebih dulu (FIFO), sehingga adil bagi semua pelanggan.
