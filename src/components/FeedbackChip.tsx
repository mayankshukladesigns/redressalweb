import React from 'react';
import { Smile, Meh, Frown } from 'lucide-react';
import { FeedbackRating } from '../web/types';

// Shared palette for the beneficiary's experience rating, so the chip on a ticket
// card and the block in the details drawer always read as the same rating — and
// so the three views cannot drift apart on colour or icon.
export const FEEDBACK_CFG: Record<FeedbackRating, {
  icon: typeof Smile; color: string; bg: string; border: string;
}> = {
  Good:    { icon: Smile, color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7' },
  Average: { icon: Meh,   color: '#f57f17', bg: '#fff8e1', border: '#ffe082' },
  Poor:    { icon: Frown, color: '#e65100', bg: '#fff3e0', border: '#ffcc80' },
};

// Compact rating chip for ticket cards in the list views. The rating alone — the
// beneficiary's comment, where there is one, belongs in the details drawer.
export default function FeedbackChip({ rating }: { rating: FeedbackRating }) {
  const cfg = FEEDBACK_CFG[rating];
  const Icon = cfg.icon;
  return (
    <span
      title={`Beneficiary rated this resolution ${rating}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0,
        padding: '2px 8px', borderRadius: 4, fontSize: 14, fontWeight: 600,
        background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      }}
    >
      <Icon size={13} /> {rating}
    </span>
  );
}
