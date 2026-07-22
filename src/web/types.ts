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
  actionTaken?: string;
  awaitingCdpoClosure?: boolean;
  origin?: TicketOrigin;
}

export interface ResolvedTicketCard extends TicketCard {
  resolvedDate: string;
  status: ResolvedStatus;
  actionTaken: string;
  awaitingCdpoClosure?: boolean;
  dpoActionTaken?: string;
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
  complaintType?: 'Corruption' | 'Urgent' | 'General';
  originalActionTaken?: string;
  origin?: TicketOrigin;
}
