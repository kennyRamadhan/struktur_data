/** Riwayat operasi yang tersimpan di tabel operation_log (SQLite). */
export default function LogPanel({ logs }) {
  return (
    <section className="card">
      <div className="card-head">
        <h3>Riwayat Operasi</h3>
        <span className="muted small">tersimpan di SQLite</span>
      </div>
      {logs.length === 0 ? (
        <p className="muted small">Belum ada operasi.</p>
      ) : (
        <ul className="log-list">
          {logs.map((log) => (
            <li key={log.id} className={log.success ? '' : 'failed'}>
              <span className={`dot ${log.success ? 'ok' : 'err'}`} />
              <code>{log.operation}</code>
              <span className="log-msg">{log.message}</span>
              <time>{log.created_at.slice(11, 19)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
