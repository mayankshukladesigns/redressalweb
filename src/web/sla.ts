import { TicketCard } from './types';

// ─── SLA / overdue ─────────────────────────────────────────────────────────────
// One definition of "overdue", shared by all three role views so the same ticket
// can never read as breached on one screen and on time on another.
//
// The clock starts when the beneficiary submits the grievance and stops only when
// the ticket is finally settled. Resolving it does not stop it: a resolution still
// awaiting the CDPO's sign-off, or one the beneficiary has appealed, is an open
// grievance as far as the beneficiary is concerned and keeps counting against the
// 21-day deadline. That is the whole point of tracking overdue past resolution —
// a ticket parked in a closure queue for a month is exactly the case that would
// otherwise go unnoticed.

export const SLA_DAYS = 21;

// Fixed "today" for the demo dataset, matching mockData and the details timeline.
export const REFERENCE_TODAY = new Date(2025, 5, 30);

export function parseTicketDate(value?: string): Date | null {
  const m = (value ?? '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
}

export function ticketAgeDays(submittedDate?: string): number {
  const d = parseTicketDate(submittedDate);
  if (!d) return 0;
  return Math.floor((REFERENCE_TODAY.getTime() - d.getTime()) / 86400000);
}

// The two end states. Everything else — awaiting action, resolved but awaiting
// closure, under appeal — is still an open grievance.
const SETTLED_STATUSES = ['CLOSED', 'APPEAL_RESOLVED'];

export function isTicketOpen(status?: string): boolean {
  return !SETTLED_STATUSES.includes(status ?? '');
}

type OverdueInput = Pick<TicketCard, 'status' | 'submittedDate' | 'isOverdue'>;

export function isTicketOverdue(ticket: OverdueInput): boolean {
  if (!isTicketOpen(ticket.status)) return false;
  return ticket.isOverdue === true || ticketAgeDays(ticket.submittedDate) >= SLA_DAYS;
}

// There is no "overdue today" — breaching the deadline is already one day late.
export function overdueByDays(ticket: OverdueInput): number {
  if (!isTicketOverdue(ticket)) return 0;
  return Math.max(1, ticketAgeDays(ticket.submittedDate) - SLA_DAYS + 1);
}

export function overdueLabel(ticket: OverdueInput): string {
  const days = overdueByDays(ticket);
  return `Overdue by ${days} Day${days === 1 ? '' : 's'}`;
}

// ─── Appeal SLA / Overdue ──────────────────────────────────────────────────
// Beneficiary has 21 days to raise an appeal after ticket closure.
// Once raised, the DPO has 21 days from the appeal submission date (appealDate)
// to resolve it. If unresolved after 21 days from appealDate, it becomes appeal overdue.

export function parseAppealDate(value?: string): Date | null {
  if (!value) return null;
  const cleaned = value.replace('Appeal Filed:', '').trim();
  return parseTicketDate(cleaned);
}

export function appealAgeDays(appealDate?: string): number {
  const d = parseAppealDate(appealDate);
  if (!d) return 0;
  return Math.floor((REFERENCE_TODAY.getTime() - d.getTime()) / 86400000);
}

export function isAppealOverdue(appeal: { status?: string; appealDate?: string }): boolean {
  if (appeal.status === 'resolved') return false;
  return appealAgeDays(appeal.appealDate) >= SLA_DAYS;
}

// Mirrors overdueByDays/overdueLabel for the appeal clock, so an overdue appeal
// reads the same on an appeal card as an overdue grievance does on a ticket card.
export function appealOverdueByDays(appeal: { status?: string; appealDate?: string }): number {
  if (!isAppealOverdue(appeal)) return 0;
  return Math.max(1, appealAgeDays(appeal.appealDate) - SLA_DAYS + 1);
}

export function appealOverdueLabel(appeal: { status?: string; appealDate?: string }): string {
  const days = appealOverdueByDays(appeal);
  return `Overdue by ${days} Day${days === 1 ? '' : 's'}`;
}
