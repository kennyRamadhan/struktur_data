import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const NAV = [
  { to: '/', label: 'Menu Utama', end: true },
  { to: '/stack', label: 'Stack (LIFO)' },
  { to: '/queue', label: 'Queue (FIFO)' },
  { to: '/compare', label: 'FIFO vs LIFO' },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <i /><i /><i />
            </span>
            <span>Struktur Data <b>Playground</b></span>
          </NavLink>
          <nav className="nav">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="user-chip">
            <span className="avatar sm">{initials(user.name)}</span>
            <span className="user-name">{user.name}</span>
            <button className="btn ghost sm" onClick={logout}>
              Keluar
            </button>
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="footer">Tugas Struktur Data · React + Node.js + SQLite</footer>
    </div>
  );
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}
