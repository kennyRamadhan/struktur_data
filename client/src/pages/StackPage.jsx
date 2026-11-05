import { useState } from 'react';
import { useStructure } from '../useStructure.js';
import StackView from '../components/StackView.jsx';
import StepPlayer from '../components/StepPlayer.jsx';
import LogPanel from '../components/LogPanel.jsx';
import { CodeBox, Feedback, Stat, Tabs, useDemo, usePersistentTab } from '../components/common.jsx';

const CODE = [
  {
    op: 'push',
    code: `push(x):
  if top == capacity - 1 → OVERFLOW
  top = top + 1
  items[top] = x`,
  },
  {
    op: 'pop',
    code: `pop():
  if top == -1 → UNDERFLOW
  x = items[top]
  top = top - 1
  return x`,
  },
  {
    op: 'peek',
    code: `peek():
  if top == -1 → UNDERFLOW
  return items[top]`,
  },
];

export default function StackPage() {
  const { state, logs, feedback, busy, run } = useStructure('stack');
  const [value, setValue] = useState('');
  const [tab, setTab] = usePersistentTab('sdp_stack_tab', 'brackets');

  if (!state) return <div className="page-loading">Memuat stack…</div>;

  const push = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    run('push', { value });
    setValue('');
  };

  return (
    <div className="stack-gap tone-stack">
      <header className="page-head">
        <div>
          <p className="eyebrow">Struktur Data Linear</p>
          <h1>
            Stack <span className="badge">LIFO</span>
          </h1>
          <p className="muted">
            Last In, First Out: data yang terakhir masuk adalah yang pertama keluar. Semua operasi hanya
            terjadi di satu ujung, yaitu <b>TOP</b>.
          </p>
        </div>
      </header>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h3>Operasi</h3>
            <span className="muted small">kapasitas {state.capacity}</span>
          </div>
          <form className="op-form" onSubmit={push}>
            <input
              value={value}
              maxLength={12}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Nilai, misal: 42"
              aria-label="Nilai yang akan di-push"
            />
            <button className="btn" disabled={busy || !value.trim()}>
              Push
            </button>
          </form>
          <div className="op-buttons">
            <button className="btn secondary" disabled={busy} onClick={() => run('pop')}>
              Pop
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
            <Stat label="top" value={state.top} />
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
            <span className="muted small">array statis + penunjuk top</span>
          </div>
          <StackView items={state.items} capacity={state.capacity} />
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h3>Penerapan Stack</h3>
        </div>
        <Tabs
          tabs={[
            { id: 'brackets', label: 'Cek Tanda Kurung' },
            { id: 'reverse', label: 'Balik Kata' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'brackets' ? <BracketsDemo /> : <ReverseDemo />}
      </section>

      <LogPanel logs={logs} />
    </div>
  );
}

function BracketsDemo() {
  const [expression, setExpression] = useState('{[(a+b)*c]-d}');
  const [submitted, setSubmitted] = useState('');
  const { result, error, loading, run } = useDemo('brackets');

  return (
    <div className="demo">
      <p className="muted small">
        Kurung buka di-<b>push</b>. Saat bertemu kurung tutup, stack di-<b>pop</b> dan dicocokkan. Ekspresi
        seimbang jika semua cocok dan stack kosong di akhir.
      </p>
      <form
        className="op-form"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(expression);
          run({ expression });
        }}
      >
        <input value={expression} maxLength={30} onChange={(e) => setExpression(e.target.value)} aria-label="Ekspresi" />
        <button className="btn" disabled={loading}>
          Periksa
        </button>
      </form>
      {error && <div className="alert err">⚠ {error}</div>}
      {result && (
        <StepPlayer
          steps={result.steps}
          footer={
            <div className={`alert ${result.balanced ? 'ok' : 'err'} pop-in`}>
              {result.balanced ? '✓' : '✗'} {result.message}
            </div>
          }
          render={(step) => (
            <div className="demo-stage">
              <div className="expr">
                {[...submitted].map((c, i) => (
                  <span key={i} className={i === step.index ? `cur ${step.action}` : i < step.index ? 'done' : ''}>
                    {c}
                  </span>
                ))}
              </div>
              <StackView items={step.stack} compact />
            </div>
          )}
        />
      )}
    </div>
  );
}

function ReverseDemo() {
  const [text, setText] = useState('STRUKTUR');
  const { result, error, loading, run } = useDemo('reverse');

  return (
    <div className="demo">
      <p className="muted small">
        Setiap huruf di-<b>push</b> ke stack, lalu di-<b>pop</b> satu per satu. Karena LIFO, huruf terakhir keluar
        pertama sehingga kata menjadi terbalik.
      </p>
      <form
        className="op-form"
        onSubmit={(e) => {
          e.preventDefault();
          run({ text });
        }}
      >
        <input value={text} maxLength={30} onChange={(e) => setText(e.target.value)} aria-label="Teks" />
        <button className="btn" disabled={loading}>
          Balik
        </button>
      </form>
      {error && <div className="alert err">⚠ {error}</div>}
      {result && (
        <StepPlayer
          steps={result.steps}
          interval={600}
          render={(step) => (
            <div className="demo-stage">
              <StackView items={step.stack} compact />
              <div className="output-box">
                <span className="muted small">Hasil</span>
                <strong className="mono">{step.output || '—'}</strong>
              </div>
            </div>
          )}
        />
      )}
    </div>
  );
}
