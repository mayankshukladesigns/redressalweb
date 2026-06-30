import React, { useState, useRef, useEffect } from 'react';
import TicketDetailsScreen from './TicketDetailsScreen';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';

// Asset URLs from Figma MCP localhost server
const imgIcon = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/reception-4.svg';
const imgIcon1 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/wifi.svg';
const imgIcon2 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/battery-full.svg';
const imgBackIconWhite = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/arrow-left.svg';
const imgChevronDown = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/chevron-down.svg';
const imgChevronDown1 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/chevron-down.svg';
const imgIcon3 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/check.svg';
const imgCloseIcon = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/x.svg';
const imgCalendarIcon = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/calendar3.svg';
const imgCalendarIcon1 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/calendar3.svg';
const imgCalendarIcon2 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/calendar3.svg';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TabType = 'Pending' | 'Resolved';
export type AssignedFilter = 'CDPO' | 'Supervisor' | 'AWW';
export type ResolvedStatus = 'CLOSED' | 'CLOSURE_PENDING' | 'APPEAL_RAISED' | 'APPEAL_RESOLVED';

export interface ResolvedTicketCard {
  id: string;
  ticketNumber: string;
  beneficiaryName: string;
  beneficiaryType: string;
  topic: string;
  description: string;
  resolvedDate: string;
  status: ResolvedStatus;
  actionTaken: string;
  awcName: string;
  awaitingCdpoClosure?: boolean;
  // Fields for Ticket Details screen
  helpTopic: string;
  subTopic: string;
  beneficiaryMobile: string;
  beneficiaryEmail?: string;
  awcCode: string;
  district: string;
  project: string;
  sector: string;
  dpoActionTaken?: string;
  assignedTo?: AssignedFilter;
  complaintType?: 'Corruption' | 'Urgent' | 'Others';
  submittedDate?: string;
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
  // Keep optional old properties to avoid breaking other components
  title?: string;
  byName?: string;
  documents?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const pendingCards: TicketCard[] = [
  {
    id: '1',
    ticketNumber: 'Ticket# 787868 898938',
    beneficiaryName: 'Sanju Devi',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Registration',
    description: 'New Registration Request for ANC enrollment under PMMVY scheme',
    submittedDate: 'Submitted: 27/06/2025',
    daysLabel: '5 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 1',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Maternity Benefit',
    subTopic: 'PMMVY Enrollment',
    beneficiaryMobile: '98765 00123',
    beneficiaryEmail: 'sanju.devi@example.com',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: '2',
    ticketNumber: 'Ticket# 787868 898939',
    beneficiaryName: 'Pooja Sharma',
    beneficiaryType: 'Lactating Mother',
    topic: 'Corruption',
    description: 'Supplementary Nutrition not received for consecutive months despite eligibility',
    submittedDate: 'Submitted: 26/06/2025',
    daysLabel: '1 Day Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 3',
    documentsCount: 1,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Corruption',
    helpTopic: 'Corruption',
    subTopic: 'Take Home Ration',
    beneficiaryMobile: '98765 00124',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 3',
    assignedTo: 'CDPO',
  },
  {
    id: '3',
    ticketNumber: 'Ticket# 787868 898940',
    beneficiaryName: 'Anita Yadav',
    beneficiaryType: 'Children (6m-3y)',
    topic: 'Urgent',
    description: 'Aadhar Verification pending for child enrollment and benefit linkage',
    submittedDate: 'Submitted: 15/06/2025',
    daysLabel: 'Overdue by 3 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 6',
    documentsCount: 1,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Urgent',
    helpTopic: 'Urgent',
    subTopic: 'Aadhar Verification',
    beneficiaryMobile: '98765 00125',
    awcCode: 'AWC-106',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'CDPO',
  },
  {
    id: '4',
    ticketNumber: 'Ticket# 787868 898941',
    beneficiaryName: 'Meena Kumari',
    beneficiaryType: 'Adolescent Girl',
    topic: 'Urgent',
    description: 'Unable to access KSY vocational training benefits despite completing registration last quarter',
    submittedDate: 'Submitted: 05/06/2025',
    daysLabel: 'Overdue by 8 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 2',
    documentsCount: 1,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Urgent',
    helpTopic: 'Urgent',
    subTopic: 'Vocational Training Access',
    beneficiaryMobile: '98765 00126',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'CDPO',
  },
  {
    id: '5',
    ticketNumber: 'Ticket# 787868 898942',
    beneficiaryName: 'Sunita Devi',
    beneficiaryType: 'Children 0-6 months',
    topic: 'Growth Monitoring',
    description: 'Weight not recorded in monthly check-up session',
    submittedDate: 'Submitted: 28/06/2025',
    daysLabel: '10 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 4',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Weight Recording',
    beneficiaryMobile: '98765 00127',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'Supervisor',
  },
  {
    id: '6',
    ticketNumber: 'Ticket# 787868 898943',
    beneficiaryName: 'Manju Sharma',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Supplementary Nutrition',
    description: 'THR rations not distributed for child for current month',
    submittedDate: 'Submitted: 29/06/2025',
    daysLabel: '12 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 1',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Take Home Ration',
    beneficiaryMobile: '98765 00128',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'AWW',
  },
  {
    id: '7',
    ticketNumber: 'Ticket# 787868 898944',
    beneficiaryName: 'Rekha Vyas',
    beneficiaryType: 'Lactating Mother',
    topic: 'Urgent',
    description: 'PMMVY second installment delayed due to verification issue',
    submittedDate: 'Submitted: 18/06/2025',
    daysLabel: 'Overdue by 2 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 4',
    documentsCount: 1,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Urgent',
    helpTopic: 'Urgent',
    subTopic: 'PMMVY Delayed Payment',
    beneficiaryMobile: '98765 00129',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: '8',
    ticketNumber: 'Ticket# 787868 898945',
    beneficiaryName: 'Priyanka Sen',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Corruption',
    description: 'Anganwadi supervisor demanding bribes to release Supplementary Nutrition',
    submittedDate: 'Submitted: 28/06/2025',
    daysLabel: '7 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 2',
    documentsCount: 1,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Corruption',
    helpTopic: 'Corruption',
    subTopic: 'Corruption / Bribe',
    beneficiaryMobile: '98765 00130',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'CDPO',
  },
  {
    id: '9',
    ticketNumber: 'Ticket# 787868 898946',
    beneficiaryName: 'Kavita Sharma',
    beneficiaryType: 'Lactating Mother',
    topic: 'Urgent',
    description: 'Critical referral services unavailable at sector health center',
    submittedDate: 'Submitted: 14/06/2025',
    daysLabel: 'Overdue by 2 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 5',
    documentsCount: 1,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Urgent',
    helpTopic: 'Urgent',
    subTopic: 'Emergency Service',
    beneficiaryMobile: '98765 00131',
    awcCode: 'AWC-105',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'CDPO',
  },
  {
    id: 'p10',
    ticketNumber: 'Ticket# 787868 898950',
    beneficiaryName: 'Sunita Bai',
    beneficiaryType: 'Lactating Mother',
    topic: 'Growth Monitoring',
    description: 'Growth monitoring register entries not shared with mother',
    submittedDate: 'Submitted: 29/06/2025',
    daysLabel: '13 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 1',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Weight Recording',
    beneficiaryMobile: '98765 00210',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'p11',
    ticketNumber: 'Ticket# 787868 898951',
    beneficiaryName: 'Rajni Devi',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Supplementary Nutrition',
    description: 'Quality issues in Supplementary Nutrition packet delivered this month',
    submittedDate: 'Submitted: 27/06/2025',
    daysLabel: '11 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 2',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Take Home Ration',
    beneficiaryMobile: '98765 00211',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'CDPO',
  },
  {
    id: 'p12',
    ticketNumber: 'Ticket# 787868 898952',
    beneficiaryName: 'Preeti Sharma',
    beneficiaryType: 'Children (6m-3y)',
    topic: 'Urgent',
    description: 'Immediate replacement of spoiled THR packets required for the sector',
    submittedDate: 'Submitted: 23/06/2025',
    daysLabel: '7 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 3',
    documentsCount: 1,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Urgent',
    helpTopic: 'Urgent',
    subTopic: 'Emergency Service',
    beneficiaryMobile: '98765 00212',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 3',
    assignedTo: 'CDPO',
  },
  {
    id: 'p13',
    ticketNumber: 'Ticket# 787868 898953',
    beneficiaryName: 'Kajal Gupta',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Corruption',
    description: 'THR supplies being sold in local market by local operator',
    submittedDate: 'Submitted: 21/06/2025',
    daysLabel: '5 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 4',
    documentsCount: 1,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Corruption',
    helpTopic: 'Corruption',
    subTopic: 'THR Misappropriation',
    beneficiaryMobile: '98765 00213',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'p14',
    ticketNumber: 'Ticket# 787868 898954',
    beneficiaryName: 'Anjali Verma',
    beneficiaryType: 'Lactating Mother',
    topic: 'Immunization',
    description: 'Pending vaccination schedule updates in the Poshan Tracker system',
    submittedDate: 'Submitted: 16/06/2025',
    daysLabel: '0 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 5',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Immunisation Pending',
    subTopic: 'System Update',
    beneficiaryMobile: '98765 00214',
    awcCode: 'AWC-105',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'CDPO',
  },
  {
    id: 'p15',
    ticketNumber: 'Ticket# 787868 898955',
    beneficiaryName: 'Kusum Lata',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Urgent',
    description: 'Critical beneficiary requires immediate health referral documents from AWC',
    submittedDate: 'Submitted: 14/06/2025',
    daysLabel: 'Overdue by 2 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 6',
    documentsCount: 1,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Urgent',
    helpTopic: 'Urgent',
    subTopic: 'Emergency Service',
    beneficiaryMobile: '98765 00215',
    awcCode: 'AWC-106',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'CDPO',
  },
  {
    id: 'p16',
    ticketNumber: 'Ticket# 787868 898956',
    beneficiaryName: 'Nisha Soni',
    beneficiaryType: 'Lactating Mother',
    topic: 'Maternity Benefit',
    description: 'Maternity benefits installment delayed at treasury level',
    submittedDate: 'Submitted: 09/06/2025',
    daysLabel: 'Overdue by 7 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 1',
    documentsCount: 0,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Others',
    helpTopic: 'Maternity Benefit',
    subTopic: 'Treasury Delay',
    beneficiaryMobile: '98765 00216',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'p17',
    ticketNumber: 'Ticket# 787868 898957',
    beneficiaryName: 'Suman Choudhary',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Corruption',
    description: 'Officer demanding commission for approving registration form',
    submittedDate: 'Submitted: 05/06/2025',
    daysLabel: 'Overdue by 11 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 2',
    documentsCount: 1,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Corruption',
    helpTopic: 'Corruption',
    subTopic: 'Bribe Allegation',
    beneficiaryMobile: '98765 00217',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'CDPO',
  },
  {
    id: 'p18',
    ticketNumber: 'Ticket# 787868 898958',
    beneficiaryName: 'Renu Bala',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Growth Monitoring',
    description: 'poshan tracking device is faulty and weights cannot be logged',
    submittedDate: 'Submitted: 02/06/2025',
    daysLabel: 'Overdue by 14 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 3',
    documentsCount: 0,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Others',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Device Failure',
    beneficiaryMobile: '98765 00218',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 3',
    assignedTo: 'CDPO',
  },
  {
    id: 'p19',
    ticketNumber: 'Ticket# 787868 898959',
    beneficiaryName: 'Guddi Devi',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Urgent',
    description: 'Medical referral records misplaced by Anganwadi helper',
    submittedDate: 'Submitted: 28/05/2025',
    daysLabel: 'Overdue by 19 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 4',
    documentsCount: 1,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Urgent',
    helpTopic: 'Urgent',
    subTopic: 'Emergency Service',
    beneficiaryMobile: '98765 00219',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'p20',
    ticketNumber: 'Ticket# 787868 898970',
    beneficiaryName: 'Raveena Tandon',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Growth Monitoring',
    description: 'Growth records are not being updated regularly.',
    submittedDate: 'Submitted: 28/06/2025',
    daysLabel: '12 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 1',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Growth Recording',
    beneficiaryMobile: '98765 00410',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'Supervisor',
  },
  {
    id: 'p21',
    ticketNumber: 'Ticket# 787868 898971',
    beneficiaryName: 'Madhuri Dixit',
    beneficiaryType: 'Lactating Mother',
    topic: 'Supplementary Nutrition',
    description: 'Take-home ration packets were short by 1kg.',
    submittedDate: 'Submitted: 20/06/2025',
    daysLabel: '4 Days Remaining',
    daysType: 'remaining',
    awcName: 'Anganwadi Centre 2',
    documentsCount: 0,
    isOverdue: false,
    borderColor: '#e0e0e0',
    complaintType: 'Others',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Take Home Ration',
    beneficiaryMobile: '98765 00411',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'AWW',
  },
  {
    id: 'p22',
    ticketNumber: 'Ticket# 787868 898972',
    beneficiaryName: 'Juhi Chawla',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Immunization',
    description: 'AWC closed early on scheduled vaccination day.',
    submittedDate: 'Submitted: 15/06/2025',
    daysLabel: 'Overdue by 1 Day',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 3',
    documentsCount: 0,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Others',
    helpTopic: 'Immunisation Pending',
    subTopic: 'AWC Timing',
    beneficiaryMobile: '98765 00412',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 3',
    assignedTo: 'Supervisor',
  },
  {
    id: 'p23',
    ticketNumber: 'Ticket# 787868 898973',
    beneficiaryName: 'Karisma Kapoor',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Supplementary Nutrition',
    description: 'Dry ration kit not delivered to home due to logistics issue.',
    submittedDate: 'Submitted: 04/06/2025',
    daysLabel: 'Overdue by 12 Days',
    daysType: 'overdue',
    awcName: 'Anganwadi Centre 4',
    documentsCount: 0,
    isOverdue: true,
    borderColor: '#ffcdd2',
    complaintType: 'Others',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Dry Ration',
    beneficiaryMobile: '98765 00413',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'AWW',
  },
];

export const resolvedCards: ResolvedTicketCard[] = [
  {
    id: 'r1',
    ticketNumber: 'Ticket# 787868 898901',
    beneficiaryName: 'Kamla Devi',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Maternity Benefit',
    description: 'PM Maternity Benefit Scheme enrollment pending despite eligibility confirmation',
    resolvedDate: 'Resolved: 20/06/2025',
    status: 'CLOSED',
    actionTaken: 'Coordinated with CDPO and ensured enrollment was processed. Beneficiary confirmed receipt of first installment.',
    awcName: 'Anganwadi Centre 1',
    helpTopic: 'Maternity Benefit',
    subTopic: 'PMMVY Enrollment',
    beneficiaryMobile: '98765 11001',
    beneficiaryEmail: 'kamla.devi@example.com',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'AWW',
  },
  {
    id: 'r2',
    ticketNumber: 'Ticket# 787868 898902',
    beneficiaryName: 'Rekha Singh',
    beneficiaryType: 'Lactating Mother',
    topic: 'THR Distribution',
    description: 'Hot Cooked Meal not being served at the centre for past 2 weeks',
    resolvedDate: 'Resolved: 18/06/2025',
    status: 'CLOSURE_PENDING',
    awaitingCdpoClosure: true,
    actionTaken: 'AWW instructed to resume HCM distribution immediately. Follow-up visit scheduled for next week.',
    awcName: 'Anganwadi Centre 5',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Hot Cooked Meal',
    beneficiaryMobile: '98765 22002',
    awcCode: 'AWC-105',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'Supervisor',
  },
  {
    id: 'r3',
    ticketNumber: 'Ticket# 787868 898903',
    beneficiaryName: 'Priya Yadav',
    beneficiaryType: 'Adolescent Girl',
    topic: 'SABLA Scheme',
    description: 'Vocational training access denied despite meeting all eligibility criteria',
    resolvedDate: 'Resolved: 15/06/2025',
    status: 'APPEAL_RAISED',
    actionTaken: 'Issue escalated to district level officer. Formal response expected within 7 working days.',
    awcName: 'Anganwadi Centre 3',
    helpTopic: 'SABLA Scheme',
    subTopic: 'Vocational Training',
    beneficiaryMobile: '98765 33003',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'AWW',
  },
  {
    id: 'r4',
    ticketNumber: 'Ticket# 787868 898904',
    beneficiaryName: 'Geeta Sharma',
    beneficiaryType: 'Children (6m-3y)',
    topic: 'Immunization',
    description: 'Vaccination not administered on scheduled date at sub-centre',
    resolvedDate: 'Resolved: 12/06/2025',
    status: 'APPEAL_RESOLVED',
    actionTaken: 'Child vaccinated at PHC Ramgarh on 01 Jul 2025. DPT booster and OPV administered. Immunisation card updated with new entries. Parents counselled on next scheduled vaccination date of 15 Sep 2025.',
    awcName: 'Anganwadi Centre 2',
    helpTopic: 'Immunisation Pending',
    subTopic: 'Immunisation Schedule',
    beneficiaryMobile: '98765 43210',
    beneficiaryEmail: 'sunita.bai@example.com',
    awcCode: 'AWC-001',
    district: 'Raigarh',
    project: 'Project Alpha',
    sector: 'Sector 1',
    assignedTo: 'Supervisor',
    dpoActionTaken: 'Appeal reviewed on 12 Jul 2025. Vaccination records verified at PHC Ramgarh — DPT booster and OPV confirmed administered on 01 Jul 2025. Immunisation card entries are accurate and complete. Resolution by AWW upheld. Appeal resolved in favour of existing resolution by AWW Priya Mehta.',
  },
  {
    id: 'r5',
    ticketNumber: 'Ticket# 787868 898905',
    beneficiaryName: 'Savita Kumari',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Pre-school Education',
    description: 'Child not enrolled in ECCE programme despite being of eligible age',
    submittedDate: 'Submitted: 15/06/2025',
    resolvedDate: 'Resolved: 08/06/2025',
    status: 'CLOSED',
    actionTaken: 'Enrollment completed by AWW. Child attending ECCE sessions regularly as confirmed during last visit.',
    awcName: 'Anganwadi Centre 6',
    helpTopic: 'Pre-school Education',
    subTopic: 'Pre-school Enrollment',
    beneficiaryMobile: '98765 55001',
    awcCode: 'AWC-106',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'CDPO',
  },
  {
    id: 'r6',
    ticketNumber: 'Ticket# 787868 898906',
    beneficiaryName: 'Maya Devi',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Growth Monitoring',
    description: 'Monthly height and weight logs not updated in Poshan Tracker',
    resolvedDate: 'Resolved: 25/06/2025',
    status: 'CLOSED',
    actionTaken: 'Weight and height updated in Poshan Tracker. Mother verified the entries on her mobile app.',
    awcName: 'Anganwadi Centre 2',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Poshan Tracker Update',
    beneficiaryMobile: '98765 55005',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'AWW',
  },
  {
    id: 'r7',
    ticketNumber: 'Ticket# 787868 898907',
    beneficiaryName: 'Kiran Bai',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Aadhar verification',
    description: 'Aadhar linkage failing for mother profile',
    submittedDate: 'Submitted: 10/06/2025',
    resolvedDate: 'Resolved: 28/06/2025',
    status: 'CLOSED',
    actionTaken: 'Biometric details re-submitted at Aadhaar center. Linked successfully.',
    awcName: 'Anganwadi Centre 1',
    helpTopic: 'Identity Linkage',
    subTopic: 'Aadhar Verification',
    beneficiaryMobile: '98765 66006',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'r10',
    ticketNumber: 'Ticket# 787868 898960',
    beneficiaryName: 'Lata Mangesh',
    beneficiaryType: 'Lactating Mother',
    topic: 'Growth Monitoring',
    description: 'ECCE program enrollment updated on the POSHAN tracker app.',
    submittedDate: 'Submitted: 29/06/2025',
    resolvedDate: 'Resolved: 30/06/2025',
    status: 'CLOSED',
    actionTaken: 'ECCE program enrollment updated on the POSHAN tracker app.',
    awcName: 'Anganwadi Centre 1',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Poshan Tracker Update',
    beneficiaryMobile: '98765 00310',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'r11',
    ticketNumber: 'Ticket# 787868 898961',
    beneficiaryName: 'Pushpa Raj',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Maternity Benefit',
    description: 'PMMVY scheme installment processed and confirmed by beneficiary.',
    submittedDate: 'Submitted: 26/06/2025',
    resolvedDate: 'Resolved: 29/06/2025',
    status: 'CLOSED',
    actionTaken: 'PMMVY scheme installment processed and confirmed by beneficiary.',
    awcName: 'Anganwadi Centre 2',
    helpTopic: 'Maternity Benefit',
    subTopic: 'PMMVY Installment',
    beneficiaryMobile: '98765 00311',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'CDPO',
  },
  {
    id: 'r12',
    ticketNumber: 'Ticket# 787868 898962',
    beneficiaryName: 'Seema Mishra',
    beneficiaryType: 'Children (6m-3y)',
    topic: 'Urgent',
    description: 'Emergency medical referral coordinated with PHC.',
    submittedDate: 'Submitted: 23/06/2025',
    resolvedDate: 'Resolved: 28/06/2025',
    status: 'CLOSED',
    actionTaken: 'Emergency medical referral coordinated with PHC.',
    awcName: 'Anganwadi Centre 3',
    helpTopic: 'Urgent',
    subTopic: 'Emergency Service',
    beneficiaryMobile: '98765 00312',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 3',
    assignedTo: 'CDPO',
  },
  {
    id: 'r13',
    ticketNumber: 'Ticket# 787868 898963',
    beneficiaryName: 'Mamta Banerjee',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Corruption',
    description: 'Investigation completed. Strict warning issued to the centre helper.',
    submittedDate: 'Submitted: 21/06/2025',
    resolvedDate: 'Resolved: 27/06/2025',
    status: 'CLOSED',
    actionTaken: 'Investigation completed. Strict warning issued to the centre helper.',
    awcName: 'Anganwadi Centre 4',
    helpTopic: 'Corruption',
    subTopic: 'THR Misappropriation',
    beneficiaryMobile: '98765 00313',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'r14',
    ticketNumber: 'Ticket# 787868 898964',
    beneficiaryName: 'Neetu Chandra',
    beneficiaryType: 'Lactating Mother',
    topic: 'Growth Monitoring',
    description: 'CDPO resolved. Appeal under review by DPO.',
    submittedDate: 'Submitted: 16/06/2025',
    resolvedDate: 'Resolved: 25/06/2025',
    status: 'APPEAL_RAISED',
    actionTaken: 'CDPO resolved. Appeal under review by DPO.',
    awcName: 'Anganwadi Centre 5',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Weight Recording',
    beneficiaryMobile: '98765 00314',
    awcCode: 'AWC-105',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'CDPO',
  },
  {
    id: 'r15',
    ticketNumber: 'Ticket# 787868 898965',
    beneficiaryName: 'Chitra Singh',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Urgent',
    description: 'Appeal resolved by DPO. Resolution upheld.',
    submittedDate: 'Submitted: 14/06/2025',
    resolvedDate: 'Resolved: 24/06/2025',
    status: 'APPEAL_RESOLVED',
    actionTaken: 'Appeal resolved by DPO. Resolution upheld.',
    awcName: 'Anganwadi Centre 6',
    helpTopic: 'Urgent',
    subTopic: 'Emergency Service',
    beneficiaryMobile: '98765 00315',
    awcCode: 'AWC-106',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 2',
    assignedTo: 'CDPO',
  },
  {
    id: 'r16',
    ticketNumber: 'Ticket# 787868 898966',
    beneficiaryName: 'Ritu Karidhal',
    beneficiaryType: 'Lactating Mother',
    topic: 'Immunization',
    description: 'Special immunization camp organized for pending children.',
    submittedDate: 'Submitted: 09/06/2025',
    resolvedDate: 'Resolved: 22/06/2025',
    status: 'CLOSED',
    actionTaken: 'Special immunization camp organized for pending children.',
    awcName: 'Anganwadi Centre 1',
    helpTopic: 'Immunisation Pending',
    subTopic: 'Special Camp',
    beneficiaryMobile: '98765 00316',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'r17',
    ticketNumber: 'Ticket# 787868 898967',
    beneficiaryName: 'Shalini Sen',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Corruption',
    description: 'Bribe allegations investigated. Officer replaced.',
    submittedDate: 'Submitted: 05/06/2025',
    resolvedDate: 'Resolved: 20/06/2025',
    status: 'CLOSED',
    actionTaken: 'Bribe allegations investigated. Officer replaced.',
    awcName: 'Anganwadi Centre 2',
    helpTopic: 'Corruption',
    subTopic: 'Bribe Allegation',
    beneficiaryMobile: '98765 00317',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'CDPO',
  },
  {
    id: 'r18',
    ticketNumber: 'Ticket# 787868 898968',
    beneficiaryName: 'Babita Phogat',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Supplementary Nutrition',
    description: 'Rations supplied. Beneficiary raised appeal regarding quality.',
    submittedDate: 'Submitted: 02/06/2025',
    resolvedDate: 'Resolved: 18/06/2025',
    status: 'APPEAL_RAISED',
    actionTaken: 'Rations supplied. Beneficiary raised appeal regarding quality.',
    awcName: 'Anganwadi Centre 3',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Take Home Ration',
    beneficiaryMobile: '98765 00318',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 3',
    assignedTo: 'CDPO',
  },
  {
    id: 'r19',
    ticketNumber: 'Ticket# 787868 898969',
    beneficiaryName: 'Kangana Ranaut',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Urgent',
    description: 'DPO resolved the appeal and ordered replacement delivery.',
    submittedDate: 'Submitted: 28/05/2025',
    resolvedDate: 'Resolved: 15/06/2025',
    status: 'APPEAL_RESOLVED',
    actionTaken: 'DPO resolved the appeal and ordered replacement delivery.',
    awcName: 'Anganwadi Centre 4',
    helpTopic: 'Urgent',
    subTopic: 'Emergency Service',
    beneficiaryMobile: '98765 00319',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'CDPO',
  },
  {
    id: 'r20',
    ticketNumber: 'Ticket# 787868 898980',
    beneficiaryName: 'Aishwarya Rai',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Growth Monitoring',
    description: 'Resolved: Supervisor visited centre and updated all weights.',
    submittedDate: 'Submitted: 28/06/2025',
    resolvedDate: 'Resolved: 29/06/2025',
    status: 'CLOSED',
    actionTaken: 'Supervisor visited centre and updated all pending weight entries.',
    awcName: 'Anganwadi Centre 1',
    helpTopic: 'Growth Monitoring',
    subTopic: 'Growth Recording',
    beneficiaryMobile: '98765 00510',
    awcCode: 'AWC-101',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'Supervisor',
  },
  {
    id: 'r21',
    ticketNumber: 'Ticket# 787868 898981',
    beneficiaryName: 'Sushmita Sen',
    beneficiaryType: 'Lactating Mother',
    topic: 'Supplementary Nutrition',
    description: 'Resolved: AWW delivered dry ration packet of correct weight.',
    submittedDate: 'Submitted: 20/06/2025',
    resolvedDate: 'Resolved: 25/06/2025',
    status: 'CLOSED',
    actionTaken: 'AWW delivered correct dry ration kit directly to beneficiary house.',
    awcName: 'Anganwadi Centre 2',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Take Home Ration',
    beneficiaryMobile: '98765 00511',
    awcCode: 'AWC-102',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 4',
    assignedTo: 'AWW',
  },
  {
    id: 'r22',
    ticketNumber: 'Ticket# 787868 898982',
    beneficiaryName: 'Kajol Devgan',
    beneficiaryType: 'Children (3-6y)',
    topic: 'Immunization',
    description: 'Resolved: Next camp scheduled and parents notified.',
    submittedDate: 'Submitted: 15/06/2025',
    resolvedDate: 'Resolved: 22/06/2025',
    status: 'CLOSED',
    actionTaken: 'Next immunization session scheduled. Parents informed via SMS.',
    awcName: 'Anganwadi Centre 3',
    helpTopic: 'Immunisation Pending',
    subTopic: 'Camp Scheduling',
    beneficiaryMobile: '98765 00512',
    awcCode: 'AWC-103',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 3',
    assignedTo: 'Supervisor',
  },
  {
    id: 'r23',
    ticketNumber: 'Ticket# 787868 898983',
    beneficiaryName: 'Tabu Hashmi',
    beneficiaryType: 'Pregnant Woman',
    topic: 'Supplementary Nutrition',
    description: 'Resolved: Special home delivery route arranged.',
    submittedDate: 'Submitted: 04/06/2025',
    resolvedDate: 'Resolved: 18/06/2025',
    status: 'CLOSED',
    actionTaken: 'Arranged special home delivery of Take-Home-Ration kits via SHG.',
    awcName: 'Anganwadi Centre 4',
    helpTopic: 'Supplementary Nutrition',
    subTopic: 'Dry Ration',
    beneficiaryMobile: '98765 00513',
    awcCode: 'AWC-104',
    district: 'Jaipur',
    project: 'Sanganer',
    sector: 'Sector 1',
    assignedTo: 'AWW',
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBar_ = () => (
  <View style={styles.statusBar}>
    <Text style={styles.statusTime}>9:41</Text>
    <View style={styles.statusIcons}>
      <Image source={{ uri: imgIcon }} style={styles.statusIcon16} />
      <Image source={{ uri: imgIcon1 }} style={styles.statusIcon14} />
      <Image source={{ uri: imgIcon2 }} style={styles.statusIcon20} />
    </View>
  </View>
);

const Header = ({ onBack }: { onBack?: () => void }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
      <Image source={{ uri: imgBackIconWhite }} style={styles.backIcon} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Beneficiary Redressal</Text>
    <View style={styles.headerSpacer} />
  </View>
);

const SubHeader = () => (
  <View style={styles.subHeader}>
    <Text style={styles.subHeaderText}>Project: Sanganer</Text>
    <Text style={styles.subHeaderSeparator}>|</Text>
    <Text style={styles.subHeaderText}>4 Sectors</Text>
  </View>
);

const SummaryTable = ({
  pendingFilter,
  resolvedFilter,
  onPendingFilter,
  onResolvedFilter,
}: {
  pendingFilter: boolean;
  resolvedFilter: boolean;
  onPendingFilter: () => void;
  onResolvedFilter: () => void;
}) => (
  <View style={styles.summarySection}>
    <Text style={styles.summaryLabel}>SUMMARY</Text>
    <View style={styles.summaryCard}>
      {/* Header Row */}
      <View style={[styles.summaryRow, styles.summaryHeaderRow]}>
        <View style={styles.summaryCol0} />
        <TouchableOpacity style={styles.summaryColBtn} onPress={onPendingFilter} activeOpacity={0.7}>
          <Text style={[styles.summaryColBtnText, { color: '#e65100' }]}>PENDING</Text>
          <Text style={[styles.chevronText, { color: '#e65100' }]}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.summaryColBtn} onPress={onResolvedFilter} activeOpacity={0.7}>
          <Text style={[styles.summaryColBtnText, { color: '#2e7d32' }]}>RESOLVED</Text>
          <Text style={[styles.chevronText, { color: '#2e7d32' }]}>▾</Text>
        </TouchableOpacity>
        <View style={styles.summaryColBtn}>
          <Text style={[styles.summaryColBtnText, { color: '#1a237e' }]}>TOTAL</Text>
        </View>
      </View>

      {/* CDPO Row */}
      <View style={[styles.summaryRow, styles.summaryDataRow, { borderBottomColor: '#f5f5f5' }]}>
        <View style={styles.summaryCol0}>
          <Text style={styles.summaryRowLabel}>CDPO</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#e65100' }]}>7</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#2e7d32' }]}>5</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#1a237e' }]}>12</Text>
        </View>
      </View>

      {/* Supervisor Row */}
      <View style={[styles.summaryRow, styles.summaryDataRow, { borderBottomColor: '#f5f5f5' }]}>
        <View style={styles.summaryCol0}>
          <Text style={styles.summaryRowLabel}>Supervisor</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#e65100' }]}>50</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#2e7d32' }]}>150</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#1a237e' }]}>200</Text>
        </View>
      </View>

      {/* AWW Row */}
      <View style={[styles.summaryRow, styles.summaryDataRow, { borderBottomColor: '#e0e0e0' }]}>
        <View style={styles.summaryCol0}>
          <Text style={styles.summaryRowLabel}>AWW</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#e65100' }]}>2,000</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#2e7d32' }]}>1,000</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#1a237e' }]}>3,000</Text>
        </View>
      </View>

      {/* Total Row */}
      <View style={[styles.summaryRow, styles.summaryDataRow, { borderBottomWidth: 0 }]}>
        <View style={styles.summaryCol0}>
          <Text style={[styles.summaryRowLabel, { fontWeight: '600', color: '#1a237e' }]}>Total</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#e65100' }]}>2,057</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#2e7d32' }]}>1,155</Text>
        </View>
        <View style={styles.summaryColData}>
          <Text style={[styles.summaryDataValue, { color: '#1a237e' }]}>3,212</Text>
        </View>
      </View>
    </View>
  </View>
);

const AssignedToFilter = ({
  selected,
  onSelect,
}: {
  selected: AssignedFilter;
  onSelect: (val: AssignedFilter) => void;
}) => (
  <View style={styles.assignedToRow}>
    <Text style={styles.assignedToLabel}>Assigned To</Text>
    <View style={styles.assignedChips}>
      {(['CDPO', 'Supervisor', 'AWW'] as AssignedFilter[]).map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.assignedChip,
            selected === item ? styles.assignedChipActive : styles.assignedChipInactive,
          ]}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.assignedChipText,
              selected === item ? styles.assignedChipTextActive : styles.assignedChipTextInactive,
            ]}
          >
            {item === 'CDPO' ? 'me' : item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const TabBar = ({
  activeTab,
  onTabChange,
  pendingCount,
  resolvedCount,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount: number;
  resolvedCount: number;
}) => (
  <View style={styles.tabBar}>
    {(['Pending', 'Resolved'] as TabType[]).map((tab) => (
      <TouchableOpacity
        key={tab}
        style={styles.tabItem}
        onPress={() => onTabChange(tab)}
        activeOpacity={0.8}
      >
        <View style={styles.tabContent}>
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === tab ? styles.tabBadgeActive : styles.tabBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === tab ? styles.tabBadgeTextActive : styles.tabBadgeTextInactive,
              ]}
            >
              {tab === 'Pending' ? pendingCount : resolvedCount}
            </Text>
          </View>
        </View>
        <View style={[styles.tabUnderline, activeTab === tab && styles.tabUnderlineActive]} />
      </TouchableOpacity>
    ))}
  </View>
);

const FilterChips = ({
  activeTab,
  assignedFilter,
  isOverdueActive,
  onOverdueToggle,
  onClearAll,
  appliedDateOption,
  appliedTypes,
  appliedCategories,
  appliedStatuses,
  onDateRangePress,
  onTypePress,
  onCategoryPress,
  onStatusPress,
  onClearDateRange,
  onClearType,
  onClearCategory,
  onClearStatus,
}: {
  activeTab: TabType;
  assignedFilter: AssignedFilter;
  isOverdueActive: boolean;
  onOverdueToggle: () => void;
  onClearAll: () => void;
  appliedDateOption: '7' | '14' | '21' | 'custom' | null;
  appliedTypes: string[];
  appliedCategories: string[];
  appliedStatuses: ResolvedStatus[];
  onDateRangePress: () => void;
  onTypePress: () => void;
  onCategoryPress: () => void;
  onStatusPress: () => void;
  onClearDateRange: () => void;
  onClearType: () => void;
  onClearCategory: () => void;
  onClearStatus: () => void;
}) => {
  const safeTypes = appliedTypes || [];
  const safeCategories = appliedCategories || [];
  const safeStatuses = appliedStatuses || [];
  const isCdpoPending = assignedFilter === 'CDPO' && activeTab === 'Pending';
  const isAnyFilterActive =
    isOverdueActive ||
    appliedDateOption !== null ||
    safeTypes.length > 0 ||
    safeCategories.length > 0 ||
    safeStatuses.length > 0;

  return (
    <View>
      <View style={styles.filterRow}>
        {activeTab === 'Pending' ? (
          <>
            <TouchableOpacity
              style={[styles.filterChip, isOverdueActive && styles.filterChipOverdueActive]}
              onPress={onOverdueToggle}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isOverdueActive && styles.filterChipTextActive]}>
                Overdue
              </Text>
              {isOverdueActive && (
                <Text style={styles.filterChipClose}> ×</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, appliedDateOption !== null && styles.filterChipActive]}
              onPress={onDateRangePress}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, appliedDateOption !== null && styles.filterChipTextActive]}>
                {appliedDateOption === '7'
                  ? '7 Days'
                  : appliedDateOption === '14'
                  ? '14 Days'
                  : appliedDateOption === '21'
                  ? '21 Days'
                  : appliedDateOption === 'custom'
                  ? 'Custom Range'
                  : 'Date Range ▾'}
              </Text>
              {appliedDateOption !== null && (
                <TouchableOpacity onPress={onClearDateRange} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={styles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {isCdpoPending ? (
              <TouchableOpacity
                style={[styles.filterChip, safeTypes.length > 0 && styles.filterChipActive]}
                onPress={onTypePress}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, safeTypes.length > 0 && styles.filterChipTextActive]}>
                  {safeTypes.length === 0
                    ? 'Type ▾'
                    : safeTypes.length === 1
                    ? safeTypes[0]
                    : `${safeTypes.length} Types`}
                </Text>
                {safeTypes.length > 0 && (
                  <TouchableOpacity onPress={onClearType} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                    <Text style={styles.filterChipClose}> ×</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.filterChip, safeCategories.length > 0 && styles.filterChipActive]}
                onPress={onCategoryPress}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, safeCategories.length > 0 && styles.filterChipTextActive]}>
                  {safeCategories.length === 0
                    ? 'Category ▾'
                    : safeCategories.length === 1
                    ? safeCategories[0]
                    : `${safeCategories.length} Categories`}
                </Text>
                {safeCategories.length > 0 && (
                  <TouchableOpacity onPress={onClearCategory} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                    <Text style={styles.filterChipClose}> ×</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.filterChip, safeStatuses.length > 0 && styles.filterChipActive]}
              onPress={onStatusPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, safeStatuses.length > 0 && styles.filterChipTextActive]}>
                {safeStatuses.length === 0
                  ? 'Status ▾'
                  : safeStatuses.length === 1
                  ? getStatusLabel(safeStatuses[0])
                  : `${safeStatuses.length} Statuses`}
              </Text>
              {safeStatuses.length > 0 && (
                <TouchableOpacity onPress={onClearStatus} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={styles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, appliedDateOption !== null && styles.filterChipActive]}
              onPress={onDateRangePress}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, appliedDateOption !== null && styles.filterChipTextActive]}>
                {appliedDateOption === '7'
                  ? '7 Days'
                  : appliedDateOption === '14'
                  ? '14 Days'
                  : appliedDateOption === '21'
                  ? '21 Days'
                  : appliedDateOption === 'custom'
                  ? 'Custom Range'
                  : 'Date Range ▾'}
              </Text>
              {appliedDateOption !== null && (
                <TouchableOpacity onPress={onClearDateRange} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={styles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, safeCategories.length > 0 && styles.filterChipActive]}
              onPress={onCategoryPress}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, safeCategories.length > 0 && styles.filterChipTextActive]}>
                {safeCategories.length === 0
                  ? 'Category ▾'
                  : safeCategories.length === 1
                  ? safeCategories[0]
                  : `${safeCategories.length} Categories`}
              </Text>
              {safeCategories.length > 0 && (
                <TouchableOpacity onPress={onClearCategory} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={styles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      {isAnyFilterActive && (
        <TouchableOpacity style={styles.clearAllRow} onPress={onClearAll} activeOpacity={0.7}>
          <Text style={styles.clearAllText}>Clear all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const TicketCardComponent = ({
  card,
  showDocs = true,
  onPress,
}: {
  card: TicketCard;
  showDocs?: boolean;
  onPress?: () => void;
}) => {
  const isCorruptionOrUrgent = card.complaintType === 'Corruption' || card.complaintType === 'Urgent';
  return (
    <TouchableOpacity
      style={[styles.card, { borderColor: card.borderColor ?? (card.isOverdue ? '#ffcdd2' : '#e0e0e0') }]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Ticket # + Overdue Badge Row */}
      <View style={styles.cardTopRow}>
        <Text style={styles.cardTicketNum}>{card.ticketNumber}</Text>
        {card.isOverdue && (
          <View style={styles.overdueBadge}>
            <Text style={styles.overdueBadgeText}>OVERDUE</Text>
          </View>
        )}
      </View>

      {/* Beneficiary Name + Tag Row */}
      {(card.beneficiaryName || card.beneficiaryType) && (
        <View style={styles.nameRow}>
          {card.beneficiaryName && (
            <Text style={styles.beneficiaryName}>{card.beneficiaryName}</Text>
          )}
          {card.beneficiaryType && (
            <View style={styles.beneficiaryTag}>
              <Text style={styles.beneficiaryTagText}>{card.beneficiaryType}</Text>
            </View>
          )}
        </View>
      )}

      {/* Fallback to old title if beneficiaryName is not available */}
      {!card.beneficiaryName && card.title && (
        <Text style={styles.cardTitle}>{card.title}</Text>
      )}

      {/* Topic + Description */}
      <View style={styles.topicRow}>
        {card.topic ? (
          <Text style={styles.topicText}>{card.topic}</Text>
        ) : null}
        <Text style={styles.cardDescription} numberOfLines={1}>
          {card.description}
        </Text>
      </View>

      {/* Date + Days Remaining/Overdue */}
      <View style={styles.cardDateRow}>
        <Text style={styles.cardDate}>{card.submittedDate}</Text>
        {card.daysLabel ? (
          <View
            style={[
              styles.daysBadge,
              card.daysType === 'overdue'
                ? { backgroundColor: '#ffebee' }
                : { backgroundColor: '#fff3e0' },
            ]}
          >
            <Text
              style={[
                styles.daysBadgeText,
                card.daysType === 'overdue' ? { color: '#d32f2f' } : { color: '#e65100' },
              ]}
            >
              {card.daysLabel}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Bottom row: AWC Name + Doc uploaded badge OR old Fallbacks (byName & documents) */}
      {card.awcName ? (
        <View style={styles.cardBottomRow}>
          <View style={styles.awcInfo}>
            <Text style={styles.awcLabel}>AWC: </Text>
            <Text style={styles.awcName}>{card.awcName}</Text>
          </View>
          {showDocs && isCorruptionOrUrgent && card.documentsCount !== undefined && card.documentsCount > 0 ? (
            <View style={styles.docChip}>
              <Text style={styles.docChipText}>
                {card.documentsCount === 1 ? 'Doc Uploaded' : `${card.documentsCount} Docs Uploaded`}
              </Text>
            </View>
          ) : (isCorruptionOrUrgent && card.documents) ? (
            <View style={styles.docChip}>
              <Text style={styles.docChipText}>
                {card.documents.toLowerCase().includes('1 ') || card.documents.toLowerCase() === '1 document' ? 'Doc Uploaded' : card.documents}
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.cardBottomRow}>
          {card.byName ? (
            <View style={styles.cardByRow}>
              <Text style={styles.cardByLabel}>By:</Text>
              <Text style={styles.cardByName}>{card.byName}</Text>
            </View>
          ) : <View />}
          {(isCorruptionOrUrgent && card.documents) ? (
            <View style={styles.docChip}>
              <Text style={styles.docChipText}>
                {card.documents.toLowerCase().includes('1 ') || card.documents.toLowerCase() === '1 document' ? 'Doc Uploaded' : card.documents}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const STATUS_CONFIG: Record<ResolvedStatus, { label: string; color: string; bg: string; border: string; hasIcon: boolean }> = {
  CLOSED:          { label: 'CLOSED',          color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', hasIcon: false },
  CLOSURE_PENDING: { label: 'CLOSURE PENDING', color: '#f57f17', bg: '#fff8e1', border: '#ffe082', hasIcon: true  },
  APPEAL_RAISED:   { label: 'APPEAL RAISED',   color: '#e65100', bg: '#fff3e0', border: '#ffcc80', hasIcon: true  },
  APPEAL_RESOLVED: { label: 'APPEAL RESOLVED', color: '#1565c0', bg: '#e8eaf6', border: '#90caf9', hasIcon: true  },
};

export function getStatusLabel(status: ResolvedStatus): string {
  switch (status) {
    case 'CLOSURE_PENDING': return 'Closure Pending';
    case 'CLOSED':          return 'Closed';
    case 'APPEAL_RAISED':   return 'Appeal Raised';
    case 'APPEAL_RESOLVED': return 'Appeal Resolved';
    default:                return status;
  }
}


export const ResolvedTicketCardComponent = ({
  card,
  onPress,
}: {
  card: ResolvedTicketCard;
  onPress?: () => void;
}) => {
  const cfg = STATUS_CONFIG[card.status];
  return (
    <TouchableOpacity
      style={[resolvedCardStyles.card, card.awaitingCdpoClosure && resolvedCardStyles.cardAwaitingClosure]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      {/* Awaiting CDPO Closure indicator row */}
      {card.awaitingCdpoClosure && (
        <View style={resolvedCardStyles.awaitingClosureRow}>
          <Text style={resolvedCardStyles.awaitingClosureText}>Awaiting CDPO Closure</Text>
        </View>
      )}

      {/* Ticket # + Status Badge */}
      <View style={resolvedCardStyles.topRow}>
        <Text style={resolvedCardStyles.ticketNum}>{card.ticketNumber}</Text>
        <View style={[resolvedCardStyles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <Text style={[resolvedCardStyles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          {cfg.hasIcon && <Text style={[resolvedCardStyles.statusIcon, { color: cfg.color }]}> ⓘ</Text>}
        </View>
      </View>

      {/* Beneficiary Name + Type */}
      <View style={resolvedCardStyles.nameRow}>
        <Text style={resolvedCardStyles.beneficiaryName}>{card.beneficiaryName}</Text>
        <View style={resolvedCardStyles.beneficiaryTag}>
          <Text style={resolvedCardStyles.beneficiaryTagText}>{card.beneficiaryType}</Text>
        </View>
      </View>

      {/* Topic + Description */}
      <View style={resolvedCardStyles.topicBlock}>
        <Text style={resolvedCardStyles.topicText}>{card.topic}</Text>
        <Text style={resolvedCardStyles.descriptionText} numberOfLines={1}>{card.description}</Text>
      </View>

      {/* Resolved Date */}
      <Text style={resolvedCardStyles.resolvedDate}>{card.resolvedDate}</Text>

      {/* Action Taken box */}
      <View style={resolvedCardStyles.actionBox}>
        <Text style={resolvedCardStyles.actionLabel}>ACTION TAKEN</Text>
        <Text style={resolvedCardStyles.actionText} numberOfLines={2}>{card.actionTaken}</Text>
      </View>

      {/* AWC */}
      <View style={resolvedCardStyles.awcRow}>
        <Text style={resolvedCardStyles.awcLabel}>AWC: </Text>
        <Text style={resolvedCardStyles.awcName}>{card.awcName}</Text>
      </View>
    </TouchableOpacity>
  );
};

const AnganwadiCentreDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={resolvedCardStyles.dropdownWrapper}>
    <TouchableOpacity style={resolvedCardStyles.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={resolvedCardStyles.dropdownDot} />
      <View style={resolvedCardStyles.dropdownTextBlock}>
        <Text style={resolvedCardStyles.dropdownLabel}>ANGANWADI CENTRE</Text>
        <Text style={resolvedCardStyles.dropdownValue}>{value}</Text>
      </View>
      <Image source={{ uri: imgChevronDown }} style={resolvedCardStyles.dropdownChevron} />
    </TouchableOpacity>
  </View>
);

const SectorDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={resolvedCardStyles.dropdownWrapper}>
    <TouchableOpacity style={resolvedCardStyles.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={resolvedCardStyles.dropdownDot} />
      <View style={resolvedCardStyles.dropdownTextBlock}>
        <Text style={resolvedCardStyles.dropdownLabel}>SECTOR</Text>
        <Text style={resolvedCardStyles.dropdownValue}>{value}</Text>
      </View>
      <Image source={{ uri: imgChevronDown }} style={resolvedCardStyles.dropdownChevron} />
    </TouchableOpacity>
  </View>
);

// ─── Sector / AWC Pick Sheets ─────────────────────────────────────────────────

const SECTOR_OPTIONS = ['All Sectors', 'Sector 1', 'Sector 2', 'Sector 3', 'Sector 4'];
const AWC_OPTIONS = [
  'All Centres',
  'Anganwadi Centre 1',
  'Anganwadi Centre 2',
  'Anganwadi Centre 3',
  'Anganwadi Centre 4',
  'Anganwadi Centre 5',
  'Anganwadi Centre 6',
];

const DropdownPickSheet = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={modalStyles.inlineOverlayWrapper}>
      <Animated.View style={[modalStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={modalStyles.inlineDismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[
          modalStyles.inlineSheet,
          { height: 80 + options.length * 52, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={modalStyles.handleRow}><View style={modalStyles.handle} /></View>
        <View style={modalStyles.titleRow}>
          <Text style={modalStyles.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={modalStyles.closeIcon} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={filterSheetStyles.optionsList}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={filterSheetStyles.radioRow}
                onPress={() => { onSelect(opt); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={[filterSheetStyles.radioOutline, selected === opt && filterSheetStyles.radioOutlineActive]}>
                  {selected === opt && <View style={filterSheetStyles.radioInner} />}
                </View>
                <Text style={[filterSheetStyles.radioLabel, selected === opt && { color: '#1a237e', fontWeight: '600' }]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// ─── Reusable Bottom Sheet ────────────────────────────────────────────────────

const useSheetAnim = (visible: boolean) => {
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Mount first, then animate in
      setMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      // Animate out, THEN unmount (via callback)
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 600, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        // Reset values for next open
        slideAnim.setValue(600);
        fadeAnim.setValue(0);
      });
    }
  }, [visible]);

  return { slideAnim, fadeAnim, mounted };
};

// ─── Pending Breakdown Sheet ──────────────────────────────────────────────────

const PendingBreakdownSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  const rows = [
    { role: 'CDPO',       pending: '7',     overdue: '3',   isSeparatorLight: true },
    { role: 'Supervisor', pending: '50',    overdue: '10',  isSeparatorLight: true },
    { role: 'AWW',        pending: '2,000', overdue: '503', isSeparatorLight: false },
    { role: 'Total',      pending: '2,057', overdue: '516', isTotal: true },
  ];

  return (
    <View
      pointerEvents={visible ? 'auto' : 'box-none'}
      style={modalStyles.inlineOverlayWrapper}
    >
      {/* Dimmed backdrop */}
      <Animated.View style={[modalStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={modalStyles.inlineDismiss} activeOpacity={1} onPress={onClose} />

      {/* Sheet */}
      <Animated.View style={[modalStyles.inlineSheet, { height: 560, transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={modalStyles.handleRow}><View style={modalStyles.handle} /></View>

        {/* Title */}
        <View style={modalStyles.titleRow}>
          <Text style={modalStyles.sheetTitle}>Pending Breakdown</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={modalStyles.closeIcon} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <View style={modalStyles.sheetBody}>
          {/* Total card — blue */}
          <View style={[modalStyles.pendingTotalCard, { backgroundColor: '#e8eaf6' }]}>
            <Text style={[modalStyles.pendingTotalLabel, { color: '#5c67b5' }]}>TOTAL PENDING</Text>
            <Text style={[modalStyles.pendingTotalValue, { color: '#1a237e' }]}>2,057</Text>
          </View>

          {/* Table */}
          <View style={modalStyles.pendingTableWrapper}>
            <View style={[modalStyles.pendingTableRow, modalStyles.pendingTableHeaderRow]}>
              <View style={modalStyles.pendingTableColRole}><Text style={modalStyles.pendingTableHeaderCell}>ROLE</Text></View>
              <View style={modalStyles.pendingTableColStat}><Text style={[modalStyles.pendingTableHeaderCell, { color: '#e65100' }]}>PENDING</Text></View>
              <View style={modalStyles.pendingTableColStat}><Text style={[modalStyles.pendingTableHeaderCell, { color: '#d32f2f' }]}>OVERDUE</Text></View>
            </View>
            {rows.map((row, idx) => (
              <View key={row.role} style={[
                modalStyles.pendingTableRow,
                { height: 58 },
                idx < rows.length - 1 ? { borderBottomWidth: 1, borderBottomColor: row.isSeparatorLight === false ? '#e0e0e0' : '#f5f5f5' } : {},
                (row as any).isTotal ? { backgroundColor: '#fafafa' } : {},
              ]}>
                <View style={modalStyles.pendingTableColRole}>
                  <Text style={[modalStyles.pendingTableRoleText, (row as any).isTotal ? { fontWeight: '600', color: '#1a237e' } : {}]}>{row.role}</Text>
                </View>
                <View style={modalStyles.pendingTableColStat}>
                  <Text style={[modalStyles.pendingTableStatVal, { color: '#e65100' }]}>{row.pending}</Text>
                </View>
                <View style={modalStyles.pendingTableColStat}>
                  <Text style={[modalStyles.pendingTableStatVal, { color: '#d32f2f' }]}>{row.overdue}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Help note */}
          <View style={modalStyles.helpNote}>
            <Text style={modalStyles.helpNoteText}>
              <Text style={modalStyles.helpNoteHighlight}>Pending</Text> is the count of tickets still awaiting action. <Text style={modalStyles.helpNoteHighlight}>Overdue</Text> is the subset that has crossed its resolution deadline (SLA) and needs urgent attention.
            </Text>
          </View>
        </View>
        <View style={{ height: 28 }} />
      </Animated.View>
    </View>
  );
};

// ─── Resolved Breakdown Sheet ─────────────────────────────────────────────────

const ResolvedBreakdownSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  const subCards = [
    {
      label: 'Closure Pending', value: '104', color: '#f57f17',
      bg: '#fff8e1', border: '#ffe082', divider: '#ffe082',
      rows: [{ role: 'CDPO', val: '1' }, { role: 'Supervisor', val: '3' }, { role: 'AWW', val: '100' }],
    },
    {
      label: 'Closed', value: '863', color: '#2e7d32',
      bg: '#e8f5e9', border: '#a5d6a7', divider: '#a5d6a7',
      rows: [{ role: 'CDPO', val: '3' }, { role: 'Supervisor', val: '110' }, { role: 'AWW', val: '750' }],
    },
    {
      label: 'Appeal Raised', value: '92', color: '#e65100',
      bg: '#fff3e0', border: '#ffcc80', divider: '#ffcc80',
      rows: [{ role: 'CDPO', val: '0' }, { role: 'Supervisor', val: '12' }, { role: 'AWW', val: '80' }],
    },
    {
      label: 'Appeal Resolved', value: '79', color: '#1565c0',
      bg: '#e8eaf6', border: '#90caf9', divider: '#90caf9',
      rows: [{ role: 'CDPO', val: '1' }, { role: 'Supervisor', val: '8' }, { role: 'AWW', val: '70' }],
    },
  ];

  return (
    <View
      pointerEvents={visible ? 'auto' : 'box-none'}
      style={modalStyles.inlineOverlayWrapper}
    >
      <Animated.View style={[modalStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={modalStyles.inlineDismiss} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[modalStyles.inlineSheet, { height: 510, transform: [{ translateY: slideAnim }] }]}>
        {/* Handle */}
        <View style={modalStyles.handleRow}><View style={modalStyles.handle} /></View>

        {/* Title */}
        <View style={modalStyles.titleRow}>
          <Text style={modalStyles.sheetTitle}>Resolved Breakdown</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={modalStyles.closeIcon} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <View style={modalStyles.sheetBody}>
          {/* Total card — green */}
          <View style={[modalStyles.resolvedTotalCard]}>
            <View>
              <Text style={[modalStyles.totalLabel, { color: '#388e3c' }]}>TOTAL RESOLVED</Text>
              <Text style={[modalStyles.totalValue, { color: '#2e7d32' }]}>1,155</Text>
            </View>
            <View style={{ gap: 3, alignItems: 'flex-end' }}>
              {[{ label: 'CDPO', val: '5' }, { label: 'Supervisor', val: '150' }, { label: 'AWW', val: '1,000' }].map(r => (
                <View key={r.label} style={{ flexDirection: 'row', gap: 6 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#66bb6a' }}>{r.label}</Text>
                  <Text style={{ fontFamily: 'Inter', fontWeight: '700', fontSize: 13, color: '#2e7d32' }}>{r.val}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 2x2 sub-cards grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {subCards.map(card => (
              <View key={card.label} style={[modalStyles.subCard, { backgroundColor: card.bg, borderColor: card.border }]}>
                <Text style={[modalStyles.subCardLabel, { color: card.color }]}>{card.label.toUpperCase()}</Text>
                <Text style={[modalStyles.subCardValue, { color: card.color }]}>{card.value}</Text>
                <View style={[modalStyles.subCardDivider, { borderTopColor: card.divider }]}>
                  {card.rows.map(r => (
                    <View key={r.role} style={modalStyles.subCardRow}>
                      <Text style={[modalStyles.subCardRowLabel, { color: card.color }]}>{r.role}</Text>
                      <Text style={[modalStyles.subCardRowVal, { color: card.color }]}>{r.val}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ height: 28 }} />
      </Animated.View>
    </View>
  );
};

// ─── Ticket Details Overlay ───────────────────────────────────────────────────

const TicketDetailsOverlay = ({
  card,
  assignedFilter,
  onBack,
  onResolveTicket,
}: {
  card: any;
  assignedFilter: AssignedFilter;
  onBack: () => void;
  onResolveTicket?: (ticketId: string, closureNote: string) => void;
}) => (
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%' }}>
    <TicketDetailsScreen
      card={card}
      assignedFilter={assignedFilter}
      onBack={onBack}
      onResolveTicket={onResolveTicket}
      isCdpoView={true}
    />
  </View>
);

// Helper functions for date filtering (mock current date 30/06/2025)
function parseDateString(str: string): Date | null {
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // 0-indexed month
  const year = parseInt(match[3], 10);
  return new Date(year, month, day);
}

function parseInputDate(str: string): Date | null {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const year = parseInt(match[3], 10);
  return new Date(year, month, day);
}

const handleDateChange = (text: string, setter: (val: string) => void) => {
  const clean = text.replace(/[^0-9/]/g, '');
  setter(clean);
};


const filterSheetStyles = StyleSheet.create({
  optionsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  radioRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  radioOutline: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#bdbdbd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOutlineActive: {
    borderColor: '#1a237e',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1a237e',
  },
  radioLabel: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#424242',
  },
  calendarIcon: {
    width: 20,
    height: 20,
  },
  customFieldsContainer: {
    paddingLeft: 36,
    paddingRight: 16,
    paddingVertical: 12,
  },
  inputLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 11,
    color: '#9e9e9e',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingLeft: 12,
    paddingRight: 40,
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#212121',
  },
  inputCalIcon: {
    position: 'absolute',
    right: 12,
    width: 18,
    height: 18,
    tintColor: '#9e9e9e',
  },
  buttonsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 14,
  },
  clearBtn: {
    flex: 112,
    height: 46,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    color: '#757575',
  },
  applyBtn: {
    flex: 220,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#e0e0e0',
  },
  applyBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
  },
});

// ─── Date Range Filter Sheet ──────────────────────────────────────────────────

const DateRangeFilterSheet = ({
  visible,
  onClose,
  appliedOption,
  appliedFrom,
  appliedTo,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  appliedOption: '7' | '14' | '21' | 'custom' | null;
  appliedFrom: string;
  appliedTo: string;
  onApply: (opt: '7' | '14' | '21' | 'custom' | null, from: string, to: string) => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [option, setOption] = useState<'7' | '14' | '21' | 'custom' | null>(appliedOption);
  const [fromText, setFromText] = useState(appliedFrom);
  const [toText, setToText] = useState(appliedTo);

  useEffect(() => {
    if (visible) {
      setOption(appliedOption);
      setFromText(appliedFrom);
      setToText(appliedTo);
    }
  }, [visible, appliedOption, appliedFrom, appliedTo]);

  if (!mounted) return null;

  const handleApply = () => {
    onApply(option, fromText, toText);
  };

  const handleClear = () => {
    setOption(null);
    setFromText('');
    setToText('');
    onApply(null, '', '');
  };

  const isApplyDisabled =
    option === null ||
    (option === 'custom' && (!fromText || !toText || fromText.length < 10 || toText.length < 10));

  const sheetHeight = option === 'custom' ? 520 : 360;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={modalStyles.inlineOverlayWrapper}>
      <Animated.View style={[modalStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={modalStyles.inlineDismiss} activeOpacity={1} onPress={onClose} />

      <Animated.View
        style={[
          modalStyles.inlineSheet,
          { height: sheetHeight, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={modalStyles.handleRow}>
          <View style={modalStyles.handle} />
        </View>

        <View style={modalStyles.titleRow}>
          <Text style={modalStyles.sheetTitle}>Filter by Date Range</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={modalStyles.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={filterSheetStyles.optionsList}>
            {/* Last 7 Days */}
            <TouchableOpacity
              style={filterSheetStyles.radioRow}
              onPress={() => setOption('7')}
              activeOpacity={0.7}
            >
              <View style={[filterSheetStyles.radioOutline, option === '7' && filterSheetStyles.radioOutlineActive]}>
                {option === '7' && <View style={filterSheetStyles.radioInner} />}
              </View>
              <Text style={filterSheetStyles.radioLabel}>Last 7 Days</Text>
              <Image
                source={{ uri: option === '7' ? imgCalendarIcon2 : imgCalendarIcon }}
                style={filterSheetStyles.calendarIcon}
              />
            </TouchableOpacity>

            {/* Last 14 Days */}
            <TouchableOpacity
              style={filterSheetStyles.radioRow}
              onPress={() => setOption('14')}
              activeOpacity={0.7}
            >
              <View style={[filterSheetStyles.radioOutline, option === '14' && filterSheetStyles.radioOutlineActive]}>
                {option === '14' && <View style={filterSheetStyles.radioInner} />}
              </View>
              <Text style={filterSheetStyles.radioLabel}>Last 14 Days</Text>
              <Image
                source={{ uri: option === '14' ? imgCalendarIcon2 : imgCalendarIcon }}
                style={filterSheetStyles.calendarIcon}
              />
            </TouchableOpacity>

            {/* Last 21 Days */}
            <TouchableOpacity
              style={filterSheetStyles.radioRow}
              onPress={() => setOption('21')}
              activeOpacity={0.7}
            >
              <View style={[filterSheetStyles.radioOutline, option === '21' && filterSheetStyles.radioOutlineActive]}>
                {option === '21' && <View style={filterSheetStyles.radioInner} />}
              </View>
              <Text style={filterSheetStyles.radioLabel}>Last 21 Days</Text>
              <Image
                source={{ uri: option === '21' ? imgCalendarIcon2 : imgCalendarIcon }}
                style={filterSheetStyles.calendarIcon}
              />
            </TouchableOpacity>

            {/* Custom Range */}
            <TouchableOpacity
              style={[
                filterSheetStyles.radioRow,
                option === 'custom' && { backgroundColor: '#f5f6ff' },
              ]}
              onPress={() => setOption('custom')}
              activeOpacity={0.7}
            >
              <View style={[filterSheetStyles.radioOutline, option === 'custom' && filterSheetStyles.radioOutlineActive]}>
                {option === 'custom' && <View style={filterSheetStyles.radioInner} />}
              </View>
              <Text style={[filterSheetStyles.radioLabel, option === 'custom' && { color: '#1a237e', fontWeight: '600' }]}>
                Custom Range
              </Text>
              <Image
                source={{ uri: option === 'custom' ? imgCalendarIcon2 : imgCalendarIcon }}
                style={filterSheetStyles.calendarIcon}
              />
            </TouchableOpacity>

            {/* Custom fields */}
            {option === 'custom' && (
              <View style={filterSheetStyles.customFieldsContainer}>
                <Text style={filterSheetStyles.inputLabel}>FROM DATE</Text>
                <View style={filterSheetStyles.inputWrapper}>
                  <TextInput
                    style={filterSheetStyles.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9e9e9e"
                    value={fromText}
                    maxLength={10}
                    onChangeText={(t) => handleDateChange(t, setFromText)}
                  />
                  <Image source={{ uri: imgCalendarIcon1 }} style={filterSheetStyles.inputCalIcon} />
                </View>

                <Text style={[filterSheetStyles.inputLabel, { marginTop: 12 }]}>TO DATE</Text>
                <View style={filterSheetStyles.inputWrapper}>
                  <TextInput
                    style={filterSheetStyles.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9e9e9e"
                    value={toText}
                    maxLength={10}
                    onChangeText={(t) => handleDateChange(t, setToText)}
                  />
                  <Image source={{ uri: imgCalendarIcon1 }} style={filterSheetStyles.inputCalIcon} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Buttons */}
        <View style={filterSheetStyles.buttonsContainer}>
          <TouchableOpacity style={filterSheetStyles.clearBtn} onPress={handleClear} activeOpacity={0.7}>
            <Text style={filterSheetStyles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[filterSheetStyles.applyBtn, isApplyDisabled && filterSheetStyles.applyBtnDisabled]}
            disabled={isApplyDisabled}
            onPress={handleApply}
            activeOpacity={0.7}
          >
            <Text style={filterSheetStyles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// ─── Type Filter Sheet ────────────────────────────────────────────────────────

const TypeFilterSheet = ({
  visible,
  onClose,
  appliedTypes,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  appliedTypes: string[];
  onApply: (types: string[]) => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [tempTypes, setTempTypes] = useState<string[]>(appliedTypes);

  useEffect(() => {
    if (visible) {
      setTempTypes(appliedTypes);
    }
  }, [visible, appliedTypes]);

  if (!mounted) return null;

  const handleToggle = (type: string) => {
    if (tempTypes.includes(type)) {
      setTempTypes(tempTypes.filter((t) => t !== type));
    } else {
      setTempTypes([...tempTypes, type]);
    }
  };

  const handleApply = () => {
    onApply(tempTypes);
  };

  const handleCancel = () => {
    setTempTypes(appliedTypes);
    onClose();
  };

  const options = ['Corruption', 'Urgent', 'Others'];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={modalStyles.inlineOverlayWrapper}>
      <Animated.View style={[modalStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={modalStyles.inlineDismiss} activeOpacity={1} onPress={handleCancel} />

      <Animated.View
        style={[
          modalStyles.inlineSheet,
          { height: 340, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={modalStyles.handleRow}>
          <View style={modalStyles.handle} />
        </View>

        <View style={modalStyles.titleRow}>
          <Text style={modalStyles.sheetTitle}>Filter by Type</Text>
        </View>

        <View style={filterSheetStyles.optionsList}>
          {options.map((opt) => {
            const isSelected = tempTypes.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={filterSheetStyles.radioRow}
                onPress={() => handleToggle(opt)}
                activeOpacity={0.7}
              >
                <View style={[filterSheetStyles.radioOutline, isSelected && filterSheetStyles.radioOutlineActive]}>
                  {isSelected && <View style={filterSheetStyles.radioInner} />}
                </View>
                <Text style={filterSheetStyles.radioLabel}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Buttons */}
        <View style={filterSheetStyles.buttonsContainer}>
          <TouchableOpacity style={filterSheetStyles.clearBtn} onPress={handleCancel} activeOpacity={0.7}>
            <Text style={filterSheetStyles.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={filterSheetStyles.applyBtn} onPress={handleApply} activeOpacity={0.7}>
            <Text style={filterSheetStyles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// ─── Category Filter Sheet ────────────────────────────────────────────────────

const CategoryFilterSheet = ({
  visible,
  onClose,
  appliedCategories,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  appliedCategories: string[];
  onApply: (categories: string[]) => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [tempCategories, setTempCategories] = useState<string[]>(appliedCategories);

  useEffect(() => {
    if (visible) {
      setTempCategories(appliedCategories);
    }
  }, [visible, appliedCategories]);

  if (!mounted) return null;

  const handleToggle = (opt: string) => {
    if (tempCategories.includes(opt)) {
      setTempCategories(tempCategories.filter((c) => c !== opt));
    } else {
      setTempCategories([...tempCategories, opt]);
    }
  };

  const handleApply = () => {
    onApply(tempCategories);
  };

  const handleCancel = () => {
    setTempCategories(appliedCategories);
    onClose();
  };

  const options = [
    'Pregnant Woman',
    'Lactating Mother',
    'Children (6m-3y)',
    'Children (3-6y)',
    'Children 0-6 months',
    'Adolescent Girl',
  ];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={modalStyles.inlineOverlayWrapper}>
      <Animated.View style={[modalStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={modalStyles.inlineDismiss} activeOpacity={1} onPress={handleCancel} />

      <Animated.View
        style={[
          modalStyles.inlineSheet,
          { height: 490, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={modalStyles.handleRow}>
          <View style={modalStyles.handle} />
        </View>

        <View style={modalStyles.titleRow}>
          <Text style={modalStyles.sheetTitle}>Filter by Category</Text>
        </View>

        <View style={filterSheetStyles.optionsList}>
          {options.map((opt) => {
            const isSelected = tempCategories.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={filterSheetStyles.radioRow}
                onPress={() => handleToggle(opt)}
                activeOpacity={0.7}
              >
                <View style={[filterSheetStyles.radioOutline, isSelected && filterSheetStyles.radioOutlineActive]}>
                  {isSelected && <View style={filterSheetStyles.radioInner} />}
                </View>
                <Text style={filterSheetStyles.radioLabel}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Buttons */}
        <View style={filterSheetStyles.buttonsContainer}>
          <TouchableOpacity style={filterSheetStyles.clearBtn} onPress={handleCancel} activeOpacity={0.7}>
            <Text style={filterSheetStyles.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={filterSheetStyles.applyBtn} onPress={handleApply} activeOpacity={0.7}>
            <Text style={filterSheetStyles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};


const StatusFilterSheet = ({
  visible,
  onClose,
  appliedStatuses,
  onApply,
  assignedFilter,
}: {
  visible: boolean;
  onClose: () => void;
  appliedStatuses: ResolvedStatus[];
  onApply: (statuses: ResolvedStatus[]) => void;
  assignedFilter: AssignedFilter;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [tempStatuses, setTempStatuses] = useState<ResolvedStatus[]>(appliedStatuses);

  useEffect(() => {
    if (visible) {
      setTempStatuses(appliedStatuses);
    }
  }, [visible, appliedStatuses]);

  if (!mounted) return null;

  const handleToggle = (opt: ResolvedStatus) => {
    if (tempStatuses.includes(opt)) {
      setTempStatuses(tempStatuses.filter((s) => s !== opt));
    } else {
      setTempStatuses([...tempStatuses, opt]);
    }
  };

  const handleApply = () => {
    onApply(tempStatuses);
  };

  const handleCancel = () => {
    setTempStatuses(appliedStatuses);
    onClose();
  };

  const allOptions: { value: ResolvedStatus; label: string; color: string }[] = [
    { value: 'CLOSURE_PENDING', label: 'Closure Pending', color: '#f57f17' },
    { value: 'CLOSED',          label: 'Closed',          color: '#2e7d32' },
    { value: 'APPEAL_RAISED',   label: 'Appeal Raised',   color: '#e65100' },
    { value: 'APPEAL_RESOLVED', label: 'Appeal Resolved', color: '#1565c0' },
  ];

  const options = assignedFilter === 'CDPO' 
    ? allOptions.filter(o => o.value !== 'CLOSURE_PENDING') 
    : allOptions;

  const selectedCount = tempStatuses.filter(s => options.some(o => o.value === s)).length;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={modalStyles.inlineOverlayWrapper}>
      <Animated.View style={[modalStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={modalStyles.inlineDismiss} activeOpacity={1} onPress={handleCancel} />

      <Animated.View
        style={[
          modalStyles.inlineSheet,
          { height: assignedFilter === 'CDPO' ? 338 : 390, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={modalStyles.handleRow}>
          <View style={modalStyles.handle} />
        </View>

        <View style={modalStyles.titleRow}>
          <Text style={modalStyles.sheetTitle}>Filter by Status</Text>
        </View>

        <View style={filterSheetStyles.optionsList}>
          {options.map((opt) => {
            const isSelected = tempStatuses.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  filterSheetStyles.radioRow,
                  { paddingHorizontal: 16, marginHorizontal: -16 },
                  isSelected && { backgroundColor: '#f3f4fb' },
                ]}
                onPress={() => handleToggle(opt.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    filterSheetStyles.radioOutline,
                    { borderRadius: 11 },
                    isSelected && { borderColor: '#1a237e', backgroundColor: '#1a237e' },
                  ]}
                >
                  {isSelected && (
                    <Image
                      source={{ uri: imgIcon3 }}
                      style={{ width: 12, height: 12, tintColor: '#ffffff' }}
                    />
                  )}
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: opt.color,
                    }}
                  />
                  <Text
                    style={[
                      filterSheetStyles.radioLabel,
                      isSelected && { color: '#1a237e', fontWeight: '600' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Buttons */}
        <View style={filterSheetStyles.buttonsContainer}>
          <TouchableOpacity style={filterSheetStyles.clearBtn} onPress={handleCancel} activeOpacity={0.7}>
            <Text style={filterSheetStyles.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={filterSheetStyles.applyBtn} onPress={handleApply} activeOpacity={0.7}>
            <Text style={filterSheetStyles.applyBtnText}>
              {selectedCount > 0 ? `Apply Filters (${selectedCount})` : 'Apply Filters'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};


// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function BeneficiaryRedressalScreen({
  initialAssignedFilter = 'CDPO',
  onBack,
}: {
  initialAssignedFilter?: AssignedFilter;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>('Pending');
  const [assignedFilter, setAssignedFilter] = useState<AssignedFilter>(initialAssignedFilter);
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [resolvedModalVisible, setResolvedModalVisible] = useState(false);
  const [isOverdueActive, setIsOverdueActive] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // CDPO Pending filters state
  const [dateRangeModalVisible, setDateRangeModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [appliedDateOption, setAppliedDateOption] = useState<'7' | '14' | '21' | 'custom' | null>(null);
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [appliedTypes, setAppliedTypes] = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedStatuses, setAppliedStatuses] = useState<ResolvedStatus[]>([]);

  const [myPendingCards, setMyPendingCards] = useState<TicketCard[]>(pendingCards);
  const [myResolvedCards, setMyResolvedCards] = useState<ResolvedTicketCard[]>(resolvedCards);

  // Sector / AWC dropdowns
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedAWC, setSelectedAWC] = useState('All Centres');
  const [sectorPickVisible, setSectorPickVisible] = useState(false);
  const [awcPickVisible, setAwcPickVisible] = useState(false);

  const handleResolveTicket = (ticketId: string, closureNote: string) => {
    const ticket = myPendingCards.find((t) => t.id === ticketId);
    if (ticket) {
      const newResolvedCard: ResolvedTicketCard = {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        beneficiaryName: ticket.beneficiaryName,
        beneficiaryType: ticket.beneficiaryType,
        topic: ticket.topic ?? ticket.title ?? '',
        description: ticket.description,
        resolvedDate: 'Resolved: 30/06/2025',
        status: 'CLOSED',
        actionTaken: closureNote,
        awcName: ticket.awcName,
        helpTopic: ticket.helpTopic ?? ticket.topic ?? '',
        subTopic: ticket.subTopic ?? ticket.topic ?? '',
        beneficiaryMobile: ticket.beneficiaryMobile ?? '',
        beneficiaryEmail: ticket.beneficiaryEmail,
        awcCode: ticket.awcCode ?? '',
        district: ticket.district ?? 'Jaipur',
        project: ticket.project ?? 'Sanganer',
        sector: ticket.sector ?? 'Sector 1',
        assignedTo: ticket.assignedTo ?? 'CDPO',
      };

      setMyPendingCards((prev) => prev.filter((t) => t.id !== ticketId));
      setMyResolvedCards((prev) => [newResolvedCard, ...prev]);
    } else {
      setMyResolvedCards((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: 'CLOSED', actionTaken: closureNote, awaitingCdpoClosure: false }
            : t
        )
      );
    }
  };

  useEffect(() => {
    setAssignedFilter(initialAssignedFilter);
  }, [initialAssignedFilter]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsOverdueActive(false);
    setAppliedDateOption(null);
    setAppliedFromDate('');
    setAppliedToDate('');
    setAppliedTypes([]);
    setAppliedCategories([]);
    setAppliedStatuses([]);
  };

  const mockCurrentDate = new Date(2025, 5, 30); // 30 June 2025

  const displayedPendingCards = myPendingCards.filter((card) => {
    // 0. Role assignment filter
    if (card.assignedTo && card.assignedTo !== assignedFilter) return false;

    // 0a. Sector filter (Supervisor tab) — filter by sector field
    if (assignedFilter === 'Supervisor' && selectedSector !== 'All Sectors') {
      if (!card.sector || card.sector !== selectedSector) return false;
    }
    // 0b. AWC filter (AWW tab) — filter by awcName field
    if (assignedFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!card.awcName || card.awcName !== selectedAWC) return false;
    }

    // 1. Overdue filter
    if (isOverdueActive && !card.isOverdue) return false;

    // 2. Date Range filter (Applies to all roles/chips under Pending tab)
    if (appliedDateOption !== null) {
      const cardDate = parseDateString(card.submittedDate);
      if (!cardDate) return false;

      if (appliedDateOption === '7') {
        const diffTime = mockCurrentDate.getTime() - cardDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 7) return false;
      } else if (appliedDateOption === '14') {
        const diffTime = mockCurrentDate.getTime() - cardDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 14) return false;
      } else if (appliedDateOption === '21') {
        const diffTime = mockCurrentDate.getTime() - cardDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 21) return false;
      } else if (appliedDateOption === 'custom') {
        const fromDate = parseInputDate(appliedFromDate);
        const toDate = parseInputDate(appliedToDate);
        if (fromDate && cardDate < fromDate) return false;
        if (toDate && cardDate > toDate) return false;
      }
    }

    // 3. Type or Category filter
    if (assignedFilter === 'CDPO') {
      if (appliedTypes.length > 0) {
        if (!card.complaintType || !appliedTypes.includes(card.complaintType)) {
          return false;
        }
      }
    } else {
      if (appliedCategories.length > 0) {
        if (!card.beneficiaryType || !appliedCategories.includes(card.beneficiaryType)) {
          return false;
        }
      }
    }

    return true;
  });

  const displayedResolvedCards = myResolvedCards.filter((card) => {
    // 0. Role assignment filter
    if (card.assignedTo && card.assignedTo !== assignedFilter) return false;

    // 0a. Sector filter (Supervisor tab)
    if (assignedFilter === 'Supervisor' && selectedSector !== 'All Sectors') {
      if (!card.sector || card.sector !== selectedSector) return false;
    }
    // 0b. AWC filter (AWW tab)
    if (assignedFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!card.awcName || card.awcName !== selectedAWC) return false;
    }

    if (assignedFilter === 'CDPO' && card.status === 'CLOSURE_PENDING') {
      return false;
    }

    // Status filter (Applies to all roles under Resolved tab)
    if (appliedStatuses.length > 0) {
      if (!card.status || !appliedStatuses.includes(card.status)) {
        return false;
      }
    }

    // Date Range filter (Applies to all roles under Resolved tab)
    if (appliedDateOption !== null) {
      const cardDate = parseDateString(card.resolvedDate);
      if (!cardDate) return false;

      if (appliedDateOption === '7') {
        const diffTime = mockCurrentDate.getTime() - cardDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 7) return false;
      } else if (appliedDateOption === '14') {
        const diffTime = mockCurrentDate.getTime() - cardDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 14) return false;
      } else if (appliedDateOption === '21') {
        const diffTime = mockCurrentDate.getTime() - cardDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays < 0 || diffDays > 21) return false;
      } else if (appliedDateOption === 'custom') {
        const fromDate = parseInputDate(appliedFromDate);
        const toDate = parseInputDate(appliedToDate);
        if (fromDate && cardDate < fromDate) return false;
        if (toDate && cardDate > toDate) return false;
      }
    }

    // Category filter (Applies to all roles under Resolved tab)
    if (appliedCategories.length > 0) {
      if (!card.beneficiaryType || !appliedCategories.includes(card.beneficiaryType)) {
        return false;
      }
    }

    return true;
  });

  const showDocs = assignedFilter === 'CDPO';
  const awaitingClosureCount = myResolvedCards.filter((c) => c.awaitingCdpoClosure).length;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* Status Bar */}
      <StatusBar_ />

      {/* Header */}
      <Header onBack={onBack} />

      {/* Sub Header */}
      <SubHeader />

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Summary Table */}
        <SummaryTable
          pendingFilter={pendingModalVisible}
          resolvedFilter={resolvedModalVisible}
          onPendingFilter={() => setPendingModalVisible(true)}
          onResolvedFilter={() => setResolvedModalVisible(true)}
        />

        {/* Assigned To Filter */}
        <AssignedToFilter
          selected={assignedFilter}
          onSelect={(val) => {
            setAssignedFilter(val);
            // Clear filters when role changes
            setIsOverdueActive(false);
            setAppliedDateOption(null);
            setAppliedFromDate('');
            setAppliedToDate('');
            setAppliedTypes([]);
            setAppliedCategories([]);
            setAppliedStatuses([]);
          }}
        />

        {/* Sector dropdown (Supervisor chip) or Anganwadi Centre dropdown (AWW chip) — above tabs */}
        {assignedFilter === 'Supervisor' && (
          <SectorDropdown value={selectedSector} onPress={() => setSectorPickVisible(true)} />
        )}
        {assignedFilter === 'AWW' && (
          <AnganwadiCentreDropdown value={selectedAWC} onPress={() => setAwcPickVisible(true)} />
        )}

        {/* Tab Bar */}
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          pendingCount={displayedPendingCards.length}
          resolvedCount={displayedResolvedCards.length}
        />

        {/* Filter Chips */}
        <FilterChips
          activeTab={activeTab}
          assignedFilter={assignedFilter}
          isOverdueActive={isOverdueActive}
          onOverdueToggle={() => setIsOverdueActive((v) => !v)}
          onClearAll={() => {
            setIsOverdueActive(false);
            setAppliedDateOption(null);
            setAppliedFromDate('');
            setAppliedToDate('');
            setAppliedTypes([]);
            setAppliedCategories([]);
            setAppliedStatuses([]);
          }}
          appliedDateOption={appliedDateOption}
          appliedTypes={appliedTypes}
          appliedCategories={appliedCategories}
          appliedStatuses={appliedStatuses}
          onDateRangePress={() => setDateRangeModalVisible(true)}
          onTypePress={() => setTypeModalVisible(true)}
          onCategoryPress={() => setCategoryModalVisible(true)}
          onStatusPress={() => setStatusModalVisible(true)}
          onClearDateRange={() => {
            setAppliedDateOption(null);
            setAppliedFromDate('');
            setAppliedToDate('');
          }}
          onClearType={() => setAppliedTypes([])}
          onClearCategory={() => setAppliedCategories([])}
          onClearStatus={() => setAppliedStatuses([])}
        />

        {/* Awaiting closure info banner — resolved tab, Supervisor chip */}
        {activeTab === 'Resolved' && assignedFilter === 'Supervisor' && awaitingClosureCount > 0 && (
          <View style={styles.closureBanner}>
            <Text style={styles.closureBannerText}>
              {awaitingClosureCount} ticket{awaitingClosureCount > 1 ? 's' : ''} awaiting your closure — tap a card to close
            </Text>
          </View>
        )}

        {/* Cards */}
        <View style={styles.cardList}>
          {activeTab === 'Pending'
            ? displayedPendingCards.map((card) => (
                <TicketCardComponent
                  key={card.id}
                  card={card}
                  showDocs={showDocs}
                  onPress={() => setSelectedTicket({ ...card, isPendingTicket: true })}
                />
              ))
            : displayedResolvedCards.map((card) => (
                <ResolvedTicketCardComponent
                  key={card.id}
                  card={card}
                  onPress={() => setSelectedTicket(card)}
                />
              ))}
        </View>
      </ScrollView>

      {/* Inline bottom sheets */}
      <PendingBreakdownSheet
        visible={pendingModalVisible}
        onClose={() => setPendingModalVisible(false)}
      />
      <ResolvedBreakdownSheet
        visible={resolvedModalVisible}
        onClose={() => setResolvedModalVisible(false)}
      />

      {/* Date Range & Type Filter Sheets */}
      <DateRangeFilterSheet
        visible={dateRangeModalVisible}
        onClose={() => setDateRangeModalVisible(false)}
        appliedOption={appliedDateOption}
        appliedFrom={appliedFromDate}
        appliedTo={appliedToDate}
        onApply={(opt, from, to) => {
          setAppliedDateOption(opt);
          setAppliedFromDate(from);
          setAppliedToDate(to);
          setDateRangeModalVisible(false);
        }}
      />

      <TypeFilterSheet
        visible={typeModalVisible}
        onClose={() => setTypeModalVisible(false)}
        appliedTypes={appliedTypes}
        onApply={(types) => {
          setAppliedTypes(types);
          setTypeModalVisible(false);
        }}
      />

      <CategoryFilterSheet
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        appliedCategories={appliedCategories}
        onApply={(categories) => {
          setAppliedCategories(categories);
          setCategoryModalVisible(false);
        }}
      />

      <StatusFilterSheet
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        appliedStatuses={appliedStatuses}
        assignedFilter={assignedFilter}
        onApply={(statuses) => {
          setAppliedStatuses(statuses);
          setStatusModalVisible(false);
        }}
      />

      {/* Sector & AWC Pick Sheets */}
      <DropdownPickSheet
        visible={sectorPickVisible}
        title="Select Sector"
        options={SECTOR_OPTIONS}
        selected={selectedSector}
        onSelect={(val) => {
          setSelectedSector(val);
          // Reset AWC when sector changes
          setSelectedAWC('All Centres');
        }}
        onClose={() => setSectorPickVisible(false)}
      />
      <DropdownPickSheet
        visible={awcPickVisible}
        title="Select Anganwadi Centre"
        options={AWC_OPTIONS}
        selected={selectedAWC}
        onSelect={setSelectedAWC}
        onClose={() => setAwcPickVisible(false)}
      />

      {/* Ticket Details overlay */}
      {selectedTicket && (
        <TicketDetailsOverlay
          card={selectedTicket}
          assignedFilter={assignedFilter}
          onBack={() => setSelectedTicket(null)}
          onResolveTicket={handleResolveTicket}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },

  // ── Status Bar
  statusBar: {
    height: 24,
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  statusTime: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 21,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusIcon16: { width: 16, height: 12 },
  statusIcon14: { width: 14, height: 12 },
  statusIcon20: { width: 20, height: 12 },

  // ── Header
  header: {
    height: 56,
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 29,
    height: 24,
    justifyContent: 'center',
  },
  backIcon: { width: 29, height: 24, tintColor: '#ffffff' },
  headerTitle: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
  },
  headerSpacer: { width: 24, height: 24 },

  // ── SubHeader
  subHeader: {
    height: 36,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  subHeaderText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    color: '#5c5c5c',
    lineHeight: 18,
  },
  subHeaderSeparator: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#bdbdbd',
    lineHeight: 18,
  },

  // ── Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // ── Summary
  summarySection: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  summaryLabel: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 10,
    color: '#1a237e',
    letterSpacing: 0.8,
    lineHeight: 15,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryHeaderRow: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    height: 36,
  },
  summaryDataRow: {
    borderBottomWidth: 1,
    height: 44.5,
  },
  summaryCol0: {
    width: 90,
    paddingHorizontal: 10,
    paddingVertical: 9,
    justifyContent: 'center',
  },
  summaryColBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 10,
    gap: 3,
  },
  summaryColBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  chevronText: {
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '600',
  },
  summaryColData: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRowLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#5c5c5c',
    lineHeight: 18,
  },
  summaryDataValue: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 17,
    lineHeight: 25.5,
  },

  // ── Assigned To
  assignedToRow: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  assignedToLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 11,
    color: '#9e9e9e',
    lineHeight: 16.5,
  },
  assignedChips: {
    flexDirection: 'row',
    gap: 8,
  },
  assignedChip: {
    height: 28,
    borderRadius: 100,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  assignedChipActive: {
    backgroundColor: '#1a237e',
  },
  assignedChipInactive: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bdbdbd',
  },
  assignedChipText: {
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  assignedChipTextActive: {
    fontWeight: '600',
    color: '#ffffff',
  },
  assignedChipTextInactive: {
    fontWeight: '400',
    color: '#757575',
  },

  // ── Tab Bar
  tabBar: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 14,
    paddingBottom: 12,
  },
  tabText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    color: '#5c5c5c',
    lineHeight: 21,
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#1a237e',
  },
  tabBadge: {
    height: 18,
    minWidth: 22,
    borderRadius: 9,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: { backgroundColor: '#1a237e' },
  tabBadgeInactive: { backgroundColor: '#eeeeee' },
  tabBadgeText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 16.5,
    textAlign: 'center',
  },
  tabBadgeTextActive: { color: '#ffffff' },
  tabBadgeTextInactive: { color: '#757575' },
  tabUnderline: {
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: { backgroundColor: '#1a237e' },

  // ── Filter Chips
  filterRow: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 8,
  },
  filterChip: {
    height: 32,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 13,
    paddingVertical: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 13,
    color: '#424242',
    lineHeight: 19.5,
  },
  filterChipOverdueActive: {
    backgroundColor: '#c62828',
    borderColor: '#c62828',
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChipTextActive: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: '#ffffff',
    lineHeight: 19.5,
  },
  filterChipClose: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 19.5,
  },
  clearAllRow: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clearAllText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    color: '#1a237e',
    lineHeight: 18,
  },

  // ── Card List
  cardList: {
    paddingHorizontal: 12,
    paddingTop: 12,
    gap: 10,
  },

  // ── Ticket Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTicketNum: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    color: '#9e9e9e',
    lineHeight: 16.5,
  },
  overdueBadge: {
    backgroundColor: '#d32f2f',
    borderRadius: 4,
    paddingHorizontal: 8,
    height: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overdueBadgeText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 10,
    color: '#ffffff',
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beneficiaryName: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 15,
    color: '#181818',
    lineHeight: 22.5,
  },
  beneficiaryTag: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beneficiaryTagText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 10,
    color: '#5c5c5c',
  },
  topicRow: {
    flexDirection: 'column',
    gap: 2,
  },
  topicText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: '#2d2d2d',
    lineHeight: 19.5,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: '#181818',
    lineHeight: 18.2,
  },
  cardDescription: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#757575',
    lineHeight: 18,
  },
  cardDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardDate: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#5c5c5c',
    lineHeight: 18,
  },
  daysBadge: {
    height: 24.5,
    borderRadius: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daysBadgeText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 16.5,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  awcInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  awcLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#9e9e9e',
  },
  awcName: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    color: '#424242',
  },
  docChip: {
    backgroundColor: '#e9f1ff',
    borderWidth: 1,
    borderColor: '#9cb6f5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docChipText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    color: '#2e4ab5',
  },
  docsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#e8eaf6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  docsIcon: { width: 13, height: 13 },
  docsText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 11,
    color: '#1a237e',
    lineHeight: 16.5,
  },
  cardByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardByLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#9e9e9e',
    lineHeight: 18,
  },
  cardByName: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    color: '#424242',
    lineHeight: 18,
  },

  // ── Closure info banner
  closureBanner: {
    backgroundColor: '#fff3e0',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closureBannerText: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    color: '#e65100',
    lineHeight: 18,
  },
  filterChipActive: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// ─── Resolved Card Styles ─────────────────────────────────────────────────────

const resolvedCardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    gap: 8,
    padding: 16,
  },
  cardAwaitingClosure: {
    borderColor: '#ffe082',
    borderWidth: 1.5,
  },
  awaitingClosureRow: {
    marginHorizontal: -16,
    marginTop: -16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#fff8e1',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe082',
  },
  awaitingClosureText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 11,
    color: '#f57f17',
    lineHeight: 16.5,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketNum: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    color: '#9e9e9e',
    lineHeight: 16.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  statusIcon: {
    fontSize: 11,
    lineHeight: 15,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  beneficiaryName: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 15,
    color: '#181818',
    lineHeight: 22.5,
  },
  beneficiaryTag: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  beneficiaryTagText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 10,
    color: '#5c5c5c',
  },
  topicBlock: {
    gap: 2,
  },
  topicText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: '#2d2d2d',
    lineHeight: 19.5,
  },
  descriptionText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#757575',
    lineHeight: 18,
  },
  resolvedDate: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    color: '#2e7d32',
    lineHeight: 18,
  },
  actionBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 10,
    gap: 4,
  },
  actionLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 9,
    color: '#9e9e9e',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    lineHeight: 13.5,
  },
  actionText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#424242',
    lineHeight: 18,
  },
  awcRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  awcLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#9e9e9e',
  },
  awcName: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 12,
    color: '#424242',
  },
  // Sector / Anganwadi Dropdown
  dropdownWrapper: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownTextBlock: {
    flex: 1,
  },
  dropdownLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 9,
    color: '#9e9e9e',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    lineHeight: 13.5,
    marginBottom: 2,
  },
  dropdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a237e',
  },
  dropdownValue: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    color: '#212121',
    lineHeight: 21,
  },
  dropdownChevron: {
    width: 16,
    height: 16,
  },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  // ── Inline overlay (stays within the 375px phone frame)
  inlineOverlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
  },
  inlineBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  inlineDismiss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  inlineSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 491,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },

  // ── Handle
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e0e0e0',
  },

  // ── Title bar
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  sheetTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 15,
    color: '#1a237e',
    lineHeight: 22.5,
  },
  closeIcon: { width: 18, height: 18 },

  // ── Sheet body
  sheetBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 0,
  },

  // ── Pending total card
  totalCard: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  totalLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    lineHeight: 16.5,
  },
  totalValue: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 32,
    lineHeight: 34,
    marginTop: 2,
  },

  // ── Resolved total card (row layout)
  resolvedTotalCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // ── Pending breakdown table
  tableWrapper: {
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableHeaderRow: {
    backgroundColor: '#f9f9fb',
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  tableColRole: {
    width: 110,
    paddingLeft: 14,
    justifyContent: 'center',
    height: 36,
  },
  tableColStat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeaderCell: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    color: '#9e9e9e',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRoleText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#424242',
  },
  tableStatVal: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 20,
    lineHeight: 30,
  },

  // ── Pending total card & table (matches Supervisor view for uniformity)
  pendingTotalCard: { borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pendingTotalLabel: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  pendingTotalValue: { fontFamily: 'Inter', fontWeight: '700', fontSize: 28 },
  pendingTableWrapper: { marginTop: 16, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  pendingTableRow: { flexDirection: 'row', alignItems: 'center' },
  pendingTableHeaderRow: { height: 40, backgroundColor: '#f5f5f5' },
  pendingTableColRole: { width: 120, paddingHorizontal: 12 },
  pendingTableColStat: { flex: 1, alignItems: 'center' },
  pendingTableHeaderCell: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: '#757575' },
  pendingTableRoleText: { fontFamily: 'Inter', fontWeight: '400', fontSize: 13, color: '#5c5c5c' },
  pendingTableStatVal: { fontFamily: 'Inter', fontWeight: '700', fontSize: 18, textAlign: 'center' },

  // ── Help note
  helpNote: {
    backgroundColor: '#f5f6fb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e6f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
  },
  helpNoteText: {
    fontFamily: 'Inter',
    fontSize: 11,
    lineHeight: 16,
    color: '#5c6470',
  },
  helpNoteHighlight: {
    fontWeight: '700',
    color: '#d32f2f',
  },

  // ── Resolved sub-cards (matches Supervisor view for uniformity)
  subCard: {
    width: '47.5%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  subCardLabel: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 9,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  subCardValue: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 8,
  },
  subCardDivider: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  subCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subCardRowLabel: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    opacity: 0.75,
  },
  subCardRowVal: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 13,
  },
});
