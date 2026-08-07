export type TabType = 'Pending' | 'Resolved';
export type AssignedFilter = 'DPO' | 'CDPO' | 'Supervisor' | 'AWW';
export type ResolvedStatus = 'CLOSED' | 'CLOSURE_PENDING' | 'APPEAL_RAISED' | 'APPEAL_RESOLVED';

// How a grievance was lodged. Web and mobile-app submissions are always by the
// beneficiary themselves; call-centre tickets may be logged by the beneficiary
// or a third party (relative, ASHA, neighbour, or an anonymous tipster) via an agent.
export type TicketChannel = 'WEB' | 'APP' | 'CALL_CENTRE';

export interface TicketOrigin {
  channel: TicketChannel;
  callerIsSelf: boolean;      // true → the caller is the beneficiary
  callerName?: string;        // when !callerIsSelf; may be 'Anonymous'
  callerRelation?: string;    // caller's relation to the beneficiary
  callerMobile?: string;      // caller's own contact, when different
  agentName?: string;         // call-centre agent who logged the ticket
  loggedAt?: string;          // when the call / web submission happened
}

// ── Beneficiary feedback ────────────────────────────────────────────────────
// Collected from the beneficiary once a grievance has been closed, and never
// before — there is nothing to rate until the closure report exists.
//
// Satisfaction and the experience rating are two separate answers. A beneficiary
// who accepts the outcome may still rate the experience Poor, and only a Poor
// rating opens a free-text box: Good and Average are recorded as the rating alone.
// A beneficiary who is *not* satisfied is routed to the appeal flow instead, so
// that dissatisfaction is recorded as an appeal — with its own reason and its own
// DPO review — rather than as a comment nobody is obliged to act on.
export type FeedbackRating = 'Good' | 'Average' | 'Poor';

export interface BeneficiaryFeedback {
  satisfied: boolean;
  rating: FeedbackRating;
  comment?: string;     // captured only alongside a Poor rating
  submittedOn?: string; // when the beneficiary responded, e.g. '22 Jun 2025'
}

export interface TicketCard {
  id: string;
  ticketNumber: string;
  beneficiaryName: string;
  beneficiaryType: string;
  topic: string;
  description: string;
  submittedDate: string;
  daysLabel: string;
  daysType: 'remaining' | 'overdue';
  awcName: string;
  documentsCount?: number;
  isOverdue?: boolean;
  borderColor?: string;
  complaintType?: 'Corruption' | 'Urgent' | 'General';
  helpTopic?: string;
  subTopic?: string;
  beneficiaryMobile?: string;
  beneficiaryEmail?: string;
  awcCode?: string;
  district?: string;
  project?: string;
  sector?: string;
  assignedTo?: AssignedFilter;
  status?: string;
  _isAppeal?: boolean;
  isPendingTicket?: boolean;
  title?: string;
  byName?: string;
  documents?: string;
  awaitingCdpoClosure?: boolean;
  origin?: TicketOrigin;

  // ── Resolution chain ────────────────────────────────────────────────────────
  // A closed grievance is the record of up to four separate acts, each owned by a
  // different officer. They are stored in four separate fields so no act can
  // overwrite another — the closing officer's remarks must never replace the
  // resolver's ATR, which is the only account of what was actually done.
  actionTaken?: string;      // the resolver's Action Taken Report
  resolvedBy?: AssignedFilter; // officer who wrote the ATR
  closureNote?: string;      // the closing officer's own remarks
  closedBy?: AssignedFilter; // officer who formally closed it; absent while CLOSURE_PENDING
  appealReason?: string;     // the beneficiary's reason for appealing
  dpoActionTaken?: string;   // the DPO's decision on the appeal

  // The beneficiary's own verdict on the closed grievance. Optional throughout —
  // responding is voluntary, so an absent value means "no response yet", never
  // "no complaints".
  feedback?: BeneficiaryFeedback;
}

export interface ResolvedTicketCard extends TicketCard {
  resolvedDate: string;
  status: ResolvedStatus;
  actionTaken: string;
  awaitingCdpoClosure?: boolean;
}

export interface OverdueTicket {
  id: string;
  ticketNumber: string;
  roleLabel: string;
  title: string;
  description: string;
  submittedDate: string;
  overdueDays: number;
  documents?: string;
  byName: string;
  complaintType?: 'Corruption' | 'Urgent' | 'General';
}

export type AppealDecision = 'uphold' | 'dismiss' | null;

export interface AppealTicket {
  id: string;
  ticketNumber: string;
  roleLabel: string;
  title: string;
  originalDescription: string;
  appealReason: string;
  submittedDate: string;
  appealDate: string;
  documents?: string;
  byName: string;
  status?: 'raised' | 'resolved';
  decision?: AppealDecision;
  resolutionNotes?: string;
  resolvedDate?: string;
  complaintType?: 'Corruption' | 'Urgent' | 'General';
  originalActionTaken?: string;
  origin?: TicketOrigin;
  // Same chain as TicketCard: the appealed grievance was resolved by `roleLabel`
  // and closed before the beneficiary appealed, so the details drawer can show
  // that history alongside the appeal itself.
  resolvedBy?: AssignedFilter;
  closedBy?: AssignedFilter;
  closureNote?: string;
}
