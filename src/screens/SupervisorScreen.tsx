import React, { useRef, useState } from 'react';
import { TicketCard, ResolvedTicketCard } from '../web/types';
import TicketDetailsScreen from './TicketDetailsScreen';
import BatchedTicketGrid from '../components/BatchedTicketGrid';
import { Search, Calendar, Eye, RefreshCw, X, Info, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SupervisorViewProps {
  sharedPendingCards: TicketCard[];
  setSharedPendingCards: React.Dispatch<React.SetStateAction<TicketCard[]>>;
  sharedResolvedCards: ResolvedTicketCard[];
  setSharedResolvedCards: React.Dispatch<React.SetStateAction<ResolvedTicketCard[]>>;
}

const RESOLVED_STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  CLOSED:          { label: 'CLOSED',          color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7' },
  CLOSURE_PENDING: { label: 'PENDING FOR CLOSURE', color: '#f57f17', bg: '#fff8e1', border: '#ffe082' },
  APPEAL_RAISED:   { label: 'APPEAL RAISED',   color: '#e65100', bg: '#fff3e0', border: '#ffcc80' },
  APPEAL_RESOLVED: { label: 'APPEAL RESOLVED', color: '#1565c0', bg: '#e8eaf6', border: '#90caf9' },
};

const RESOLVED_STATUS_OPTIONS = [
  { value: 'CLOSED',          label: 'Closed',          color: '#2e7d32' },
  { value: 'CLOSURE_PENDING', label: 'Pending for Closure', color: '#f57f17' },
  { value: 'APPEAL_RAISED',   label: 'Appeal Raised',   color: '#e65100' },
  { value: 'APPEAL_RESOLVED', label: 'Appeal Resolved', color: '#1565c0' },
];

const AWC_OPTIONS = [
  'All Centres',
  'AWC 27305060101',
  'AWC 27305060102',
  'AWC 27305060103',
  'AWC 27305060104',
  'AWC 27305060105',
  'AWC 27305060106',
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'Category: All' },
  { value: 'Pregnant Woman', label: 'Pregnant Woman' },
  { value: 'Lactating Mother', label: 'Lactating Mother' },
  { value: 'Children 0-6 months', label: 'Children 0-6 months' },
  { value: 'Children (6m-3y)', label: 'Children 6 months to 3 years' },
  { value: 'Children (3-6y)', label: 'Children 3 Years to 6 years' },
  { value: 'Adolescent Girl', label: 'Adolescent Girls' },
];

type DateRangeOption = 'All' | '7' | '14' | '21' | '21+';

const DATE_RANGE_LABELS: Record<DateRangeOption, string> = {
  All: 'Date Range: All',
  '7': 'Last 7 Days',
  '14': 'Last 14 Days',
  '21': 'Last 21 Days',
  '21+': 'More than 21 Days',
};

const REFERENCE_TODAY = new Date(2025, 5, 30);

function parseSubmittedDate(value: string | undefined): Date | null {
  if (!value) return null;
  const clean = value.replace('Submitted:', '').trim();
  const m = clean.match(/(\d{2})\/(\d{2})\/(\d{4})/);
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

const COMPLAINT_PRIORITY: Record<string, number> = { Urgent: 0, Corruption: 1, General: 2 };
const complaintRank = (t?: string) => COMPLAINT_PRIORITY[t ?? ''] ?? 3;

// Tickets predating the origin field are treated as web self-service.
type SourceFilter = 'All' | 'WEB' | 'APP' | 'CALL_CENTRE';
const channelOf = (c: { origin?: { channel?: string } }) => c.origin?.channel ?? 'WEB';
const passesSource = (c: { origin?: { channel?: string } }, f: SourceFilter) => f === 'All' || channelOf(c) === f;

function ticketAge(submittedDate?: string): number {
  const d = parseSubmittedDate(submittedDate);
  if (!d) return 0;
  return Math.floor((REFERENCE_TODAY.getTime() - d.getTime()) / 86400000);
}

// Queue order for pending tickets: the closer a ticket is to breaching the 21-day
// SLA, the higher it sits — so already-overdue tickets lead (most overdue first),
// followed by those nearest the deadline. Oldest-first achieves exactly that.
// Complaint severity only breaks ties between tickets of the same age.
function byBreachRisk(a: TicketCard, b: TicketCard): number {
  const ageDiff = ticketAge(b.submittedDate) - ticketAge(a.submittedDate);
  if (ageDiff !== 0) return ageDiff;
  return complaintRank(a.complaintType) - complaintRank(b.complaintType);
}

function parseResolvedDate(value: string | undefined): Date | null {
  if (!value) return null;
  const clean = value.replace('Resolved:', '').trim();
  const m = clean.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

function byLatestResolutionDate(a: TicketCard, b: TicketCard): number {
  const dateA = parseResolvedDate((a as any).resolvedDate);
  const dateB = parseResolvedDate((b as any).resolvedDate);
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1;
  if (!dateB) return -1;
  return dateB.getTime() - dateA.getTime();
}

export default function SupervisorScreen({
  sharedPendingCards,
  setSharedPendingCards,
  sharedResolvedCards,
  setSharedResolvedCards,
}: SupervisorViewProps) {
  // Tab and Filters State
  const [activeTab, setActiveTab] = useState<'Pending' | 'Resolved'>('Pending');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Assigned To scope — now lives ABOVE the sidebar (uniform with CDPO) ──
  const [scopeFilter, setScopeFilter] = useState<'me' | 'aww'>('me');
  const [selectedAWC, setSelectedAWC] = useState('All Centres');

  // Sidebar filter state
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [appliedStatuses, setAppliedStatuses] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('All');

  // Date range filter
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const [isDatePanelOpen, setIsDatePanelOpen] = useState(false);
  const [datePanelPlacement, setDatePanelPlacement] = useState<'below' | 'above'>('below');
  const [appliedDateOption, setAppliedDateOption] = useState<DateRangeOption>('All');
  const [draftDateOption, setDraftDateOption] = useState<DateRangeOption>('All');

  // Detail Overlay
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Summary breakdown modal
  const [breakdownView, setBreakdownView] = useState<'pending' | 'resolved' | null>(null);

  // Scoped ticket lists
  const pendingList = sharedPendingCards.filter(
    (c) => c.assignedTo === 'Supervisor' || c.assignedTo === 'AWW'
  );
  const resolvedList = sharedResolvedCards.filter(
    (c) => c.assignedTo === 'Supervisor' || c.assignedTo === 'AWW'
  );

  // Summary counts
  const supervisorPending  = pendingList.filter(c => c.assignedTo === 'Supervisor').length;
  const supervisorResolved = resolvedList.filter(c => c.assignedTo === 'Supervisor').length;
  const supervisorTotal    = supervisorPending + supervisorResolved;
  const awwPending         = pendingList.filter(c => c.assignedTo === 'AWW').length;
  const awwResolved        = resolvedList.filter(c => c.assignedTo === 'AWW').length;
  const awwTotal           = awwPending + awwResolved;
  const totalPending       = supervisorPending + awwPending;
  const totalResolved      = supervisorResolved + awwResolved;
  const totalAll           = supervisorTotal + awwTotal;

  const matchesScope = (ticket: TicketCard) =>
    (scopeFilter === 'me'  && ticket.assignedTo === 'Supervisor') ||
    (scopeFilter === 'aww' && ticket.assignedTo === 'AWW' &&
      (selectedAWC === 'All Centres' || ticket.awcName === selectedAWC));

  const scopedPendingCount  = pendingList.filter(matchesScope).length;
  const scopedResolvedCount = resolvedList.filter(matchesScope).length;

  const isTicketOverdue  = (c: TicketCard) => c.daysType === 'overdue' || c.isOverdue;
  const supervisorOverdue = pendingList.filter(c => c.assignedTo === 'Supervisor' && isTicketOverdue(c)).length;
  const awwOverdue        = pendingList.filter(c => c.assignedTo === 'AWW'        && isTicketOverdue(c)).length;
  const totalOverdue      = supervisorOverdue + awwOverdue;

  const countResolvedByStatus = (status: string, role: 'Supervisor' | 'AWW') =>
    resolvedList.filter(c => c.status === status && c.assignedTo === role).length;

  const closurePendingSup   = countResolvedByStatus('CLOSURE_PENDING', 'Supervisor');
  const closurePendingAWW   = countResolvedByStatus('CLOSURE_PENDING', 'AWW');
  const closedSup           = countResolvedByStatus('CLOSED',          'Supervisor');
  const closedAWW           = countResolvedByStatus('CLOSED',          'AWW');
  const appealRaisedSup     = countResolvedByStatus('APPEAL_RAISED',   'Supervisor');
  const appealRaisedAWW     = countResolvedByStatus('APPEAL_RAISED',   'AWW');
  const appealResolvedSup   = countResolvedByStatus('APPEAL_RESOLVED', 'Supervisor');
  const appealResolvedAWW   = countResolvedByStatus('APPEAL_RESOLVED', 'AWW');

  const openDatePanel = () => {
    setDraftDateOption(appliedDateOption);
    const buttonRect = dateButtonRef.current?.getBoundingClientRect();
    const estimatedPanelHeight = 360;
    setDatePanelPlacement(
      buttonRect && window.innerHeight - buttonRect.bottom < estimatedPanelHeight ? 'above' : 'below'
    );
    setIsDatePanelOpen(true);
  };

  const handleClearDateFilter = () => {
    setDraftDateOption('All');
  };

  const handleApplyDateFilter = () => {
    setAppliedDateOption(draftDateOption);
    setIsDatePanelOpen(false);
  };

  const getFilteredTickets = () => {
    const list = activeTab === 'Pending' ? pendingList : resolvedList;
    return list.filter((ticket) => {
      if (!matchesScope(ticket)) return false;

      if (!passesSource(ticket, sourceFilter)) return false;

      const isOverdue = ticket.daysType === 'overdue' || ticket.isOverdue;
      if (activeTab === 'Pending' && isOverdueOnly && !isOverdue) return false;

      if (selectedCategory !== 'All' && ticket.beneficiaryType !== selectedCategory) return false;

      if (activeTab === 'Resolved' && appliedStatuses.length > 0 && (!ticket.status || !appliedStatuses.includes(ticket.status))) return false;

      if (appliedDateOption !== 'All') {
        const submitted = parseSubmittedDate(ticket.submittedDate);
        if (!submitted) return false;
        if (appliedDateOption === '21+') {
          // Equivalent to the Overdue definition used elsewhere (age >= 21 days).
          const cutoff = new Date(REFERENCE_TODAY);
          cutoff.setDate(cutoff.getDate() - 21);
          if (!(submitted <= cutoff)) return false;
        } else {
          const days = Number(appliedDateOption);
          const windowStart = new Date(REFERENCE_TODAY);
          windowStart.setDate(windowStart.getDate() - (days - 1));
          if (!(submitted >= windowStart && submitted <= REFERENCE_TODAY)) return false;
        }
      }

      const query = searchQuery.toLowerCase();
      if (query) {
        const hit =
          ticket.ticketNumber.toLowerCase().includes(query) ||
          ticket.beneficiaryName.toLowerCase().includes(query) ||
          (ticket.description && ticket.description.toLowerCase().includes(query)) ||
          (ticket.topic && ticket.topic.toLowerCase().includes(query));
        if (!hit) return false;
      }

      return true;
    });
  };

  const filteredTickets = activeTab === 'Pending'
    ? [...getFilteredTickets()].sort(byBreachRisk)
    : [...getFilteredTickets()].sort(byLatestResolutionDate);

  // Counted from the list actually on screen rather than the whole queue, so the
  // banner can never contradict the cards below it once a filter or search narrows
  // the list.
  const awaitingClosureCount = activeTab === 'Resolved'
    ? filteredTickets.filter(t => t.awaitingCdpoClosure).length
    : 0;

  // Any change to scope, tab or a filter snaps the batched grid back to page one.
  const gridResetKey = [
    activeTab, scopeFilter, selectedAWC, searchQuery, isOverdueOnly,
    selectedCategory, appliedStatuses.join(','), appliedDateOption, sourceFilter,
  ].join('|');

  const handleResolveTicket = (ticketId: string, closureNote: string) => {
    const ticket = sharedPendingCards.find((t) => t.id === ticketId);
    if (ticket) {
      // The Supervisor's note is their ATR. Closure is the CDPO's own act, so no
      // closer or closure remark is recorded until they sign it off.
      const newCard: ResolvedTicketCard = {
        ...ticket,
        resolvedDate: 'Resolved: 30/06/2025',
        status: 'CLOSURE_PENDING',
        awaitingCdpoClosure: true,
        actionTaken: closureNote,
        resolvedBy: 'Supervisor',
      };
      setSharedPendingCards((prev) => prev.filter((t) => t.id !== ticketId));
      setSharedResolvedCards((prev) => [newCard, ...prev]);
    }
  };

  // Active filter count for sidebar badge
  const activeFilterCount =
    (activeTab === 'Pending' && isOverdueOnly ? 1 : 0) +
    (selectedCategory !== 'All' ? 1 : 0) +
    (activeTab === 'Resolved' ? appliedStatuses.length : 0) +
    (appliedDateOption !== 'All' ? 1 : 0) +
    (sourceFilter !== 'All' ? 1 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', fontWeight: 700, color: 'var(--primary-deep)' }}>
          Beneficiary Redressal
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginTop: '4px' }}>
          Track and resolve grievances raised by beneficiaries within your jurisdiction.
        </p>
      </div>

      {/* SUMMARY Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-deep)', letterSpacing: '0.5px', display: 'block' }}>
          Summary
        </span>
        <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '16px' }}>
          Overview of pending grievances and resolved cases.
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <th style={{ textAlign: 'left', paddingBottom: '10px', fontWeight: 600, paddingLeft: '24px' }}></th>
              <th style={{ textAlign: 'right', paddingBottom: '10px', fontWeight: 600, width: '180px' }}>
                <button onClick={() => setBreakdownView('pending')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent-saffron)', fontSize: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', width: '100%' }}>
                  PENDING ▼
                </button>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: '10px', fontWeight: 600, width: '180px' }}>
                <button onClick={() => setBreakdownView('resolved')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--accent-green)', fontSize: '16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', width: '100%' }}>
                  RESOLVED ▼
                </button>
              </th>
              <th style={{ textAlign: 'right', paddingBottom: '10px', fontWeight: 700, color: 'var(--primary-deep)', fontSize: '16px', paddingRight: '24px', width: '180px' }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 0', paddingLeft: '24px', fontWeight: 500, color: 'var(--text-muted)' }}>Supervisor</td>
              <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--accent-saffron)', fontSize: '18px' }}>{supervisorPending}</td>
              <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--accent-green)', fontSize: '18px' }}>{supervisorResolved}</td>
              <td style={{ textAlign: 'right', padding: '12px 0', paddingRight: '24px', fontWeight: 700, color: 'var(--primary-deep)', fontSize: '18px' }}>{supervisorTotal}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '12px 0', paddingLeft: '24px', fontWeight: 500, color: 'var(--text-muted)' }}>AWW</td>
              <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--accent-saffron)', fontSize: '18px' }}>{awwPending}</td>
              <td style={{ textAlign: 'right', padding: '12px 0', fontWeight: 700, color: 'var(--accent-green)', fontSize: '18px' }}>{awwResolved}</td>
              <td style={{ textAlign: 'right', padding: '12px 0', paddingRight: '24px', fontWeight: 700, color: 'var(--primary-deep)', fontSize: '18px' }}>{awwTotal}</td>
            </tr>
            <tr style={{ background: 'var(--primary-light)', fontWeight: 700 }}>
              <td style={{ padding: '14px 10px', paddingLeft: '24px', color: 'var(--primary-deep)', borderRadius: '6px 0 0 6px' }}>Total</td>
              <td style={{ textAlign: 'right', padding: '14px 10px', color: 'var(--accent-saffron)', fontSize: '20px' }}>{totalPending}</td>
              <td style={{ textAlign: 'right', padding: '14px 10px', color: 'var(--accent-green)', fontSize: '20px' }}>{totalResolved}</td>
              <td style={{ textAlign: 'right', padding: '14px 10px', paddingRight: '24px', color: 'var(--primary-deep)', fontSize: '20px', borderRadius: '0 6px 6px 0' }}>{totalAll}</td>
            </tr>
          </tbody>
        </table>
        <span style={{ display: 'block', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)', marginTop: '14px' }}>
          Tap PENDING or RESOLVED column for detailed breakdown
        </span>
      </div>

      {/* ── Assigned To — uniform position, full-width row above main content ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0 }}>Assigned To</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { setScopeFilter('me'); setSelectedAWC('All Centres'); }}
            style={{
              padding: '7px 20px', borderRadius: '20px',
              border: `1.5px solid ${scopeFilter === 'me' ? 'var(--primary-deep)' : 'var(--border-color)'}`,
              background: scopeFilter === 'me' ? 'var(--primary-deep)' : '#ffffff',
              color: scopeFilter === 'me' ? '#ffffff' : 'var(--text-dark)',
              fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            Me
          </button>
          <button
            onClick={() => setScopeFilter('aww')}
            style={{
              padding: '7px 20px', borderRadius: '20px',
              border: `1.5px solid ${scopeFilter === 'aww' ? 'var(--primary-deep)' : 'var(--border-color)'}`,
              background: scopeFilter === 'aww' ? 'var(--primary-deep)' : '#ffffff',
              color: scopeFilter === 'aww' ? '#ffffff' : 'var(--text-dark)',
              fontSize: '16px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            AWW
          </button>
        </div>
        {/* AWC sub-filter — shown inline when AWW is selected */}
        {scopeFilter === 'aww' && (
          <select
            className="form-select"
            value={selectedAWC}
            onChange={(e) => setSelectedAWC(e.target.value)}
            style={{ height: '38px', padding: '0 32px 0 12px', fontSize: '16px', fontWeight: 500, maxWidth: '220px' }}
          >
            {AWC_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        )}
      </div>

      {/* ── Main content: sidebar + ticket grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Left Filter Sidebar */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-deep)' }}>
              Filter Options
            </h3>
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--primary-deep)', color: '#fff', borderRadius: '99px', padding: '2px 8px', fontSize: '14px', fontWeight: 700 }}>
                {activeFilterCount}
              </span>
            )}
          </div>

          {/* Overdue Toggle — SLA breach only applies to open (Pending) tickets */}
          {activeTab === 'Pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Urgency</label>
              <button
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '8px 16px', borderRadius: '20px', fontSize: '16px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: isOverdueOnly ? 'var(--color-danger)' : 'var(--bg-main)',
                  color: isOverdueOnly ? '#fff' : 'var(--text-dark)',
                  border: `1.5px solid ${isOverdueOnly ? 'var(--color-danger)' : 'var(--border-color)'}`,
                }}
                onClick={() => setIsOverdueOnly(!isOverdueOnly)}
              >
                {isOverdueOnly ? '× ' : ''}Overdue Only
              </button>
            </div>
          )}

          {/* Status — Resolved tab only */}
          {activeTab === 'Resolved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {RESOLVED_STATUS_OPTIONS.map((s) => (
                  <label key={s.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', cursor: 'pointer', padding: '4px 0' }}>
                    <input
                      type="checkbox"
                      checked={appliedStatuses.includes(s.value)}
                      onChange={() => setAppliedStatuses((prev) => prev.includes(s.value) ? prev.filter((x) => x !== s.value) : [...prev, s.value])}
                      style={{ accentColor: 'var(--primary-deep)', width: '15px', height: '15px' }}
                    />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                    <span style={{ color: appliedStatuses.includes(s.value) ? 'var(--primary-deep)' : 'var(--text-dark)', fontWeight: appliedStatuses.includes(s.value) ? 600 : 400 }}>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Beneficiary Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Beneficiary Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', height: '40px', padding: '0 32px 0 12px', fontSize: '16px' }}
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Source channel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Source</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {([['All', 'All'], ['WEB', 'Web'], ['APP', 'App'], ['CALL_CENTRE', 'Call Centre']] as [SourceFilter, string][]).map(([val, lbl]) => (
                <button key={val} onClick={() => setSourceFilter(val)} style={{
                  flex: 1, padding: '7px 4px', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                  border: `1.5px solid ${sourceFilter === val ? 'var(--primary-deep)' : 'var(--border-color)'}`,
                  background: sourceFilter === val ? 'var(--primary-deep)' : 'var(--bg-main)',
                  color: sourceFilter === val ? '#ffffff' : 'var(--text-dark)',
                }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Submission Date</label>
            <button
              ref={dateButtonRef}
              className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-md"
              style={{
                width: '100%', justifyContent: 'space-between', height: '40px',
                border: appliedDateOption !== 'All' ? '1.5px solid var(--primary-deep)' : undefined,
                color: appliedDateOption !== 'All' ? 'var(--primary-deep)' : undefined,
                fontWeight: appliedDateOption !== 'All' ? 700 : undefined,
              }}
              onClick={openDatePanel}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={14} />
                {DATE_RANGE_LABELS[appliedDateOption]}
              </span>
            </button>

            {isDatePanelOpen && (
              <>
                <div onClick={() => setIsDatePanelOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                <div style={{
                  position: 'absolute',
                  ...(datePanelPlacement === 'below' ? { top: 'calc(100% + 8px)' } : { bottom: 'calc(100% + 8px)' }),
                  left: 0, width: '300px', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
                  background: '#ffffff', border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '20px', zIndex: 50,
                }}>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--primary-deep)', marginBottom: '14px' }}>
                    Filter by Date Range
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {([['7','Last 7 Days'],['14','Last 14 Days'],['21','Last 21 Days'],['21+','More than 21 Days']] as [DateRangeOption, string][]).map(([value, label]) => (
                      <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 4px', cursor: 'pointer', fontSize: '16px', fontWeight: 600, color: draftDateOption === value ? 'var(--primary-deep)' : 'var(--text-dark)' }}>
                        <input type="radio" name="dateRange" checked={draftDateOption === value} onChange={() => setDraftDateOption(value)}
                          style={{ accentColor: 'var(--primary-deep)', width: '16px', height: '16px' }} />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                    <button className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm" style={{ flex: 1 }} onClick={handleClearDateFilter}>Clear</button>
                    <button className="ux4g-btn ux4g-btn-primary ux4g-btn-sm" style={{ flex: 1 }} onClick={handleApplyDateFilter}>Apply Filters</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reset all */}
          {activeFilterCount > 0 && (
            <button
              className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-sm"
              style={{ borderRadius: '20px', fontSize: '14px' }}
              onClick={() => { setIsOverdueOnly(false); setSelectedCategory('All'); setAppliedStatuses([]); setAppliedDateOption('All'); setSourceFilter('All'); }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Right workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Tabs + Search bar */}
          <div className="search-filter-section" style={{ marginBottom: 0 }}>
            <div className="tabs-navigation" style={{ borderBottom: 'none', margin: 0 }}>
              <button className={`tab-btn ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>
                Pending
                <span className="tab-count">{scopedPendingCount}</span>
              </button>
              <button className={`tab-btn ${activeTab === 'Resolved' ? 'active' : ''}`} onClick={() => setActiveTab('Resolved')}>
                Resolved
                <span className="tab-count">{scopedResolvedCount}</span>
              </button>
            </div>

            <div className="search-input-wrapper" style={{ maxWidth: '260px' }}>
              <Search className="search-icon-svg" />
              <input
                type="text"
                className="search-input"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Closure Banner */}
          {activeTab === 'Resolved' && awaitingClosureCount > 0 && (
            <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 'var(--radius-md)', padding: '10px 16px', fontSize: '16px', fontWeight: 600, color: '#f57f17', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠</span>
              {awaitingClosureCount} ticket{awaitingClosureCount > 1 ? 's' : ''} awaiting CDPO closure
            </div>
          )}

          {/* Ticket Grid */}
          {filteredTickets.length === 0 ? (
            <div style={{ padding: '64px 32px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={40} style={{ opacity: 0.5, marginBottom: '16px' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--primary-deep)' }}>No matching tickets</h3>
              <p style={{ fontSize: '16px', marginTop: '4px' }}>Try switching scope or adjusting the filters.</p>
            </div>
          ) : (
            <BatchedTicketGrid items={filteredTickets} resetKey={gridResetKey}
              renderItem={(ticket) => {
                const overdue = ticket.daysType === 'overdue' || ticket.isOverdue;
                const resolvedCfg = activeTab === 'Resolved' ? (RESOLVED_STATUS_CFG[ticket.status || 'CLOSED'] ?? RESOLVED_STATUS_CFG.CLOSED) : null;
                return (
                  <div key={ticket.id} className="ticket-card" onClick={() => setSelectedTicket(ticket)} style={{ cursor: 'pointer', borderColor: overdue ? 'var(--color-danger)' : 'var(--border-color)' }}>
                    <div className="ticket-card-header">
                      <span className="ticket-id">{ticket.ticketNumber}</span>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {activeTab === 'Pending' && overdue && <span className="badge badge-danger">Overdue</span>}
                        {resolvedCfg && (
                          <span style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '14px', fontWeight: 700, letterSpacing: '0.3px', background: resolvedCfg.bg, color: resolvedCfg.color, border: `1px solid ${resolvedCfg.border}` }}>
                            {resolvedCfg.label}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ticket-title-row">
                      <h4 className="ticket-title" style={{ margin: 0 }}>{ticket.beneficiaryName}</h4>
                      {ticket.beneficiaryType && (
                        <span style={{ fontSize: '14px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {ticket.beneficiaryType}
                        </span>
                      )}
                    </div>
                    <div className="ticket-topic">{ticket.topic}</div>
                    <p className="ticket-desc">{ticket.description}</p>
                    <div className="ticket-metadata">
                      {activeTab === 'Resolved' ? (
                        <span className="ticket-date">{(ticket as any).resolvedDate}</span>
                      ) : (
                        <span className="ticket-date">Submitted: {ticket.submittedDate?.replace('Submitted: ', '')}</span>
                      )}
                      {activeTab === 'Pending' && (
                        <span style={{ fontWeight: 700, color: overdue ? 'var(--color-danger)' : 'var(--accent-ashoka)' }}>{ticket.daysLabel}</span>
                      )}
                    </div>
                    <div className="ticket-awc-row">
                      <span>AWC: <strong className="ticket-awc">{formatAwcName(ticket.awcName)}</strong></span>
                    </div>
                    <button className="ux4g-btn ux4g-btn-secondary ux4g-btn-md" style={{ width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
                      onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                      <Eye size={14} /> View Details
                    </button>
                  </div>
                );
              }} />
          )}
        </div>
      </div>

      {/* Ticket Details Drawer */}
      {selectedTicket && (
        <TicketDetailsScreen
          card={selectedTicket}
          assignedFilter="Supervisor"
          onBack={() => setSelectedTicket(null)}
          onResolveTicket={handleResolveTicket}
        />
      )}

      {/* Pending Breakdown Modal */}
      {breakdownView === 'pending' && (
        <div className="modal-backdrop" onClick={() => setBreakdownView(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, color: 'var(--primary-deep)' }}>Pending Breakdown</h3>
              <button onClick={() => setBreakdownView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', borderRadius: '6px' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: '18px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-deep)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Pending</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: 'var(--primary-deep)', lineHeight: 1 }}>{totalPending.toLocaleString()}</span>
            </div>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '16px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-main)' }}>
                    <th style={{ textAlign: 'left', padding: '11px 16px', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Role</th>
                    <th style={{ textAlign: 'right', padding: '11px 16px', fontSize: '14px', fontWeight: 700, color: 'var(--accent-saffron)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Pending</th>
                    <th style={{ textAlign: 'right', padding: '11px 16px', fontSize: '14px', fontWeight: 700, color: 'var(--color-danger)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Overdue</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '13px 16px', color: 'var(--text-dark)', fontWeight: 500 }}>Supervisor</td>
                    <td style={{ textAlign: 'right', padding: '13px 16px', fontWeight: 700, color: 'var(--accent-saffron)' }}>{supervisorPending}</td>
                    <td style={{ textAlign: 'right', padding: '13px 16px', fontWeight: 700, color: 'var(--color-danger)' }}>{supervisorOverdue}</td>
                  </tr>
                  <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '13px 16px', color: 'var(--text-dark)', fontWeight: 500 }}>AWW</td>
                    <td style={{ textAlign: 'right', padding: '13px 16px', fontWeight: 700, color: 'var(--accent-saffron)' }}>{awwPending}</td>
                    <td style={{ textAlign: 'right', padding: '13px 16px', fontWeight: 700, color: 'var(--color-danger)' }}>{awwOverdue}</td>
                  </tr>
                  <tr style={{ background: 'var(--primary-light)', borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '13px 16px', color: 'var(--primary-deep)', fontWeight: 700 }}>Total</td>
                    <td style={{ textAlign: 'right', padding: '13px 16px', fontWeight: 800, color: 'var(--accent-saffron)' }}>{totalPending}</td>
                    <td style={{ textAlign: 'right', padding: '13px 16px', fontWeight: 800, color: 'var(--color-danger)' }}>{totalOverdue}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '10px', background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
              <Info size={15} style={{ color: 'var(--color-info)', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ margin: 0, fontSize: 16, color: 'var(--text-dark)', lineHeight: 1.55 }}>
                <strong>Pending</strong> is the count of tickets still awaiting action. <strong>Overdue</strong> tickets are grievances pending for more than 21 days and need immediate attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Breakdown Modal */}
      {breakdownView === 'resolved' && (
        <div className="modal-backdrop" onClick={() => setBreakdownView(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 28, maxWidth: 580 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--primary-deep)' }}>Resolved Breakdown</h3>
              <button onClick={() => setBreakdownView(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, display: 'flex', borderRadius: 6 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ background: 'var(--accent-green-light)', borderRadius: 'var(--radius-lg)', padding: '16px 24px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Total Resolved</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1 }}>{totalResolved.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[{ l: 'Supervisor', v: supervisorResolved }, { l: 'AWW', v: awwResolved }].map((r) => (
                  <span key={r.l} style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 999, padding: '4px 10px', fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>
                    {r.l} <strong style={{ color: 'var(--accent-green)' }}>{r.v}</strong>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Pending for Closure', icon: Clock,        color: '#f57f17', bg: '#fff8e1', border: '#ffe082', total: closurePendingSup + closurePendingAWW, rows: [{ r: 'Supervisor', v: closurePendingSup }, { r: 'AWW', v: closurePendingAWW }] },
                { label: 'Closed',              icon: CheckCircle2, color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', total: closedSup + closedAWW,                 rows: [{ r: 'Supervisor', v: closedSup },         { r: 'AWW', v: closedAWW }] },
                { label: 'Appeal Raised',       icon: AlertTriangle,color: '#e65100', bg: '#fff3e0', border: '#ffcc80', total: appealRaisedSup + appealRaisedAWW,    rows: [{ r: 'Supervisor', v: appealRaisedSup },   { r: 'AWW', v: appealRaisedAWW }] },
                { label: 'Appeal Resolved',     icon: ShieldCheck,  color: '#1565c0', bg: '#e8eaf6', border: '#90caf9', total: appealResolvedSup + appealResolvedAWW,rows: [{ r: 'Supervisor', v: appealResolvedSup }, { r: 'AWW', v: appealResolvedAWW }] },
              ].map((card) => (
                <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 'var(--radius-lg)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <card.icon size={13} style={{ color: card.color }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: card.color, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{card.label}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: card.color, lineHeight: 1 }}>{card.total}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, borderTop: `1px solid ${card.border}`, paddingTop: 8 }}>
                    {card.rows.map((r) => (
                      <div key={r.r} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: card.color }}>
                        <span>{r.r}</span><strong>{r.v}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
