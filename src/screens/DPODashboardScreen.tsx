import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Animated,
} from 'react-native';
import BeneficiaryRedressalScreen, {
  TicketCard,
  ResolvedTicketCard,
  AssignedFilter,
  pendingCards,
  resolvedCards,
  TicketCardComponent,
  ResolvedTicketCardComponent,
  DateRangeFilterSheet,
  TypeFilterSheet,
} from './BeneficiaryRedressalScreen';
import TicketDetailsScreen from './TicketDetailsScreen';
// ─── Assets (reused from Figma MCP) ─────────────────────────────────────────
const imgIcon        = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/reception-4.svg';
const imgIcon1       = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/wifi.svg';
const imgIcon2       = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/battery-full.svg';
const imgBackIcon    = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/arrow-left.svg';
const imgDocIcon     = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/file-earmark-pdf-fill.svg';
const imgCloseIcon   = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/x.svg';

// ─── Types ────────────────────────────────────────────────────────────────────
type DPOTab       = 'Overdue' | 'Appealed';
type AssignFilter = 'DPO' | 'CDPO' | 'Supervisor' | 'AWW';
type ResolutionCategory = 'Action Taken' | 'Closed – No Action' | 'Referred to Higher Authority';
type AppealDecision = 'uphold' | 'dismiss' | null;

interface OverdueTicket {
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

interface AppealTicket {
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

// ─── Sample Data ──────────────────────────────────────────────────────────────
const overdueTickets: OverdueTicket[] = [
  {
    id: 'o1',
    ticketNumber: 'Ticket# AWW 001243',
    roleLabel: 'AWW',
    title: 'Misappropriation of THR Distribution Funds',
    description:
      'AWW at Anganwadi Centre 3 has reportedly been collecting THR payments from beneficiaries without distributing actual supplies.',
    submittedDate: 'Submitted: 27/05/2025',
    overdueDays: 22,
    documents: '3 documents',
    byName: 'Kamla Devi',
    complaintType: 'Corruption',
  },
  {
    id: 'o2',
    ticketNumber: 'Ticket# AWW 001255',
    roleLabel: 'AWW',
    title: 'Ghost Beneficiary Enrollment to Inflate Coverage',
    description:
      'Inactive and relocated beneficiaries found active in records. AWW in Sector 5 maintaining ghost entries for nutrition supply inflation.',
    submittedDate: 'Submitted: 05/06/2025',
    overdueDays: 13,
    documents: '2 documents',
    byName: 'Anonymous',
    complaintType: 'Corruption',
  },
  {
    id: 'o3',
    ticketNumber: 'Ticket# SUP 000891',
    roleLabel: 'Supervisor',
    title: 'Missing ECCE Materials from Sector 3',
    description:
      'ECCE materials dispatched from district store not received at Sector 3 AWCs. Supervisor has not filed FIR or initiated enquiry despite 3 reminders.',
    submittedDate: 'Submitted: 15/06/2025',
    overdueDays: 3,
    byName: 'Supervisor Priya Devi',
    complaintType: 'Corruption',
  },
  {
    id: 'o4',
    ticketNumber: 'Ticket# AWW 001267',
    roleLabel: 'AWW',
    title: 'Severe Water Supply Issue at Anganwadi Centre 7',
    description:
      'AWC in Sector 4 has had no running water for over a month. Beneficiaries and children are being serviced in unhygienic conditions.',
    submittedDate: 'Submitted: 28/05/2025',
    overdueDays: 21,
    documents: '1 document',
    byName: 'Sunita Rani',
    complaintType: 'Urgent',
  },
  {
    id: 'o5',
    ticketNumber: 'Ticket# DPO 000100',
    roleLabel: 'DPO',
    title: 'District Redressal Policy Drafting',
    description:
      'Drafting new guidelines for Anganwadi grievance redressal portal integration and escalations.',
    submittedDate: 'Submitted: 02/06/2025',
    overdueDays: 16,
    documents: '1 document',
    byName: 'DPO Admin',
    complaintType: 'Others',
  },
];

const appealTickets: AppealTicket[] = [
  {
    id: 'a1',
    ticketNumber: 'Ticket# CDPO 001234',
    roleLabel: 'CDPO',
    title: 'Misappropriation of THR Distribution Funds',
    originalDescription:
      'AWW collecting THR payments without distributing actual supplies. Multiple beneficiary complaints received.',
    appealReason:
      'CDPO has marked this ticket as resolved without any physical verification or action on the AWW. The issue persists at ground level.',
    submittedDate: 'Submitted: 25/06/2025',
    appealDate: 'Appeal Filed: 28/06/2025',
    documents: '2 documents',
    byName: 'Kamla Devi',
    complaintType: 'Corruption',
    originalActionTaken: 'Enquiry conducted at Anganwadi Centre 3. Rations distribution register verified and found up to date. No misappropriation detected.',
  },
  {
    id: 'a2',
    ticketNumber: 'Ticket# AWW 001189',
    roleLabel: 'AWW',
    title: 'Denial of Maternity Benefit Payment',
    originalDescription:
      'Beneficiary in 3rd trimester denied maternity benefits citing documentation issues. AWW refused to assist.',
    appealReason:
      'AWW resolved the ticket without disbursing benefits. Documents were in order and no valid reason was given for denial.',
    submittedDate: 'Submitted: 20/06/2025',
    appealDate: 'Appeal Filed: 25/06/2025',
    byName: 'Rekha Sharma',
    complaintType: 'Others',
    originalActionTaken: 'Application rejected due to mismatch of name in Aadhaar card and Bank passbook. Beneficiary advised to correct document first.',
  },
  {
    id: 'a3',
    ticketNumber: 'Ticket# SUP 000756',
    roleLabel: 'Supervisor',
    title: 'Improper Handling of Nutrition Complaint',
    originalDescription:
      'Children at AWC showing severe stunting. Supervisor instructed to investigate nutrition programme irregularities.',
    appealReason:
      'Supervisor marked complaint resolved without visiting the AWC. Photographs from the site confirm the situation is unchanged.',
    submittedDate: 'Submitted: 15/06/2025',
    appealDate: 'Appeal Filed: 22/06/2025',
    documents: '4 documents',
    byName: 'Dr. Suresh Mehta (PHC)',
    complaintType: 'Others',
    originalActionTaken: 'Visited AWC and checked growth registers. Nutrition distribution was verified with local beneficiaries.',
  },
  {
    id: 'a4',
    ticketNumber: 'Ticket# SUP 787868898904',
    roleLabel: 'Supervisor',
    title: 'Vaccination not administered on scheduled date at sub-health centre',
    originalDescription:
      'Vaccination rescheduled with PHC medical officer. Child vaccinated on 11 Jun 2025 — DPT booster and OPV administered.',
    appealReason:
      'Sub-health centre was closed on scheduled date. Supervisor marked resolved after child got vaccinated, but no action was taken on staff absence.',
    submittedDate: 'Submitted: 08/06/2025',
    appealDate: 'Appeal Filed: 14/06/2025',
    byName: 'Geeta Sharma',
    status: 'resolved',
    decision: 'dismiss',
    resolutionNotes:
      'Appeal reviewed on 12 Jun 2025. Vaccination records verified at PHC — DPT booster and OPV confirmed administered on 11 Jun 2025. Immunisation card entries are accurate and complete. Resolution by Supervisor upheld. Appeal resolved in favour of existing resolution.',
    complaintType: 'Others',
    originalActionTaken: 'Vaccination rescheduled with PHC medical officer. Child vaccinated on 11 Jun 2025.',
  },
  {
    id: 'a5',
    ticketNumber: 'Ticket# AWW 001290',
    roleLabel: 'AWW',
    title: 'Delay in Growth Monitoring Device Supply',
    originalDescription:
      'Anganwadi Centre lacks functional weighing scales and height boards for children.',
    appealReason:
      'AWW marked resolved saying devices ordered, but actual delivery has not happened for 3 months.',
    submittedDate: 'Submitted: 12/06/2025',
    appealDate: 'Appeal Filed: 18/06/2025',
    byName: 'Sita Devi',
    complaintType: 'Others',
    originalActionTaken: 'Placed procurement order for weighing scales and height boards with central stores.',
  },
  {
    id: 'a6',
    ticketNumber: 'Ticket# CDPO 001311',
    roleLabel: 'CDPO',
    title: 'Non-disbursal of KSY Scholarship Funds',
    originalDescription:
      'Adolescent girls registered under KSY in Sector 2 have not received scholarship stipends.',
    appealReason:
      'CDPO closed the file stating treasury limits reached, without forwarding escalation request to district office.',
    submittedDate: 'Submitted: 10/06/2025',
    appealDate: 'Appeal Filed: 20/06/2025',
    byName: 'Radha Bai',
    complaintType: 'Others',
    originalActionTaken: 'KSY scholarship files verified. Disbursal pending from state treasury limits.',
  },
  {
    id: 'a7',
    ticketNumber: 'Ticket# SUP 000840',
    roleLabel: 'Supervisor',
    title: 'Delayed Mid-Day Meal Ration Disbursal',
    originalDescription:
      'Rations for hot cooked meals not supplied on time, leading to disruption of services.',
    appealReason:
      'Supervisor marked resolved saying temporary supply arranged, but quality of supply is extremely sub-standard.',
    submittedDate: 'Submitted: 04/06/2025',
    appealDate: 'Appeal Filed: 15/06/2025',
    byName: 'Sunita Choudhary',
    complaintType: 'Urgent',
    originalActionTaken: 'Arranged alternative ration buffer supply from Sector 3 storage facility.',
  },
  {
    id: 'a8',
    ticketNumber: 'Ticket# AWW 001330',
    roleLabel: 'AWW',
    title: 'Severe Infrastructure Issues at AWC 4',
    originalDescription:
      'AWC building ceiling is leaking severely, posing safety hazard to toddlers.',
    appealReason:
      'AWW marked resolved saying minor patch work completed, but entire roof remains structurally unsafe.',
    submittedDate: 'Submitted: 01/06/2025',
    appealDate: 'Appeal Filed: 12/06/2025',
    byName: 'Priyanka Sen',
    complaintType: 'Urgent',
    originalActionTaken: 'Conducted minor cement plaster patch work on the ceiling to prevent immediate leakage.',
  },
  {
    id: 'a9',
    ticketNumber: 'Ticket# SUP 000882',
    roleLabel: 'Supervisor',
    title: 'Incomplete Health Checks under VHSND',
    originalDescription:
      'VHSND sessions held without auxiliary nurse midwives (ANMs), resulting in missed antenatal checks.',
    appealReason:
      'Supervisor closed ticket stating ANM availability resolved, but sessions are still being held without ANM.',
    submittedDate: 'Submitted: 29/05/2025',
    appealDate: 'Appeal Filed: 10/06/2025',
    byName: 'Kiran Yadav',
    complaintType: 'Others',
    originalActionTaken: 'ANM instructed to ensure presence in all upcoming Sector 2 VHSND sessions.',
  },
  {
    id: 'a10',
    ticketNumber: 'Ticket# CDPO 001389',
    roleLabel: 'CDPO',
    title: 'Misleading Records for Supplementary Nutrition',
    originalDescription:
      'Records show full distribution of Take Home Ration, but beneficiaries received only half allocation.',
    appealReason:
      'CDPO marked resolved stating distribution discrepancy clarified, but no audit was carried out.',
    submittedDate: 'Submitted: 22/05/2025',
    appealDate: 'Appeal Filed: 05/06/2025',
    byName: 'Maya Sharma',
    complaintType: 'Corruption',
    originalActionTaken: 'Cross-verified register entries with the distributor reports and found no discrepancy.',
  },
  {
    id: 'a11',
    ticketNumber: 'Ticket# AWW 001420',
    roleLabel: 'AWW',
    title: 'Delayed VHSND Immunisation Rollout',
    originalDescription:
      'Grievance regarding missing immunisation vials for BCG and DPT scheduled drives.',
    appealReason:
      'AWW closed ticket citing vials received, but vaccination drive has been postponed indefinitely.',
    submittedDate: 'Submitted: 18/05/2025',
    appealDate: 'Appeal Filed: 02/06/2025',
    byName: 'Pooja Soni',
    complaintType: 'Urgent',
    originalActionTaken: 'Verified allocation of BCG and DPT vials with the district health warehouse.',
  },
];

// ─── Animation Hook ───────────────────────────────────────────────────────────
const useSheetAnim = (visible: boolean) => {
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(700)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 700, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        slideAnim.setValue(700);
        fadeAnim.setValue(0);
      });
    }
  }, [visible]);

  return { slideAnim, fadeAnim, mounted };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const DPOStatusBar_ = () => (
  <View style={s.statusBar}>
    <Text style={s.statusTime}>9:41</Text>
    <View style={s.statusIcons}>
      <Image source={{ uri: imgIcon  }} style={s.sIcon16} />
      <Image source={{ uri: imgIcon1 }} style={s.sIcon14} />
      <Image source={{ uri: imgIcon2 }} style={s.sIcon20} />
    </View>
  </View>
);

const DPOHeader = ({ onBack }: { onBack?: () => void }) => (
  <View style={s.header}>
    <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
      <Image source={{ uri: imgBackIcon }} style={s.backIcon} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>Beneficiary Redressal</Text>
    <View style={s.dpoBadge}>
      <Text style={s.dpoBadgeText}>DPO</Text>
    </View>
  </View>
);

const DPOSubHeader = () => (
  <View style={s.subHeader}>
    <Text style={s.subHeaderText}>District: Jaipur</Text>
    <Text style={s.subHeaderSep}>|</Text>
    <Text style={s.subHeaderText}>5 Projects</Text>
  </View>
);

const DPOSummaryTable = ({
  onPendingFilter,
  onResolvedFilter,
}: {
  onPendingFilter: () => void;
  onResolvedFilter: () => void;
}) => (
  <View style={s.summarySection}>
    <Text style={s.summaryLabel}>SUMMARY</Text>
    <View style={s.summaryCard}>
      {/* Header */}
      <View style={[s.sRow, s.sHeaderRow]}>
        <View style={s.sCol0} />
        <TouchableOpacity style={s.sColBtn} onPress={onPendingFilter} activeOpacity={0.7}>
          <Text style={[s.sColBtnText, { color: '#e65100' }]}>PENDING</Text>
          <Text style={[s.chevronTxt, { color: '#e65100' }]}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.sColBtn} onPress={onResolvedFilter} activeOpacity={0.7}>
          <Text style={[s.sColBtnText, { color: '#2e7d32' }]}>RESOLVED</Text>
          <Text style={[s.chevronTxt, { color: '#2e7d32' }]}>▾</Text>
        </TouchableOpacity>
        <View style={s.sColBtn}>
          <Text style={[s.sColBtnText, { color: '#1a237e' }]}>TOTAL</Text>
        </View>
      </View>

      {[
        { label: 'DPO',        pending: '4',     resolved: '4',     total: '8' },
        { label: 'CDPO',       pending: '7',     resolved: '5',     total: '12' },
        { label: 'Supervisor', pending: '50',    resolved: '150',    total: '200' },
        { label: 'AWW',        pending: '2,000', resolved: '1,000', total: '3,000' },
      ].map((row, i, arr) => (
        <View
          key={row.label}
          style={[s.sRow, s.sDataRow, { borderBottomColor: i < arr.length - 1 ? '#f5f5f5' : '#e0e0e0' }]}
        >
          <View style={s.sCol0}><Text style={s.sRowLabel}>{row.label}</Text></View>
          <View style={s.sColData}><Text style={[s.sDataVal, { color: '#e65100' }]}>{row.pending}</Text></View>
          <View style={s.sColData}><Text style={[s.sDataVal, { color: '#2e7d32' }]}>{row.resolved}</Text></View>
          <View style={s.sColData}><Text style={[s.sDataVal, { color: '#1a237e' }]}>{row.total}</Text></View>
        </View>
      ))}

      {/* Total Row */}
      <View style={[s.sRow, s.sDataRow, { borderBottomWidth: 0 }]}>
        <View style={s.sCol0}><Text style={[s.sRowLabel, { fontWeight: '600', color: '#1a237e' }]}>Total</Text></View>
        <View style={s.sColData}><Text style={[s.sDataVal, { color: '#e65100' }]}>2,061</Text></View>
        <View style={s.sColData}><Text style={[s.sDataVal, { color: '#2e7d32' }]}>1,159</Text></View>
        <View style={s.sColData}><Text style={[s.sDataVal, { color: '#1a237e' }]}>3,220</Text></View>
      </View>
    </View>
  </View>
);

// ─── Assign Filter ────────────────────────────────────────────────────────────

const DPOAssignFilter = ({
  selected,
  onSelect,
}: {
  selected: AssignFilter;
  onSelect: (v: AssignFilter) => void;
}) => (
  <View style={s.assignRow}>
    <Text style={s.assignLabel}>Assigned To</Text>
    <View style={s.assignChips}>
      {(['DPO', 'CDPO', 'Supervisor', 'AWW'] as AssignFilter[]).map(item => (
        <TouchableOpacity
          key={item}
          style={[s.assignChip, selected === item ? s.chipActive : s.chipInactive]}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <Text style={[s.chipText, selected === item ? s.chipTextActive : s.chipTextInactive]}>
            {item === 'DPO' ? 'Me' : item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

const DPOTabBar = ({
  active,
  onChange,
}: {
  active: DPOTab;
  onChange: (t: DPOTab) => void;
}) => (
  <View style={s.tabBar}>
    {(['Overdue', 'Appealed'] as DPOTab[]).map(tab => (
      <TouchableOpacity key={tab} style={s.tabItem} onPress={() => onChange(tab)} activeOpacity={0.8}>
        <View style={s.tabContent}>
          <Text style={[s.tabText, active === tab && s.tabTextActive]}>{tab}</Text>
          <View style={[s.tabBadge, active === tab ? s.tabBadgeOn : s.tabBadgeOff]}>
            <Text style={[s.tabBadgeTxt, active === tab ? s.tabBadgeTxtOn : s.tabBadgeTxtOff]}>
              {tab === 'Overdue' ? '516' : '92'}
            </Text>
          </View>
        </View>
        <View style={[s.tabUnderline, active === tab && s.tabUnderlineActive]} />
      </TouchableOpacity>
    ))}
  </View>
);

const CDPOTabBar = ({
  active,
  onChange,
  showAppealTab,
  appealCount,
  overdueCount,
  pendingCount,
  resolvedCount,
}: {
  active: 'Pending' | 'Overdue' | 'Resolved' | 'Appeal Pending';
  onChange: (t: 'Pending' | 'Overdue' | 'Resolved' | 'Appeal Pending') => void;
  showAppealTab?: boolean;
  appealCount?: number;
  overdueCount?: number;
  pendingCount?: number;
  resolvedCount?: number;
}) => {
  const tabs: ('Pending' | 'Overdue' | 'Resolved' | 'Appeal Pending')[] = showAppealTab
    ? ['Pending', 'Overdue', 'Resolved', 'Appeal Pending']
    : ['Pending', 'Resolved'];

  const isFourTabs = tabs.length === 4;

  const formatCountStr = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return String(num);
  };

  const getCount = (tab: string) => {
    if (tab === 'Pending') return formatCountStr(pendingCount ?? 7);
    if (tab === 'Overdue') return formatCountStr(overdueCount ?? 0);
    if (tab === 'Resolved') return formatCountStr(resolvedCount ?? 5);
    if (tab === 'Appeal Pending') return formatCountStr(appealCount ?? 0);
    return '0';
  };

  return (
    <View style={s.tabBar}>
      {tabs.map(tab => (
        <TouchableOpacity key={tab} style={s.tabItem} onPress={() => onChange(tab)} activeOpacity={0.8}>
          <View style={[s.tabContent, isFourTabs && { gap: 4 }]}>
            <Text style={[s.tabText, active === tab && s.tabTextActive, isFourTabs && { fontSize: 12 }]}>
              {tab === 'Appeal Pending' ? 'Appeals' : tab}
            </Text>
            <View style={[s.tabBadge, active === tab ? s.tabBadgeOn : s.tabBadgeOff, isFourTabs && { minWidth: 18, height: 16, borderRadius: 8, paddingHorizontal: 4 }]}>
              <Text style={[s.tabBadgeTxt, active === tab ? s.tabBadgeTxtOn : s.tabBadgeTxtOff, isFourTabs && { fontSize: 9 }]}>
                {getCount(tab)}
              </Text>
            </View>
          </View>
          <View style={[s.tabUnderline, active === tab && s.tabUnderlineActive]} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const FilterChips = ({
  showOverdue,
  isOverdueActive,
  onOverdueToggle,
  appliedDateOption,
  onDateRangePress,
  appliedTypes,
  onTypePress,
  onClearDateRange,
  onClearType,
  isAnyFilterActive,
  onClearAll,
}: {
  showOverdue: boolean;
  isOverdueActive: boolean;
  onOverdueToggle: () => void;
  appliedDateOption: '7' | '14' | '21' | 'custom' | null;
  onDateRangePress: () => void;
  appliedTypes: string[];
  onTypePress: () => void;
  onClearDateRange: () => void;
  onClearType: () => void;
  isAnyFilterActive: boolean;
  onClearAll: () => void;
}) => {
  return (
    <View>
      <View style={s.filterRow}>
        {showOverdue && (
          <TouchableOpacity
            style={[s.filterChip, isOverdueActive && { backgroundColor: '#ffebee', borderColor: '#ef9a9a' }]}
            onPress={onOverdueToggle}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[s.filterChipTxt, isOverdueActive && { color: '#c62828', fontWeight: '600' }]}>Overdue</Text>
              {isOverdueActive && <Text style={{ color: '#c62828', fontSize: 14, fontWeight: 'bold' }}>×</Text>}
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.filterChip, appliedDateOption !== null && { backgroundColor: '#e8eaf6', borderColor: '#c5cae9' }]}
          onPress={onDateRangePress}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[s.filterChipTxt, appliedDateOption !== null && { color: '#1a237e', fontWeight: '600' }]}>
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
                <Text style={{ color: '#1a237e', fontSize: 14, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.filterChip, appliedTypes.length > 0 && { backgroundColor: '#e8eaf6', borderColor: '#c5cae9' }]}
          onPress={onTypePress}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={[s.filterChipTxt, appliedTypes.length > 0 && { color: '#1a237e', fontWeight: '600' }]}>
              {appliedTypes.length === 0
                ? 'Type ▾'
                : appliedTypes.length === 1
                ? appliedTypes[0]
                : `${appliedTypes.length} Types`}
            </Text>
            {appliedTypes.length > 0 && (
              <TouchableOpacity onPress={onClearType} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                <Text style={{ color: '#1a237e', fontSize: 14, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
      {isAnyFilterActive && (
        <TouchableOpacity
          style={{
            backgroundColor: '#ffffff',
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          }}
          onPress={onClearAll}
          activeOpacity={0.7}
        >
          <Text style={{
            fontFamily: 'Inter',
            fontWeight: '500',
            fontSize: 12,
            color: '#1a237e',
          }}>
            Clear all
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Cards UI helper ──────────────────────────────────────────────────────────

const getRoleChipStyles = (role: string) => {
  switch (role.toUpperCase()) {
    case 'CDPO':
      return { bg: '#e3f2fd', border: '#90caf9', text: '#1565c0' };
    case 'SUPERVISOR':
      return { bg: '#f3e5f5', border: '#ce93d8', text: '#7b1fa2' };
    case 'AWW':
      return { bg: '#e8f5e9', border: '#a5d6a7', text: '#2e7d32' };
    default:
      return { bg: '#e8eaf6', border: '#90caf9', text: '#1a237e' };
  }
};

// ─── Overdue Card ─────────────────────────────────────────────────────────────

const OverdueCard = ({
  ticket,
  onView,
  onClose,
}: {
  ticket: OverdueTicket;
  onView: (t: OverdueTicket) => void;
  onClose?: (t: OverdueTicket) => void;
}) => {
  const roleStyle = getRoleChipStyles(ticket.roleLabel);
  return (
    <View style={[s.card, s.overdueCard]}>
      {/* Top row */}
      <View style={s.cardTopRow}>
        <Text style={s.cardTicketNum}>{ticket.ticketNumber}</Text>
      </View>
 
      {/* Role chip */}
      <View style={[s.roleChip, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
        <Text style={[s.roleChipTxt, { color: roleStyle.text }]}>{ticket.roleLabel}</Text>
      </View>
 
      {/* Title */}
      <Text style={s.cardTitle}>{ticket.title}</Text>
 
      {/* Description */}
      <Text style={s.cardDesc} numberOfLines={2}>{ticket.description}</Text>
 
      {/* Date + Overdue days */}
      <View style={s.cardDateRow}>
        <Text style={s.cardDate}>{ticket.submittedDate}</Text>
        <View style={[s.daysBadge, { backgroundColor: '#ffebee' }]}>
          <Text style={[s.daysBadgeTxt, { color: '#d32f2f' }]}>Overdue by {ticket.overdueDays} Days</Text>
        </View>
      </View>
 
      {/* Documents */}
      {ticket.documents && (ticket.complaintType === 'Corruption' || ticket.complaintType === 'Urgent') && (
        <View style={s.docBtn}>
          <Image source={{ uri: imgDocIcon }} style={s.docIcon} />
          <Text style={s.docTxt}>
            {ticket.documents.toLowerCase().includes('1 ') || ticket.documents.toLowerCase() === '1 document' ? 'Doc Uploaded' : ticket.documents}
          </Text>
        </View>
      )}
 
      {/* By */}
      <View style={s.cardByRow}>
        <Text style={s.cardByLabel}>By:</Text>
        <Text style={s.cardByName}>{ticket.byName}</Text>
      </View>
 
      {/* CTA */}
      {ticket.roleLabel === 'DPO' ? (
        <TouchableOpacity style={s.ctaNavy} onPress={() => onClose && onClose(ticket)} activeOpacity={0.8}>
          <Text style={s.ctaNavyTxt}>Close Ticket</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.ctaNavy} onPress={() => onView(ticket)} activeOpacity={0.8}>
          <Text style={s.ctaNavyTxt}>View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Appeal Card ──────────────────────────────────────────────────────────────

const AppealCard = ({
  ticket,
  onResolve,
  onViewDetails,
}: {
  ticket: AppealTicket;
  onResolve: (t: AppealTicket) => void;
  onViewDetails?: (t: AppealTicket) => void;
}) => {
  const roleStyle = getRoleChipStyles(ticket.roleLabel);
  const isResolved = ticket.status === 'resolved';
  return (
    <TouchableOpacity
      style={[s.card, s.appealCard]}
      activeOpacity={isResolved && onViewDetails ? 0.85 : 1}
      onPress={() => isResolved && onViewDetails && onViewDetails(ticket)}
    >
      {/* Top row */}
      <View style={s.cardTopRow}>
        <Text style={s.cardTicketNum}>{ticket.ticketNumber}</Text>
        <View style={[s.appealBadge, isResolved && { backgroundColor: '#2e7d32' }]}>
          <Text style={s.appealBadgeTxt}>
            {isResolved ? 'APPEAL RESOLVED' : 'APPEAL RAISED'}
          </Text>
        </View>
      </View>

      {/* Role chip */}
      <View style={[s.roleChip, { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }]}>
        <Text style={[s.roleChipTxt, { color: roleStyle.text }]}>{ticket.roleLabel}</Text>
      </View>

      {/* Title */}
      <Text style={s.cardTitle}>{ticket.title}</Text>

      {/* Appeal reason */}
      <Text style={s.appealReasonLabel}>Appeal Reason:</Text>
      <Text style={s.appealReasonTxt} numberOfLines={2}>{ticket.appealReason}</Text>

      {/* Dates */}
      <View style={s.cardDateRow}>
        <Text style={s.cardDate}>
          {isResolved
            ? `Closure: ${ticket.appealDate.replace('Appeal Filed: ', '')}`
            : `Closure: ${ticket.appealDate.replace('Appeal Filed: ', '')}`}
        </Text>
      </View>

      {/* Documents */}
      {ticket.documents && (ticket.complaintType === 'Corruption' || ticket.complaintType === 'Urgent') && (
        <View style={s.docBtn}>
          <Image source={{ uri: imgDocIcon }} style={s.docIcon} />
          <Text style={s.docTxt}>
            {ticket.documents.toLowerCase().includes('1 ') || ticket.documents.toLowerCase() === '1 document' ? 'Doc Uploaded' : ticket.documents}
          </Text>
        </View>
      )}

      {/* By */}
      <View style={s.cardByRow}>
        <Text style={s.cardByLabel}>By:</Text>
        <Text style={s.cardByName}>{ticket.byName}</Text>
      </View>

      {/* CTA */}
      {isResolved ? (
        <View style={s.resolvedFooter}>
          <Text style={s.resolvedFooterTxt}>
            ✓  Resolved — {ticket.decision === 'uphold' ? 'Appeal Upheld' : 'Appeal Dismissed'}
          </Text>
        </View>
      ) : (
        <TouchableOpacity style={s.ctaGreen} onPress={() => onResolve(ticket)} activeOpacity={0.8}>
          <Text style={s.ctaGreenTxt}>Resolve Appeal</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

// ─── Pending Breakdown Sheet ──────────────────────────────────────────────────

const PendingBreakdownSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  const rows = [
    { role: 'DPO',         pending: '4',     overdue: '2',   isSeparatorLight: true },
    { role: 'CDPO',        pending: '7',     overdue: '3',   isSeparatorLight: true },
    { role: 'Supervisor',  pending: '50',    overdue: '10',  isSeparatorLight: true },
    { role: 'AWW',         pending: '2,000', overdue: '503', isSeparatorLight: false },
    { role: 'Total',       pending: '2,061', overdue: '518', isTotal: true },
  ];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[ms.sheet, { height: 640, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Pending Breakdown</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>
        <View style={ms.body}>
          {/* Total card */}
          <View style={[ms.pendingTotalCard, { backgroundColor: '#e8eaf6' }]}>
            <Text style={[ms.pendingTotalLabel, { color: '#5c67b5' }]}>TOTAL PENDING</Text>
            <Text style={[ms.pendingTotalValue, { color: '#1a237e' }]}>2,061</Text>
          </View>
          {/* Table */}
          <View style={ms.pendingTableWrapper}>
            <View style={[ms.pendingTableRow, ms.pendingTableHeaderRow]}>
              <View style={ms.pendingTableColRole}><Text style={ms.pendingTableHeaderCell}>ROLE</Text></View>
              <View style={ms.pendingTableColStat}><Text style={[ms.pendingTableHeaderCell, { color: '#e65100' }]}>PENDING</Text></View>
              <View style={ms.pendingTableColStat}><Text style={[ms.pendingTableHeaderCell, { color: '#d32f2f' }]}>OVERDUE</Text></View>
            </View>
            {rows.map(row => (
              <View key={row.role} style={[ms.pendingTableRow, { height: 58, borderBottomWidth: row.isTotal ? 0 : 1, borderBottomColor: '#f5f5f5' }, row.isTotal ? { backgroundColor: '#fafafa' } : {}]}>
                <View style={ms.pendingTableColRole}>
                  <Text style={[ms.pendingTableRoleText, row.isTotal ? { fontWeight: '600', color: '#1a237e' } : {}]}>{row.role}</Text>
                </View>
                <View style={ms.pendingTableColStat}>
                  <Text style={[ms.pendingTableStatVal, { color: '#e65100' }]}>{row.pending}</Text>
                </View>
                <View style={ms.pendingTableColStat}>
                  <Text style={[ms.pendingTableStatVal, { color: '#d32f2f' }]}>{row.overdue}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Help note */}
          <View style={ms.helpNote}>
            <Text style={ms.helpNoteText}>
              <Text style={ms.helpNoteHighlight}>Pending</Text> is the count of tickets still awaiting action. <Text style={ms.helpNoteHighlight}>Overdue</Text> tickets are the grievances which are pending for more than 21 days and need your immediate attention.
            </Text>
          </View>
        </View>
        <View style={{ height: 28 }} />
      </Animated.View>
    </View>
  );
};

// ─── Resolved Breakdown Sheet ───────────────────────────────────────────────────

const ResolvedBreakdownSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  const subCards = [
    {
      label: 'Closure Pending', value: '104', color: '#f57f17',
      bg: '#fff8e1', border: '#ffe082', divider: '#ffe082',
      rows: [{ role: 'DPO', val: '0' }, { role: 'CDPO', val: '1' }, { role: 'Supervisor', val: '3' }, { role: 'AWW', val: '100' }],
    },
    {
      label: 'Closed', value: '867', color: '#2e7d32',
      bg: '#e8f5e9', border: '#a5d6a7', divider: '#a5d6a7',
      rows: [{ role: 'DPO', val: '4' }, { role: 'CDPO', val: '3' }, { role: 'Supervisor', val: '110' }, { role: 'AWW', val: '750' }],
    },
    {
      label: 'Appeal Raised', value: '92', color: '#e65100',
      bg: '#fff3e0', border: '#ffcc80', divider: '#ffcc80',
      rows: [{ role: 'DPO', val: '0' }, { role: 'CDPO', val: '0' }, { role: 'Supervisor', val: '12' }, { role: 'AWW', val: '80' }],
    },
    {
      label: 'Appeal Resolved', value: '79', color: '#1565c0',
      bg: '#e8eaf6', border: '#90caf9', divider: '#90caf9',
      rows: [{ role: 'DPO', val: '0' }, { role: 'CDPO', val: '1' }, { role: 'Supervisor', val: '8' }, { role: 'AWW', val: '70' }],
    },
  ];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[ms.sheet, { height: 550, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={titleRowStyle}>
          <Text style={ms.sheetTitle}>Resolved Breakdown</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>
        <View style={ms.body}>
          {/* Total card */}
          <View style={ms.resolvedTotalCard}>
            <View>
              <Text style={[ms.totalLabel, { color: '#388e3c' }]}>TOTAL RESOLVED</Text>
              <Text style={[ms.totalVal, { color: '#2e7d32' }]}>1,159</Text>
            </View>
            <View style={{ gap: 3, alignItems: 'flex-end' }}>
              {[
                { label: 'DPO', val: '4' },
                { label: 'CDPO', val: '5' },
                { label: 'Supervisor', val: '150' },
                { label: 'AWW', val: '1,000' },
              ].map(r => (
                <View key={r.label} style={{ flexDirection: 'row', gap: 6 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#66bb6a' }}>{r.label}</Text>
                  <Text style={{ fontFamily: 'Inter', fontWeight: '700', fontSize: 13, color: '#2e7d32' }}>{r.val}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 2x2 grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {subCards.map(card => (
              <View key={card.label} style={[ms.subCard, { backgroundColor: card.bg, borderColor: card.border }]}>
                <Text style={[ms.subCardLabel, { color: card.color }]}>{card.label.toUpperCase()}</Text>
                <Text style={[ms.subCardValue, { color: card.color }]}>{card.value}</Text>
                <View style={[ms.subCardDivider, { borderTopColor: card.divider }]}>
                  {card.rows.map(r => (
                    <View key={r.role} style={ms.subCardRow}>
                      <Text style={[ms.subCardRowLabel, { color: card.color }]}>{r.role}</Text>
                      <Text style={[ms.subCardRowVal, { color: card.color }]}>{r.val}</Text>
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

// Helper style to keep titleRow clean
const titleRowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  justifyContent: 'space-between' as const,
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 13,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
};

// ─── Action Taken Modal ───────────────────────────────────────────────────────

const ActionTakenModal = ({
  visible,
  ticket,
  onClose,
}: {
  visible: boolean;
  ticket: OverdueTicket | null;
  onClose: () => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);

  // Reset form when a new ticket is opened
  useEffect(() => {
    if (visible) {
      setNotes('');
      setSubmitted(false);
      setAttachedFile(null);
    }
  }, [visible, ticket?.id]);

  if (!mounted || !ticket) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[ms.sheet, { height: 460, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>

        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Close Ticket</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={ms.body}>

            {/* Ticket mini card */}
            <View style={ms.miniCard}>
              <View style={ms.miniCardTop}>
                <Text style={ms.miniCardNum}>{ticket.ticketNumber}</Text>
                <View style={[ms.rolePillSmall, { backgroundColor: '#e3f2fd' }]}>
                  <Text style={[ms.rolePillSmallTxt, { color: '#1565c0' }]}>{ticket.roleLabel}</Text>
                </View>
              </View>
              <Text style={ms.miniCardTitle} numberOfLines={2}>{ticket.title}</Text>
              <View style={[ms.overdueTagRed, { marginTop: 6, alignSelf: 'flex-start' }]}>
                <Text style={ms.overdueTagRedTxtSm}>Overdue by {ticket.overdueDays} Days</Text>
              </View>
            </View>

            {/* Action Taken Notes */}
            <Text style={ms.fieldLabel}>Action Taken Description</Text>
            <TextInput
              style={ms.textArea}
              placeholder="Describe the action taken to resolve this ticket…"
              placeholderTextColor="#bdbdbd"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />

            {/* Attach Document / Attached Document Card */}
            {(ticket.complaintType === 'Corruption' || ticket.complaintType === 'Urgent') && (
              <View style={{ marginVertical: 14 }}>
                {attachedFile === null ? (
                  <TouchableOpacity
                    style={ms.attachBtn}
                    activeOpacity={0.75}
                    onPress={() => setAttachedFile('supporting_document.pdf')}
                  >
                    <Text style={ms.attachBtnTxt}>＋  Attach Supporting Document</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={ms.attachedFileBox}>
                    <View style={ms.attachedFileLeft}>
                      <Image source={{ uri: imgDocIcon }} style={ms.attachedDocIcon} />
                      <Text style={ms.attachedFileText}>
                        {attachedFile}
                        <Text style={ms.attachedFileSize}>  (2.4 MB)</Text>
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={ms.removeFileBtn}
                      onPress={() => setAttachedFile(null)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Image source={{ uri: imgCloseIcon }} style={ms.removeFileIcon} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Submit */}
            {submitted ? (
              <View style={ms.successBanner}>
                <Text style={ms.successBannerTxt}>✓  Ticket Closed Successfully</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[ms.submitBtn, (!notes.trim()) && ms.submitBtnDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!notes.trim()}
              >
                <Text style={ms.submitBtnTxt}>Confirm &amp; Close Ticket</Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 32 }} />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// ─── Appeal Resolution Modal ──────────────────────────────────────────────────

const AppealResolutionModal = ({
  visible,
  ticket,
  onClose,
  onResolveSubmit,
}: {
  visible: boolean;
  ticket: AppealTicket | null;
  onClose: () => void;
  onResolveSubmit: (ticketId: string, decision: AppealDecision, notes: string) => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [decision, setDecision] = useState<AppealDecision>(null);
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (visible) {
      setDecision(null);
      setNotes('');
      setConfirmed(false);
      setSubmitted(false);
    }
  }, [visible, ticket?.id]);

  if (!mounted || !ticket) return null;

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      onResolveSubmit(ticket.id, decision, notes);
      onClose();
    }, 1400);
  };

  const canSubmit = decision !== null && notes.trim().length > 0 && confirmed;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[ms.sheet, { height: 580, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>

        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Resolve Appeal</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={ms.body}>

            {/* Appeal summary card */}
            <View style={[ms.miniCard, { backgroundColor: '#fff8e1', borderColor: '#ffe082' }]}>
              <View style={ms.miniCardTop}>
                <Text style={ms.miniCardNum}>{ticket.ticketNumber}</Text>
                <View style={[ms.rolePillSmall, { backgroundColor: '#fff3e0', borderColor: '#ffcc80' }]}>
                  <Text style={[ms.rolePillSmallTxt, { color: '#e65100' }]}>{ticket.roleLabel}</Text>
                </View>
              </View>
              <Text style={ms.miniCardTitle} numberOfLines={2}>{ticket.title}</Text>
              <View style={ms.appealInfoRow}>
                <Text style={ms.appealInfoLabel}>Appeal Reason:</Text>
                <Text style={ms.appealInfoTxt} numberOfLines={2}>{ticket.appealReason}</Text>
              </View>
              <Text style={[ms.cardDate, { marginTop: 6, color: '#e65100' }]}>{ticket.appealDate}</Text>
            </View>

            {/* Your Decision */}
            <Text style={ms.fieldLabel}>Your Decision</Text>
            <View style={ms.decisionRow}>
              {/* Uphold */}
              <TouchableOpacity
                style={[
                  ms.decisionOption,
                  { borderColor: decision === 'uphold' ? '#2e7d32' : '#e0e0e0', backgroundColor: decision === 'uphold' ? '#e8f5e9' : '#fff' },
                ]}
                onPress={() => setDecision('uphold')}
                activeOpacity={0.8}
              >
                <View style={[ms.radioCircle, { borderColor: decision === 'uphold' ? '#2e7d32' : '#bdbdbd' }]}>
                  {decision === 'uphold' && <View style={[ms.radioDot, { backgroundColor: '#2e7d32' }]} />}
                </View>
                <View>
                  <Text style={[ms.decisionLabel, { color: decision === 'uphold' ? '#2e7d32' : '#424242' }]}>Uphold Appeal</Text>
                  <Text style={ms.decisionSub}>Appeal is valid</Text>
                </View>
              </TouchableOpacity>

              {/* Dismiss */}
              <TouchableOpacity
                style={[
                  ms.decisionOption,
                  { borderColor: decision === 'dismiss' ? '#d32f2f' : '#e0e0e0', backgroundColor: decision === 'dismiss' ? '#ffebee' : '#fff' },
                ]}
                onPress={() => setDecision('dismiss')}
                activeOpacity={0.8}
              >
                <View style={[ms.radioCircle, { borderColor: decision === 'dismiss' ? '#d32f2f' : '#bdbdbd' }]}>
                  {decision === 'dismiss' && <View style={[ms.radioDot, { backgroundColor: '#d32f2f' }]} />}
                </View>
                <View>
                  <Text style={[ms.decisionLabel, { color: decision === 'dismiss' ? '#d32f2f' : '#424242' }]}>Dismiss Appeal</Text>
                  <Text style={ms.decisionSub}>Resolution was correct</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Resolution Notes */}
            <Text style={ms.fieldLabel}>Resolution Notes</Text>
            <TextInput
              style={ms.textArea}
              placeholder="Provide the basis for your decision…"
              placeholderTextColor="#bdbdbd"
              multiline
              numberOfLines={4}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />

            {/* Confirmation Checkbox */}
            <TouchableOpacity
              style={ms.checkboxRow}
              onPress={() => setConfirmed(!confirmed)}
              activeOpacity={0.8}
            >
              <View style={[ms.checkboxCircle, confirmed && ms.checkboxCircleChecked]}>
                {confirmed && <Text style={ms.checkmark}>✓</Text>}
              </View>
              <Text style={ms.checkboxLabel}>
                I confirm the decision and details filled above.
              </Text>
            </TouchableOpacity>

            {/* Submit */}
            {submitted ? (
              <View style={[ms.successBanner, { backgroundColor: decision === 'uphold' ? '#e8f5e9' : '#ffebee' }]}>
                <Text style={[ms.successBannerTxt, { color: decision === 'uphold' ? '#2e7d32' : '#d32f2f' }]}>
                  {decision === 'uphold' ? '✓  Appeal Upheld — Ticket Reopened' : '✓  Appeal Dismissed — Resolution Confirmed'}
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  ms.submitBtn,
                  decision === 'uphold' ? { backgroundColor: '#2e7d32' } : decision === 'dismiss' ? { backgroundColor: '#d32f2f' } : {},
                  !canSubmit && ms.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={!canSubmit}
              >
                <Text style={ms.submitBtnTxt}>
                  {decision === 'uphold' ? 'Uphold & Reopen' : decision === 'dismiss' ? 'Dismiss Appeal' : 'Resolve Appeal'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ height: 32 }} />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

// ─── Ticket Details Modal ─────────────────────────────────────────────────────

const TicketDetailModal = ({
  visible,
  ticket,
  onClose,
}: {
  visible: boolean;
  ticket: AppealTicket | null;
  onClose: () => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);

  if (!mounted || !ticket) return null;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[ms.sheet, { height: 720, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>

        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Ticket Details</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={[ms.body, { paddingBottom: 40 }]}>
            {/* Section 1: Ticket Summary */}
            <View style={ds.sectionHeader}>
              <Text style={ds.sectionHeaderTxt}>Ticket Summary</Text>
              <View style={ds.sectionHeaderLine} />
            </View>

            <View style={ds.summaryTitleRow}>
              <Text style={ds.summaryTitle}>{ticket.ticketNumber}</Text>
              <View style={ds.summaryBadge}>
                <Text style={ds.summaryBadgeTxt}>
                  {ticket.appealReason ? (ticket.status === 'resolved' ? 'APPEAL RESOLVED' : 'APPEAL RAISED') : 'OVERDUE'}
                </Text>
              </View>
            </View>

            <View style={ds.infoList}>
              {[
                { label: 'Assigned on', val: '08/06/2025' },
                { label: 'Resolved on', val: '12/06/2025' },
                { label: 'Resolved by', val: 'Supervisor' },
                { label: 'Closed on', val: '13/06/2025' },
                { label: 'Appeal raised on', val: '14/06/2025' },
                { label: 'Appeal resolved on', val: '12/06/2025' },
              ].map(item => (
                <View key={item.label} style={ds.infoRow}>
                  <Text style={ds.infoLabel}>{item.label}</Text>
                  <Text style={ds.infoValue}>{item.val}</Text>
                </View>
              ))}
            </View>

            {/* Section 2: Ticket Details */}
            <View style={ds.sectionHeader}>
              <Text style={ds.sectionHeaderTxt}>Ticket Details</Text>
              <View style={ds.sectionHeaderLine} />
            </View>

            <View style={ds.infoList}>
              <View style={ds.infoRow}>
                <Text style={ds.infoLabel}>Help Topic</Text>
                <Text style={ds.infoValue}>Immunization</Text>
              </View>
              <View style={ds.infoRow}>
                <Text style={ds.infoLabel}>Sub-topic</Text>
                <Text style={[ds.infoValue, { flex: 1, flexWrap: 'wrap' }]}>
                  Vaccination not administered on scheduled date at sub-health centre
                </Text>
              </View>
            </View>

            <View style={ds.textBlock}>
              <Text style={ds.textBlockLabel}>Description</Text>
              <View style={ds.blueBox}>
                <Text style={ds.blueBoxTxt}>
                  Vaccination rescheduled with PHC medical officer. Child vaccinated on 11 Jun 2025 — DPT booster and OPV administered. Immunisation card updated. Parents counselled on next scheduled vaccination date of 15 Sep 2025.
                </Text>
              </View>
            </View>

            {/* Section 3: Beneficiary Information */}
            <View style={ds.sectionHeader}>
              <Text style={ds.sectionHeaderTxt}>Beneficiary Information</Text>
              <View style={ds.sectionHeaderLine} />
            </View>

            <View style={ds.infoList}>
              {[
                { label: 'Name', val: 'Geeta Sharma' },
                { label: 'Mobile', val: '98765 43210' },
                { label: 'Category', val: 'Children (6m-3y)' },
                { label: 'AWC', val: 'Anganwadi Centre 2' },
                { label: 'District', val: 'Jaipur' },
                { label: 'Project', val: 'Sanganer' },
                { label: 'Sector', val: '1' },
              ].map(item => (
                <View key={item.label} style={ds.infoRow}>
                  <Text style={ds.infoLabel}>{item.label}</Text>
                  <Text style={ds.infoValue}>{item.val}</Text>
                </View>
              ))}
            </View>

            {/* Section 4: Resolution Details */}
            {ticket.appealReason !== '' && (
              <>
                <View style={ds.sectionHeader}>
                  <Text style={ds.sectionHeaderTxt}>Resolution Details</Text>
                  <View style={ds.sectionHeaderLine} />
                </View>

                <View style={ds.textBlock}>
                  <Text style={ds.textBlockLabel}>Action Taken</Text>
                  <View style={ds.blueBox}>
                    <Text style={ds.blueBoxTxt}>
                      Vaccination rescheduled with PHC medical officer. Child vaccinated on 11 Jun 2025 — DPT booster and OPV administered. Immunisation card updated. Parents counselled on next scheduled vaccination date of 15 Sep 2025.
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Section 5: DPO Appeal Resolution */}
            {ticket.appealReason !== '' && (
              <>
                <View style={ds.sectionHeader}>
                  <Text style={ds.sectionHeaderTxt}>DPO Appeal Resolution</Text>
                  <View style={ds.sectionHeaderLine} />
                </View>

                <View style={ds.textBlock}>
                  <Text style={ds.textBlockLabel}>Action Taken by DPO</Text>
                  <View style={ds.blueBox}>
                    <Text style={ds.blueBoxTxt}>
                      Appeal reviewed on 12 Jun 2025. Vaccination records verified at PHC — DPT booster and OPV confirmed administered on 11 Jun 2025. Immunisation card entries are accurate and complete. Resolution by Supervisor upheld. Appeal resolved in favour of existing resolution.
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Section 6: Timeline */}
            <View style={ds.sectionHeader}>
              <Text style={ds.sectionHeaderTxt}>Timeline</Text>
              <View style={ds.sectionHeaderLine} />
            </View>

            <View style={ds.timeline}>
              {ticket.appealReason !== '' ? (
                [
                  { title: 'Appeal Resolved by DPO', date: '12/06/2025, 11:00 AM', color: '#1565c0' },
                  { title: 'Appeal Raised by Beneficiary', date: '14/06/2025, 02:00 PM', color: '#e65100' },
                  { title: 'Ticket Closed by CDPO', date: '13/06/2025, 10:00 AM', color: '#1b5e20' },
                  { title: 'Ticket Resolved by Supervisor', date: '12/06/2025, 03:00 PM', color: '#2e7d32' },
                  { title: 'Reminder Sent — System', date: '08/06/2025, 09:00 AM', color: '#f59e0b' },
                  { title: 'Assigned to Supervisor — Sector 1', date: '08/06/2025, 11:30 AM', color: '#1a237e', isLast: true },
                ].map((item, idx) => (
                  <View key={idx} style={ds.timelineRow}>
                    <View style={ds.timelineLeft}>
                      <View style={[ds.timelineDot, { backgroundColor: item.color }]} />
                      {!item.isLast && <View style={ds.timelineLine} />}
                    </View>
                    <View style={ds.timelineRight}>
                      <Text style={ds.timelineTitle}>{item.title}</Text>
                      <Text style={ds.timelineDate}>{item.date}</Text>
                    </View>
                  </View>
                ))
              ) : (
                [
                  { title: 'Ticket Overdue', date: '21 days after assignment', color: '#d32f2f' },
                  { title: 'Ticket Escalated to DPO (View Only)', date: '14 days after assignment', color: '#e65100' },
                  { title: `Reminder Sent to ${ticket.roleLabel || 'AWW'}`, date: '7 days after assignment', color: '#f57f17' },
                  { title: 'Ticket Assigned to Officer', date: '09:00 AM (Day 0)', color: '#1a237e', isLast: true },
                ].map((item, idx) => (
                  <View key={idx} style={ds.timelineRow}>
                    <View style={ds.timelineLeft}>
                      <View style={[ds.timelineDot, { backgroundColor: item.color }]} />
                      {!item.isLast && <View style={ds.timelineLine} />}
                    </View>
                    <View style={ds.timelineRight}>
                      <Text style={ds.timelineTitle}>{item.title}</Text>
                      <Text style={ds.timelineDate}>{item.date}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Read-only Banner */}
            {!ticket.appealReason && ticket.roleLabel !== 'DPO' ? (
              <View style={[ds.readOnlyBanner, { backgroundColor: '#ffebee', borderColor: '#ffcdd2', borderWidth: 1 }]}>
                <Text style={[ds.readOnlyBannerTxt, { color: '#d32f2f', fontWeight: '700' }]}>
                  Escalated to DPO (View Only). CDPO is the main Closing Officer.
                </Text>
              </View>
            ) : ticket.status === 'resolved' ? (
              <View style={ds.readOnlyBanner}>
                <Text style={ds.readOnlyBannerTxt}>This ticket has been resolved and is read-only.</Text>
              </View>
            ) : null}

          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const PROJECT_OPTIONS = ['All Projects', 'Sanganer', 'Jotwara', 'Amer', 'Sanganer II', 'Phagi'];
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

const AnganwadiCentreDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={dropdownStyles.dropdownWrapper}>
    <TouchableOpacity style={dropdownStyles.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={dropdownStyles.dropdownDot} />
      <View style={dropdownStyles.dropdownTextBlock}>
        <Text style={dropdownStyles.dropdownLabel}>ANGANWADI CENTRE</Text>
        <Text style={dropdownStyles.dropdownValue}>{value}</Text>
      </View>
      <Image source={{ uri: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/chevron-down.svg' }} style={dropdownStyles.dropdownChevron} />
    </TouchableOpacity>
  </View>
);

const SectorDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={dropdownStyles.dropdownWrapper}>
    <TouchableOpacity style={dropdownStyles.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={dropdownStyles.dropdownDot} />
      <View style={dropdownStyles.dropdownTextBlock}>
        <Text style={dropdownStyles.dropdownLabel}>SECTOR</Text>
        <Text style={dropdownStyles.dropdownValue}>{value}</Text>
      </View>
      <Image source={{ uri: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/chevron-down.svg' }} style={dropdownStyles.dropdownChevron} />
    </TouchableOpacity>
  </View>
);

const ProjectDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={dropdownStyles.dropdownWrapper}>
    <TouchableOpacity style={dropdownStyles.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={dropdownStyles.dropdownDot} />
      <View style={dropdownStyles.dropdownTextBlock}>
        <Text style={dropdownStyles.dropdownLabel}>PROJECT</Text>
        <Text style={dropdownStyles.dropdownValue}>{value}</Text>
      </View>
      <Image source={{ uri: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/chevron-down.svg' }} style={dropdownStyles.dropdownChevron} />
    </TouchableOpacity>
  </View>
);

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
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[
          ms.sheet,
          { height: 80 + options.length * 52, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={{
                  height: 52,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
                onPress={() => { onSelect(opt); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={[
                  {
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: '#bdbdbd',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  selected === opt && { borderColor: '#1a237e' }
                ]}>
                  {selected === opt && (
                    <View style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#1a237e',
                    }} />
                  )}
                </View>
                <Text style={[
                  {
                    flex: 1,
                    fontFamily: 'Inter',
                    fontWeight: '400',
                    fontSize: 14,
                    color: '#424242',
                  },
                  selected === opt && { color: '#1a237e', fontWeight: '600' }
                ]}>
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

const dropdownStyles = StyleSheet.create({
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

// ─── Main DPO Screen ──────────────────────────────────────────────────────────

export default function DPODashboardScreen({
  onBack,
  sharedPendingCards,
  setSharedPendingCards,
  sharedResolvedCards,
  setSharedResolvedCards,
}: {
  onBack?: () => void;
  sharedPendingCards?: TicketCard[];
  setSharedPendingCards?: React.Dispatch<React.SetStateAction<TicketCard[]>>;
  sharedResolvedCards?: ResolvedTicketCard[];
  setSharedResolvedCards?: React.Dispatch<React.SetStateAction<ResolvedTicketCard[]>>;
} = {}) {
  const [activeTab, setActiveTab]             = useState<DPOTab>('Overdue');
  const [cdpoActiveTab, setCdpoActiveTab]     = useState<'Pending' | 'Overdue' | 'Resolved' | 'Appeal Pending'>('Pending');
  const [assignFilter, setAssignFilter]       = useState<AssignFilter>('DPO');

  // Interactive state for appeal tickets
  const [appealList, setAppealList] = useState<AppealTicket[]>(() =>
    appealTickets.map(t => ({ ...t, status: t.status || ('raised' as const) }))
  );

  const [localPending, setLocalPending] = useState<TicketCard[]>(() => pendingCards);
  const [localResolved, setLocalResolved] = useState<ResolvedTicketCard[]>(() => resolvedCards);

  const myPendingCards = sharedPendingCards ?? localPending;
  const setMyPendingCards = setSharedPendingCards ?? setLocalPending;
  const myResolvedCards = sharedResolvedCards ?? localResolved;
  const setMyResolvedCards = setSharedResolvedCards ?? setLocalResolved;

  // Summary breakdown sheets
  const [pendingBreakdown, setPendingBreakdown] = useState(false);
  const [resolvedBreakdown, setResolvedBreakdown] = useState(false);

  // Action Taken Modal
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [activeOverdueTicket, setActiveOverdueTicket] = useState<OverdueTicket | null>(null);

  // Appeal Resolution Modal
  const [appealModalVisible, setAppealModalVisible] = useState(false);
  const [activeAppealTicket, setActiveAppealTicket] = useState<AppealTicket | null>(null);

  // Ticket Details Modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeDetailTicket, setActiveDetailTicket] = useState<AppealTicket | null>(null);

  const [selectedCardForDetails, setSelectedCardForDetails] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedAWC, setSelectedAWC]       = useState('All Centres');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [sectorPickVisible, setSectorPickVisible] = useState(false);
  const [awcPickVisible, setAwcPickVisible]       = useState(false);
  const [projectPickVisible, setProjectPickVisible] = useState(false);

  // Filter States
  const [isOverdueActive, setIsOverdueActive] = useState(false);
  const [appliedDateOption, setAppliedDateOption] = useState<'7' | '14' | '21' | 'custom' | null>(null);
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  const [appliedTypes, setAppliedTypes] = useState<string[]>([]);
  const [dateRangeSheetVisible, setDateRangeSheetVisible] = useState(false);
  const [typeSheetVisible, setTypeSheetVisible] = useState(false);

  const getTicketAge = (submittedDate?: string) => {
    if (!submittedDate) return 0;
    const cleanStr = submittedDate.replace('Submitted:', '').trim();
    const match = cleanStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return 0;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const ticketDate = new Date(year, month, day);
    const mockToday = new Date(2025, 5, 30); // 30/06/2025
    const diffTime = mockToday.getTime() - ticketDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const filterByAgeAndRole = (t: any) => {
    const age = getTicketAge(t.submittedDate);

    // 1. Role assignment check based on active tab
    if (assignFilter === 'DPO') {
      if (cdpoActiveTab === 'Pending') {
        // Direct DPO pending tickets (not escalated overdue from other roles)
        if (t.assignedTo !== 'DPO') return false;
      } else if (cdpoActiveTab === 'Overdue') {
        // Show directly assigned DPO overdue tickets OR escalated overdue tickets from other roles
        const isOverdueTicket = t.isOverdue || age >= 21;
        if (!isOverdueTicket) return false;
      } else if (cdpoActiveTab === 'Resolved') {
        // Resolved DPO tickets + overdue tickets resolved by DPO
        if (t.assignedTo !== 'DPO' && !t.resolvedByDPO) return false;
      } else {
        if (t.assignedTo !== 'DPO' && !t.resolvedByDPO) return false;
      }
    } else {
      // CDPO / Supervisor / AWW filters
      if (t.assignedTo !== assignFilter) return false;

      // Exclude if it crossed 21 days (reassigned to DPO)
      if (age >= 21) return false;

      // DPO can only view their pending tickets after 14 days
      if (age < 14) return false;
    }

    // Project filter
    if (assignFilter === 'CDPO' && selectedProject !== 'All Projects') {
      if (!t.project || t.project !== selectedProject) return false;
    }

    // Sector filter
    if ((assignFilter === 'Supervisor' || assignFilter === 'AWW') && selectedSector !== 'All Sectors') {
      if (!t.sector || t.sector !== selectedSector) return false;
    }

    // AWC filter
    if (assignFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!t.awcName || t.awcName !== selectedAWC) return false;
    }

    // Overdue filter
    if (isOverdueActive && !t.isOverdue) return false;

    // Date range filter
    if (appliedDateOption !== null) {
      if (appliedDateOption === '7' && age > 7) return false;
      if (appliedDateOption === '14' && age > 14) return false;
      if (appliedDateOption === '21' && age > 21) return false;
      if (appliedDateOption === 'custom' && appliedFrom && appliedTo) {
        const parseD = (s: string) => {
          const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
          return m ? new Date(parseInt(m[3],10), parseInt(m[2],10)-1, parseInt(m[1],10)) : new Date(0);
        };
        const ticketDate = parseD(t.submittedDate);
        const fromDate = parseD(appliedFrom);
        const toDate = parseD(appliedTo);
        if (ticketDate < fromDate || ticketDate > toDate) return false;
      }
    }

    // Type filter
    if (appliedTypes.length > 0) {
      if (!t.complaintType || !appliedTypes.includes(t.complaintType)) return false;
    }

    return true;
  };

  const handleOpenCardDetail = (ticket: any) => {
    setSelectedCardForDetails(ticket);
    setDetailsVisible(true);
  };

  const handleOpenOverdueDetail = (ticket: OverdueTicket) => {
    const detailTicket: AppealTicket = {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      roleLabel: ticket.roleLabel,
      title: ticket.title,
      originalDescription: ticket.description,
      appealReason: '',
      submittedDate: ticket.submittedDate,
      appealDate: '',
      documents: ticket.documents,
      byName: ticket.byName,
      status: 'raised',
      complaintType: ticket.complaintType,
    };
    setActiveDetailTicket(detailTicket);
    setDetailModalVisible(true);
  };

  const handleCloseTicket = (ticket: OverdueTicket) => {
    setActiveOverdueTicket(ticket);
    setActionModalVisible(true);
  };

  const handleResolveAppeal = (ticket: AppealTicket) => {
    setActiveAppealTicket(ticket);
    setAppealModalVisible(true);
  };

  const handleResolveSubmit = (ticketId: string, decision: AppealDecision, notes: string) => {
    setAppealList(prev =>
      prev.map(t =>
        t.id === ticketId
          ? { ...t, status: 'resolved', decision: decision || 'uphold', resolutionNotes: notes }
          : t
      )
    );
  };

  const getDpoPendingCount = () => {
    return myPendingCards.filter(t => t.assignedTo === 'DPO').length;
  };
  const getDpoOverdueCount = () => {
    return myPendingCards.filter(t => (t.isOverdue || getTicketAge(t.submittedDate) >= 21)).length;
  };
  const getDpoResolvedCount = () => {
    return myResolvedCards.filter(t => t.assignedTo === 'DPO' || t.resolvedByDPO).length + appealList.filter(t => t.status === 'resolved').length;
  };

  const getRolePendingCount = (role: AssignFilter) => {
    return myPendingCards.filter(t => t.assignedTo === role && getTicketAge(t.submittedDate) < 21 && getTicketAge(t.submittedDate) >= 14).length;
  };
  const getRoleResolvedCount = (role: AssignFilter) => {
    return myResolvedCards.filter(t => t.assignedTo === role).length;
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      <DPOStatusBar_ />
      <DPOHeader onBack={onBack} />
      <DPOSubHeader />

      <ScrollView
        style={s.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Summary */}
        <DPOSummaryTable
          onPendingFilter={() => setPendingBreakdown(true)}
          onResolvedFilter={() => setResolvedBreakdown(true)}
        />

        {/* Assign Filter */}
        <DPOAssignFilter
          selected={assignFilter}
          onSelect={(val) => {
            setAssignFilter(val);
            setCdpoActiveTab('Pending');
            setSelectedSector('All Sectors');
            setSelectedAWC('All Centres');
            setSelectedProject('All Projects');
          }}
        />

        {/* Sector / AWC / Project Dropdowns */}
        {assignFilter === 'CDPO' && (
          <ProjectDropdown value={selectedProject} onPress={() => setProjectPickVisible(true)} />
        )}
        {assignFilter === 'Supervisor' && (
          <>
            <ProjectDropdown value={selectedProject} onPress={() => setProjectPickVisible(true)} />
            <SectorDropdown value={selectedSector} onPress={() => setSectorPickVisible(true)} />
          </>
        )}
        {assignFilter === 'AWW' && (
          <>
            <ProjectDropdown value={selectedProject} onPress={() => setProjectPickVisible(true)} />
            <SectorDropdown value={selectedSector} onPress={() => setSectorPickVisible(true)} />
            <AnganwadiCentreDropdown value={selectedAWC} onPress={() => setAwcPickVisible(true)} />
          </>
        )}

        {/* Tab Bar */}
        <CDPOTabBar
          active={cdpoActiveTab}
          onChange={setCdpoActiveTab}
          showAppealTab={assignFilter === 'DPO'}
          appealCount={appealList.filter(t => t.status !== 'resolved').length}
          overdueCount={getDpoOverdueCount()}
          pendingCount={assignFilter === 'DPO' ? getDpoPendingCount() : getRolePendingCount(assignFilter)}
          resolvedCount={assignFilter === 'DPO' ? getDpoResolvedCount() : getRoleResolvedCount(assignFilter)}
        />

        {/* Helper text for Appeals tab */}
        {cdpoActiveTab === 'Appeal Pending' && (
          <View style={{
            backgroundColor: '#e8eaf6',
            borderColor: '#c5cae9',
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
            marginHorizontal: 12,
            marginTop: 12,
            marginBottom: 2,
          }}>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: '#1a237e',
              lineHeight: 18,
            }}>
              <Text style={{ fontWeight: '700' }}>Appeals</Text> are grievances escalated by beneficiaries who are unsatisfied with the resolution.
            </Text>
          </View>
        )}

        {/* Filter Chips */}
        {cdpoActiveTab !== 'Appeal Pending' && (
          <FilterChips
            showOverdue={cdpoActiveTab !== 'Overdue'}
            isOverdueActive={isOverdueActive}
            onOverdueToggle={() => setIsOverdueActive(!isOverdueActive)}
            appliedDateOption={appliedDateOption}
            onDateRangePress={() => setDateRangeSheetVisible(true)}
            appliedTypes={appliedTypes}
            onTypePress={() => setTypeSheetVisible(true)}
            onClearDateRange={() => {
              setAppliedDateOption(null);
              setAppliedFrom('');
              setAppliedTo('');
            }}
            onClearType={() => setAppliedTypes([])}
            isAnyFilterActive={isOverdueActive || appliedDateOption !== null || appliedTypes.length > 0}
            onClearAll={() => {
              setIsOverdueActive(false);
              setAppliedDateOption(null);
              setAppliedFrom('');
              setAppliedTo('');
              setAppliedTypes([]);
            }}
          />
        )}

        {/* Cards */}
        <View style={s.cardList}>
          {cdpoActiveTab === 'Pending' ? (
            myPendingCards
              .filter(filterByAgeAndRole)
              .map(t => (
                <TicketCardComponent
                  key={t.id}
                  card={t}
                  onPress={() => handleOpenCardDetail({ ...t, isPendingTicket: true })}
                />
              ))
          ) : cdpoActiveTab === 'Overdue' ? (
            myPendingCards
              .filter(filterByAgeAndRole)
              .map(t => (
                <TicketCardComponent
                  key={t.id}
                  card={{
                    ...t,
                    daysLabel: t.daysLabel,
                    isOverdue: true,
                    isPendingTicket: true,
                    _isOverdueTab: true,
                  }}
                  onPress={() => handleOpenCardDetail({ ...t, isPendingTicket: true, isOverdue: true, _isOverdueTab: true })}
                />
              ))
          ) : cdpoActiveTab === 'Appeal Pending' ? (
            appealList
              .filter(t => t.status !== 'resolved')
              .map(t => {
                // Determine category map for beneficiary category
                const categoryMap: Record<string, string> = {
                  'Kamla Devi': 'Pregnant Woman',
                  'Rekha Sharma': 'Lactating Mother',
                  'Dr. Suresh Mehta (PHC)': 'Children (6m-3y)',
                  'Geeta Sharma': 'Adolescent Girl',
                };
                const beneficiaryType = categoryMap[t.byName] || 'Beneficiary';

                // Convert appeal ticket to TicketCard format for uniform UI
                const appealAsCard: any = {
                  id: t.id,
                  ticketNumber: t.ticketNumber,
                  beneficiaryName: t.byName,
                  beneficiaryType: beneficiaryType,
                  topic: t.title,
                  description: t.appealReason || t.originalDescription,
                  submittedDate: `Closure: ${t.appealDate?.replace('Appeal Filed: ', '') ?? ''}`,
                  daysLabel: '',
                  daysType: 'remaining',
                  isOverdue: false,
                  isPendingTicket: false,
                  awcName: 'Anganwadi Centre 1',
                  complaintType: t.complaintType,
                  documents: t.documents,
                  documentsCount: t.documents ? 1 : 0,
                  assignedTo: t.roleLabel,
                  status: 'APPEAL_RAISED',
                  actionTaken: t.originalActionTaken || 'Initial resolution completed by ' + t.roleLabel + '.',
                  _isAppeal: true,
                  _appealTicket: t,
                };
                return (
                  <TicketCardComponent
                    key={t.id}
                    card={appealAsCard}
                    onPress={() => handleOpenCardDetail(appealAsCard)}
                  />
                );
              })
          ) : (
            (() => {
              // Get resolved appeal cards
              const resolvedAppeals = appealList
                .filter(t => t.status === 'resolved')
                .map(t => {
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
                  const beneficiaryType = categoryMap[t.byName] || 'Beneficiary';
                  return {
                    id: t.id,
                    ticketNumber: t.ticketNumber,
                    beneficiaryName: t.byName,
                    beneficiaryType: beneficiaryType,
                    topic: t.title,
                    description: t.appealReason || t.originalDescription,
                    submittedDate: t.submittedDate?.replace('Submitted: ', '') ?? '',
                    resolvedDate: 'Resolved: ' + (t.appealDate?.replace('Appeal Filed: ', '') ?? '28/06/2025'),
                    daysLabel: 'Resolved',
                    daysType: 'resolved',
                    isOverdue: false,
                    isPendingTicket: false,
                    awcName: 'Anganwadi Centre 1',
                    complaintType: t.complaintType,
                    documents: t.documents,
                    documentsCount: t.documents ? 1 : 0,
                    assignedTo: t.roleLabel as AssignedFilter,
                    status: 'APPEAL_RESOLVED' as const,
                    actionTaken: t.resolutionNotes || 'Appeal resolved successfully by DPO.',
                  };
                });

              // Merge lists and filter
              const listToRender = [
                ...myResolvedCards.filter(filterByAgeAndRole),
                ...resolvedAppeals,
              ];

              return listToRender.map(t => (
                <ResolvedTicketCardComponent
                  key={t.id}
                  card={t}
                  onPress={() => handleOpenCardDetail(t)}
                />
              ));
            })()
          )}
        </View>
      </ScrollView>

      {/* ── Inline Sheets ── */}
      <PendingBreakdownSheet  visible={pendingBreakdown} onClose={() => setPendingBreakdown(false)} />
      <ResolvedBreakdownSheet   visible={resolvedBreakdown}  onClose={() => setResolvedBreakdown(false)} />
      <ActionTakenModal
        visible={actionModalVisible}
        ticket={activeOverdueTicket}
        onClose={() => setActionModalVisible(false)}
      />
      <AppealResolutionModal
        visible={appealModalVisible}
        ticket={activeAppealTicket}
        onClose={() => setAppealModalVisible(false)}
        onResolveSubmit={handleResolveSubmit}
      />
      <TicketDetailModal
        visible={detailModalVisible}
        ticket={activeDetailTicket}
        onClose={() => setDetailModalVisible(false)}
      />

      {/* Sector & AWC Pick Sheets */}
      <DropdownPickSheet
        visible={sectorPickVisible}
        title="Select Sector"
        options={SECTOR_OPTIONS}
        selected={selectedSector}
        onSelect={(val) => {
          setSelectedSector(val);
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
      <DropdownPickSheet
        visible={projectPickVisible}
        title="Select Project"
        options={PROJECT_OPTIONS}
        selected={selectedProject}
        onSelect={setSelectedProject}
        onClose={() => setProjectPickVisible(false)}
      />

      {/* Date Range & Type Filter Sheets */}
      <DateRangeFilterSheet
        visible={dateRangeSheetVisible}
        onClose={() => setDateRangeSheetVisible(false)}
        appliedOption={appliedDateOption}
        appliedFrom={appliedFrom}
        appliedTo={appliedTo}
        onApply={(opt, from, to) => {
          setAppliedDateOption(opt);
          setAppliedFrom(from);
          setAppliedTo(to);
          setDateRangeSheetVisible(false);
        }}
      />
      <TypeFilterSheet
        visible={typeSheetVisible}
        onClose={() => setTypeSheetVisible(false)}
        appliedTypes={appliedTypes}
        onApply={(types) => {
          setAppliedTypes(types);
          setTypeSheetVisible(false);
        }}
      />

      {/* Ticket Details Overlay (Uniform to CDPO View) */}
      {detailsVisible && selectedCardForDetails && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', zIndex: 9999, backgroundColor: '#fff' }}>
          <TicketDetailsScreen
            card={selectedCardForDetails}
            assignedFilter={assignFilter}
            onBack={() => {
              setDetailsVisible(false);
              setSelectedCardForDetails(null);
            }}
            onResolveTicket={(ticketId, closureNote) => {
              // Remove from pending list
              setMyPendingCards(prev => prev.filter(t => t.id !== ticketId));
              
              // Find the ticket to move to resolved
              const ticketToResolve = myPendingCards.find(t => t.id === ticketId);
              if (ticketToResolve) {
                const originalAssigned = ticketToResolve.assignedTo;
                const wasEscalated = originalAssigned !== 'DPO';
                const resolvedCard: ResolvedTicketCard = {
                  ...ticketToResolve,
                  resolvedDate: 'Resolved: 30/06/2025',
                  daysLabel: 'Resolved',
                  daysType: 'resolved',
                  status: 'CLOSED',
                  assignedTo: originalAssigned, // Keep original role assignment
                  resolvedByDPO: wasEscalated || ticketToResolve.resolvedByDPO,
                  actionTaken: closureNote || (wasEscalated ? 'Resolved & closed by DPO due to overdue escalation.' : 'Resolved & closed by DPO.'),
                };
                setMyResolvedCards(prev => [resolvedCard, ...prev]);
              }
              
              setDetailsVisible(false);
              setSelectedCardForDetails(null);
            }}
            isCdpoView={false}
            isAppealTicket={!!selectedCardForDetails._isAppeal}
            onResolveAppeal={(ticketId, notes) => {
              handleResolveSubmit(ticketId, 'uphold', notes);
              setDetailsVisible(false);
              setSelectedCardForDetails(null);
            }}
            onSimulateAppeal={(ticketId) => {
              // Remove from resolved list
              setMyResolvedCards(prev => prev.filter(t => t.id !== ticketId));

              // Find the resolved ticket details to map it into an appeal ticket
              const resolvedTicket = myResolvedCards.find(t => t.id === ticketId);
              if (resolvedTicket) {
                const newAppeal: AppealTicket = {
                  id: resolvedTicket.id,
                  ticketNumber: resolvedTicket.ticketNumber,
                  roleLabel: resolvedTicket.assignedTo || 'AWW',
                  title: resolvedTicket.topic || resolvedTicket.title || 'Escalated Grievance',
                  originalDescription: resolvedTicket.description,
                  appealReason: 'Beneficiary is unsatisfied with resolution of ' + resolvedTicket.ticketNumber + '. The issue has not been fully solved on the ground.',
                  submittedDate: resolvedTicket.submittedDate || 'Submitted: 25/06/2025',
                  appealDate: 'Appeal Filed: 06/07/2025',
                  documents: resolvedTicket.documents,
                  byName: resolvedTicket.beneficiaryName || 'Sita Devi',
                  status: 'raised',
                  complaintType: resolvedTicket.complaintType,
                  originalActionTaken: resolvedTicket.actionTaken || 'Resolved by CDPO/Supervisor.',
                };
                setAppealList(prev => [newAppeal, ...prev]);
              }
              setDetailsVisible(false);
              setSelectedCardForDetails(null);
            }}
            hideResolveCTA={
              !selectedCardForDetails._isAppeal &&
              selectedCardForDetails.assignedTo !== 'DPO' &&
              getTicketAge(selectedCardForDetails.submittedDate) < 21
            }
          />
        </View>
      )}
    </View>
  );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, width: '100%', backgroundColor: '#fafafa', overflow: 'hidden' },

  // Status bar
  statusBar: { height: 24, backgroundColor: '#1a237e', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  statusTime: { fontFamily: 'Inter', fontWeight: '600', fontSize: 14, color: '#fff', lineHeight: 21 },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sIcon16: { width: 16, height: 12, tintColor: '#ffffff' },
  sIcon14: { width: 14, height: 12, tintColor: '#ffffff' },
  sIcon20: { width: 20, height: 12, tintColor: '#ffffff' },

  // Header
  header: { height: 56, backgroundColor: '#1a237e', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  backBtn: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  backIcon: { width: 24, height: 24, tintColor: '#ffffff' },
  headerTitle: { flex: 1, fontFamily: 'Inter', fontWeight: '700', fontSize: 16, color: '#fff', textAlign: 'center' },
  dpoBadge: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  dpoBadgeText: { fontFamily: 'Inter', fontWeight: '700', fontSize: 11, color: '#fff', letterSpacing: 0.5 },

  // Sub header
  subHeader: { height: 36, backgroundColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  subHeaderText: { fontFamily: 'Inter', fontWeight: '500', fontSize: 12, color: '#5c5c5c' },
  subHeaderSep: { fontFamily: 'Inter', fontSize: 12, color: '#bdbdbd' },

  // Summary
  summarySection: { backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  summaryLabel: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, color: '#1a237e', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden' },
  sRow: { flexDirection: 'row', alignItems: 'center' },
  sHeaderRow: { height: 36, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  sDataRow: { height: 44, borderBottomWidth: 1 },
  sCol0: { width: 90, justifyContent: 'center', paddingLeft: 10 },
  sColBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 4 },
  sColData: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sColBtnText: { fontFamily: 'Inter', fontWeight: '600', fontSize: 10, textTransform: 'uppercase', lineHeight: 15 },
  chevronTxt: { fontSize: 12, fontWeight: '600', lineHeight: 15 },
  sRowLabel: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#5c5c5c' },
  sDataVal: { fontFamily: 'Inter', fontWeight: '700', fontSize: 17, lineHeight: 25 },

  // Assign filter
  assignRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 10 },
  assignLabel: { fontFamily: 'Inter', fontWeight: '500', fontSize: 11, color: '#9e9e9e', lineHeight: 16.5 },
  assignChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  assignChip: { height: 28, borderRadius: 100, paddingHorizontal: 13, justifyContent: 'center', alignItems: 'center' },
  chipActive: { backgroundColor: '#1a237e' },
  chipInactive: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#bdbdbd' },
  chipText: { fontFamily: 'Inter', fontSize: 12, textAlign: 'center' },
  chipTextActive: { fontWeight: '600', color: '#fff' },
  chipTextInactive: { fontWeight: '400', color: '#757575' },

  // Tab bar
  tabBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', flexDirection: 'row' },
  tabItem: { flex: 1, flexDirection: 'column', alignItems: 'center' },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 14, paddingBottom: 12 },
  tabText: { fontFamily: 'Inter', fontWeight: '500', fontSize: 14, color: '#5c5c5c' },
  tabTextActive: { fontFamily: 'Inter', fontWeight: '700', color: '#1a237e' },
  tabBadge: { borderRadius: 9, minWidth: 22, height: 18, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center' },
  tabBadgeOn: { backgroundColor: '#1a237e' },
  tabBadgeOff: { backgroundColor: '#eee' },
  tabBadgeTxt: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11, textAlign: 'center' },
  tabBadgeTxtOn: { color: '#fff' },
  tabBadgeTxtOff: { color: '#757575' },
  tabUnderline: { height: 2, width: '100%' },
  tabUnderlineActive: { backgroundColor: '#1a237e' },

  // Filter chips row
  filterRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 10, flexWrap: 'wrap' },
  filterChip: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 100, paddingHorizontal: 13, paddingVertical: 5 },
  filterChipTxt: { fontFamily: 'Inter', fontWeight: '400', fontSize: 13, color: '#424242' },

  // Card list
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  cardList: { padding: 12, gap: 10 },

  // Common card
  card: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, padding: 16, gap: 8 },
  overdueCard: { borderColor: '#ffcdd2' },
  appealCard: { borderColor: '#e0e0e0' },

  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTicketNum: { fontFamily: 'Inter', fontWeight: '400', fontSize: 11, color: '#9e9e9e', lineHeight: 16.5 },
  overdueBadge: { backgroundColor: '#d32f2f', borderRadius: 100, paddingHorizontal: 10, height: 19, justifyContent: 'center' },
  overdueBadgeTxt: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, color: '#ffffff', lineHeight: 15, textTransform: 'uppercase' },
  appealBadge: { backgroundColor: '#e65100', borderRadius: 100, paddingHorizontal: 10, height: 19, justifyContent: 'center' },
  appealBadgeTxt: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, color: '#ffffff', lineHeight: 15, textTransform: 'uppercase' },

  roleChip: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  roleChipTxt: { fontFamily: 'Inter', fontWeight: '600', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 },

  cardTitle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 14, color: '#181818', lineHeight: 19.6 },
  cardDesc: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#757575', lineHeight: 18 },

  cardDateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDate: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#5c5c5c' },
  daysBadge: { height: 24.5, borderRadius: 100, paddingHorizontal: 10, justifyContent: 'center' },
  daysBadgeTxt: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11, lineHeight: 16.5 },

  appealReasonLabel: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11, color: '#e65100', textTransform: 'uppercase', letterSpacing: 0.4 },
  appealReasonTxt: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#616161', lineHeight: 18 },

  docBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#e8eaf6', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  docIcon: { width: 13, height: 13, tintColor: '#1a237e' },
  docTxt: { fontFamily: 'Inter', fontWeight: '500', fontSize: 11, color: '#1a237e' },

  cardByRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardByLabel: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#9e9e9e' },
  cardByName: { fontFamily: 'Inter', fontWeight: '500', fontSize: 12, color: '#424242' },

  // CTA Buttons
  ctaNavy: { backgroundColor: '#1a237e', borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 4 },
  ctaNavyTxt: { fontFamily: 'Inter', fontWeight: '700', fontSize: 13, color: '#fff', letterSpacing: 0.3 },
  ctaGreen: { backgroundColor: '#2e7d32', borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginTop: 4 },
  ctaGreenTxt: { fontFamily: 'Inter', fontWeight: '700', fontSize: 13, color: '#fff', letterSpacing: 0.3 },
  resolvedFooter: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 4, alignItems: 'center' },
  resolvedFooterTxt: { fontFamily: 'Inter', fontWeight: '700', fontSize: 12, color: '#2e7d32' },
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  overlayWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  dismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, width: '100%',
    backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden',
  },

  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 2 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0' },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sheetTitle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 15, color: '#1a237e' },
  closeIcon: { width: 18, height: 18, tintColor: '#1a237e' },

  body: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },

  // Total card
  totalCard: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14 },
  totalLabel: { fontFamily: 'Inter', fontWeight: '500', fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', lineHeight: 16.5 },
  totalVal: { fontFamily: 'Inter', fontWeight: '700', fontSize: 32, lineHeight: 36, marginTop: 2 },

  // Resolved total card
  resolvedTotalCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Table
  table: { borderWidth: 1, borderColor: '#eee', borderRadius: 10, overflow: 'hidden', marginTop: 4 },
  tRow: { flexDirection: 'row', alignItems: 'center' },
  tHeaderRow: { backgroundColor: '#f9f9fb', height: 36, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tColRole: { width: 120, paddingLeft: 14, justifyContent: 'center', height: 36 },
  tColCount: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tHeaderCell: { fontFamily: 'Inter', fontWeight: '600', fontSize: 10, color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: 0.4 },
  tRoleText: { fontFamily: 'Inter', fontWeight: '400', fontSize: 14, color: '#424242' },
  tStatVal: { fontFamily: 'Inter', fontWeight: '700', fontSize: 22, lineHeight: 28 },
  helpNote: { backgroundColor: '#f5f6fb', borderRadius: 8, borderWidth: 1, borderColor: '#e3e6f5', paddingHorizontal: 12, paddingVertical: 10, marginTop: 12 },
  helpNoteText: { fontFamily: 'Inter', fontSize: 11, lineHeight: 16, color: '#5c6470' },
  helpNoteHighlight: { fontWeight: '700', color: '#d32f2f' },

  // Pending total card & table (matches Supervisor view for uniformity)
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

  // Action Taken form
  miniCard: { backgroundColor: '#f5f5f5', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', padding: 12, gap: 4 },
  miniCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniCardNum: { fontFamily: 'Inter', fontWeight: '400', fontSize: 11, color: '#9e9e9e' },
  miniCardTitle: { fontFamily: 'Inter', fontWeight: '600', fontSize: 13, color: '#212121', lineHeight: 18 },
  rolePillSmall: { borderRadius: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  rolePillSmallTxt: { fontFamily: 'Inter', fontWeight: '600', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  overdueTagRed: { backgroundColor: '#ffebee', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  overdueTagRedTxt: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11, color: '#d32f2f' },
  overdueTagRedTxtSm: { fontFamily: 'Inter', fontWeight: '600', fontSize: 10, color: '#d32f2f' },

  fieldLabel: { fontFamily: 'Inter', fontWeight: '600', fontSize: 12, color: '#424242', letterSpacing: 0.3, marginBottom: -4 },

  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  catChipActive: { backgroundColor: '#1a237e', borderColor: '#1a237e' },
  catChipTxt: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#616161' },
  catChipTxtActive: { fontFamily: 'Inter', fontWeight: '600', color: '#fff' },

  textArea: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 12, minHeight: 96,
    fontFamily: 'Inter', fontSize: 13, color: '#424242', lineHeight: 20,
    backgroundColor: '#fafafa',
  },

  attachBtn: { borderWidth: 1.5, borderColor: '#1a237e', borderRadius: 8, borderStyle: 'dashed', paddingVertical: 11, alignItems: 'center' },
  attachBtnTxt: { fontFamily: 'Inter', fontWeight: '500', fontSize: 13, color: '#1a237e' },

  attachedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#bfa8da',
    borderRadius: 8,
    borderStyle: 'solid',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f6ff',
  },
  attachedFileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachedDocIcon: {
    width: 18,
    height: 18,
    tintColor: '#1a237e',
  },
  attachedFileText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: '#1a237e',
  },
  attachedFileSize: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    color: '#5c6bc0',
  },
  removeFileBtn: {
    padding: 4,
  },
  removeFileIcon: {
    width: 12,
    height: 12,
    tintColor: '#d32f2f',
  },

  submitBtn: { backgroundColor: '#1a237e', borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#b0bec5' },
  submitBtnTxt: { fontFamily: 'Inter', fontWeight: '700', fontSize: 14, color: '#fff', letterSpacing: 0.3 },

  successBanner: { backgroundColor: '#e8f5e9', borderRadius: 8, paddingVertical: 13, alignItems: 'center' },
  successBannerTxt: { fontFamily: 'Inter', fontWeight: '600', fontSize: 13, color: '#2e7d32' },

  // Appeal Resolution
  appealInfoRow: { gap: 2, marginTop: 4 },
  appealInfoLabel: { fontFamily: 'Inter', fontWeight: '600', fontSize: 10, color: '#e65100', textTransform: 'uppercase', letterSpacing: 0.4 },
  appealInfoTxt: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#616161', lineHeight: 17 },

  decisionRow: { gap: 10 },
  decisionOption: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 8, padding: 14 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  decisionLabel: { fontFamily: 'Inter', fontWeight: '700', fontSize: 13 },
  decisionSub: { fontFamily: 'Inter', fontWeight: '400', fontSize: 11, color: '#9e9e9e', marginTop: 1 },
  cardDate: { fontFamily: 'Inter', fontWeight: '400', fontSize: 12, color: '#5c5c5c' },

  // Resolved sub-cards (matches Supervisor view for uniformity)
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 8, paddingHorizontal: 4 },
  checkboxCircle: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#bdbdbd', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  checkboxCircleChecked: { borderColor: '#2e7d32', backgroundColor: '#e8f5e9' },
  checkmark: { color: '#2e7d32', fontSize: 12, fontWeight: 'bold', lineHeight: 14 },
  checkboxLabel: { flex: 1, fontFamily: 'Inter', fontSize: 12, color: '#616161', lineHeight: 16.5 },
});

const ds = StyleSheet.create({
  sectionHeader: {
    marginTop: 14,
    marginBottom: 8,
    gap: 6,
  },
  sectionHeaderTxt: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 11,
    color: '#1a237e',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionHeaderLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryTitle: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 20,
    color: '#1a237e',
    lineHeight: 30,
  },
  summaryBadge: {
    backgroundColor: '#e8eaf6',
    borderWidth: 1,
    borderColor: '#9fa8da',
    borderRadius: 100,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  summaryBadgeTxt: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 10,
    color: '#1565c0',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  infoList: {
    gap: 12,
    marginVertical: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    width: 120,
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 12,
    color: '#9e9e9e',
    lineHeight: 18,
  },
  infoValue: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 13,
    color: '#212121',
    lineHeight: 19.5,
  },
  textBlock: {
    gap: 10,
    marginTop: 6,
  },
  textBlockLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    color: '#9e9e9e',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  blueBox: {
    backgroundColor: '#e8eaf6',
    borderWidth: 1,
    borderColor: '#c5cae9',
    borderRadius: 8,
    padding: 15,
  },
  blueBoxTxt: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 13,
    color: '#1a237e',
    lineHeight: 21.45,
  },
  timeline: {
    paddingLeft: 8,
    marginVertical: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 12,
    height: 52,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  timelineRight: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: '#212121',
    lineHeight: 19.5,
  },
  timelineDate: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    color: '#9e9e9e',
    lineHeight: 16.5,
    marginTop: 2,
  },
  readOnlyBanner: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  readOnlyBannerTxt: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 13,
    color: '#757575',
  },
});
