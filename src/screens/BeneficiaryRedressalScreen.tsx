import React, { useRef, useState } from 'react';
import { TicketCard, ResolvedTicketCard } from '../web/types';
import TicketDetailsScreen from './TicketDetailsScreen';
import {
  Eye, X, Info, Clock, CheckCircle2, AlertTriangle, ShieldCheck,
  Calendar, ChevronDown, Inbox, Search,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type AssignedFilter = 'CDPO' | 'Supervisor' | 'AWW';
type DateRangeOption = '7' | '14' | '21' | 'custom';

interface CDPOViewProps {
  sharedPendingCards: TicketCard[];
  setSharedPendingCards: React.Dispatch<React.SetStateAction<TicketCard[]>>;
  sharedResolvedCards: ResolvedTicketCard[];
  setSharedResolvedCards: React.Dispatch<React.SetStateAction<ResolvedTicketCard[]>>;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SECTOR_OPTIONS = ['All Sectors', 'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'];
const AWC_OPTIONS = [
  'All Centres',
  'Anganwadi Centre 1', 'Anganwadi Centre 2', 'Anganwadi Centre 3',
  'Anganwadi Centre 4', 'Anganwadi Centre 5', 'Anganwadi Centre 6',
];
const COMPLAINT_TYPES = ['Corruption', 'Urgent', 'Others'];
const BENEFICIARY_CATEGORIES = [
  'Pregnant Woman', 'Lactating Mother', 'Children 0-6 months',
  'Children (6m-3y)', 'Children (3-6y)', 'Adolescent Girl',
];
const RESOLVED_STATUSES = [
  { value: 'CLOSED',          label: 'Closed',          color: '#2e7d32' },
  { value: 'CLOSURE_PENDING', label: 'Closure Pending', color: '#f57f17' },
  { value: 'APPEAL_RAISED',   label: 'Appeal Raised',   color: '#e65100' },
  { value: 'APPEAL_RESOLVED', label: 'Appeal Resolved', color: '#1565c0' },
];
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CLOSED:          { label: 'CLOSED',          color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7' },
  CLOSURE_PENDING: { label: 'CLOSURE PENDING', color: '#f57f17', bg: '#fff8e1', border: '#ffe082' },
  APPEAL_RAISED:   { label: 'APPEAL RAISED',   color: '#e65100', bg: '#fff3e0', border: '#ffcc80' },
  APPEAL_RESOLVED: { label: 'APPEAL RESOLVED', color: '#1565c0', bg: '#e8eaf6', border: '#90caf9' },
};
const REFERENCE_TODAY = new Date(2025, 5, 30);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseDateStr(str: string): Date | null {
  if (!str) return null;
  const m = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function toInputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function passesDateFilter(dateStr: string, option: DateRangeOption | null, fromStr: string, toStr: string): boolean {
  if (!option) return true;
  const d = parseDateStr(dateStr);
  if (!d) return false;
  if (option === 'custom') {
    const from = fromStr ? new Date(fromStr) : null;
    const to   = toStr   ? new Date(toStr)   : null;
    return (!from || d >= from) && (!to || d <= to);
  }
  const days = Number(option);
  const windowStart = new Date(REFERENCE_TODAY);
  windowStart.setDate(windowStart.getDate() - (days - 1));
  return d >= windowStart && d <= REFERENCE_TODAY;
}

// ─── Date Range Popover ────────────────────────────────────────────────────────

const DateRangePopover = ({
  open, onClose, applied, appliedFrom, appliedTo, onApply, placement = 'below',
}: {
  open: boolean; onClose: () => void;
  applied: DateRangeOption | null; appliedFrom: string; appliedTo: string;
  onApply: (opt: DateRangeOption | null, from: string, to: string) => void;
  placement?: 'below' | 'above';
}) => {
  const [draft, setDraft] = useState<DateRangeOption | null>(applied);
  const [from, setFrom]   = useState(appliedFrom);
  const [to, setTo]       = useState(appliedTo);

  if (!open) return null;

  const handleCancel = () => { setDraft(applied); setFrom(appliedFrom); setTo(appliedTo); onClose(); };

  return (
    <>
      <div onClick={handleCancel} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      <div style={{
        position: 'absolute',
        ...(placement === 'below' ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
        left: 0, zIndex: 50, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
        width: 280, background: '#fff', border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '18px 20px',
      }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--primary-deep)', marginBottom: 12 }}>
          Filter by Date Range
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {([['7','Last 7 Days'],['14','Last 14 Days'],['21','Last 21 Days'],['custom','Custom Range']] as [DateRangeOption, string][]).map(([val, lbl]) => (
            <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', cursor: 'pointer', fontSize: 13, fontWeight: draft === val ? 600 : 400, color: draft === val ? 'var(--primary-deep)' : 'var(--text-dark)' }}>
              <input type="radio" name="dateRangeCDPO" checked={draft === val} onChange={() => setDraft(val)} style={{ accentColor: 'var(--primary-deep)', width: 16, height: 16 }} />
              {lbl}
            </label>
          ))}
        </div>
        {draft === 'custom' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10, paddingLeft: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>From Date</label>
              <input type="date" className="form-control" value={from} max={toInputDate(REFERENCE_TODAY)} onChange={e => setFrom(e.target.value)} style={{ height: 36, fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>To Date</label>
              <input type="date" className="form-control" value={to} max={toInputDate(REFERENCE_TODAY)} onChange={e => setTo(e.target.value)} style={{ height: 36, fontSize: 13 }} />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm" style={{ flex: 1 }}
            onClick={() => { setDraft(null); setFrom(''); setTo(''); onApply(null,'',''); }}>Clear</button>
          <button className="ux4g-btn ux4g-btn-primary ux4g-btn-sm" style={{ flex: 1 }}
            onClick={() => { onApply(draft, from, to); onClose(); }}>Apply</button>
        </div>
      </div>
    </>
  );
};

// ─── Pending Breakdown Modal ───────────────────────────────────────────────────

const PendingBreakdownModal = ({
  open, onClose, cdpoP, cdpoO, supP, supO, awwP, awwO,
}: { open: boolean; onClose: () => void; cdpoP: number; cdpoO: number; supP: number; supO: number; awwP: number; awwO: number }) => {
  if (!open) return null;
  const totalP = cdpoP + supP + awwP;
  const totalO = cdpoO + supO + awwO;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--primary-deep)' }}>Pending Breakdown</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', borderRadius: 6 }}><X size={20} /></button>
        </div>
        <div style={{ background: '#e8eaf6', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#5c67b5', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Pending</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: '#1a237e', lineHeight: 1 }}>{totalP.toLocaleString()}</span>
        </div>
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 18 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)' }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Role</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#e65100', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Pending</th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#d32f2f', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Overdue</th>
              </tr>
            </thead>
            <tbody>
              {[{r:'CDPO',p:cdpoP,o:cdpoO},{r:'Supervisor',p:supP,o:supO},{r:'AWW',p:awwP,o:awwO}].map(row => (
                <tr key={row.r} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dark)', fontWeight: 500 }}>{row.r}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: '#e65100', fontSize: 15 }}>{row.p}</td>
                  <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 700, color: '#d32f2f', fontSize: 15 }}>{row.o}</td>
                </tr>
              ))}
              <tr style={{ background: '#e8eaf6', borderTop: '2px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px', color: '#1a237e', fontWeight: 700 }}>Total</td>
                <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 800, color: '#e65100', fontSize: 16 }}>{totalP}</td>
                <td style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 800, color: '#d32f2f', fontSize: 16 }}>{totalO}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 10, background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <Info size={15} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-dark)', lineHeight: 1.55 }}>
            <strong>Pending</strong> is the count of tickets still awaiting action. <strong>Overdue</strong> tickets are grievances pending for more than 21 days and need immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Resolved Breakdown Modal ──────────────────────────────────────────────────

const ResolvedBreakdownModal = ({
  open, onClose, byRole, byStatus,
}: {
  open: boolean; onClose: () => void;
  byRole: { cdpo: number; sup: number; aww: number };
  byStatus: { closurePending: {cdpo:number;sup:number;aww:number}; closed: {cdpo:number;sup:number;aww:number}; appealRaised: {cdpo:number;sup:number;aww:number}; appealResolved: {cdpo:number;sup:number;aww:number} };
}) => {
  if (!open) return null;
  const totalResolved = byRole.cdpo + byRole.sup + byRole.aww;
  const subCards = [
    { label: 'Closure Pending', icon: Clock,         color: '#f57f17', bg: '#fff8e1', border: '#ffe082', total: byStatus.closurePending.cdpo + byStatus.closurePending.sup + byStatus.closurePending.aww, rows: [{r:'CDPO',v:byStatus.closurePending.cdpo},{r:'Supervisor',v:byStatus.closurePending.sup},{r:'AWW',v:byStatus.closurePending.aww}] },
    { label: 'Closed',          icon: CheckCircle2,  color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', total: byStatus.closed.cdpo         + byStatus.closed.sup         + byStatus.closed.aww,         rows: [{r:'CDPO',v:byStatus.closed.cdpo},        {r:'Supervisor',v:byStatus.closed.sup},        {r:'AWW',v:byStatus.closed.aww}]         },
    { label: 'Appeal Raised',   icon: AlertTriangle, color: '#e65100', bg: '#fff3e0', border: '#ffcc80', total: byStatus.appealRaised.cdpo    + byStatus.appealRaised.sup    + byStatus.appealRaised.aww,   rows: [{r:'CDPO',v:byStatus.appealRaised.cdpo},  {r:'Supervisor',v:byStatus.appealRaised.sup},  {r:'AWW',v:byStatus.appealRaised.aww}]   },
    { label: 'Appeal Resolved', icon: ShieldCheck,   color: '#1565c0', bg: '#e8eaf6', border: '#90caf9', total: byStatus.appealResolved.cdpo  + byStatus.appealResolved.sup  + byStatus.appealResolved.aww, rows: [{r:'CDPO',v:byStatus.appealResolved.cdpo},{r:'Supervisor',v:byStatus.appealResolved.sup},{r:'AWW',v:byStatus.appealResolved.aww}] },
  ];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ padding: 28, maxWidth: 580 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 700, color: 'var(--primary-deep)' }}>Resolved Breakdown</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', borderRadius: 6 }}><X size={20} /></button>
        </div>
        <div style={{ background: 'var(--accent-green-light)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Resolved</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1 }}>{totalResolved.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[{l:'CDPO',v:byRole.cdpo},{l:'Supervisor',v:byRole.sup},{l:'AWW',v:byRole.aww}].map(r => (
              <span key={r.l} style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-dark)' }}>
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
                  <span style={{ fontSize: 11, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{card.label}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.total}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: `1px solid ${card.border}`, paddingTop: 8 }}>
                  {card.rows.map(r => (
                    <div key={r.r} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: card.color }}>
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

// ─── Pending Ticket Card ───────────────────────────────────────────────────────

const PendingCard = ({ card, showDocs, onView }: { card: TicketCard; showDocs: boolean; onView: () => void }) => {
  const isCorruptionOrUrgent = card.complaintType === 'Corruption' || card.complaintType === 'Urgent';
  const overdue = card.isOverdue || card.daysType === 'overdue';
  return (
    <div className="ticket-card" onClick={onView} style={{ cursor: 'pointer', borderColor: overdue ? 'var(--color-danger)' : 'var(--border-color)' }}>
      <div className="ticket-card-header">
        <span className="ticket-id">{card.ticketNumber}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {card.complaintType === 'Corruption' && <span className="badge badge-danger">Corruption</span>}
          {card.complaintType === 'Urgent'     && <span className="badge badge-warning">Urgent</span>}
          {overdue && <span className="badge badge-danger">OVERDUE</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <h4 className="ticket-title" style={{ margin: 0 }}>{card.beneficiaryName}</h4>
        {card.beneficiaryType && (
          <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>{card.beneficiaryType}</span>
        )}
      </div>
      <div>
        {card.topic && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-deep)', marginBottom: 2 }}>{card.topic}</div>}
        <p className="ticket-desc">{card.description}</p>
      </div>
      <div className="ticket-metadata">
        <span className="ticket-date" style={{ fontSize: 12 }}>{card.submittedDate?.replace('Submitted: ', '')}</span>
        {card.daysLabel && (
          <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: overdue ? '#ffebee' : '#fff3e0', color: overdue ? '#d32f2f' : '#e65100' }}>{card.daysLabel}</span>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        <span>AWC: <strong style={{ color: 'var(--primary-deep)' }}>{card.awcName}</strong></span>
        {showDocs && isCorruptionOrUrgent && (card.documentsCount ?? 0) > 0 && (
          <span style={{ background: '#e8eaf6', color: '#1565c0', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, border: '1px solid #90caf9' }}>Doc Uploaded</span>
        )}
      </div>
      <button className="ux4g-btn ux4g-btn-secondary ux4g-btn-md" style={{ width: '100%', marginTop: 4, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
        onClick={e => { e.stopPropagation(); onView(); }}>
        <Eye size={14} /> View Details
      </button>
    </div>
  );
};

// ─── Resolved Ticket Card ──────────────────────────────────────────────────────

const ResolvedCard = ({ card, onView }: { card: ResolvedTicketCard; onView: () => void }) => {
  const cfg = STATUS_CFG[card.status] ?? STATUS_CFG.CLOSED;
  return (
    <div className="ticket-card" style={{ cursor: 'pointer', padding: 0, overflow: 'hidden' }} onClick={onView}>
      {card.awaitingCdpoClosure && (
        <div style={{ background: '#fff8e1', borderBottom: '1px solid #ffe082', padding: '7px 18px', fontSize: 12, fontWeight: 700, color: '#f57f17' }}>
          Awaiting CDPO Closure
        </div>
      )}
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="ticket-id">{card.ticketNumber}</span>
          <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <h4 className="ticket-title" style={{ margin: 0 }}>{card.beneficiaryName}</h4>
          {card.beneficiaryType && (
            <span style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 4, fontWeight: 600, flexShrink: 0 }}>{card.beneficiaryType}</span>
          )}
        </div>
        <div>
          {card.topic && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-deep)', marginBottom: 2 }}>{card.topic}</div>}
          <p className="ticket-desc">{card.description}</p>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{card.resolvedDate}</div>
        {card.actionTaken && (
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', borderRadius: 6, padding: '8px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Action Taken</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-dark)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>{card.actionTaken}</p>
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>AWC: <strong style={{ color: 'var(--primary-deep)' }}>{card.awcName}</strong></div>
        <button className="ux4g-btn ux4g-btn-secondary ux4g-btn-md" style={{ width: '100%', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { e.stopPropagation(); onView(); }}>
          <Eye size={14} /> View Details
        </button>
      </div>
    </div>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function CDPOView({
  sharedPendingCards,
  setSharedPendingCards,
  sharedResolvedCards,
  setSharedResolvedCards,
}: CDPOViewProps) {

  // ── Core state ────────────────────────────────────────────────────────────────
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>('CDPO');
  const [activeTab,      setActiveTab]      = useState<'Pending' | 'Resolved'>('Pending');
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [pendingModal,   setPendingModal]   = useState(false);
  const [resolvedModal,  setResolvedModal]  = useState(false);

  // ── Scope sub-filters ─────────────────────────────────────────────────────────
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedAWC,    setSelectedAWC]    = useState('All Centres');

  // ── Sidebar filter state ──────────────────────────────────────────────────────
  const [searchQuery,     setSearchQuery]     = useState('');
  const [isOverdueOnly,   setIsOverdueOnly]   = useState(false);
  const [appliedDateOption, setAppliedDateOption] = useState<DateRangeOption | null>(null);
  const [appliedFrom,     setAppliedFrom]     = useState('');
  const [appliedTo,       setAppliedTo]       = useState('');
  const [dateOpen,        setDateOpen]        = useState(false);
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

  // Pending-only: Type (CDPO) or Category (Supervisor/AWW)
  const [appliedTypes,      setAppliedTypes]      = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);

  // Resolved-only: Status filter
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);

  // ── Handle role/tab switch ────────────────────────────────────────────────────
  const clearAllFilters = () => {
    setSearchQuery(''); setIsOverdueOnly(false);
    setAppliedDateOption(null); setAppliedFrom(''); setAppliedTo('');
    setAppliedTypes([]); setAppliedCategories([]); setAppliedStatuses([]);
  };

  const handleRoleSwitch = (role: AssignedFilter) => {
    setAssignedFilter(role);
    setSelectedSector('All Sectors');
    setSelectedAWC('All Centres');
    clearAllFilters();
  };

  const handleTabChange = (tab: 'Pending' | 'Resolved') => {
    setActiveTab(tab);
    clearAllFilters();
  };

  // ── Derived summary counts ────────────────────────────────────────────────────
  const allPending  = sharedPendingCards;
  const allResolved = sharedResolvedCards;

  const countP = (role: AssignedFilter) => allPending.filter(c => c.assignedTo === role).length;
  const countR = (role: AssignedFilter) => allResolved.filter(c => c.assignedTo === role).length;
  const countOD= (role: AssignedFilter) => allPending.filter(c => c.assignedTo === role && (c.isOverdue || c.daysType === 'overdue')).length;
  const countSt= (role: AssignedFilter, s: string) => allResolved.filter(c => c.assignedTo === role && c.status === s).length;

  const cdpoP = countP('CDPO');  const cdpoO = countOD('CDPO');  const cdpoR = countR('CDPO');
  const supP  = countP('Supervisor'); const supO = countOD('Supervisor'); const supR = countR('Supervisor');
  const awwP  = countP('AWW');   const awwO = countOD('AWW');   const awwR = countR('AWW');

  const byStatus = {
    closurePending:  { cdpo: countSt('CDPO','CLOSURE_PENDING'),  sup: countSt('Supervisor','CLOSURE_PENDING'),  aww: countSt('AWW','CLOSURE_PENDING')  },
    closed:          { cdpo: countSt('CDPO','CLOSED'),            sup: countSt('Supervisor','CLOSED'),            aww: countSt('AWW','CLOSED')            },
    appealRaised:    { cdpo: countSt('CDPO','APPEAL_RAISED'),     sup: countSt('Supervisor','APPEAL_RAISED'),     aww: countSt('AWW','APPEAL_RAISED')     },
    appealResolved:  { cdpo: countSt('CDPO','APPEAL_RESOLVED'),   sup: countSt('Supervisor','APPEAL_RESOLVED'),   aww: countSt('AWW','APPEAL_RESOLVED')   },
  };

  // ── Filter logic ──────────────────────────────────────────────────────────────
  const displayedPending = allPending.filter(card => {
    if (card.assignedTo && card.assignedTo !== assignedFilter) return false;
    if ((assignedFilter === 'Supervisor' || assignedFilter === 'AWW') && selectedSector !== 'All Sectors') {
      if (!card.sector || card.sector !== selectedSector) return false;
    }
    if (assignedFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!card.awcName || card.awcName !== selectedAWC) return false;
    }
    if (isOverdueOnly && !(card.isOverdue || card.daysType === 'overdue')) return false;
    if (!passesDateFilter(card.submittedDate ?? '', appliedDateOption, appliedFrom, appliedTo)) return false;
    if (assignedFilter === 'CDPO') {
      if (appliedTypes.length > 0 && (!card.complaintType || !appliedTypes.includes(card.complaintType))) return false;
    } else {
      if (appliedCategories.length > 0 && (!card.beneficiaryType || !appliedCategories.includes(card.beneficiaryType))) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hit = card.ticketNumber.toLowerCase().includes(q) || card.beneficiaryName.toLowerCase().includes(q) ||
        (card.description && card.description.toLowerCase().includes(q)) || (card.topic && card.topic.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const displayedResolved = allResolved.filter(card => {
    if (card.assignedTo && card.assignedTo !== assignedFilter) return false;
    if ((assignedFilter === 'Supervisor' || assignedFilter === 'AWW') && selectedSector !== 'All Sectors') {
      if (!card.sector || card.sector !== selectedSector) return false;
    }
    if (assignedFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!card.awcName || card.awcName !== selectedAWC) return false;
    }
    if (assignedFilter === 'CDPO' && card.status === 'CLOSURE_PENDING') return false;
    if (appliedStatuses.length > 0 && (!card.status || !appliedStatuses.includes(card.status))) return false;
    if (!passesDateFilter(card.resolvedDate ?? '', appliedDateOption, appliedFrom, appliedTo)) return false;
    if (appliedCategories.length > 0 && (!card.beneficiaryType || !appliedCategories.includes(card.beneficiaryType))) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hit = card.ticketNumber.toLowerCase().includes(q) || card.beneficiaryName.toLowerCase().includes(q) ||
        (card.description && card.description.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const awaitingClosureCount = allResolved.filter(c => c.awaitingCdpoClosure && c.assignedTo === 'Supervisor').length;
  const showDocs = assignedFilter === 'CDPO';
  const isCdpoPending = assignedFilter === 'CDPO' && activeTab === 'Pending';

  // Active filter count for badge
  const activeFilterCount =
    (activeTab === 'Pending' && isOverdueOnly ? 1 : 0) +
    (appliedDateOption ? 1 : 0) +
    appliedTypes.length +
    appliedCategories.length +
    appliedStatuses.length;

  // ── Action handlers ───────────────────────────────────────────────────────────
  const handleResolveTicket = (ticketId: string, closureNote: string) => {
    const ticket = sharedPendingCards.find(t => t.id === ticketId);
    if (ticket) {
      const newCard: ResolvedTicketCard = { ...ticket, resolvedDate: 'Resolved: 30/06/2025', status: 'CLOSED', actionTaken: closureNote };
      setSharedPendingCards(prev => prev.filter(t => t.id !== ticketId));
      setSharedResolvedCards(prev => [newCard, ...prev]);
    }
  };

  const handleCloseTicket = (ticketId: string, note?: string) => {
    const ticket = sharedPendingCards.find(t => t.id === ticketId);
    if (ticket) {
      const newCard: ResolvedTicketCard = { 
        ...ticket, 
        resolvedDate: 'Resolved: 30/06/2025', 
        status: 'CLOSED', 
        actionTaken: note || 'Ticket closed by CDPO.', 
        awaitingCdpoClosure: false 
      };
      setSharedPendingCards(prev => prev.filter(t => t.id !== ticketId));
      setSharedResolvedCards(prev => [newCard, ...prev]);
    } else {
      setSharedResolvedCards(prev => prev.map(t => t.id === ticketId ? { 
        ...t, 
        status: 'CLOSED', 
        actionTaken: note || t.actionTaken || 'Ticket closed by CDPO.', 
        awaitingCdpoClosure: false 
      } : t));
    }
  };

  const dateLabelText =
    appliedDateOption === '7' ? 'Last 7 Days' : appliedDateOption === '14' ? 'Last 14 Days' :
    appliedDateOption === '21' ? 'Last 21 Days' : appliedDateOption === 'custom' ? 'Custom Range' : 'Date Range: All';

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Title + Project Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--primary-deep)' }}>
            Beneficiary Redressal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Review project complaints, audit Supervisor resolutions, and manage escalations.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, padding: '8px 16px', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          <span>Project: <span style={{ color: 'var(--accent-saffron)' }}>Sanganer</span></span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>4 Sectors</span>
        </div>
      </div>

      {/* Summary Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-deep)', letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>Summary</span>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ textAlign: 'left', paddingBottom: 10, fontWeight: 600, width: '35%' }}></th>
              <th style={{ textAlign: 'right', paddingBottom: 10, fontWeight: 600 }}>
                <button onClick={() => setPendingModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#e65100', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>PENDING ▼</button>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: 10, fontWeight: 600 }}>
                <button onClick={() => setResolvedModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent-green)', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 2 }}>RESOLVED ▼</button>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: 10, fontWeight: 700, color: 'var(--primary-deep)', fontSize: 13 }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {[{label:'CDPO',p:cdpoP,r:cdpoR},{label:'Supervisor',p:supP,r:supR},{label:'AWW',p:awwP,r:awwR}].map(row => (
              <tr key={row.label} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 0', fontWeight: 500, color: 'var(--text-muted)' }}>{row.label}</td>
                <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: '#e65100', fontSize: 16 }}>{row.p}</td>
                <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--accent-green)', fontSize: 16 }}>{row.r}</td>
                <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--primary-deep)', fontSize: 16 }}>{row.p + row.r}</td>
              </tr>
            ))}
            <tr style={{ background: '#e8eaf6', fontWeight: 700 }}>
              <td style={{ padding: '12px 10px', color: '#1a237e', borderRadius: '6px 0 0 6px' }}>Total</td>
              <td style={{ textAlign: 'right', padding: '12px 10px', color: '#e65100', fontSize: 18 }}>{cdpoP + supP + awwP}</td>
              <td style={{ textAlign: 'right', padding: '12px 10px', color: 'var(--accent-green)', fontSize: 18 }}>{cdpoR + supR + awwR}</td>
              <td style={{ textAlign: 'right', padding: '12px 10px', color: '#1a237e', fontSize: 18, borderRadius: '0 6px 6px 0' }}>{cdpoP + supP + awwP + cdpoR + supR + awwR}</td>
            </tr>
          </tbody>
        </table>
        <span style={{ display: 'block', textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
          Click PENDING or RESOLVED column for detailed breakdown
        </span>
      </div>

      {/* ── Assigned To — uniform full-width row above main content ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>Assigned To</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['CDPO','Supervisor','AWW'] as AssignedFilter[]).map(role => (
            <button key={role} onClick={() => handleRoleSwitch(role)} style={{
              padding: '7px 20px', borderRadius: 20,
              border: `1.5px solid ${assignedFilter === role ? 'var(--primary-deep)' : 'var(--border-color)'}`,
              background: assignedFilter === role ? 'var(--primary-deep)' : '#ffffff',
              color: assignedFilter === role ? '#ffffff' : 'var(--text-dark)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {role === 'CDPO' ? 'me' : role}
            </button>
          ))}
        </div>
        {/* Sector/AWC sub-filters inline when Supervisor/AWW selected */}
        {(assignedFilter === 'Supervisor' || assignedFilter === 'AWW') && (
          <select className="form-select" value={selectedSector} onChange={e => setSelectedSector(e.target.value)}
            style={{ height: 38, padding: '0 32px 0 12px', fontSize: 13, fontWeight: 500, maxWidth: 180 }}>
            {SECTOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
        {assignedFilter === 'AWW' && (
          <select className="form-select" value={selectedAWC} onChange={e => setSelectedAWC(e.target.value)}
            style={{ height: 38, padding: '0 32px 0 12px', fontSize: 13, fontWeight: 500, maxWidth: 210 }}>
            {AWC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
      </div>

      {/* ── Main content: sidebar + ticket workspace ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left Filter Sidebar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: 10 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-deep)' }}>Filter Options</h3>
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--primary-deep)', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{activeFilterCount}</span>
            )}
          </div>

          {/* Overdue Toggle — SLA breach only applies to open (Pending) tickets */}
          {activeTab === 'Pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Urgency</label>
              <button
                onClick={() => setIsOverdueOnly(v => !v)}
                style={{
                  padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
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

          {/* Type (CDPO pending) or Category (other pending + all resolved) */}
          {activeTab === 'Pending' && isCdpoPending && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Complaint Type</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {COMPLAINT_TYPES.map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
                    <input type="checkbox" checked={appliedTypes.includes(t)} onChange={() => setAppliedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                      style={{ accentColor: 'var(--primary-deep)', width: 15, height: 15 }} />
                    <span style={{ color: appliedTypes.includes(t) ? 'var(--primary-deep)' : 'var(--text-dark)', fontWeight: appliedTypes.includes(t) ? 600 : 400 }}>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'Pending' && !isCdpoPending) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Beneficiary Category</label>
              <select className="form-select" value={appliedCategories[0] || 'All'}
                onChange={e => setAppliedCategories(e.target.value === 'All' ? [] : [e.target.value])}
                style={{ width: '100%', height: 40, padding: '0 32px 0 12px', fontSize: 13 }}>
                <option value="All">Category: All</option>
                {BENEFICIARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {activeTab === 'Resolved' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {RESOLVED_STATUSES.map(s => (
                    <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '4px 0' }}>
                      <input type="checkbox" checked={appliedStatuses.includes(s.value)} onChange={() => setAppliedStatuses(prev => prev.includes(s.value) ? prev.filter(x => x !== s.value) : [...prev, s.value])}
                        style={{ accentColor: 'var(--primary-deep)', width: 15, height: 15 }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                      <span style={{ color: appliedStatuses.includes(s.value) ? 'var(--primary-deep)' : 'var(--text-dark)', fontWeight: appliedStatuses.includes(s.value) ? 600 : 400 }}>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Beneficiary Category</label>
                <select className="form-select" value={appliedCategories[0] || 'All'}
                  onChange={e => setAppliedCategories(e.target.value === 'All' ? [] : [e.target.value])}
                  style={{ width: '100%', height: 40, padding: '0 32px 0 12px', fontSize: 13 }}>
                  <option value="All">Category: All</option>
                  {BENEFICIARY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Date Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {activeTab === 'Pending' ? 'Submission Date' : 'Resolution Date'}
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
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={14} /> {dateLabelText}
              </span>
            </button>
            <DateRangePopover
              open={dateOpen} onClose={() => setDateOpen(false)}
              applied={appliedDateOption} appliedFrom={appliedFrom} appliedTo={appliedTo}
              onApply={(opt, from, to) => { setAppliedDateOption(opt); setAppliedFrom(from); setAppliedTo(to); setDateOpen(false); }}
              placement={datePanelPlacement}
            />
          </div>

          {/* Reset */}
          {activeFilterCount > 0 && (
            <button className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm" style={{ borderRadius: 20, fontSize: 12 }} onClick={clearAllFilters}>
              Reset Filters
            </button>
          )}
        </div>

        {/* Right workspace: tabs + search + closure banner + cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Tabs + Search */}
          <div className="search-filter-section" style={{ marginBottom: 0 }}>
            <div className="tabs-navigation" style={{ borderBottom: 'none', margin: 0 }}>
              {(['Pending','Resolved'] as const).map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => handleTabChange(tab)}>
                  {tab}
                  <span className="tab-count">{tab === 'Pending' ? displayedPending.length : displayedResolved.length}</span>
                </button>
              ))}
            </div>
            <div className="search-input-wrapper" style={{ maxWidth: 260 }}>
              <Search className="search-icon-svg" />
              <input type="text" className="search-input" placeholder="Search tickets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>

          {/* Closure Banner */}
          {activeTab === 'Resolved' && assignedFilter === 'Supervisor' && awaitingClosureCount > 0 && (
            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 'var(--radius-md)', padding: '10px 16px', fontSize: 13, fontWeight: 600, color: '#f57f17', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚠</span>
              {awaitingClosureCount} ticket{awaitingClosureCount > 1 ? 's' : ''} awaiting your closure — click a card to close
            </div>
          )}

          {/* Ticket Grid */}
          {activeTab === 'Pending' ? (
            displayedPending.length === 0 ? (
              <div style={{ padding: '64px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--primary-deep)' }}>No Pending Grievances</h3>
                <p style={{ fontSize: 13, marginTop: 4 }}>No tickets match the current filters.</p>
              </div>
            ) : (
              <div className="ticket-grid">
                {displayedPending.map(card => (
                  <PendingCard key={card.id} card={card} showDocs={showDocs} onView={() => setSelectedTicket({ ...card, isPendingTicket: true })} />
                ))}
              </div>
            )
          ) : (
            displayedResolved.length === 0 ? (
              <div style={{ padding: '64px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Inbox size={48} style={{ opacity: 0.4, marginBottom: 16 }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--primary-deep)' }}>No Resolved Tickets</h3>
                <p style={{ fontSize: 13, marginTop: 4 }}>No tickets match the current filters.</p>
              </div>
            ) : (
              <div className="ticket-grid">
                {displayedResolved.map(card => (
                  <ResolvedCard key={card.id} card={card} onView={() => setSelectedTicket(card)} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* Ticket Detail Drawer */}
      {selectedTicket && (
        <TicketDetailsScreen
          card={selectedTicket}
          assignedFilter="CDPO"
          onBack={() => setSelectedTicket(null)}
          onResolveTicket={handleResolveTicket}
          onCloseTicket={handleCloseTicket}
        />
      )}

      {/* Breakdown Modals */}
      <PendingBreakdownModal open={pendingModal} onClose={() => setPendingModal(false)}
        cdpoP={cdpoP} cdpoO={cdpoO} supP={supP} supO={supO} awwP={awwP} awwO={awwO} />
      <ResolvedBreakdownModal open={resolvedModal} onClose={() => setResolvedModal(false)}
        byRole={{ cdpo: cdpoR, sup: supR, aww: awwR }} byStatus={byStatus} />
    </div>
  );
}
