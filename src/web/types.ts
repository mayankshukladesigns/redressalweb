export type TabType = 'Pending' | 'Resolved';
export type AssignedFilter = 'DPO' | 'CDPO' | 'Supervisor' | 'AWW';
export type ResolvedStatus = 'CLOSED' | 'CLOSURE_PENDING' | 'APPEAL_RAISED' | 'APPEAL_RESOLVED';

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
  complaintType?: 'Corruption' | 'Urgent' | 'Others';
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
  _isOverdueTab?: boolean;
  resolvedByDPO?: boolean;
  title?: string;
  byName?: string;
  documents?: string;
  actionTaken?: string;
  awaitingCdpoClosure?: boolean;
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
  complaintType?: 'Corruption' | 'Urgent' | 'Others';
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
  complaintType?: 'Corruption' | 'Urgent' | 'Others';
  originalActionTaken?: string;
}
