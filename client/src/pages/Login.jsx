import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { useTeam } from '../useTeam.js';

export default function Login() {
  const { user, login } = useAuth();
  const team = useTeam();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="hero-stack" aria-hidden="true">
          <span>D</span>
          <span>C</span>
          <span>B</span>
          <span>A</span>
        </div>
        <h1>
          Struktur Data <br />
          <span>Playground</span>
        </h1>
        <p>Visualisasi interaktif Stack (LIFO) dan Queue (FIFO).</p>
        {team.length > 0 && (
          <div className="hero-team">
            <span>Disusun oleh</span>
            <ul>
              {team.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="login-panel">
        <form className="card login-card" onSubmit={submit}>
          <h2>Masuk</h2>
          <p className="muted small">Hanya anggota kelompok yang terdaftar yang dapat masuk.</p>

          <label className="field">
            <span>Username (NIM)</span>
            <input
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="NIM, contoh: 312510195"
              required
            />
          </label>
          <label className="field">
            <span>Password (NIM)</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="alert err">⚠ {error}</div>}

          <button className="btn block" disabled={loading}>
            {loading ? 'Memeriksa…' : 'Masuk'}
          </button>
        </form>
      </section>
    </div>
  );
}
