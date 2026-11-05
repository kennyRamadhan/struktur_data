/**
 * Visualisasi array melingkar (circular queue) lengkap dengan
 * penunjuk FRONT dan REAR di bawah slot yang sesuai.
 */
export function CircularQueueView({ state }) {
  const { slots, front, rear, count } = state;

  return (
    <div className="circular">
      <div className="queue-slots">
        {slots.map((value, i) => {
          const filled = value !== null;
          const isFront = count > 0 && i === front;
          const isRear = count > 0 && i === rear;
          return (
            <div key={i} className="queue-cell">
              <div className={`queue-slot ${filled ? 'filled' : 'empty'} ${isFront ? 'is-front' : ''} ${isRear ? 'is-rear' : ''}`}>
                {filled && (
                  <span key={`${i}-${value}`} className="slot-value pop-in">
                    {value}
                  </span>
                )}
              </div>
              <span className="slot-index">{i}</span>
              <div className="queue-pointers">
                {isFront && <span className="tag front">FRONT</span>}
                {isRear && <span className="tag rear">REAR</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="muted small center">
        front = {front} · rear = {rear} · count = {count}
        {count === 0 && ' · Queue kosong'}
      </p>
    </div>
  );
}

/** Visualisasi antrian sebagai barisan: depan (kiri) → belakang (kanan). */
export function QueueLine({ items, emptyText = 'Antrian kosong' }) {
  return (
    <div className="queue-line">
      <span className="line-end">DEPAN</span>
      <div className="line-items">
        {items.length === 0 && <span className="muted small">{emptyText}</span>}
        {items.map((value, i) => (
          <span key={`${i}-${value}`} className={`chip pop-in ${i === 0 ? 'first' : ''}`}>
            {value}
          </span>
        ))}
      </div>
      <span className="line-end">BELAKANG</span>
    </div>
  );
}
