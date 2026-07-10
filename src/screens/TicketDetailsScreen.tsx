import React, { useEffect, useState } from 'react';
import { X, ArrowLeft, FileText, Check } from 'lucide-react';

interface TicketDetailsProps {
  card: any;
  assignedFilter: 'Supervisor' | 'CDPO' | 'DPO' | 'AWW';
  onBack: () => void;
  onResolveTicket?: (ticketId: string, closureNote: string) => void;
  onCloseTicket?: (ticketId: string, note?: string) => void;
  onResolveAppeal?: (ticketId: string, notes: string) => void;
}

// Status badge config — ported verbatim from the mobile app (my-app/src/screens/TicketDetailsScreen.tsx STATUS_CFG)
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; hasIcon: boolean }> = {
  PENDING:         { label: 'PENDING',         color: '#e65100', bg: '#fff3e0', border: '#ffcc80', hasIcon: false },
  OVERDUE:         { label: 'OVERDUE',         color: '#d32f2f', bg: '#ffebee', border: '#ffcdd2', hasIcon: true  },
  CLOSED:          { label: 'CLOSED',          color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', hasIcon: false },
  CLOSURE_PENDING: { label: 'CLOSURE PENDING', color: '#f57f17', bg: '#fff8e1', border: '#ffe082', hasIcon: true  },
  APPEAL_RAISED:   { label: 'APPEAL RAISED',   color: '#e65100', bg: '#fff3e0', border: '#ffcc80', hasIcon: true  },
  APPEAL_RESOLVED: { label: 'APPEAL RESOLVED', color: '#ffffff', bg: '#4f46e5', border: '#4f46e5', hasIcon: true  },
};

export default function TicketDetailsScreen({
  card,
  assignedFilter,
  onBack,
  onResolveTicket,
  onCloseTicket,
  onResolveAppeal,
}: TicketDetailsProps) {
  // Local copy of the ticket that gets patched in place on resolve/close, so
  // the drawer can flip straight to the updated details behind the success
  // screen — mirroring the mobile app's `currentCard` pattern.
  const [currentCard, setCurrentCard] = useState(card);
  useEffect(() => setCurrentCard(card), [card]);

  const [actionNote, setActionNote] = useState('');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAppealSuccess, setShowAppealSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ title: string; description: string; viewLabel: string } | null>(null);

  const isPending = !currentCard.resolvedDate && currentCard.status !== 'CLOSED' && currentCard.status !== 'APPEAL_RESOLVED' && currentCard.status !== 'CLOSURE_PENDING';
  const isClosurePending = currentCard.status === 'CLOSURE_PENDING';
  const isAppeal = currentCard.status === 'APPEAL_RAISED' || currentCard._isAppeal;
  const hasAppealReason = isAppeal || currentCard.status === 'APPEAL_RESOLVED';
  const isOverdue = isPending && (currentCard.isOverdue || currentCard.daysType === 'overdue');

  const statusKey = isOverdue ? 'OVERDUE' : (isPending ? 'PENDING' : currentCard.status);
  const statusCfg = STATUS_CFG[statusKey] ?? STATUS_CFG.CLOSED;

  // Timeline construction — ported verbatim from the mobile app
  // (my-app/src/screens/TicketDetailsScreen.tsx). Same events, per-event dot
  // colours, labels and date math so the web drawer matches the app exactly.
  type TimelineItem = { label: string; date: string; dotColor: string };

  const buildTimelineItems = (): TimelineItem[] => {
    const items: TimelineItem[] = [];
    const assignedRole = currentCard.assignedTo || 'AWW';
    const dateSubmitted = (currentCard.submittedDate || currentCard._appealTicket?.submittedDate)
      ? (currentCard.submittedDate || currentCard._appealTicket.submittedDate).replace('Submitted: ', '')
      : '25/06/2025';

    // Parse submitted date (dd/mm/yyyy)
    const subDateParts = dateSubmitted.split('/');
    let subDay = 25, subMonth = 6, subYear = 2025;
    if (subDateParts.length === 3) {
      subDay = parseInt(subDateParts[0], 10);
      subMonth = parseInt(subDateParts[1], 10);
      subYear = parseInt(subDateParts[2], 10);
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[subMonth - 1] || 'Jun';
    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

    // Base assignment
    items.push({
      label: `Assigned to ${assignedRole}`,
      date: `${pad(subDay)} ${monthName} ${subYear}, 09:00 AM`,
      dotColor: '#1a237e',
    });

    // Age relative to the app's fixed "today" (30/06/2025)
    const submissionDate = new Date(subYear, subMonth - 1, subDay);
    const currentDate = new Date(2025, 5, 30);
    const diffDays = Math.floor((currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));

    // Reminder Sent (after 7 days)
    if (diffDays >= 7) {
      const d = new Date(subYear, subMonth - 1, subDay + 7);
      items.push({
        label: `Reminder Sent to ${assignedRole}`,
        date: `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}, 10:30 AM`,
        dotColor: '#f57f17',
      });
    }

    // DPO Escalation (after 14 days)
    if (diffDays >= 14) {
      const d = new Date(subYear, subMonth - 1, subDay + 14);
      items.push({
        label: 'Ticket Escalated to DPO (View Only)',
        date: `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}, 02:00 PM`,
        dotColor: '#e65100',
      });
    }

    // Ticket Overdue (after 21 days)
    if (diffDays >= 21) {
      const d = new Date(subYear, subMonth - 1, subDay + 21);
      const od = pad(d.getDate()), om = months[d.getMonth()], oy = d.getFullYear();
      items.push({ label: 'Ticket Overdue', date: `${od} ${om} ${oy}, 05:00 PM`, dotColor: '#d32f2f' });

      const isEscalatedFromOther = currentCard.ticketNumber.includes('CDPO') || currentCard.ticketNumber.includes('SUP') || currentCard.ticketNumber.includes('AWW') || (assignedRole !== 'DPO');
      if (isEscalatedFromOther) {
        items.push({
          label: 'Reassigned to DPO (Overdue Escalation)',
          date: `${od} ${om} ${oy}, 05:01 PM`,
          dotColor: '#1a237e',
        });
      }
    }

    // Resolution & closure steps once the ticket is no longer pending
    if (!isPending) {
      const resolvedDayVal = new Date(subYear, subMonth - 1, subDay + Math.min(diffDays, 9));
      const resDay = pad(resolvedDayVal.getDate()), resMonth = months[resolvedDayVal.getMonth()], resYear = resolvedDayVal.getFullYear();

      const closedDayVal = new Date(subYear, subMonth - 1, subDay + Math.min(diffDays, 12));
      const clsDay = pad(closedDayVal.getDate()), clsMonth = months[closedDayVal.getMonth()], clsYear = closedDayVal.getFullYear();

      const appealDayVal = new Date(subYear, subMonth - 1, subDay + Math.min(diffDays, 14));
      const appDay = appealDayVal.getDate(), appMonth = months[appealDayVal.getMonth()], appYear = appealDayVal.getFullYear();

      if (currentCard.status === 'CLOSURE_PENDING') {
        items.push({ label: `Ticket Resolved by ${assignedRole}`, date: `${resDay} ${resMonth} ${resYear}, 03:00 PM`, dotColor: '#2e7d32' });
      } else if (currentCard.status === 'CLOSED') {
        if (assignedRole === 'DPO') {
          const isOverdueEscalation = currentCard.ticketNumber.includes('CDPO') || currentCard.ticketNumber.includes('SUP') || currentCard.ticketNumber.includes('AWW');
          items.push({
            label: isOverdueEscalation ? 'Ticket Resolved & Closed by DPO (Overdue Escalation)' : 'Ticket Resolved & Closed by DPO',
            date: `${clsDay} ${clsMonth} ${clsYear}, 10:00 AM`,
            dotColor: '#2e7d32',
          });
        } else if (assignedRole === 'CDPO') {
          items.push({ label: 'Ticket Resolved & Closed by CDPO', date: `${clsDay} ${clsMonth} ${clsYear}, 10:00 AM`, dotColor: '#2e7d32' });
        } else {
          items.push({ label: `Ticket Resolved by ${assignedRole}`, date: `${resDay} ${resMonth} ${resYear}, 03:00 PM`, dotColor: '#2e7d32' });
          items.push({ label: 'Ticket Closed by CDPO', date: `${clsDay} ${clsMonth} ${clsYear}, 10:00 AM`, dotColor: '#2e7d32' });
        }
      } else if (currentCard.status === 'APPEAL_RAISED') {
        if (assignedRole === 'CDPO') {
          items.push({ label: 'Ticket Resolved & Closed by CDPO', date: `${clsDay} ${clsMonth} ${clsYear}, 10:00 AM`, dotColor: '#2e7d32' });
        } else {
          items.push({ label: `Ticket Resolved by ${assignedRole}`, date: `${resDay} ${resMonth} ${resYear}, 03:00 PM`, dotColor: '#2e7d32' });
          items.push({ label: 'Ticket Closed by CDPO', date: `${clsDay} ${clsMonth} ${clsYear}, 10:00 AM`, dotColor: '#2e7d32' });
        }
        items.push({ label: 'Appeal Raised by Beneficiary', date: `${pad(appDay)} ${appMonth} ${appYear}, 02:00 PM`, dotColor: '#f57f17' });
      } else if (currentCard.status === 'APPEAL_RESOLVED') {
        if (assignedRole === 'CDPO') {
          items.push({ label: 'Ticket Resolved & Closed by CDPO', date: `${clsDay} ${clsMonth} ${clsYear}, 10:00 AM`, dotColor: '#2e7d32' });
        } else {
          items.push({ label: `Ticket Resolved by ${assignedRole}`, date: `${resDay} ${resMonth} ${resYear}, 03:00 PM`, dotColor: '#2e7d32' });
          items.push({ label: 'Ticket Closed by CDPO', date: `${clsDay} ${clsMonth} ${clsYear}, 10:00 AM`, dotColor: '#2e7d32' });
        }
        items.push({ label: 'Appeal Raised by Beneficiary', date: `${pad(appDay)} ${appMonth} ${appYear}, 02:00 PM`, dotColor: '#f57f17' });
        items.push({
          label: 'Appeal Resolved by DPO',
          date: `${appDay < 10 ? '0' + (appDay + 5) : (appDay + 5)} ${appMonth} ${appYear}, 11:00 AM`,
          dotColor: '#1a237e',
        });
      }
    }

    // Latest first
    items.reverse();
    return items;
  };

  const timelineItems = buildTimelineItems();

  // Modal copy — mirrors the mobile app's ActionTakenModal / AppealResolutionSheet titles, placeholders and button text.
  const modalTitle = isAppeal
    ? 'Resolve Appeal'
    : isClosurePending
      ? 'Close Ticket'
      : (assignedFilter === 'CDPO' || assignedFilter === 'DPO')
        ? 'Resolve & Close Ticket'
        : 'Resolve Ticket';

  const modalPlaceholder = isAppeal
    ? 'Describe the action taken to resolve this appeal...'
    : (isClosurePending || assignedFilter === 'CDPO' || assignedFilter === 'DPO')
      ? 'Describe the action taken and reason for closure...'
      : 'Describe the action taken to resolve this ticket...';

  const modalSubmitLabel = isAppeal
    ? 'Submit Resolution'
    : isClosurePending
      ? 'Close Ticket'
      : (assignedFilter === 'CDPO' || assignedFilter === 'DPO')
        ? 'Resolve & Close Ticket'
        : 'Submit Resolution';

  const closeActionModal = () => {
    setActionModalVisible(false);
    setActionNote('');
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (assignedFilter === 'Supervisor' && onResolveTicket) {
      onResolveTicket(currentCard.id, actionNote);
      setCurrentCard((prev: any) => ({ ...prev, status: 'CLOSURE_PENDING', actionTaken: actionNote, resolvedDate: prev.resolvedDate || 'Resolved: 30/06/2025' }));
      setSuccessInfo({
        title: 'Ticket Resolved!',
        description: 'The ticket has been marked as resolved and is now waiting for CDPO closure.',
        viewLabel: 'View Resolved Ticket',
      });
      setActionModalVisible(false);
      setShowSuccess(true);
    } else if (assignedFilter === 'CDPO') {
      if (isClosurePending && onCloseTicket) {
        onCloseTicket(currentCard.id, actionNote);
        setCurrentCard((prev: any) => ({ ...prev, status: 'CLOSED' }));
        setSuccessInfo({
          title: 'Ticket Closed!',
          description: `Ticket ${currentCard.ticketNumber} has been marked as closed by CDPO.`,
          viewLabel: 'View Closed Ticket',
        });
        setActionModalVisible(false);
        setShowSuccess(true);
      } else if (onResolveTicket) {
        onResolveTicket(currentCard.id, actionNote);
        setCurrentCard((prev: any) => ({ ...prev, status: 'CLOSED', actionTaken: actionNote, resolvedDate: prev.resolvedDate || 'Resolved: 30/06/2025' }));
        setSuccessInfo({
          title: 'Ticket Closed!',
          description: `Ticket ${currentCard.ticketNumber} has been marked as closed.`,
          viewLabel: 'View Closed Ticket',
        });
        setActionModalVisible(false);
        setShowSuccess(true);
      }
    } else if (assignedFilter === 'DPO') {
      if (isAppeal && onResolveAppeal) {
        onResolveAppeal(currentCard.id, actionNote);
        setCurrentCard((prev: any) => ({ ...prev, status: 'APPEAL_RESOLVED', dpoActionTaken: actionNote }));
        setActionModalVisible(false);
        setShowAppealSuccess(true);
      } else if (onResolveTicket) {
        onResolveTicket(currentCard.id, actionNote);
        setCurrentCard((prev: any) => ({ ...prev, status: 'CLOSED', actionTaken: actionNote, resolvedDate: prev.resolvedDate || 'Resolved: 30/06/2025' }));
        setSuccessInfo({
          title: 'Ticket Closed!',
          description: `Ticket ${currentCard.ticketNumber} has been marked as closed.`,
          viewLabel: 'View Closed Ticket',
        });
        setActionModalVisible(false);
        setShowSuccess(true);
      }
    }
  };

  const isFormValid = actionNote.trim().length > 0;

  // ─── Success screens fill the entire drawer, header included — matching the mobile app's full-screen SuccessScreen/AppealSuccessScreen ───
  if (showSuccess && successInfo) {
    return (
      <div className="drawer-backdrop" onClick={onBack}>
        <div className="drawer-content" onClick={(e) => e.stopPropagation()} style={{ height: '100%', width: '520px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', maxWidth: '360px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#1a237e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 8px rgba(26,35,126,0.2)' }}>
              <Check size={30} color="#ffffff" strokeWidth={3} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#181818', margin: 0 }}>{successInfo.title}</h3>
            <p style={{ color: '#757575', fontSize: '13px', lineHeight: '1.5', marginTop: '10px' }}>{successInfo.description}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '28px' }}>
              <button
                className="ux4g-btn ux4g-btn-primary ux4g-btn-md"
                onClick={onBack}
                style={{ width: '100%', height: '48px', background: '#1a237e', border: 'none' }}
              >
                Back to Ticket List
              </button>
              <button
                className="ux4g-btn ux4g-btn-outline-neutral ux4g-btn-md"
                onClick={() => setShowSuccess(false)}
                style={{ width: '100%', height: '48px', border: '1px solid #1a237e', color: '#1a237e' }}
              >
                {successInfo.viewLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAppealSuccess) {
    return (
      <div className="drawer-backdrop" onClick={onBack}>
        <div className="drawer-content" onClick={(e) => e.stopPropagation()} style={{ height: '100%', width: '520px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', maxWidth: '360px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 4px 8px rgba(46,125,50,0.2)' }}>
              <Check size={30} color="#ffffff" strokeWidth={3} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: '#181818', margin: 0 }}>Appeal Resolved!</h3>
            <p style={{ color: '#757575', fontSize: '13px', lineHeight: '1.5', marginTop: '10px' }}>Appeal for {currentCard.ticketNumber} has been resolved successfully.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '28px' }}>
              <button
                className="ux4g-btn ux4g-btn-primary ux4g-btn-md"
                onClick={onBack}
                style={{ width: '100%', height: '48px', background: '#1a237e', border: 'none' }}
              >
                Back to Ticket List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer-backdrop" onClick={onBack}>
      <div
        className="drawer-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          width: '520px',
          background: '#ffffff',
          position: 'relative'
        }}
      >
        {/* Top Header Row */}
        <div style={{ background: '#0b3a60', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }} title="Go back">
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Ticket Details</span>
          <button
            onClick={onBack}
            style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.1)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}
            title="Close drawer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="drawer-body" style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Ticket Title & Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0b3a60', fontFamily: 'var(--font-display)' }}>
              {currentCard.ticketNumber || 'Ticket #787868898972'}
            </h2>
            <span style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px', border: `1px solid ${statusCfg.border}`, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {statusCfg.label}{statusCfg.hasIcon ? ' ⓘ' : ''}
            </span>
          </div>

          {/* Help & Sub Topics */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px 16px', fontSize: '14px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Help Topic</span>
            <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.helpTopic || currentCard.topic || 'Supplementary Nutrition'}</span>

            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Sub Topic</span>
            <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.subTopic || 'Take Home Ration'}</span>
          </div>

          {/* Boxed Description Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</span>
            <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px 16px', fontSize: '14px', color: '#1e293b', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
              {currentCard.description || currentCard.originalDescription || 'No description provided.'}
            </div>
          </div>

          {/* BENEFICIARY INFORMATION */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '12px' }}>
              Beneficiary Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.beneficiaryName || currentCard.byName || 'Kamla Devi'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mobile</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.beneficiaryMobile || '98765 00412'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.beneficiaryType || 'Lactating Mother'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-muted)' }}>AWC</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.awcCode || currentCard.awcName || 'AWC-103'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-muted)' }}>District</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.district || 'Jaipur'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-muted)' }}>Project</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.project || 'Sanganer'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sector</span>
                <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{currentCard.sector || 'Sector 3'}</span>
              </div>
            </div>
          </div>

          {/* SUPPORTING DOCUMENTS */}
          {(currentCard.complaintType === 'Corruption' || currentCard.complaintType === 'Urgent') && ((currentCard.documentsCount ?? 0) > 0 || currentCard.documents) && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '12px' }}>
                Supporting Documents
              </h3>
              <div style={{ background: '#f5f6ff', border: '1px solid #c5cae9', borderRadius: '8px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8eaf6', borderRadius: '50%', width: '40px', height: '40px', flexShrink: 0 }}>
                  <FileText size={20} style={{ color: '#1a237e' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a237e' }}>
                    {currentCard.id === '1' ? 'pmmvy_enrollment_form.pdf' :
                     currentCard.id === '2' ? 'thr_ration_card_copy.pdf' :
                     currentCard.id === '3' ? 'aadhaar_card_scan.pdf' :
                     currentCard.id === '4' ? 'ksy_training_registration.pdf' :
                     currentCard.id === '5' ? 'growth_monitoring_report.pdf' : 'supporting_document.pdf'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#757575' }}>2.4 MB</span>
                </div>
                <button
                  className="ux4g-btn ux4g-btn-primary ux4g-btn-sm"
                  style={{ background: '#1a237e', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
                  onClick={() => alert('Opening supporting document PDF viewer...')}
                >
                  View
                </button>
              </div>
            </div>
          )}

          {/* RESOLUTION DETAILS */}
          {!isPending && currentCard.actionTaken && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '12px' }}>
                Resolution Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action Taken</span>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '14px 16px', fontSize: '14px', color: '#166534', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                  {currentCard.actionTaken}
                </div>
              </div>
            </div>
          )}

          {/* APPEAL RAISED (Appeal Reason) — shown after the original resolution, before the DPO's appeal resolution.
              Stays visible once the appeal is resolved too, since it's the record of why the appeal was filed. */}
          {hasAppealReason && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '12px' }}>
                Appeal Raised
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Appeal Reason</span>
                <div style={{ background: '#fff3e0', border: '1px solid #ffcc80', borderRadius: '6px', padding: '14px 16px', fontSize: '14px', color: '#e65100', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                  {currentCard.appealReason || 'Beneficiary is unsatisfied with the resolution steps taken by the officer.'}
                </div>
              </div>
            </div>
          )}

          {/* APPEAL RESOLUTION — only once the DPO has actually resolved the
              appeal. While it's merely raised (APPEAL_RAISED) there is no
              DPO action to show yet, so this section stays hidden. */}
          {!isPending && currentCard.status === 'APPEAL_RESOLVED' && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '12px' }}>
                Appeal Resolution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action Taken By DPO</span>
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px', padding: '14px 16px', fontSize: '14px', color: '#5b21b6', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                  {currentCard.dpoActionTaken || 'Appeal resolved in favour of existing resolution.'}
                </div>
              </div>
            </div>
          )}

          {/* TIMELINE — mirrors the mobile app: per-event dot colours,
              a per-row connector segment, and label + date only. */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '14px' }}>
              Timeline
            </h3>
            <div style={{ paddingLeft: '4px', paddingBottom: '4px', width: '100%' }}>
              {timelineItems.map((item, idx) => {
                const isLast = idx === timelineItems.length - 1;
                return (
                  <div key={item.label + idx} style={{ display: 'flex', flexDirection: 'row', gap: '16px', minHeight: '52px', width: '100%' }}>
                    {/* Dot + connector column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', marginTop: '4px', background: item.dotColor, flexShrink: 0 }} />
                      {!isLast && <div style={{ flex: 1, width: '2px', background: '#e0e0e0', marginTop: '4px' }} />}
                    </div>
                    {/* Text column */}
                    <div style={{ flex: 1, paddingBottom: '20px' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#333333', lineHeight: '19.5px' }}>{item.label}</div>
                      <div style={{ fontWeight: 400, fontSize: '11px', color: '#747474', lineHeight: '16.5px', marginTop: '2px' }}>{item.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA Button Block (Anchored at very bottom) */}
        {!actionModalVisible && (() => {
          const canAct =
            (assignedFilter === 'Supervisor' && isPending && currentCard.assignedTo !== 'AWW') ||
            (assignedFilter === 'CDPO' && isPending) ||
            (assignedFilter === 'CDPO' && isClosurePending) ||
            // DPO can resolve & close any ticket assigned to them (Pending or Overdue tab,
            // regardless of whether it has actually breached SLA yet), plus escalated
            // overdue tickets from other roles, plus appeals.
            (assignedFilter === 'DPO' && isPending && (currentCard.assignedTo === 'DPO' || currentCard.isOverdue)) ||
            (assignedFilter === 'DPO' && isAppeal);

          const getButtonText = () => {
            if (isAppeal) return 'Resolve Appeal';
            if (isPending) {
              if (assignedFilter === 'Supervisor') return 'Resolve';
              if (assignedFilter === 'CDPO' || assignedFilter === 'DPO') return 'Resolve & Close';
              return 'Resolve';
            }
            if (isClosurePending && assignedFilter === 'CDPO') return 'Close Ticket';
            return 'Close Ticket';
          };

          if (!canAct) return null;

          return (
            <div style={{ borderTop: '1px solid #e2e8f0' }}>
              <button
                className="ux4g-btn ux4g-btn-primary ux4g-btn-lg"
                style={{
                  width: '100%',
                  margin: 0,
                  padding: '16px 0',
                  borderRadius: 0,
                  background: isClosurePending ? 'var(--accent-green)' : 'var(--primary-deep)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setActionModalVisible(true)}
              >
                {getButtonText()}
              </button>
            </div>
          );
        })()}

        {/* Resolve / Close bottom sheet — mirrors the mobile app's ActionTakenModal / AppealResolutionSheet */}
        {actionModalVisible && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={closeActionModal} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#ffffff', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', boxShadow: '0 -4px 24px rgba(0,0,0,0.15)', maxHeight: '85%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '2px' }}>
                <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: '#e0e0e0' }} />
              </div>
              <div style={{ padding: '12px 20px 13px', borderBottom: '1px solid #eeeeee' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1a237e', fontFamily: 'var(--font-display)' }}>{modalTitle}</h3>
              </div>
              <form onSubmit={handleActionSubmit} style={{ overflowY: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#757575' }}>Action Taken</label>
                    <span style={{ color: '#d32f2f', marginLeft: '3px' }}>*</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      style={{ height: '120px', width: '100%', border: '1px solid #1a237e', borderRadius: '8px', background: '#fafafa', padding: '12px', fontSize: '14px', color: '#212121', resize: 'vertical', boxSizing: 'border-box' }}
                      placeholder={modalPlaceholder}
                      maxLength={250}
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      required
                    />
                    <span style={{ position: 'absolute', bottom: '12px', right: '12px', fontSize: '11px', color: '#9e9e9e' }}>{actionNote.length} / 250</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    style={{
                      height: '44px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', color: '#ffffff',
                      background: isFormValid ? (isAppeal ? '#2e7d32' : '#1a237e') : '#e0e0e0',
                      cursor: isFormValid ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {modalSubmitLabel}
                  </button>
                  <button
                    type="button"
                    onClick={closeActionModal}
                    style={{ height: '44px', borderRadius: '8px', border: '1px solid #1a237e', background: '#ffffff', color: '#1a237e', fontWeight: 700, fontSize: '14px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
