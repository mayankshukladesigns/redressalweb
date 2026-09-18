import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Contact numbers are personal data, so most of the number stays hidden until
// the officer explicitly asks to see it — the show-password pattern. The last
// four digits stay readable so a number can still be recognised while masked,
// and the original spacing is kept so the value still reads as a phone number.
export function maskPhone(value: string, visible = 4): string {
  const total = (value.match(/\d/g) || []).length;
  // Too short to partially mask — hide every digit rather than leak the lot.
  const keep = total > visible ? visible : 0;
  let seen = 0;
  return value.replace(/\d/g, (d) => (seen++ >= total - keep ? d : '\u2022'));
}

// One masked number plus its reveal toggle. Each instance keeps its own state,
// so revealing the caller's contact does not also reveal the beneficiary's, and
// both re-mask whenever the drawer switches to a different ticket.
export default function MaskedPhone({ value }: { value: string }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => { setRevealed(false); }, [value]);

  // Both states are stacked in one grid cell so the cell is always as wide as
  // the wider of the two. Dots and digits are not the same width, so without
  // this the eye icon would jump sideways on every toggle.
  const cellStyle: React.CSSProperties = { gridArea: '1 / 1', whiteSpace: 'pre' };

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-dark)' }}>
      <span style={{ display: 'inline-grid' }}>
        <span style={{ ...cellStyle, visibility: revealed ? 'visible' : 'hidden' }} aria-hidden={!revealed}>
          {value}
        </span>
        <span style={{ ...cellStyle, visibility: revealed ? 'hidden' : 'visible' }} aria-hidden={revealed}>
          {maskPhone(value)}
        </span>
      </span>
      <button
        type="button"
        onClick={() => setRevealed((r) => !r)}
        aria-label={revealed ? 'Hide contact number' : 'Show contact number'}
        aria-pressed={revealed}
        title={revealed ? 'Hide contact number' : 'Show contact number'}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: 0, border: 'none', background: 'none', cursor: 'pointer',
          color: 'var(--text-muted)', lineHeight: 1, flexShrink: 0,
        }}
      >
        {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </span>
  );
}
