import { useEffect, useState } from 'react';

/**
 * Pemutar langkah-langkah algoritma: maju, mundur, atau putar otomatis.
 * `render(step, index)` menggambar visualisasi untuk satu langkah.
 * `footer` (hasil akhir) baru ditampilkan setelah langkah terakhir.
 */
export default function StepPlayer({ steps, render, interval = 900, footer = null }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const last = steps.length - 1;

  useEffect(() => {
    setIndex(0);
    setPlaying(true);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setIndex((i) => i + 1), interval);
    return () => clearTimeout(timer);
  }, [playing, index, last, interval]);

  if (steps.length === 0) return null;
  const step = steps[index];

  const go = (i) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(last, i)));
  };

  return (
    <div className="player">
      <div className="player-stage">{render(step, index)}</div>
      <p className="player-note">
        <span className="step-badge">
          Langkah {index + 1}/{steps.length}
        </span>
        {step.note}
      </p>
      <div className="player-controls">
        <button className="btn ghost sm" onClick={() => go(0)} disabled={index === 0}>
          ⏮ Awal
        </button>
        <button className="btn ghost sm" onClick={() => go(index - 1)} disabled={index === 0}>
          ◀ Mundur
        </button>
        <button
          className="btn sm"
          onClick={() => {
            if (index >= last) setIndex(0);
            setPlaying((p) => !p);
          }}
        >
          {playing ? '⏸ Jeda' : index >= last ? '↻ Ulangi' : '▶ Putar'}
        </button>
        <button className="btn ghost sm" onClick={() => go(index + 1)} disabled={index === last}>
          Maju ▶
        </button>
        <button className="btn ghost sm" onClick={() => go(last)} disabled={index === last}>
          Akhir ⏭
        </button>
      </div>
      <div className="progress">
        <div className="progress-bar" style={{ width: `${((index + 1) / steps.length) * 100}%` }} />
      </div>
      {index === last && footer}
    </div>
  );
}
