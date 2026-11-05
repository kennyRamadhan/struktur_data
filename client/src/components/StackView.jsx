/**
 * Visualisasi stack secara vertikal: index 0 di bawah, TOP di atas.
 * Jika `capacity` diberikan, slot kosong juga digambar.
 */
export default function StackView({ items, capacity, compact = false }) {
  const slots = capacity ?? Math.max(items.length, 1);
  const top = items.length - 1;
  const rows = [];

  for (let i = slots - 1; i >= 0; i--) {
    const filled = i <= top;
    rows.push(
      <div key={i} className="stack-row">
        <span className="slot-index">{i}</span>
        <div className={`stack-slot ${filled ? 'filled' : 'empty'} ${i === top ? 'is-top' : ''}`}>
          {filled && (
            <span key={`${i}-${items[i]}`} className="slot-value pop-in">
              {items[i]}
            </span>
          )}
        </div>
        <span className="pointer-label">{i === top ? '← TOP' : ''}</span>
      </div>
    );
  }

  return (
    <div className={`stack-view ${compact ? 'compact' : ''}`}>
      {rows}
      <div className="stack-base" />
      {top === -1 && <p className="muted center small">Stack kosong · top = -1</p>}
    </div>
  );
}
