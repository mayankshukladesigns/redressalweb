import React, { useState, useRef } from 'react';
import { TicketCard, ResolvedTicketCard, AppealTicket } from '../web/types';
import { initialAppealTickets } from '../web/mockData';
import TicketDetailsScreen from './TicketDetailsScreen';
import BatchedTicketGrid from '../components/BatchedTicketGrid';
import {
  Search,
  AlertTriangle,
  Scale,
  CheckCircle,
  Eye,
  Info,
  RefreshCw,
  X,
  Calendar,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Inbox,
  Clock,
} from 'lucide-react';

interface DPOViewProps {
  sharedPendingCards: TicketCard[];
  setSharedPendingCards: React.Dispatch<React.SetStateAction<TicketCard[]>>;
  sharedResolvedCards: ResolvedTicketCard[];
  setSharedResolvedCards: React.Dispatch<React.SetStateAction<ResolvedTicketCard[]>>;
}

type AssignedFilter = 'DPO' | 'CDPO' | 'Supervisor' | 'AWW';
type DateRangeOption = '7' | '14' | '21' | '21+';

// Constants
const PROJECT_OPTIONS = ['All Projects', 'Sanganer', 'Jotwara', 'Amer', 'Sanganer II', 'Phagi'];
const SECTOR_OPTIONS = ['All Sectors', 'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'];
const AWC_OPTIONS = [
  'All Centres',
  'AWC 27305060101', 'AWC 27305060102', 'AWC 27305060103',
  'AWC 27305060104', 'AWC 27305060105', 'AWC 27305060106',
];
const COMPLAINT_TYPES = ['Urgent', 'Corruption', 'General'];
const COMPLAINT_PRIORITY: Record<string, number> = { Urgent: 0, Corruption: 1, General: 2 };
const complaintRank = (t?: string) => COMPLAINT_PRIORITY[t ?? ''] ?? 3;

// Tickets predating the origin field are treated as web self-service.
type SourceFilter = 'All' | 'WEB' | 'CALL_CENTRE';
const channelOf = (c: { origin?: { channel?: string } }) => c.origin?.channel ?? 'WEB';
const passesSource = (c: { origin?: { channel?: string } }, f: SourceFilter) => f === 'All' || channelOf(c) === f;
const BENEFICIARY_CATEGORIES = [
  'Pregnant Woman', 'Lactating Mother', 'Children 0-6 months',
  'Children (6m-3y)', 'Children (3-6y)', 'Adolescent Girl',
];
const REFERENCE_TODAY = new Date(2025, 5, 30);
// A ticket is escalated to the DPO (view-only) once it has been open this long.
const ESCALATION_DAYS = 14;

// Helper function to parse dates
function parseDateStr(str: string): Date | null {
  if (!str) return null;
  const cleanStr = str.replace('Submitted:', '').trim();
  const m = cleanStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

const formatAwcName = (name: string | undefined): string => {
  if (!name) return '';
  let clean = name.split('(')[0].trim();
  const matchCentre = clean.match(/(?:Anganwadi\s+Centr?e)\s+(\d+)/i);
  if (matchCentre) {
    return `AWC 2730506010${matchCentre[1]}`;
  }
  const matchAwcDash = clean.match(/AWC-10(\d+)/i);
  if (matchAwcDash) {
    return `AWC 2730506010${matchAwcDash[1]}`;
  }
  return clean;
};

function passesDateFilter(
  dateStr: string,
  option: DateRangeOption | null,
): boolean {
  if (!option) return true;
  const d = parseDateStr(dateStr);
  if (!d) return false;
  if (option === '21+') {
    // Equivalent to the Overdue definition used elsewhere (age >= 21 days).
    const cutoff = new Date(REFERENCE_TODAY);
    cutoff.setDate(cutoff.getDate() - 21);
    return d <= cutoff;
  }
  const days = Number(option);
  const windowStart = new Date(REFERENCE_TODAY);
  windowStart.setDate(windowStart.getDate() - (days - 1));
  return d >= windowStart && d <= REFERENCE_TODAY;
}

// Role chip style helper
const getRoleChipStyle = (role: string) => {
  switch (role?.toUpperCase()) {
    case 'DPO':
      return { bg: '#e0e0f8', color: '#1a237e', border: '#b8c1ec' };
    case 'CDPO':
      return { bg: '#e3f2fd', color: '#1565c0', border: '#90caf9' };
    case 'SUPERVISOR':
      return { bg: '#f3e5f5', color: '#7b1fa2', border: '#ce93d8' };
    case 'AWW':
      return { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' };
    default:
      return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  }
};

// Date Range Popover
const DateRangePopover = ({
  open, onClose, applied, onApply, placement = 'below',
}: {
  open: boolean; onClose: () => void;
  applied: DateRangeOption | null;
  onApply: (opt: DateRangeOption | null) => void;
  placement?: 'below' | 'above';
}) => {
  const [draft, setDraft] = useState<DateRangeOption | null>(applied);

  if (!open) return null;

  const handleCancel = () => {
    setDraft(applied);
    onClose();
  };

  return (
    <>
      <div onClick={handleCancel} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      <div style={{
        position: 'absolute',
        ...(placement === 'below' ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
        left: 0, zIndex: 50, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
        width: 280, background: '#ffffff', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '18px 20px',
      }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--primary-deep)', marginBottom: 12 }}>
          Filter by Date Range
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {([['7', 'Last 7 Days'], ['14', 'Last 14 Days'], ['21', 'Last 21 Days'], ['21+', 'More than 21 Days']] as [DateRangeOption, string][]).map(([val, lbl]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', cursor: 'pointer', fontSize: 15, fontWeight: draft === val ? 600 : 400, color: draft === val ? 'var(--primary-deep)' : 'var(--text-dark)' }}>
              <input type="radio" name="dateRangeDPO" checked={draft === val} onChange={() => setDraft(val)} style={{ accentColor: 'var(--primary-deep)', width: 16, height: 16 }} />
              {lbl}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm" style={{ flex: 1 }} onClick={() => { setDraft(null); onApply(null); }}>Clear</button>
          <button className="ux4g-btn ux4g-btn-primary ux4g-btn-sm" style={{ flex: 1 }} onClick={() => { onApply(draft); onClose(); }}>Apply</button>
        </div>
      </div>
    </>
  );
};

// Pending Breakdown Modal
const PendingBreakdownModal = ({
  open, onClose, dpoP, dpoO, cdpoP, cdpoO, supP, supO, awwP, awwO,
}: {
  open: boolean; onClose: () => void;
  dpoP: number; dpoO: number;
  cdpoP: number; cdpoO: number;
  supP: number; supO: number;
  awwP: number; awwO: number;
}) => {
  if (!open) return null;
  const totalP = dpoP + cdpoP + supP + awwP;
  const totalO = dpoO + cdpoO + supO + awwO;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: 'var(--primary-deep)' }}>Pending Breakdown</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', borderRadius: 6 }}><X size={20} /></button>
        </div>
        <div style={{ background: '#e8eaf6', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#5c67b5', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Pending</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: '#1a237e', lineHeight: 1 }}>{totalP.toLocaleString()}</span>
        </div>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)' }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Role</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#e65100', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Pending</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#d32f2f', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Overdue</th>
              </tr>
            </thead>
            <tbody>
              {[
                { r: 'DPO', p: dpoP, o: dpoO },
                { r: 'CDPO', p: cdpoP, o: cdpoO },
                { r: 'Supervisor', p: supP, o: supO },
                { r: 'AWW', p: awwP, o: awwO }
              ].map(row => (
                <tr key={row.r} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dark)', fontWeight: 500 }}>{row.r}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: '#e65100', fontSize: 17 }}>{row.p}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: '#d32f2f', fontSize: 17 }}>{row.o}</td>
                </tr>
              ))}
              <tr style={{ background: '#e8eaf6', borderTop: '2px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px', color: '#1a237e', fontWeight: 700 }}>Total</td>
                <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 800, color: '#e65100', fontSize: 18 }}>{totalP}</td>
                <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 800, color: '#d32f2f', fontSize: 18 }}>{totalO}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 10, background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <Info size={15} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-dark)', lineHeight: 1.55 }}>
            <strong>Pending</strong> is the count of tickets still awaiting action. <strong>Overdue</strong> tickets are grievances pending for more than 21 days and need immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
};

// Resolved Breakdown Modal
const ResolvedBreakdownModal = ({
  open, onClose, byRole, byStatus,
}: {
  open: boolean; onClose: () => void;
  byRole: { dpo: number; cdpo: number; sup: number; aww: number };
  byStatus: {
    closurePending: { dpo: number; cdpo: number; sup: number; aww: number };
    closed: { dpo: number; cdpo: number; sup: number; aww: number };
    appealRaised: { dpo: number; cdpo: number; sup: number; aww: number };
    appealResolved: { dpo: number; cdpo: number; sup: number; aww: number };
  };
}) => {
  if (!open) return null;
  const totalResolved = byRole.dpo + byRole.cdpo + byRole.sup + byRole.aww;
  const subCards = [
    { label: 'Pending for Closure', icon: Clock,         color: '#f57f17', bg: '#fff8e1', border: '#ffe082', total: byStatus.closurePending.dpo + byStatus.closurePending.cdpo + byStatus.closurePending.sup + byStatus.closurePending.aww, rows: [{r:'DPO',v:byStatus.closurePending.dpo},{r:'CDPO',v:byStatus.closurePending.cdpo},{r:'Supervisor',v:byStatus.closurePending.sup},{r:'AWW',v:byStatus.closurePending.aww}] },
    { label: 'Closed',          icon: CheckCircle2,  color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', total: byStatus.closed.dpo         + byStatus.closed.cdpo         + byStatus.closed.sup         + byStatus.closed.aww,         rows: [{r:'DPO',v:byStatus.closed.dpo},        {r:'CDPO',v:byStatus.closed.cdpo},        {r:'Supervisor',v:byStatus.closed.sup},        {r:'AWW',v:byStatus.closed.aww}]         },
    { label: 'Appeal Raised',   icon: AlertTriangle, color: '#e65100', bg: '#fff3e0', border: '#ffcc80', total: byStatus.appealRaised.dpo    + byStatus.appealRaised.cdpo    + byStatus.appealRaised.sup    + byStatus.appealRaised.aww,   rows: [{r:'DPO',v:byStatus.appealRaised.dpo},  {r:'CDPO',v:byStatus.appealRaised.cdpo},  {r:'Supervisor',v:byStatus.appealRaised.sup},  {r:'AWW',v:byStatus.appealRaised.aww}]   },
    { label: 'Appeal Resolved', icon: ShieldCheck,   color: '#1565c0', bg: '#e8eaf6', border: '#90caf9', total: byStatus.appealResolved.dpo  + byStatus.appealResolved.cdpo  + byStatus.appealResolved.sup  + byStatus.appealResolved.aww, rows: [{r:'DPO',v:byStatus.appealResolved.dpo},{r:'CDPO',v:byStatus.appealResolved.cdpo},{r:'Supervisor',v:byStatus.appealResolved.sup},{r:'AWW',v:byStatus.appealResolved.aww}] },
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 580 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 700, color: 'var(--primary-deep)' }}>Resolved Breakdown</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', borderRadius: 6 }}><X size={20} /></button>
        </div>
        <div style={{ background: 'var(--accent-green-light)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Resolved</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1 }}>{totalResolved.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{l:'DPO',v:byRole.dpo},{l:'CDPO',v:byRole.cdpo},{l:'Supervisor',v:byRole.sup},{l:'AWW',v:byRole.aww}].map(r => (
              <span key={r.l} style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 999, padding: '4px 10px', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                {r.l} <strong style={{ color: 'var(--accent-green)' }}>{r.v}</strong>
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {subCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={13} style={{ color: card.color }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{card.label}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.total}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: `1px solid ${card.border}`, paddingTop: 8 }}>
                  {card.rows.map(r => (
                    <div key={r.r} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: card.color }}>
                      <span>{r.r}</span><strong>{r.v}</strong>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Ticket card component (handles pending & overdue tickets)
const TicketCardComponent = ({ card, onView }: { card: TicketCard; onView: () => void }) => {
  const isCorruptionOrUrgent = card.complaintType === 'Corruption' || card.complaintType === 'Urgent';
  const age = (() => {
    if (!card.submittedDate) return 0;
    const cleanStr = card.submittedDate.replace('Submitted:', '').trim();
    const m = cleanStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return 0;
    const ticketDate = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    const diff = REFERENCE_TODAY.getTime() - ticketDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  })();
  const isTicketOverdue = card.isOverdue || age >= 21;
  const accent = isTicketOverdue ? 'var(--color-danger)' : 'var(--accent-saffron)';

  return (
    <div className="ticket-card" style={{ borderColor: isTicketOverdue ? 'var(--color-danger)' : 'var(--border-color)' }} onClick={onView}>
      <div className="ticket-card-header">
        <span className="ticket-id">{card.ticketNumber}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {card.complaintType === 'Corruption' && <span className="badge badge-danger">Corruption</span>}
          {card.complaintType === 'Urgent' && <span className="badge badge-warning">Urgent</span>}
          {isTicketOverdue && (
            <span className="badge badge-danger" style={{ backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2' }}>
              OVERDUE
            </span>
          )}
        </div>
      </div>

      <div className="ticket-title-row">
        <h4 className="ticket-title" style={{ margin: 0 }}>{card.beneficiaryName || card.byName}</h4>
        {card.beneficiaryType && (
          <span style={{ fontSize: 13, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
            {card.beneficiaryType}
          </span>
        )}
      </div>

      <div className="ticket-topic">{card.topic || card.title}</div>
      <p className="ticket-desc">{card.description}</p>

      <div className="ticket-metadata">
        <span className="ticket-date" style={{ fontSize: 14 }}>{card.submittedDate?.includes('Submitted') ? card.submittedDate : `Submitted: ${card.submittedDate}`}</span>
        <span style={{ fontWeight: 700, fontSize: 14, color: accent }}>
          {card.daysLabel || (isTicketOverdue ? `Overdue by ${age - 20} Days` : 'Urgent')}
        </span>
      </div>

      <div className="ticket-awc-row">
        <span>AWC: <strong className="ticket-awc">{formatAwcName(card.awcName)}</strong></span>
        {isCorruptionOrUrgent && (card.documentsCount ?? 0) > 0 && (
          <span style={{ background: '#e8eaf6', color: '#1565c0', padding: '2px 8px', borderRadius: 4, fontSize: 13, fontWeight: 600, border: '1px solid #90caf9' }}>
            Doc Uploaded
          </span>
        )}
      </div>

      <button className="ux4g-btn ux4g-btn-secondary ux4g-btn-md" style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
        onClick={e => { e.stopPropagation(); onView(); }}>
        <Eye size={14} /> View Details
      </button>
    </div>
  );
};

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CLOSED:          { label: 'CLOSED',          color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7' },
  CLOSURE_PENDING: { label: 'PENDING FOR CLOSURE', color: '#f57f17', bg: '#fff8e1', border: '#ffe082' },
  APPEAL_RAISED:   { label: 'APPEAL RAISED',   color: '#e65100', bg: '#fff3e0', border: '#ffcc80' },
  APPEAL_RESOLVED: { label: 'APPEAL RESOLVED', color: '#1565c0', bg: '#e8eaf6', border: '#90caf9' },
};

// Resolved ticket card component
const ResolvedCard = ({ card, onView }: { card: ResolvedTicketCard; onView: () => void }) => {
  const cfg = STATUS_CFG[card.status] ?? STATUS_CFG.CLOSED;
  return (
    <div className="ticket-card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }} onClick={onView}>
      {card.awaitingCdpoClosure && (
        <div style={{ background: '#fff8e1', borderBottom: '1px solid #ffe082', padding: '7px 18px', fontSize: 14, fontWeight: 700, color: '#f57f17' }}>
          Awaiting CDPO Closure
        </div>
      )}
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="ticket-id">{card.ticketNumber}</span>
          <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 12.5, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
            {cfg.label}
          </span>
        </div>
        <div className="ticket-title-row">
          <h4 className="ticket-title" style={{ margin: 0 }}>{card.beneficiaryName}</h4>
          {card.beneficiaryType && (
            <span style={{ fontSize: 13, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
              {card.beneficiaryType}
            </span>
          )}
        </div>
        {card.topic && <div className="ticket-topic">{card.topic}</div>}
        <p className="ticket-desc">{card.description}</p>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>
          {card.resolvedDate}
        </div>
        {card.actionTaken && (
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
              Action Taken Report (ATR)
            </div>
            <p style={{ fontSize: 14.5, color: 'var(--text-dark)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
              {card.actionTaken}
            </p>
          </div>
        )}
        <div className="ticket-awc-row">
          <span>AWC: <strong className="ticket-awc">{formatAwcName(card.awcName)}</strong></span>
        </div>
        <button className="ux4g-btn ux4g-btn-secondary ux4g-btn-md" style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { e.stopPropagation(); onView(); }}>
          <Eye size={14} /> View Details
        </button>
      </div>
    </div>
  );
};

// Appeal ticket card
const AppealCard = ({ card, onResolve, onViewDetails }: { card: AppealTicket; onResolve: () => void; onViewDetails: () => void }) => {
  const roleStyle = getRoleChipStyle(card.roleLabel);
  const isResolved = card.status === 'resolved';

  return (
    <div className="ticket-card" style={{ borderColor: isResolved ? 'var(--accent-green)' : 'var(--accent-saffron)' }} onClick={isResolved ? onViewDetails : onResolve}>
      <div className="ticket-card-header">
        <span className="ticket-id">{card.ticketNumber}</span>
        <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 12.5, fontWeight: 700, background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
          {card.roleLabel?.toUpperCase()}
        </span>
      </div>

      <div className="ticket-title-row">
        <h4 className="ticket-title" style={{ margin: 0 }}>{card.byName}</h4>
        <span style={{ fontSize: 13, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>
          Beneficiary
        </span>
      </div>

      <div className="ticket-topic">{card.title}</div>
      
      <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 6, padding: '8px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Appeal Reason</div>
        <p style={{ fontSize: 14.5, color: 'var(--text-dark)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
          {card.appealReason}
        </p>
      </div>

      <div className="ticket-awc-row">
        <span>Filed: <strong>{card.appealDate?.replace('Appeal Filed:', '') || '28 Jun 2025'}</strong></span>
        {card.documents && (card.complaintType === 'Corruption' || card.complaintType === 'Urgent') && (
          <span style={{ background: '#e8eaf6', color: '#1565c0', padding: '2px 8px', borderRadius: 4, fontSize: 13, fontWeight: 600, border: '1px solid #90caf9' }}>
            Doc Uploaded
          </span>
        )}
      </div>

      {isResolved ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent-green-light)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--accent-green)' }}>
          <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-green)' }}>
            Appeal Resolved
          </span>
        </div>
      ) : (
        <button className="ux4g-btn ux4g-btn-primary ux4g-btn-md" style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
          onClick={e => { e.stopPropagation(); onResolve(); }}>
          Resolve Appeal
        </button>
      )}
    </div>
  );
};

export default function DPOView({
  sharedPendingCards,
  setSharedPendingCards,
  sharedResolvedCards,
  setSharedResolvedCards,
}: DPOViewProps) {

  // Core view state (tabs: 'Pending' | 'Appeals' | 'Resolved').
  // DPO lands on Pending first, followed by Appeals and Resolved.
  const [activeTab, setActiveTab] = useState<'Pending' | 'Resolved' | 'Appeals'>('Pending');
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>('DPO');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Breakdown modals
  const [pendingModal, setPendingModal] = useState(false);
  const [resolvedModal, setResolvedModal] = useState(false);

  // Appeal Tickets list state
  const [appealList, setAppealList] = useState<AppealTicket[]>(() => initialAppealTickets);

  // Dropdown scoping
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedAWC, setSelectedAWC] = useState('All Centres');

  // Sidebar filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [appliedDateOption, setAppliedDateOption] = useState<DateRangeOption | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const [datePanelPlacement, setDatePanelPlacement] = useState<'below' | 'above'>('below');
  const toggleDatePanel = () => {
    const buttonRect = dateButtonRef.current?.getBoundingClientRect();
    const estimatedPanelHeight = 340;
    setDatePanelPlacement(
      buttonRect && window.innerHeight - buttonRect.bottom < estimatedPanelHeight ? 'above' : 'below'
    );
    setDateOpen(v => !v);
  };

  // Filter lists: complaint types or status/category
  const [appliedTypes, setAppliedTypes] = useState<string[]>([]);
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('All');

  // Reset filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setIsOverdueOnly(false);
    setAppliedDateOption(null);
    setAppliedTypes([]);
    setAppliedStatuses([]);
    setSelectedCategory('All');
    setSourceFilter('All');
  };

  const handleRoleSwitch = (role: AssignedFilter) => {
    setAssignedFilter(role);
    setSelectedProject('All Projects');
    setSelectedSector('All Sectors');
    setSelectedAWC('All Centres');
    clearAllFilters();
    // Appeals is DPO specific, switch back to Pending if switching roles
    if (role !== 'DPO' && activeTab === 'Appeals') {
      setActiveTab('Pending');
    }
  };

  const handleTabChange = (tab: 'Pending' | 'Resolved' | 'Appeals') => {
    setActiveTab(tab);
    clearAllFilters();
  };

  // ─── Derive Age of Ticket ───
  const getTicketAge = (submittedDate?: string) => {
    if (!submittedDate) return 0;
    const cleanStr = submittedDate.replace('Submitted:', '').trim();
    const m = cleanStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return 0;
    const ticketDate = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    const diff = REFERENCE_TODAY.getTime() - ticketDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // ─── Derive breakdown counts dynamically from shared state ───
  const countPending = (role: AssignedFilter) => {
    return sharedPendingCards.filter(t => t.assignedTo === role).length;
  };
  const countResolved = (role: AssignedFilter) => {
    const directResolved = sharedResolvedCards.filter(t => t.assignedTo === role).length;
    const resolvedAppeals = appealList.filter(t => t.status === 'resolved' && t.roleLabel === role).length;
    return directResolved + resolvedAppeals;
  };
  const countOverdue = (role: AssignedFilter) => {
    return sharedPendingCards.filter(t => t.assignedTo === role && (t.isOverdue || getTicketAge(t.submittedDate) >= 21)).length;
  };

  const dpoP = countPending('DPO');  const dpoO = countOverdue('DPO');  const dpoR = countResolved('DPO');
  const cdpoP = countPending('CDPO'); const cdpoO = countOverdue('CDPO'); const cdpoR = countResolved('CDPO');
  const supP = countPending('Supervisor'); const supO = countOverdue('Supervisor'); const supR = countResolved('Supervisor');
  const awwP = countPending('AWW');  const awwO = countOverdue('AWW');  const awwR = countResolved('AWW');

  const countByStatus = (status: string, role: AssignedFilter) => {
    const cardsMatch = sharedResolvedCards.filter(c => c.assignedTo === role && c.status === status).length;
    const appealsMatch = status === 'APPEAL_RESOLVED' 
      ? appealList.filter(c => c.status === 'resolved' && c.roleLabel === role).length 
      : status === 'APPEAL_RAISED' 
        ? appealList.filter(c => c.status === 'raised' && c.roleLabel === role).length 
        : 0;
    return cardsMatch + appealsMatch;
  };

  const byStatus = {
    closurePending: { dpo: countByStatus('CLOSURE_PENDING', 'DPO'), cdpo: countByStatus('CLOSURE_PENDING', 'CDPO'), sup: countByStatus('CLOSURE_PENDING', 'Supervisor'), aww: countByStatus('CLOSURE_PENDING', 'AWW') },
    closed: { dpo: countByStatus('CLOSED', 'DPO'), cdpo: countByStatus('CLOSED', 'CDPO'), sup: countByStatus('CLOSED', 'Supervisor'), aww: countByStatus('CLOSED', 'AWW') },
    appealRaised: { dpo: countByStatus('APPEAL_RAISED', 'DPO'), cdpo: countByStatus('APPEAL_RAISED', 'CDPO'), sup: countByStatus('APPEAL_RAISED', 'Supervisor'), aww: countByStatus('APPEAL_RAISED', 'AWW') },
    appealResolved: { dpo: countByStatus('APPEAL_RESOLVED', 'DPO'), cdpo: countByStatus('APPEAL_RESOLVED', 'CDPO'), sup: countByStatus('APPEAL_RESOLVED', 'Supervisor'), aww: countByStatus('APPEAL_RESOLVED', 'AWW') }
  };

  // ─── Filter logic helper for active lists ───
  const applyCommonFilters = (t: TicketCard) => {
    // 0. Source channel
    if (!passesSource(t, sourceFilter)) return false;

    // 1. Scoping dropdowns
    if (assignedFilter === 'CDPO' && selectedProject !== 'All Projects') {
      if (!t.project || t.project !== selectedProject) return false;
    }
    if ((assignedFilter === 'Supervisor' || assignedFilter === 'AWW') && selectedProject !== 'All Projects') {
      if (!t.project || t.project !== selectedProject) return false;
    }
    if ((assignedFilter === 'Supervisor' || assignedFilter === 'AWW') && selectedSector !== 'All Sectors') {
      if (!t.sector || t.sector !== selectedSector) return false;
    }
    if (assignedFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!t.awcName || t.awcName !== selectedAWC) return false;
    }

    // 2. Sidebar Urgency Toggle (Overdue Only) — Pending tab only; Resolved/Appeals
    // don't carry SLA state.
    if (activeTab === 'Pending' && isOverdueOnly) {
      const age = getTicketAge(t.submittedDate);
      if (!(t.isOverdue || age >= 21)) return false;
    }

    // 3. Category Filter
    if (selectedCategory !== 'All' && t.beneficiaryType !== selectedCategory) return false;

    // 4. Complaint Types
    if (appliedTypes.length > 0 && (!t.complaintType || !appliedTypes.includes(t.complaintType))) return false;

    // 5. Date Range
    if (!passesDateFilter(t.submittedDate ?? '', appliedDateOption)) return false;

    // 6. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = t.ticketNumber.toLowerCase().includes(q) ||
        t.beneficiaryName.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.topic && t.topic.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  };

  // ─── 1. Pending Tab List ───
  // Includes overdue tickets too (for every "Assigned To" scope) — there is no
  // separate Overdue tab; overdue tickets stay with their original assignee and
  // are surfaced here via the "Overdue Only" sidebar filter.
  const displayedPending = sharedPendingCards.filter(t => {
    if (t.assignedTo !== assignedFilter) return false;
    // CDPO/Supervisor/AWW tickets only become visible to the DPO once they are escalated,
    // which happens 14 days after creation. Before that they sit within the block/sector
    // hierarchy and the district office has no view of them. Ownership never
    // transfers on escalation — the DPO's access stays read-only.
    if ((assignedFilter === 'CDPO' || assignedFilter === 'Supervisor' || assignedFilter === 'AWW') && getTicketAge(t.submittedDate) < ESCALATION_DAYS) return false;
    return applyCommonFilters(t);
  })
    // Queue order: the closer a ticket is to breaching the 21-day SLA, the higher it
    // sits — already-overdue tickets lead (most overdue first), then those nearest the
    // deadline. Oldest-first achieves exactly that; severity only breaks age ties.
    .sort((a, b) => {
      const ageDiff = getTicketAge(b.submittedDate) - getTicketAge(a.submittedDate);
      if (ageDiff !== 0) return ageDiff;
      return complaintRank(a.complaintType) - complaintRank(b.complaintType);
    });

  // ─── 2. Resolved Tab List ───
  const displayedResolved = (() => {
    const directResolved = sharedResolvedCards.filter(t => {
      if (t.assignedTo !== assignedFilter) return false;
      return applyCommonFilters(t);
    });

    // Merge resolved appeals under Resolved tab when viewing DPO scope
    if (assignedFilter === 'DPO') {
      const resolvedAppeals = appealList
        .filter(t => t.status === 'resolved')
        .map(t => {
          const card: ResolvedTicketCard = {
            id: t.id,
            ticketNumber: t.ticketNumber,
            beneficiaryName: t.byName,
            beneficiaryType: 'Beneficiary',
            topic: t.title,
            description: t.appealReason || t.originalDescription,
            submittedDate: t.submittedDate || 'Submitted: 25/06/2025',
            resolvedDate: 'Resolved: 30/06/2025',
            daysLabel: 'Resolved',
            daysType: 'resolved' as any,
            isOverdue: false,
            awcName: 'AWC 27305060101',
            status: 'APPEAL_RESOLVED',
            actionTaken: t.resolutionNotes || 'Appeal resolved successfully by DPO.',
            assignedTo: t.roleLabel as AssignedFilter,
            origin: t.origin,
          };
          return card;
        })
        .filter(applyCommonFilters);
      return [...directResolved, ...resolvedAppeals];
    }

    return directResolved;
  })().sort((a, b) => {
    const ageDiff = getTicketAge(b.submittedDate) - getTicketAge(a.submittedDate);
    if (ageDiff !== 0) return ageDiff;
    return complaintRank(a.complaintType) - complaintRank(b.complaintType);
  });

  // ─── 3. Appeals Tab List ───
  const displayedAppeals = appealList.filter(appeal => {
    if (assignedFilter !== 'DPO' && appeal.roleLabel !== assignedFilter) return false;
    // Appeals tab only shows active / unresolved appeals
    if (appeal.status === 'resolved') return false;

    if (!passesSource(appeal, sourceFilter)) return false;

    // Category filter mapping
    const categoryMap: Record<string, string> = {
      'Kamla Devi': 'Pregnant Woman',
      'Rekha Sharma': 'Lactating Mother',
      'Dr. Suresh Mehta (PHC)': 'Children (6m-3y)',
      'Geeta Sharma': 'Adolescent Girl',
      'Sita Devi': 'Pregnant Woman',
      'Radha Bai': 'Lactating Mother',
      'Sunita Choudhary': 'Children (6m-3y)',
      'Priyanka Sen': 'Adolescent Girl',
      'Kiran Yadav': 'Pregnant Woman',
      'Maya Sharma': 'Lactating Mother',
      'Pooja Soni': 'Children 0-6 months',
    };
    const beneficiaryType = categoryMap[appeal.byName] || 'Beneficiary';
    if (selectedCategory !== 'All' && beneficiaryType !== selectedCategory) return false;

    // Complaint Types
    if (appliedTypes.length > 0 && (!appeal.complaintType || !appliedTypes.includes(appeal.complaintType))) return false;

    // Date Range (Appeal Date)
    const rawAppealDate = appeal.appealDate?.replace('Appeal Filed:', '').trim() ?? '';
    if (!passesDateFilter(rawAppealDate, appliedDateOption)) return false;

    // Search query matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = appeal.ticketNumber.toLowerCase().includes(q) ||
        appeal.byName.toLowerCase().includes(q) ||
        (appeal.title && appeal.title.toLowerCase().includes(q)) ||
        (appeal.appealReason && appeal.appealReason.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  // Any change to scope, tab or a filter snaps the batched grids back to page one.
  const gridResetKey = [
    assignedFilter, activeTab, selectedProject, selectedSector, selectedAWC, searchQuery,
    isOverdueOnly, appliedDateOption, appliedTypes.join(','), appliedStatuses.join(','), selectedCategory, sourceFilter,
  ].join('|');

  // Active filter count
  const activeFilterCount =
    (activeTab === 'Pending' && isOverdueOnly ? 1 : 0) +
    (appliedDateOption ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (sourceFilter !== 'All' ? 1 : 0) +
    appliedTypes.length +
    appliedStatuses.length;

  // ─── Actions Taken ───
  const handleResolveOverdue = (ticketId: string, closureNote: string) => {
    const ticket = sharedPendingCards.find(t => t.id === ticketId);
    if (ticket) {
      const newCard: ResolvedTicketCard = {
        ...ticket,
        resolvedDate: 'Resolved: 30/06/2025',
        status: 'CLOSED',
        actionTaken: closureNote || 'Resolved & closed by DPO.',
      };
      setSharedPendingCards(prev => prev.filter(t => t.id !== ticketId));
      setSharedResolvedCards(prev => [newCard, ...prev]);
    }
  };

  const handleResolveAppeal = (ticketId: string, notes: string) => {
    // 1. Update local appeal list state
    setAppealList(prev =>
      prev.map(a =>
        a.id === ticketId
          ? { ...a, status: 'resolved', resolutionNotes: notes }
          : a
      )
    );

    // 2. Synchronize with central Resolved Cards state
    const appeal = appealList.find(a => a.id === ticketId);
    if (appeal) {
      const matchingResolved = sharedResolvedCards.find(rc => rc.ticketNumber === appeal.ticketNumber);
      if (matchingResolved) {
        setSharedResolvedCards(prev =>
          prev.map(rc =>
            rc.id === matchingResolved.id
              ? {
                  ...rc,
                  status: 'APPEAL_RESOLVED',
                  dpoActionTaken: notes,
                  actionTaken: appeal.originalActionTaken || rc.actionTaken,
                }
              : rc
          )
        );
      } else {
        const newCard: ResolvedTicketCard = {
          id: appeal.id,
          ticketNumber: appeal.ticketNumber,
          beneficiaryName: appeal.byName,
          beneficiaryType: 'Beneficiary',
          topic: appeal.title,
          description: appeal.originalDescription,
          submittedDate: appeal.submittedDate,
          daysLabel: 'Resolved',
          daysType: 'remaining',
          resolvedDate: 'Resolved: 30/06/2025',
          status: 'APPEAL_RESOLVED',
          actionTaken: appeal.originalActionTaken || '',
          dpoActionTaken: notes,
          awcName: 'Anganwadi Centre',
          complaintType: appeal.complaintType,
          assignedTo: appeal.roleLabel as AssignedFilter,
        };
        setSharedResolvedCards(prev => [newCard, ...prev]);
      }
    }
  };

  const dateLabelText =
    appliedDateOption === '7' ? 'Last 7 Days' :
    appliedDateOption === '14' ? 'Last 14 Days' :
    appliedDateOption === '21' ? 'Last 21 Days' :
    appliedDateOption === '21+' ? 'More than 21 Days' : 'Date Range: All';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title & jurisdiction banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, color: 'var(--primary-deep)' }}>
            Beneficiary Redressal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '4px' }}>
            Review district complaints, audit Supervisor and Anganwadi Worker ticket resolutions, and resolve active appeals.
          </p>
        </div>
        <div style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '15px', fontWeight: 600 }}>
          District: <span style={{ color: 'var(--accent-saffron)' }}>Jaipur District</span>
        </div>
      </div>

      {/* SUMMARY Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-deep)', letterSpacing: '0.5px', display: 'block' }}>
          Summary
        </span>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
          Overview of pending grievances and resolved cases.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ textAlign: 'left', paddingBottom: '10px', fontWeight: 600, paddingLeft: '24px' }}></th>
              <th style={{ textAlign: 'right', paddingBottom: '10px', fontWeight: 600, width: '180px' }}>
                <button onClick={() => setPendingModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent-saffron)', fontSize: '15px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', width: '100%' }}>
                  PENDING ▼
                </button>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: '10px', fontWeight: 600, width: '180px' }}>
                <button onClick={() => setResolvedModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent-green)', fontSize: '15px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', width: '100%' }}>
                  RESOLVED ▼
                </button>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: '10px', fontWeight: 700, color: 'var(--primary-deep)', fontSize: '15px', paddingRight: '24px', width: '180px' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'DPO', p: dpoP, r: dpoR },
              { label: 'CDPO', p: cdpoP, r: cdpoR },
              { label: 'Supervisor', p: supP, r: supR },
              { label: 'AWW', p: awwP, r: awwR }
            ].map(row => (
              <tr key={row.label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 0', paddingLeft: '24px', fontWeight: 500, color: 'var(--text-muted)' }}>{row.label}</td>
                <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--accent-saffron)', fontSize: '18px' }}>{row.p}</td>
                <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--accent-green)', fontSize: '18px' }}>{row.r}</td>
                <td style={{ textAlign: 'right', padding: '12px 0', paddingRight: '24px', fontWeight: 700, color: 'var(--primary-deep)', fontSize: '18px' }}>{row.p + row.r}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--primary-light)', fontWeight: 700 }}>
              <td style={{ padding: '14px 10px', paddingLeft: '24px', color: 'var(--primary-deep)', borderRadius: '6px 0 0 6px' }}>Total</td>
              <td style={{ textAlign: 'right', padding: '14px 10px', color: 'var(--accent-saffron)', fontSize: '20px' }}>{dpoP + cdpoP + supP + awwP}</td>
              <td style={{ textAlign: 'right', padding: '14px 10px', color: 'var(--accent-green)', fontSize: 20 }}>{dpoR + cdpoR + supR + awwR}</td>
              <td style={{ textAlign: 'right', padding: '14px 10px', paddingRight: '24px', color: 'var(--primary-deep)', fontSize: 20, borderRadius: '0 6px 6px 0' }}>{dpoP + cdpoP + supP + awwP + dpoR + cdpoR + supR + awwR}</td>
            </tr>
          </tbody>
        </table>
        <span style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginTop: '14px' }}>
          Tap PENDING or RESOLVED column for detailed breakdown
        </span>
      </div>

      {/* ── Assigned To Scope Switcher — Uniform row above main content area ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>Assigned To</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['DPO', 'CDPO', 'Supervisor', 'AWW'] as AssignedFilter[]).map(role => (
            <button
              key={role}
              onClick={() => handleRoleSwitch(role)}
              style={{
                padding: '7px 20px', borderRadius: 20,
                border: `1.5px solid ${assignedFilter === role ? 'var(--primary-deep)' : 'var(--border-color)'}`,
                background: assignedFilter === role ? 'var(--primary-deep)' : '#ffffff',
                color: assignedFilter === role ? '#ffffff' : 'var(--text-dark)',
                fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {role === 'DPO' ? 'me' : role}
            </button>
          ))}
        </div>

        {/* CDPO Project filter */}
        {assignedFilter === 'CDPO' && (
          <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
            style={{ height: 38, padding: '0 32px 0 12px', fontSize: 15, fontWeight: 500, maxWidth: 180 }}>
            {PROJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}

        {/* Supervisor Project + Sector filters */}
        {assignedFilter === 'Supervisor' && (
          <>
            <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              style={{ height: 38, padding: '0 32px 0 12px', fontSize: 15, fontWeight: 500, maxWidth: 180 }}>
              {PROJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select className="form-select" value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
              style={{ height: 38, padding: '0 32px 0 12px', fontSize: 15, fontWeight: 500, maxWidth: 180 }}>
              {SECTOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </>
        )}

        {/* AWW Project + Sector + AWC filters */}
        {assignedFilter === 'AWW' && (
          <>
            <select className="form-select" value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
              style={{ height: 38, padding: '0 32px 0 12px', fontSize: 15, fontWeight: 500, maxWidth: 180 }}>
              {PROJECT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select className="form-select" value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
              style={{ height: 38, padding: '0 32px 0 12px', fontSize: 15, fontWeight: 500, maxWidth: 180 }}>
              {SECTOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <select className="form-select" value={selectedAWC} onChange={e => setSelectedAWC(e.target.value)}
              style={{ height: 38, padding: '0 32px 0 12px', fontSize: 15, fontWeight: 500, maxWidth: 210 }}>
              {AWC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Main content layout: Left Filter Sidebar + Right Workspace area */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left Filter Sidebar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary-deep)' }}>Filter Options</h3>
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--primary-deep)', color: '#fff', borderRadius: '99px', padding: '2px 8px', fontSize: 13, fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Urgency: Overdue Only — Pending tab only. This is the sole way to
              isolate overdue tickets now that there's no separate Overdue tab;
              Resolved/Appeals carry no SLA state. */}
          {activeTab === 'Pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Urgency</label>
              <button
                onClick={() => setIsOverdueOnly(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 16px', borderRadius: '20px', fontSize: '15px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: isOverdueOnly ? 'var(--color-danger)' : 'var(--bg-main)',
                  color: isOverdueOnly ? '#fff' : 'var(--text-dark)',
                  border: `1.5px solid ${isOverdueOnly ? 'var(--color-danger)' : 'var(--border-color)'}`,
                }}
              >
                {isOverdueOnly && '× '}Overdue Only
              </button>
            </div>
          )}

          {/* Beneficiary Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Beneficiary Category</label>
            <select className="form-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
              style={{ width: '100%', height: 40, padding: '0 32px 0 12px', fontSize: 15 }}>
              <option value="All">Category: All</option>
              {BENEFICIARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Complaint Type checkboxes (Urgent / Corruption / General) */}
          {activeTab !== 'Appeals' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Complaint Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {COMPLAINT_TYPES.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, cursor: 'pointer', padding: '4px 0' }}>
                    <input type="checkbox" checked={appliedTypes.includes(t)} onChange={() => setAppliedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                      style={{ accentColor: 'var(--primary-deep)', width: 15, height: 15 }} />
                    <span style={{ color: appliedTypes.includes(t) ? 'var(--primary-deep)' : 'var(--text-dark)', fontWeight: appliedTypes.includes(t) ? 600 : 400 }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Complaint Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['Urgent', 'Corruption', 'General'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, cursor: 'pointer', padding: '4px 0' }}>
                    <input type="checkbox" checked={appliedTypes.includes(t)} onChange={() => setAppliedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                      style={{ accentColor: 'var(--primary-deep)', width: 15, height: 15 }} />
                    <span style={{ color: appliedTypes.includes(t) ? 'var(--primary-deep)' : 'var(--text-dark)', fontWeight: appliedTypes.includes(t) ? 600 : 400 }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Source channel — shown on every tab */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Source</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {([['All', 'All'], ['WEB', 'Web'], ['CALL_CENTRE', 'Call Centre']] as [SourceFilter, string][]).map(([val, lbl]) => (
                <button key={val} onClick={() => setSourceFilter(val)} style={{
                  flex: 1, padding: '7px 4px', borderRadius: 20, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  border: `1.5px solid ${sourceFilter === val ? 'var(--primary-deep)' : 'var(--border-color)'}`,
                  background: sourceFilter === val ? 'var(--primary-deep)' : 'var(--bg-main)',
                  color: sourceFilter === val ? '#ffffff' : 'var(--text-dark)',
                }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Submission / Resolution Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
            <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {activeTab === 'Resolved' ? 'Resolution Date' : 'Submission Date'}
            </label>
            <button
              ref={dateButtonRef}
              onClick={toggleDatePanel}
              className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-md"
              style={{
                width: '100%', justifyContent: 'space-between', height: 40,
                border: appliedDateOption ? '1.5px solid var(--primary-deep)' : undefined,
                color: appliedDateOption ? 'var(--primary-deep)' : undefined,
                fontWeight: appliedDateOption ? 700 : undefined,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} /> {appliedDateOption ? dateLabelText : 'Date Range: All'}
              </span>
            </button>
            <DateRangePopover
              open={dateOpen} onClose={() => setDateOpen(false)}
              applied={appliedDateOption}
              onApply={(opt) => { setAppliedDateOption(opt); setDateOpen(false); }}
              placement={datePanelPlacement}
            />
          </div>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm" style={{ borderRadius: 20, fontSize: 14 }} onClick={clearAllFilters}>
              Reset Filters
            </button>
          )}
        </div>

        {/* Right Workspace: Tabs + Search + Cards list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Tab bar header */}
          <div className="search-filter-section" style={{ marginBottom: 0 }}>
            <div className="tabs-navigation" style={{ borderBottom: 'none', margin: 0 }}>
              <button className={`tab-btn ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => handleTabChange('Pending')}>
                Pending
                <span className="tab-count">{displayedPending.length}</span>
              </button>

              {assignedFilter === 'DPO' && (
                <button className={`tab-btn ${activeTab === 'Appeals' ? 'active' : ''}`} onClick={() => handleTabChange('Appeals')}>
                  Appeals
                  <span className="tab-count">{displayedAppeals.length}</span>
                </button>
              )}

              <button className={`tab-btn ${activeTab === 'Resolved' ? 'active' : ''}`} onClick={() => handleTabChange('Resolved')}>
                Resolved
                <span className="tab-count">{displayedResolved.length}</span>
              </button>
            </div>

            <div className="search-input-wrapper" style={{ maxWidth: 260 }}>
              <Search className="search-icon-svg" />
              <input
                type="text" className="search-input" placeholder="Search by ticket or name..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Appeals Tab Info Box */}
          {activeTab === 'Appeals' && (
            <div style={{ display: 'flex', gap: 10, background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', border: '1px solid var(--border-color)' }}>
              <Info size={15} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-dark)', lineHeight: 1.5 }}>
                <strong>Appeals</strong> are grievances escalated by beneficiaries who are unsatisfied with the resolution. DPO acts as the Senior Redressal Authority to audit and resolve them.
              </p>
            </div>
          )}

          {/* Escalation notice — explains why this list is a subset of the summary count */}
          {activeTab === 'Pending' && (assignedFilter === 'CDPO' || assignedFilter === 'Supervisor' || assignedFilter === 'AWW') && (
            <div style={{ display: 'flex', gap: 10, background: '#fff3e0', borderRadius: 'var(--radius-md)', padding: '12px 14px', border: '1px solid #ffcc80' }}>
              <Info size={15} style={{ color: '#e65100', flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 14.5, color: 'var(--text-dark)', lineHeight: 1.5 }}>
                Showing only {assignedFilter} tickets <strong>escalated to DPO</strong> — those open for {ESCALATION_DAYS} days or more. These are <strong>view-only</strong>; the ticket stays with its original assignee.
              </p>
            </div>
          )}

          {/* Cards Grid */}
          {activeTab === 'Pending' && (
            displayedPending.length === 0 ? (
              <div style={{ padding: '64px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--primary-deep)' }}>No Pending Grievances</h3>
                <p style={{ fontSize: 15, marginTop: 4 }}>No pending tickets match the current filters.</p>
              </div>
            ) : (
              <BatchedTicketGrid items={displayedPending} resetKey={gridResetKey}
                renderItem={ticket => (
                  <TicketCardComponent
                    key={ticket.id}
                    card={ticket}
                    onView={() => {
                      const age = getTicketAge(ticket.submittedDate);
                      const isOverdue = ticket.isOverdue || age >= 21;
                      setSelectedTicket({ ...ticket, isPendingTicket: true, isOverdue });
                    }}
                  />
                )} />
            )
          )}

          {activeTab === 'Resolved' && (
            displayedResolved.length === 0 ? (
              <div style={{ padding: '64px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--primary-deep)' }}>No Resolved Tickets</h3>
                <p style={{ fontSize: 15, marginTop: 4 }}>No resolved tickets match the current filters.</p>
              </div>
            ) : (
              <BatchedTicketGrid items={displayedResolved} resetKey={gridResetKey}
                renderItem={ticket => (
                  <ResolvedCard
                    key={ticket.id}
                    card={ticket as ResolvedTicketCard}
                    onView={() => setSelectedTicket(ticket)}
                  />
                )} />
            )
          )}

          {activeTab === 'Appeals' && (
            displayedAppeals.length === 0 ? (
              <div style={{ padding: '64px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--primary-deep)' }}>No Appeal Grievances</h3>
                <p style={{ fontSize: 15, marginTop: 4 }}>No active appeals match the current filters.</p>
              </div>
            ) : (
              <BatchedTicketGrid items={displayedAppeals} resetKey={gridResetKey} itemNoun="appeals"
                renderItem={appeal => (
                  <AppealCard
                    key={appeal.id}
                    card={appeal}
                    onResolve={() => setSelectedTicket({
                      ...appeal,
                      description: appeal.originalDescription,
                      beneficiaryName: appeal.byName,
                      beneficiaryType: 'Beneficiary',
                      assignedTo: appeal.roleLabel,
                      actionTaken: appeal.originalActionTaken,
                      _isAppeal: true,
                      status: 'APPEAL_RAISED',
                    })}
                    onViewDetails={() => setSelectedTicket({
                      ...appeal,
                      description: appeal.originalDescription,
                      beneficiaryName: appeal.byName,
                      beneficiaryType: 'Beneficiary',
                      assignedTo: appeal.roleLabel,
                      actionTaken: appeal.originalActionTaken,
                      dpoActionTaken: appeal.resolutionNotes,
                      _isAppeal: true,
                      status: 'APPEAL_RESOLVED',
                    })}
                  />
                )} />
            )
          )}
        </div>
      </div>

      {/* Ticket Details Overlay Drawer */}
      {selectedTicket && (
        <TicketDetailsScreen
          card={selectedTicket}
          assignedFilter="DPO"
          onBack={() => setSelectedTicket(null)}
          onResolveTicket={handleResolveOverdue}
          onResolveAppeal={handleResolveAppeal}
        />
      )}

      {/* Pending Breakdown Modal */}
      <PendingBreakdownModal
        open={pendingModal} onClose={() => setPendingModal(false)}
        dpoP={dpoP} dpoO={dpoO}
        cdpoP={cdpoP} cdpoO={cdpoO}
        supP={supP} supO={supO}
        awwP={awwP} awwO={awwO}
      />

      {/* Resolved Breakdown Modal */}
      <ResolvedBreakdownModal
        open={resolvedModal} onClose={() => setResolvedModal(false)}
        byRole={{ dpo: dpoR, cdpo: cdpoR, sup: supR, aww: awwR }}
        byStatus={byStatus}
      />

    </div>
  );
}
