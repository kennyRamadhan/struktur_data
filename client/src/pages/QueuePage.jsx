import { useState } from 'react';
import { useStructure } from '../useStructure.js';
import { CircularQueueView, QueueLine } from '../components/QueueView.jsx';
import StepPlayer from '../components/StepPlayer.jsx';
import LogPanel from '../components/LogPanel.jsx';
import { CodeBox, Feedback, Stat, useDemo } from '../components/common.jsx';

const CODE = [
  {
    op: 'enqueue',
    code: `enqueue(x):
  if count == capacity → OVERFLOW
  rear = (rear + 1) % capacity
  slots[rear] = x
  count = count + 1`,
  },
  {
    op: 'dequeue',
    code: `dequeue():
  if count == 0 → UNDERFLOW
  x = slots[front]
  front = (front + 1) % capacity
  count = count - 1
  return x`,
  },
  {
    op: 'peek',
    code: `peek():
  if count == 0 → UNDERFLOW
  return slots[front]`,
  },
];

export default function QueuePage() {
  const { state, logs, feedback, busy, run } = useStructure('queue');
  const [value, setValue] = useState('');

  if (!state) return <div className="page-loading">Memuat queue…</div>;

  const enqueue = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    run('enqueue', { value });
    setValue('');
  };

  return (
    <div className="stack-gap tone-queue">
      <header className="page-head">
        <div>
          <p className="eyebrow">Struktur Data Linear</p>
          <h1>
            Queue <span className="badge">FIFO</span>
          </h1>
          <p className="muted">
            First In, First Out: data yang pertama masuk adalah yang pertama keluar. Data masuk dari <b>REAR</b>{' '}
            (belakang) dan keluar dari <b>FRONT</b> (depan).
          </p>
        </div>
      </header>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h3>Operasi</h3>
            <span className="muted small">kapasitas {state.capacity}</span>
          </div>
          <form className="op-form" onSubmit={enqueue}>
            <input
              value={value}
              maxLength={12}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Nilai, misal: Andi"
              aria-label="Nilai yang akan di-enqueue"
            />
            <button className="btn teal" disabled={busy || !value.trim()}>
              Enqueue
            </button>
          </form>
          <div className="op-buttons">
            <button className="btn secondary" disabled={busy} onClick={() => run('dequeue')}>
              Dequeue
            </button>
            <button className="btn secondary" disabled={busy} onClick={() => run('peek')}>
              Peek
            </button>
            <button className="btn ghost" disabled={busy} onClick={() => run('clear')}>
              Kosongkan
            </button>
          </div>
          <Feedback feedback={feedback} />
          <div className="stats">
            <Stat label="front" value={state.front} />
            <Stat label="rear" value={state.rear} />
            <Stat label="size()" value={state.size} />
            <Stat label="isEmpty()" value={state.isEmpty} tone={state.isEmpty ? 'warn' : ''} />
            <Stat label="isFull()" value={state.isFull} tone={state.isFull ? 'warn' : ''} />
          </div>
          <h4 className="sub">Cara Kerja</h4>
          <CodeBox blocks={CODE} active={feedback?.op} />
        </section>

        <section className="card">
          <div className="card-head">
            <h3>Visualisasi</h3>
            <span className="muted small">circular queue</span>
          </div>
          <h4 className="sub">Isi array (slot fisik)</h4>
          <CircularQueueView state={state} />
          <h4 className="sub">Urutan antrian</h4>
          <QueueLine items={state.items} />
          <p className="muted small hint">
            💡 Coba enqueue sampai penuh, dequeue beberapa kali, lalu enqueue lagi. <b>REAR</b> akan melingkar
            kembali ke index 0 dan memakai ulang slot yang kosong.
          </p>
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h3>Penerapan Queue: Simulasi Antrian Loket</h3>
        </div>
        <CounterDemo />
      </section>

      <LogPanel logs={logs} />
    </div>
  );
}

function CounterDemo() {
  const [customers, setCustomers] = useState('Andi, Budi, Citra, Dewi, Eka');
  const { result, error, loading, run } = useDemo('counter');

  return (
    <div className="demo">
      <p className="muted small">
        Pelanggan datang dan masuk antrian (<b>enqueue</b>), lalu dilayani satu per satu (<b>dequeue</b>). Yang
        datang lebih dulu dilayani lebih dulu. Pisahkan nama dengan koma.
      </p>
      <form
        className="op-form"
        onSubmit={(e) => {
          e.preventDefault();
          run({ customers });
        }}
      >
        <input value={customers} onChange={(e) => setCustomers(e.target.value)} aria-label="Daftar pelanggan" />
        <button className="btn teal" disabled={loading}>
          Mulai
        </button>
      </form>
      {error && <div className="alert err">⚠ {error}</div>}
      {result && (
        <StepPlayer
          steps={result.steps}
          render={(step) => (
            <div className="counter-stage">
              <div className="counter-desk">
                <span className="desk-icon" aria-hidden="true">🏪</span>
                <span className="muted small">Loket</span>
                <strong>{step.phase === 'dilayani' ? step.name : '—'}</strong>
              </div>
              <QueueLine items={step.queue} emptyText="Tidak ada yang mengantre" />
              <div className="served">
                <span className="muted small">Sudah dilayani:</span>
                {step.served.length === 0 && <span className="muted small"> belum ada</span>}
                {step.served.map((s) => (
                  <span key={s.ticket} className="chip done">
                    #{s.ticket} {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
