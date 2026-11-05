import { useState } from 'react';
import { api } from '../api.js';

/** Hook untuk endpoint demo (/api/demo/...) yang mengembalikan langkah-langkah. */
export function useDemo(path) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (body) => {
    setLoading(true);
    setError('');
    try {
      setResult(await api(`/demo/${path}`, { method: 'POST', body }));
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { result, error, loading, run };
}

export function Feedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div key={feedback.id} className={`alert ${feedback.ok ? 'ok' : 'err'} pop-in`}>
      {feedback.ok ? '✓' : '⚠'} {feedback.text}
    </div>
  );
}

export function Stat({ label, value, tone }) {
  return (
    <div className={`stat ${tone ?? ''}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{String(value)}</span>
    </div>
  );
}

/** Kotak pseudo-code; baris milik operasi terakhir diberi highlight. */
export function CodeBox({ blocks, active }) {
  return (
    <div className="codebox">
      {blocks.map((block) => (
        <pre key={block.op} className={block.op === active ? 'active' : ''}>
          {block.code}
        </pre>
      ))}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          className={`tab ${value === t.id ? 'active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function usePersistentTab(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) || initial;
    } catch {
      return initial;
    }
  });
  const update = (v) => {
    setValue(v);
    try {
      localStorage.setItem(key, v);
    } catch {
      /* abaikan */
    }
  };
  return [value, update];
}
