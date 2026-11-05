import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { initials } from '../components/Layout.jsx';

const MENU = [
  {
    to: '/stack',
    tone: 'stack',
    title: 'Stack',
    badge: 'LIFO',
    text: 'Tumpukan: data yang terakhir masuk keluar pertama. Coba push, pop, peek, cek tanda kurung, dan balik kata.',
    visual: ['C', 'B', 'A'],
  },
  {
    to: '/queue',
    tone: 'queue',
    title: 'Queue',
    badge: 'FIFO',
    text: 'Antrian: data yang pertama masuk keluar pertama. Coba enqueue, dequeue, circular queue, dan simulasi loket.',
    visual: ['A', 'B', 'C'],
  },
  {
    to: '/compare',
    tone: 'compare',
    title: 'FIFO vs LIFO',
    badge: 'Bandingkan',
    text: 'Masukkan data yang sama ke stack dan queue sekaligus, lalu lihat perbedaan urutan keluarnya.',
    visual: ['⇄'],
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    api('/auth/members').then((data) => setMembers(data.members));
  }, []);

  return (
    <div className="stack-gap">
      <section className="welcome">
        <p className="eyebrow">Menu Utama</p>
        <h1>Halo, {user.name.split(' ')[0]} 👋</h1>
        <p className="muted">Pilih struktur data yang ingin kamu pelajari.</p>
      </section>

      <section className="menu-grid">
        {MENU.map((m) => (
          <Link key={m.to} to={m.to} className={`menu-card tone-${m.tone}`}>
            <div className={`menu-visual ${m.tone}`} aria-hidden="true">
              {m.visual.map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <div>
              <div className="menu-title">
                <h2>{m.title}</h2>
                <span className="badge">{m.badge}</span>
              </div>
              <p>{m.text}</p>
            </div>
            <span className="menu-go">Buka →</span>
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="card-head">
          <h3>Ringkasan Teori</h3>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Aspek</th>
                <th>Stack</th>
                <th>Queue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prinsip</td>
                <td>LIFO — Last In, First Out</td>
                <td>FIFO — First In, First Out</td>
              </tr>
              <tr>
                <td>Tambah data</td>
                <td><code>push()</code> di TOP</td>
                <td><code>enqueue()</code> di REAR</td>
              </tr>
              <tr>
                <td>Ambil data</td>
                <td><code>pop()</code> dari TOP</td>
                <td><code>dequeue()</code> dari FRONT</td>
              </tr>
              <tr>
                <td>Lihat data</td>
                <td><code>peek()</code> TOP</td>
                <td><code>peek()</code> FRONT</td>
              </tr>
              <tr>
                <td>Kompleksitas</td>
                <td>O(1) untuk semua operasi</td>
                <td>O(1) untuk semua operasi</td>
              </tr>
              <tr>
                <td>Contoh nyata</td>
                <td>Tumpukan piring, tombol undo, tombol back browser</td>
                <td>Antrian kasir, antrian printer, antrian tiket</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="card-head">
          <h3>Anggota Kelompok</h3>
          <span className="muted small">{members.length} anggota terdaftar</span>
        </div>
        <div className="member-grid">
          {members.map((m) => (
            <div key={m.id} className={`member ${m.id === user.id ? 'me' : ''}`}>
              <span className="avatar">{initials(m.name)}</span>
              <div>
                <strong>{m.name}</strong>
                <span className="muted small">{m.nim}</span>
              </div>
              {m.id === user.id && <span className="badge">Kamu</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
