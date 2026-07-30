import React, { useEffect, useRef, useState } from 'react';

// How many cards arrive per "page". Mirrors the batch size a real API would be
// asked for (`?limit=24&after=<cursor>`); 24 fills six rows of the 4-up grid,
// which keeps a 300-ticket backlog inside a sane number of Load More presses
// without shipping a payload big enough to stall a low-end district workstation.
const BATCH_SIZE = 24;

/**
 * Progressive "Load More" wrapper for the ticket card grids.
 *
 * With thousands of tickets a queue can't render (or fetch) everything at once.
 * This renders the first batch and appends further batches on demand — the list
 * only ever grows downward, so items never shift under the user the way they do
 * with numbered pages when tickets get resolved mid-session. A "Showing X of Y"
 * line keeps the true queue size visible at all times.
 *
 * The demo slices an in-memory array; against a real backend the Load More
 * handler becomes a cursor-paginated fetch and everything else stays the same.
 */
export default function BatchedTicketGrid<T>({
  items,
  renderItem,
  resetKey,
  itemNoun = 'tickets',
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  /** Change this string (tab/role/filter state) to snap back to the first batch. */
  resetKey: string;
  itemNoun?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [loading, setLoading] = useState(false);
  const loadTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    setLoading(false);
  }, [resetKey]);

  useEffect(() => () => window.clearTimeout(loadTimer.current), []);

  const visible = items.slice(0, visibleCount);
  const remaining = items.length - visible.length;

  const handleLoadMore = () => {
    if (loading) return;
    // Brief simulated latency so the demo shows the same affordance a real
    // cursor-paginated fetch would have.
    setLoading(true);
    loadTimer.current = window.setTimeout(() => {
      setVisibleCount(c => c + BATCH_SIZE);
      setLoading(false);
    }, 350);
  };

  return (
    <>
      <div className="ticket-grid">{visible.map(renderItem)}</div>

      {items.length > BATCH_SIZE && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 0 8px' }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
            Showing <strong style={{ color: 'var(--primary-deep)' }}>{visible.length.toLocaleString()}</strong> of{' '}
            <strong style={{ color: 'var(--primary-deep)' }}>{items.length.toLocaleString()}</strong> {itemNoun}
          </span>
          {remaining > 0 && (
            <button
              className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-md"
              onClick={handleLoadMore}
              disabled={loading}
              style={{ minWidth: 220, borderRadius: 20, fontWeight: 600, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Loading…' : `Load ${Math.min(BATCH_SIZE, remaining)} More`}
            </button>
          )}
        </div>
      )}
    </>
  );
}
