import { useState } from 'react';
import StackView from '../components/StackView.jsx';
import { QueueLine } from '../components/QueueView.jsx';
import StepPlayer from '../components/StepPlayer.jsx';
import { useDemo } from '../components/common.jsx';

export default function ComparePage() {
  const [values, setValues] = useState('1, 2, 3, 4, 5');
  const { result, error, loading, run } = useDemo('compare');

  return (
    <div className="stack-gap tone-compare">
      <header className="page-head">
        <div>
          <p className="eyebrow">Perbandingan</p>
          <h1>FIFO vs LIFO</h1>
          <p className="muted">
            Data yang sama dimasukkan ke <b>Stack</b> dan <b>Queue</b> secara bersamaan, lalu semuanya dikeluarkan.
            Perhatikan perbedaan urutan keluarnya.
          </p>
        </div>
      </header>

      <section className="card">
        <form
          className="op-form"
          onSubmit={(e) => {
            e.preventDefault();
            run({ values });
          }}
        >
          <input value={values} onChange={(e) => setValues(e.target.value)} aria-label="Data, pisahkan dengan koma" />
          <button className="btn" disabled={loading}>
            Bandingkan
          </button>
        </form>
        <p className="muted small">Pisahkan data dengan koma (maksimal 10 data).</p>
        {error && <div className="alert err">⚠ {error}</div>}

        {result && (
          <StepPlayer
            steps={result.steps}
            footer={
              <div className="conclusion-box pop-in">
                <h3>Kesimpulan</h3>
                <ul className="conclusion">
                  <li>
                    Data masuk: <code>{result.fifo.join(' → ')}</code>
                  </li>
                  <li>
                    <b>Queue (FIFO)</b> mengeluarkan: <code>{result.fifo.join(' → ')}</code> (sama dengan urutan
                    masuk)
                  </li>
                  <li>
                    <b>Stack (LIFO)</b> mengeluarkan: <code>{result.lifo.join(' → ')}</code> (kebalikan urutan
                    masuk)
                  </li>
                </ul>
              </div>
            }
            render={(step) => (
              <div className="compare-grid">
                <div className="compare-col tone-stack">
                  <h3>
                    Stack <span className="badge">LIFO</span>
                  </h3>
                  <StackView items={step.stack} capacity={result.lifo.length} compact />
                  <Output label="Urutan keluar (pop)" items={step.stackOut} />
                </div>
                <div className="compare-col tone-queue">
                  <h3>
                    Queue <span className="badge">FIFO</span>
                  </h3>
                  <div className="compare-queue">
                    <QueueLine items={step.queue} />
                  </div>
                  <Output label="Urutan keluar (dequeue)" items={step.queueOut} />
                </div>
              </div>
            )}
          />
        )}
      </section>
    </div>
  );
}

function Output({ label, items }) {
  return (
    <div className="out">
      <span className="muted small">{label}</span>
      <div className="out-items">
        {items.length === 0 ? (
          <span className="muted small">—</span>
        ) : (
          items.map((v, i) => (
            <span key={`${i}-${v}`} className="chip done pop-in">
              {v}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
