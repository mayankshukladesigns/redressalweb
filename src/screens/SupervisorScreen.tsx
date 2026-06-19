import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  StatusBar,
  TextInput,
} from 'react-native';
import {
  pendingCards,
  resolvedCards,
  TicketCard,
  ResolvedTicketCard,
  AssignedFilter,
  TabType,
  ResolvedStatus,
  TicketCardComponent,
  ResolvedTicketCardComponent,
  getStatusLabel,
} from './BeneficiaryRedressalScreen';
import TicketDetailsScreen from './TicketDetailsScreen';

// ─── Asset URLs ────────────────────────────────────────────────────────────────
const imgIcon = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/reception-4.svg';
const imgIcon1 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/wifi.svg';
const imgIcon2 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/battery-full.svg';
const imgBackIconWhite = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/arrow-left.svg';
const imgChevronDown = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/chevron-down.svg';
const imgCloseIcon = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/x.svg';
const imgCalendarIcon = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/calendar3.svg';
const imgCalendarIcon1 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/calendar3.svg';
const imgCalendarIcon2 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/calendar3.svg';

// ─── Types ─────────────────────────────────────────────────────────────────────
type SupervisorFilter = 'Me' | 'AWW';

// Supervisor-specific pending tickets: supervisor's own + AWW tickets
const supervisorPendingCards: TicketCard[] = pendingCards.filter(
  (c) => c.assignedTo === 'Supervisor' || c.assignedTo === 'AWW'
);
const supervisorResolvedCards: ResolvedTicketCard[] = resolvedCards.filter(
  (c) => c.assignedTo === 'Supervisor' || c.assignedTo === 'AWW'
);

// AWC options for the supervisor's scope
const SVR_AWC_OPTIONS = [
  'All Centres',
  'Anganwadi Centre 1',
  'Anganwadi Centre 2',
  'Anganwadi Centre 3',
  'Anganwadi Centre 4',
  'Anganwadi Centre 5',
  'Anganwadi Centre 6',
];

// ─── Shared animation hook ────────────────────────────────────────────────────

const useSheetAnim = (visible: boolean) => {
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 600, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        setMounted(false);
        slideAnim.setValue(600);
        fadeAnim.setValue(0);
      });
    }
  }, [visible]);

  return { slideAnim, fadeAnim, mounted };
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const StatusBar_ = () => (
  <View style={svStyles.statusBar}>
    <Text style={svStyles.statusTime}>9:41</Text>
    <View style={svStyles.statusIcons}>
      <Image source={{ uri: imgIcon }} style={svStyles.statusIcon16} />
      <Image source={{ uri: imgIcon1 }} style={svStyles.statusIcon14} />
      <Image source={{ uri: imgIcon2 }} style={svStyles.statusIcon20} />
    </View>
  </View>
);

const Header = ({ onBack }: { onBack?: () => void }) => (
  <View style={svStyles.header}>
    <TouchableOpacity style={svStyles.backButton} onPress={onBack} activeOpacity={0.7}>
      <Image source={{ uri: imgBackIconWhite }} style={svStyles.backIcon} />
    </TouchableOpacity>
    <Text style={svStyles.headerTitle}>Beneficiary Redressal</Text>
    <View style={svStyles.headerSpacer} />
  </View>
);

const SubHeader = () => (
  <View style={svStyles.subHeader}>
    <Text style={svStyles.subHeaderText}>Sector 1</Text>
    <Text style={svStyles.subHeaderSeparator}>|</Text>
    <Text style={svStyles.subHeaderText}>AWC 6</Text>
  </View>
);

// Summary table with Supervisor + AWW rows
const SummaryTable = ({
  onPendingFilter,
  onResolvedFilter,
}: {
  onPendingFilter: () => void;
  onResolvedFilter: () => void;
}) => (
  <View style={svStyles.summarySection}>
    <Text style={svStyles.summaryLabel}>SUMMARY</Text>
    <View style={svStyles.summaryCard}>
      {/* Header Row */}
      <View style={[svStyles.summaryRow, svStyles.summaryHeaderRow]}>
        <View style={svStyles.summaryCol0} />
        <TouchableOpacity style={svStyles.summaryColBtn} onPress={onPendingFilter} activeOpacity={0.7}>
          <Text style={[svStyles.summaryColBtnText, { color: '#e65100' }]}>PENDING</Text>
          <Text style={[svStyles.chevronText, { color: '#e65100' }]}>▾</Text>
        </TouchableOpacity>
        <TouchableOpacity style={svStyles.summaryColBtn} onPress={onResolvedFilter} activeOpacity={0.7}>
          <Text style={[svStyles.summaryColBtnText, { color: '#2e7d32' }]}>RESOLVED</Text>
          <Text style={[svStyles.chevronText, { color: '#2e7d32' }]}>▾</Text>
        </TouchableOpacity>
        <View style={svStyles.summaryColBtn}>
          <Text style={[svStyles.summaryColBtnText, { color: '#1a237e' }]}>TOTAL</Text>
        </View>
      </View>

      {/* Supervisor (Me) Row */}
      <View style={[svStyles.summaryRow, svStyles.summaryDataRow, { borderBottomColor: '#f5f5f5' }]}>
        <View style={svStyles.summaryCol0}><Text style={svStyles.summaryRowLabel}>Supervisor</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#e65100' }]}>10</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#2e7d32' }]}>30</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#1a237e' }]}>40</Text></View>
      </View>

      {/* AWW Row */}
      <View style={[svStyles.summaryRow, svStyles.summaryDataRow, { borderBottomColor: '#e0e0e0' }]}>
        <View style={svStyles.summaryCol0}><Text style={svStyles.summaryRowLabel}>AWW</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#e65100' }]}>2,000</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#2e7d32' }]}>1,000</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#1a237e' }]}>3,000</Text></View>
      </View>

      {/* Total Row */}
      <View style={[svStyles.summaryRow, svStyles.summaryDataRow, { borderBottomWidth: 0 }]}>
        <View style={svStyles.summaryCol0}>
          <Text style={[svStyles.summaryRowLabel, { fontWeight: '600', color: '#1a237e' }]}>Total</Text>
        </View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#e65100' }]}>2,010</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#2e7d32' }]}>1,030</Text></View>
        <View style={svStyles.summaryColData}><Text style={[svStyles.summaryDataValue, { color: '#1a237e' }]}>3,040</Text></View>
      </View>
    </View>
    <Text style={svStyles.summaryHint}>Tap PENDING or RESOLVED column for detailed breakdown</Text>
  </View>
);

// Assigned To: Me | AWW
const AssignedToFilter = ({
  selected,
  onSelect,
}: {
  selected: SupervisorFilter;
  onSelect: (val: SupervisorFilter) => void;
}) => (
  <View style={svStyles.assignedToRow}>
    <Text style={svStyles.assignedToLabel}>Assigned To</Text>
    <View style={svStyles.assignedChips}>
      {(['Me', 'AWW'] as SupervisorFilter[]).map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            svStyles.assignedChip,
            selected === item ? svStyles.assignedChipActive : svStyles.assignedChipInactive,
          ]}
          onPress={() => onSelect(item)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              svStyles.assignedChipText,
              selected === item ? svStyles.assignedChipTextActive : svStyles.assignedChipTextInactive,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// Anganwadi Centre dropdown (used when AWW is selected)
const AWCDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={svStyles.dropdownWrapper}>
    <TouchableOpacity style={svStyles.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={svStyles.dropdownDot} />
      <View style={svStyles.dropdownDivider} />
      <View style={svStyles.dropdownTextBlock}>
        <Text style={svStyles.dropdownLabel}>ANGANWADI CENTRE</Text>
        <Text style={svStyles.dropdownValue}>{value}</Text>
      </View>
      <Image source={{ uri: imgChevronDown }} style={svStyles.dropdownChevron} />
    </TouchableOpacity>
  </View>
);

// AWC Dropdown Pick Sheet
const AWCPickSheet = ({
  visible,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={svModalStyles.overlayWrapper}>
      <Animated.View style={[svModalStyles.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={svModalStyles.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[svModalStyles.sheet, { height: 80 + options.length * 52, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={svModalStyles.handleRow}><View style={svModalStyles.handle} /></View>
        <View style={svModalStyles.titleRow}>
          <Text style={svModalStyles.sheetTitle}>Select Anganwadi Centre</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={svModalStyles.closeIcon} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={svModalStyles.radioRow}
                onPress={() => { onSelect(opt); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={[svModalStyles.radioOutline, selected === opt && svModalStyles.radioOutlineActive]}>
                  {selected === opt && <View style={svModalStyles.radioInner} />}
                </View>
                <Text style={[svModalStyles.radioLabel, selected === opt && { color: '#1a237e', fontWeight: '600' }]}>
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

// Tab Bar
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
  <View style={svStyles.tabBar}>
    {(['Pending', 'Resolved'] as TabType[]).map((tab) => (
      <TouchableOpacity
        key={tab}
        style={svStyles.tabItem}
        onPress={() => onTabChange(tab)}
        activeOpacity={0.8}
      >
        <View style={svStyles.tabContent}>
          <Text style={[svStyles.tabText, activeTab === tab && svStyles.tabTextActive]}>{tab}</Text>
          <View style={[svStyles.tabBadge, activeTab === tab ? svStyles.tabBadgeActive : svStyles.tabBadgeInactive]}>
            <Text style={[svStyles.tabBadgeText, activeTab === tab ? svStyles.tabBadgeTextActive : svStyles.tabBadgeTextInactive]}>
              {tab === 'Pending' ? pendingCount : resolvedCount}
            </Text>
          </View>
        </View>
        <View style={[svStyles.tabUnderline, activeTab === tab && svStyles.tabUnderlineActive]} />
      </TouchableOpacity>
    ))}
  </View>
);

// Date helper
function parseDateString(str: string): Date | null {
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
}
function parseInputDate(str: string): Date | null {
  const match = str.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
}

// Filter Chips
const FilterChips = ({
  activeTab,
  isOverdueActive,
  onOverdueToggle,
  onClearAll,
  appliedDateOption,
  appliedCategories,
  appliedStatuses,
  onDateRangePress,
  onCategoryPress,
  onStatusPress,
  onClearDateRange,
  onClearCategory,
  onClearStatus,
}: {
  activeTab: TabType;
  isOverdueActive: boolean;
  onOverdueToggle: () => void;
  onClearAll: () => void;
  appliedDateOption: '7' | '14' | '21' | 'custom' | null;
  appliedCategories: string[];
  appliedStatuses: ResolvedStatus[];
  onDateRangePress: () => void;
  onCategoryPress: () => void;
  onStatusPress: () => void;
  onClearDateRange: () => void;
  onClearCategory: () => void;
  onClearStatus: () => void;
}) => {
  const safeCategories = appliedCategories || [];
  const safeStatuses = appliedStatuses || [];
  const isAnyFilterActive =
    isOverdueActive || appliedDateOption !== null || safeCategories.length > 0 || safeStatuses.length > 0;

  const dateLabel =
    appliedDateOption === '7' ? '7 Days' :
    appliedDateOption === '14' ? '14 Days' :
    appliedDateOption === '21' ? '21 Days' :
    appliedDateOption === 'custom' ? 'Custom Range' : 'Date Range ▾';

  return (
    <View>
      <View style={svStyles.filterRow}>
        {activeTab === 'Pending' ? (
          <>
            <TouchableOpacity
              style={[svStyles.filterChip, isOverdueActive && svStyles.filterChipOverdueActive]}
              onPress={onOverdueToggle}
              activeOpacity={0.7}
            >
              <Text style={[svStyles.filterChipText, isOverdueActive && svStyles.filterChipTextActive]}>Overdue</Text>
              {isOverdueActive && <Text style={svStyles.filterChipClose}> ×</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[svStyles.filterChip, appliedDateOption !== null && svStyles.filterChipActive]}
              onPress={onDateRangePress}
              activeOpacity={0.7}
            >
              <Text style={[svStyles.filterChipText, appliedDateOption !== null && svStyles.filterChipTextActive]}>
                {dateLabel}
              </Text>
              {appliedDateOption !== null && (
                <TouchableOpacity onPress={onClearDateRange} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={svStyles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[svStyles.filterChip, safeCategories.length > 0 && svStyles.filterChipActive]}
              onPress={onCategoryPress}
              activeOpacity={0.7}
            >
              <Text style={[svStyles.filterChipText, safeCategories.length > 0 && svStyles.filterChipTextActive]}>
                {safeCategories.length === 0 ? 'Category ▾' : safeCategories.length === 1 ? safeCategories[0] : `${safeCategories.length} Categories`}
              </Text>
              {safeCategories.length > 0 && (
                <TouchableOpacity onPress={onClearCategory} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={svStyles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[svStyles.filterChip, safeStatuses.length > 0 && svStyles.filterChipActive]}
              onPress={onStatusPress}
              activeOpacity={0.7}
            >
              <Text style={[svStyles.filterChipText, safeStatuses.length > 0 && svStyles.filterChipTextActive]}>
                {safeStatuses.length === 0 ? 'Status ▾' : safeStatuses.length === 1 ? getStatusLabel(safeStatuses[0]) : `${safeStatuses.length} Statuses`}
              </Text>
              {safeStatuses.length > 0 && (
                <TouchableOpacity onPress={onClearStatus} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={svStyles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[svStyles.filterChip, appliedDateOption !== null && svStyles.filterChipActive]}
              onPress={onDateRangePress}
              activeOpacity={0.7}
            >
              <Text style={[svStyles.filterChipText, appliedDateOption !== null && svStyles.filterChipTextActive]}>
                {dateLabel}
              </Text>
              {appliedDateOption !== null && (
                <TouchableOpacity onPress={onClearDateRange} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={svStyles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[svStyles.filterChip, safeCategories.length > 0 && svStyles.filterChipActive]}
              onPress={onCategoryPress}
              activeOpacity={0.7}
            >
              <Text style={[svStyles.filterChipText, safeCategories.length > 0 && svStyles.filterChipTextActive]}>
                {safeCategories.length === 0 ? 'Category ▾' : safeCategories.length === 1 ? safeCategories[0] : `${safeCategories.length} Categories`}
              </Text>
              {safeCategories.length > 0 && (
                <TouchableOpacity onPress={onClearCategory} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={svStyles.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      {isAnyFilterActive && (
        <TouchableOpacity style={svStyles.clearAllRow} onPress={onClearAll} activeOpacity={0.7}>
          <Text style={svStyles.clearAllText}>Clear all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Supervisor Pending Breakdown Sheet ───────────────────────────────────────

const PendingBreakdownSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  const rows = [
    { role: 'Supervisor', pending: '10', overdue: '8', isSeparatorLight: true },
    { role: 'AWW', pending: '2,000', overdue: '508', isSeparatorLight: false },
    { role: 'Total', pending: '2,010', overdue: '516', isTotal: true },
  ];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={svModalStyles.overlayWrapper}>
      <Animated.View style={[svModalStyles.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={svModalStyles.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[svModalStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={svModalStyles.handleRow}><View style={svModalStyles.handle} /></View>
        <View style={svModalStyles.titleRow}>
          <Text style={svModalStyles.sheetTitle}>Pending Breakdown</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={svModalStyles.closeIcon} />
          </TouchableOpacity>
        </View>

        <View style={svModalStyles.sheetBody}>
          <View style={[svModalStyles.totalCard, { backgroundColor: '#e8eaf6' }]}>
            <Text style={[svModalStyles.totalLabel, { color: '#5c67b5' }]}>TOTAL PENDING</Text>
            <Text style={[svModalStyles.totalValue, { color: '#1a237e' }]}>2,010</Text>
          </View>

          <View style={svModalStyles.tableWrapper}>
            <View style={[svModalStyles.tableRow, svModalStyles.tableHeaderRow]}>
              <View style={svModalStyles.tableColRole}><Text style={svModalStyles.tableHeaderCell}>ROLE</Text></View>
              <View style={svModalStyles.tableColStat}><Text style={[svModalStyles.tableHeaderCell, { color: '#e65100' }]}>PENDING</Text></View>
              <View style={svModalStyles.tableColStat}><Text style={[svModalStyles.tableHeaderCell, { color: '#d32f2f' }]}>OVERDUE</Text></View>
            </View>
            {rows.map((row, idx) => (
              <View key={row.role} style={[
                svModalStyles.tableRow,
                { height: 58 },
                idx < rows.length - 1 ? { borderBottomWidth: 1, borderBottomColor: (row as any).isSeparatorLight === false ? '#e0e0e0' : '#f5f5f5' } : {},
                (row as any).isTotal ? { backgroundColor: '#fafafa' } : {},
              ]}>
                <View style={svModalStyles.tableColRole}>
                  <Text style={[svModalStyles.tableRoleText, (row as any).isTotal ? { fontWeight: '600', color: '#1a237e' } : {}]}>{row.role}</Text>
                </View>
                <View style={svModalStyles.tableColStat}>
                  <Text style={[svModalStyles.tableStatVal, { color: '#e65100' }]}>{row.pending}</Text>
                </View>
                <View style={svModalStyles.tableColStat}>
                  <Text style={[svModalStyles.tableStatVal, { color: '#d32f2f' }]}>{row.overdue}</Text>
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

// ─── Supervisor Resolved Breakdown Sheet ──────────────────────────────────────

const ResolvedBreakdownSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  const subCards = [
    {
      label: 'Closure Pending', value: '103', color: '#f57f17',
      bg: '#fff8e1', border: '#ffe082', divider: '#ffe082',
      rows: [{ role: 'Supervisor', val: '3' }, { role: 'AWW', val: '100' }],
    },
    {
      label: 'Closed', value: '850', color: '#2e7d32',
      bg: '#e8f5e9', border: '#a5d6a7', divider: '#a5d6a7',
      rows: [{ role: 'Supervisor', val: '100' }, { role: 'AWW', val: '750' }],
    },
    {
      label: 'Appeal Raised', value: '92', color: '#e65100',
      bg: '#fff3e0', border: '#ffcc80', divider: '#ffcc80',
      rows: [{ role: 'Supervisor', val: '12' }, { role: 'AWW', val: '80' }],
    },
    {
      label: 'Appeal Resolved', value: '79', color: '#1565c0',
      bg: '#e8eaf6', border: '#90caf9', divider: '#90caf9',
      rows: [{ role: 'Supervisor', val: '9' }, { role: 'AWW', val: '70' }],
    },
  ];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={svModalStyles.overlayWrapper}>
      <Animated.View style={[svModalStyles.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={svModalStyles.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[svModalStyles.sheet, { height: 510, transform: [{ translateY: slideAnim }] }]}>
        <View style={svModalStyles.handleRow}><View style={svModalStyles.handle} /></View>
        <View style={svModalStyles.titleRow}>
          <Text style={svModalStyles.sheetTitle}>Resolved Breakdown</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={svModalStyles.closeIcon} />
          </TouchableOpacity>
        </View>

        <View style={svModalStyles.sheetBody}>
          {/* Total resolved card */}
          <View style={svModalStyles.resolvedTotalCard}>
            <View>
              <Text style={[svModalStyles.totalLabel, { color: '#388e3c' }]}>TOTAL RESOLVED</Text>
              <Text style={[svModalStyles.totalValue, { color: '#2e7d32' }]}>1,030</Text>
            </View>
            <View style={{ gap: 3, alignItems: 'flex-end' }}>
              {[{ label: 'Supervisor', val: '30' }, { label: 'AWW', val: '1,000' }].map(r => (
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
              <View key={card.label} style={[svModalStyles.subCard, { backgroundColor: card.bg, borderColor: card.border }]}>
                <Text style={[svModalStyles.subCardLabel, { color: card.color }]}>{card.label.toUpperCase()}</Text>
                <Text style={[svModalStyles.subCardValue, { color: card.color }]}>{card.value}</Text>
                <View style={[svModalStyles.subCardDivider, { borderTopColor: card.divider }]}>
                  {card.rows.map(r => (
                    <View key={r.role} style={svModalStyles.subCardRow}>
                      <Text style={[svModalStyles.subCardRowLabel, { color: card.color }]}>{r.role}</Text>
                      <Text style={[svModalStyles.subCardRowVal, { color: card.color }]}>{r.val}</Text>
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
    if (visible) { setOption(appliedOption); setFromText(appliedFrom); setToText(appliedTo); }
  }, [visible, appliedOption, appliedFrom, appliedTo]);

  if (!mounted) return null;

  const isApplyDisabled = option === null || (option === 'custom' && (!fromText || !toText || fromText.length < 10 || toText.length < 10));
  const sheetHeight = option === 'custom' ? 520 : 360;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={svModalStyles.overlayWrapper}>
      <Animated.View style={[svModalStyles.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={svModalStyles.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[svModalStyles.sheet, { height: sheetHeight, transform: [{ translateY: slideAnim }] }]}>
        <View style={svModalStyles.handleRow}><View style={svModalStyles.handle} /></View>
        <View style={svModalStyles.titleRow}>
          <Text style={svModalStyles.sheetTitle}>Filter by Date Range</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={svModalStyles.closeIcon} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            {(['7', '14', '21'] as const).map((opt) => (
              <TouchableOpacity key={opt} style={svModalStyles.radioRow} onPress={() => setOption(opt)} activeOpacity={0.7}>
                <View style={[svModalStyles.radioOutline, option === opt && svModalStyles.radioOutlineActive]}>
                  {option === opt && <View style={svModalStyles.radioInner} />}
                </View>
                <Text style={svModalStyles.radioLabel}>Last {opt} Days</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={svModalStyles.radioRow} onPress={() => setOption('custom')} activeOpacity={0.7}>
              <View style={[svModalStyles.radioOutline, option === 'custom' && svModalStyles.radioOutlineActive]}>
                {option === 'custom' && <View style={svModalStyles.radioInner} />}
              </View>
              <Text style={[svModalStyles.radioLabel, option === 'custom' && { color: '#1a237e', fontWeight: '600' }]}>Custom Range</Text>
            </TouchableOpacity>
            {option === 'custom' && (
              <View style={{ paddingLeft: 36, paddingRight: 16, paddingVertical: 12 }}>
                <Text style={svModalStyles.inputLabel}>FROM DATE</Text>
                <TextInput
                  style={svModalStyles.textInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9e9e9e"
                  value={fromText}
                  maxLength={10}
                  onChangeText={setFromText}
                />
                <Text style={[svModalStyles.inputLabel, { marginTop: 12 }]}>TO DATE</Text>
                <TextInput
                  style={svModalStyles.textInput}
                  placeholder="DD/MM/YYYY"
                  placeholderTextColor="#9e9e9e"
                  value={toText}
                  maxLength={10}
                  onChangeText={setToText}
                />
              </View>
            )}
          </View>
        </ScrollView>
        <View style={svModalStyles.buttonsContainer}>
          <TouchableOpacity
            style={svModalStyles.clearBtn}
            onPress={() => { setOption(null); setFromText(''); setToText(''); onApply(null, '', ''); }}
            activeOpacity={0.7}
          >
            <Text style={svModalStyles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[svModalStyles.applyBtn, isApplyDisabled && svModalStyles.applyBtnDisabled]}
            disabled={isApplyDisabled}
            onPress={() => onApply(option, fromText, toText)}
            activeOpacity={0.7}
          >
            <Text style={svModalStyles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// Category Filter Sheet
const CategoryFilterSheet = ({
  visible,
  onClose,
  appliedCategories,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  appliedCategories: string[];
  onApply: (cats: string[]) => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [tempCats, setTempCats] = useState<string[]>(appliedCategories);
  useEffect(() => { if (visible) setTempCats(appliedCategories); }, [visible, appliedCategories]);
  if (!mounted) return null;

  const opts = [
    { label: 'Pregnant Woman', color: '#e91e63' },
    { label: 'Lactating Mother', color: '#9c27b0' },
    { label: 'Children (0-6y)', color: '#ff9800' },
    { label: 'Adolescent Girl', color: '#4caf50' },
  ];

  const toggle = (val: string) => {
    setTempCats((prev) => prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]);
  };

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={svModalStyles.overlayWrapper}>
      <Animated.View style={[svModalStyles.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={svModalStyles.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[svModalStyles.sheet, { height: 380, transform: [{ translateY: slideAnim }] }]}>
        <View style={svModalStyles.handleRow}><View style={svModalStyles.handle} /></View>
        <View style={svModalStyles.titleRow}>
          <Text style={svModalStyles.sheetTitle}>Filter by Category</Text>
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {opts.map((opt) => {
            const isSel = tempCats.includes(opt.label);
            return (
              <TouchableOpacity key={opt.label} style={svModalStyles.radioRow} onPress={() => toggle(opt.label)} activeOpacity={0.7}>
                <View style={[svModalStyles.radioOutline, isSel && svModalStyles.radioOutlineActive]}>
                  {isSel && <View style={svModalStyles.radioInner} />}
                </View>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: opt.color, marginRight: 6 }} />
                <Text style={[svModalStyles.radioLabel, isSel && { color: '#1a237e', fontWeight: '600' }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={svModalStyles.buttonsContainer}>
          <TouchableOpacity style={svModalStyles.clearBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={svModalStyles.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={svModalStyles.applyBtn} onPress={() => onApply(tempCats)} activeOpacity={0.7}>
            <Text style={svModalStyles.applyBtnText}>{tempCats.length > 0 ? `Apply (${tempCats.length})` : 'Apply'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// Status Filter Sheet
const StatusFilterSheet = ({
  visible,
  onClose,
  appliedStatuses,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  appliedStatuses: ResolvedStatus[];
  onApply: (statuses: ResolvedStatus[]) => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [temp, setTemp] = useState<ResolvedStatus[]>(appliedStatuses);
  useEffect(() => { if (visible) setTemp(appliedStatuses); }, [visible, appliedStatuses]);
  if (!mounted) return null;

  const opts: { label: string; value: ResolvedStatus; color: string }[] = [
    { label: 'Closed', value: 'CLOSED', color: '#2e7d32' },
    { label: 'Closure Pending', value: 'CLOSURE_PENDING', color: '#f57f17' },
    { label: 'Appeal Raised', value: 'APPEAL_RAISED', color: '#e65100' },
    { label: 'Appeal Resolved', value: 'APPEAL_RESOLVED', color: '#1565c0' },
  ];

  const toggle = (val: ResolvedStatus) => {
    setTemp((prev) => prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]);
  };

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={svModalStyles.overlayWrapper}>
      <Animated.View style={[svModalStyles.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={svModalStyles.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[svModalStyles.sheet, { height: 400, transform: [{ translateY: slideAnim }] }]}>
        <View style={svModalStyles.handleRow}><View style={svModalStyles.handle} /></View>
        <View style={svModalStyles.titleRow}>
          <Text style={svModalStyles.sheetTitle}>Filter by Status</Text>
        </View>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          {opts.map((opt) => {
            const isSel = temp.includes(opt.value);
            return (
              <TouchableOpacity key={opt.value} style={svModalStyles.radioRow} onPress={() => toggle(opt.value)} activeOpacity={0.7}>
                <View style={[svModalStyles.radioOutline, isSel && svModalStyles.radioOutlineActive]}>
                  {isSel && <View style={svModalStyles.radioInner} />}
                </View>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: opt.color, marginRight: 6 }} />
                <Text style={[svModalStyles.radioLabel, isSel && { color: '#1a237e', fontWeight: '600' }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={svModalStyles.buttonsContainer}>
          <TouchableOpacity style={svModalStyles.clearBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={svModalStyles.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={svModalStyles.applyBtn} onPress={() => onApply(temp)} activeOpacity={0.7}>
            <Text style={svModalStyles.applyBtnText}>{temp.length > 0 ? `Apply (${temp.length})` : 'Apply'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// ─── Ticket Details Overlay ───────────────────────────────────────────────────

const TicketDetailsOverlay = ({
  card,
  onBack,
  onResolveTicket,
}: {
  card: any;
  onBack: () => void;
  onResolveTicket?: (ticketId: string, closureNote: string) => void;
}) => (
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 375 }}>
    <TicketDetailsScreen
      card={card}
      assignedFilter={'Supervisor'}
      onBack={onBack}
      onResolveTicket={onResolveTicket}
      resolveLabel="Resolve"
      hideResolveCTA={card.assignedTo === 'AWW'}
    />
  </View>
);

// ─── Main Supervisor Screen ───────────────────────────────────────────────────

export default function SupervisorScreen({ onBack }: { onBack?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('Pending');
  const [supervisorFilter, setSupervisorFilter] = useState<SupervisorFilter>('Me');
  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const [resolvedModalVisible, setResolvedModalVisible] = useState(false);

  const [selectedAWC, setSelectedAWC] = useState('All Centres');
  const [awcPickVisible, setAwcPickVisible] = useState(false);

  const [isOverdueActive, setIsOverdueActive] = useState(false);
  const [dateRangeModalVisible, setDateRangeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [appliedDateOption, setAppliedDateOption] = useState<'7' | '14' | '21' | 'custom' | null>(null);
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedStatuses, setAppliedStatuses] = useState<ResolvedStatus[]>([]);

  const [myPendingCards, setMyPendingCards] = useState<TicketCard[]>(supervisorPendingCards);
  const [myResolvedCards, setMyResolvedCards] = useState<ResolvedTicketCard[]>(supervisorResolvedCards);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const mockCurrentDate = new Date(2025, 5, 30);

  const handleResolveTicket = (ticketId: string, closureNote: string) => {
    const ticket = myPendingCards.find((t) => t.id === ticketId);
    if (ticket) {
      const newCard: ResolvedTicketCard = {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        beneficiaryName: ticket.beneficiaryName,
        beneficiaryType: ticket.beneficiaryType,
        topic: ticket.topic ?? '',
        description: ticket.description,
        resolvedDate: 'Resolved: 30/06/2025',
        // Supervisor resolves → CLOSURE_PENDING (CDPO will close)
        status: 'CLOSURE_PENDING',
        awaitingCdpoClosure: true,
        actionTaken: closureNote,
        awcName: ticket.awcName,
        helpTopic: ticket.helpTopic ?? ticket.topic ?? '',
        subTopic: ticket.subTopic ?? ticket.topic ?? '',
        beneficiaryMobile: ticket.beneficiaryMobile ?? '',
        awcCode: ticket.awcCode ?? '',
        district: ticket.district ?? 'Jaipur',
        project: ticket.project ?? 'Sanganer',
        sector: ticket.sector ?? 'Sector 1',
        assignedTo: ticket.assignedTo ?? 'Supervisor',
      };
      setMyPendingCards((prev) => prev.filter((t) => t.id !== ticketId));
      setMyResolvedCards((prev) => [newCard, ...prev]);
    }
  };

  const clearFilters = () => {
    setIsOverdueActive(false);
    setAppliedDateOption(null);
    setAppliedFromDate('');
    setAppliedToDate('');
    setAppliedCategories([]);
    setAppliedStatuses([]);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    clearFilters();
  };

  // Me → Supervisor's own tickets | AWW → AWW-assigned tickets
  const roleKey = supervisorFilter === 'Me' ? 'Supervisor' : 'AWW';

  const displayedPendingCards = myPendingCards.filter((card) => {
    if (card.assignedTo !== roleKey) return false;
    if (supervisorFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!card.awcName || card.awcName !== selectedAWC) return false;
    }
    if (isOverdueActive && !card.isOverdue) return false;
    if (appliedDateOption !== null) {
      const cardDate = parseDateString(card.submittedDate);
      if (!cardDate) return false;
      if (appliedDateOption === '7' || appliedDateOption === '14' || appliedDateOption === '21') {
        const days = parseInt(appliedDateOption);
        const diff = (mockCurrentDate.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 0 || diff > days) return false;
      } else if (appliedDateOption === 'custom') {
        const from = parseInputDate(appliedFromDate);
        const to = parseInputDate(appliedToDate);
        if (from && cardDate < from) return false;
        if (to && cardDate > to) return false;
      }
    }
    if (appliedCategories.length > 0 && (!card.beneficiaryType || !appliedCategories.includes(card.beneficiaryType))) return false;
    return true;
  });

  const displayedResolvedCards = myResolvedCards.filter((card) => {
    if (card.assignedTo !== roleKey) return false;
    if (supervisorFilter === 'AWW' && selectedAWC !== 'All Centres') {
      if (!card.awcName || card.awcName !== selectedAWC) return false;
    }
    if (appliedStatuses.length > 0 && (!card.status || !appliedStatuses.includes(card.status))) return false;
    if (appliedDateOption !== null) {
      const cardDate = parseDateString(card.resolvedDate);
      if (!cardDate) return false;
      if (appliedDateOption === '7' || appliedDateOption === '14' || appliedDateOption === '21') {
        const days = parseInt(appliedDateOption);
        const diff = (mockCurrentDate.getTime() - cardDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 0 || diff > days) return false;
      } else if (appliedDateOption === 'custom') {
        const from = parseInputDate(appliedFromDate);
        const to = parseInputDate(appliedToDate);
        if (from && cardDate < from) return false;
        if (to && cardDate > to) return false;
      }
    }
    if (appliedCategories.length > 0 && (!card.beneficiaryType || !appliedCategories.includes(card.beneficiaryType))) return false;
    return true;
  });

  return (
    <View style={svStyles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      <StatusBar_ />
      <Header onBack={onBack} />
      <SubHeader />

      <ScrollView style={svStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={svStyles.scrollContent}>
        <SummaryTable
          onPendingFilter={() => setPendingModalVisible(true)}
          onResolvedFilter={() => setResolvedModalVisible(true)}
        />

        <AssignedToFilter
          selected={supervisorFilter}
          onSelect={(val) => {
            setSupervisorFilter(val);
            setSelectedAWC('All Centres');
            clearFilters();
          }}
        />

        {/* AWC dropdown — only when AWW tab is selected */}
        {supervisorFilter === 'AWW' && (
          <AWCDropdown value={selectedAWC} onPress={() => setAwcPickVisible(true)} />
        )}

        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          pendingCount={displayedPendingCards.length}
          resolvedCount={displayedResolvedCards.length}
        />

        <FilterChips
          activeTab={activeTab}
          isOverdueActive={isOverdueActive}
          onOverdueToggle={() => setIsOverdueActive((v) => !v)}
          onClearAll={clearFilters}
          appliedDateOption={appliedDateOption}
          appliedCategories={appliedCategories}
          appliedStatuses={appliedStatuses}
          onDateRangePress={() => setDateRangeModalVisible(true)}
          onCategoryPress={() => setCategoryModalVisible(true)}
          onStatusPress={() => setStatusModalVisible(true)}
          onClearDateRange={() => { setAppliedDateOption(null); setAppliedFromDate(''); setAppliedToDate(''); }}
          onClearCategory={() => setAppliedCategories([])}
          onClearStatus={() => setAppliedStatuses([])}
        />

        <View style={svStyles.cardList}>
          {activeTab === 'Pending'
            ? displayedPendingCards.map((card) => (
                <TicketCardComponent
                  key={card.id}
                  card={card}
                  showDocs={false}
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

      {/* Breakdown Sheets */}
      <PendingBreakdownSheet visible={pendingModalVisible} onClose={() => setPendingModalVisible(false)} />
      <ResolvedBreakdownSheet visible={resolvedModalVisible} onClose={() => setResolvedModalVisible(false)} />

      {/* AWC Pick Sheet */}
      <AWCPickSheet
        visible={awcPickVisible}
        options={SVR_AWC_OPTIONS}
        selected={selectedAWC}
        onSelect={setSelectedAWC}
        onClose={() => setAwcPickVisible(false)}
      />

      {/* Filter Sheets */}
      <DateRangeFilterSheet
        visible={dateRangeModalVisible}
        onClose={() => setDateRangeModalVisible(false)}
        appliedOption={appliedDateOption}
        appliedFrom={appliedFromDate}
        appliedTo={appliedToDate}
        onApply={(opt, from, to) => { setAppliedDateOption(opt); setAppliedFromDate(from); setAppliedToDate(to); setDateRangeModalVisible(false); }}
      />
      <CategoryFilterSheet
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        appliedCategories={appliedCategories}
        onApply={(cats) => { setAppliedCategories(cats); setCategoryModalVisible(false); }}
      />
      <StatusFilterSheet
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        appliedStatuses={appliedStatuses}
        onApply={(statuses) => { setAppliedStatuses(statuses); setStatusModalVisible(false); }}
      />

      {/* Ticket Details Overlay */}
      {selectedTicket && (
        <TicketDetailsOverlay
          card={selectedTicket}
          onBack={() => setSelectedTicket(null)}
          onResolveTicket={handleResolveTicket}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const svStyles = StyleSheet.create({
  root: { flex: 1, width: 375, backgroundColor: '#fafafa', overflow: 'hidden' },

  // Status Bar
  statusBar: { height: 24, backgroundColor: '#1a237e', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  statusTime: { fontFamily: 'Inter', fontWeight: '600', fontSize: 14, color: '#ffffff', lineHeight: 21 },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusIcon16: { width: 16, height: 12, tintColor: '#ffffff' },
  statusIcon14: { width: 14, height: 12, tintColor: '#ffffff' },
  statusIcon20: { width: 20, height: 12, tintColor: '#ffffff' },

  // Header
  header: { height: 56, backgroundColor: '#1a237e', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { width: 29, height: 24, justifyContent: 'center' },
  backIcon: { width: 24, height: 24, tintColor: '#ffffff' },
  headerTitle: { flex: 1, fontFamily: 'Inter', fontWeight: '700', fontSize: 16, color: '#ffffff', textAlign: 'center', lineHeight: 24 },
  headerSpacer: { width: 29 },

  // Sub Header
  subHeader: { height: 36, backgroundColor: '#f0f0f0', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
  subHeaderText: { fontFamily: 'Inter', fontWeight: '500', fontSize: 12, color: '#5c5c5c' },
  subHeaderSeparator: { fontFamily: 'Inter', fontSize: 12, color: '#bdbdbd' },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32, gap: 0 },

  // Summary
  summarySection: { backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  summaryLabel: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, color: '#1a237e', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  summaryCard: { backgroundColor: '#ffffff', borderRadius: 10, overflow: 'hidden' },
  summaryHint: { fontFamily: 'Inter', fontWeight: '400', fontSize: 10, color: '#bdbdbd', textAlign: 'center', marginTop: 7 },
  summaryRow: { flexDirection: 'row', alignItems: 'stretch' },
  summaryHeaderRow: { height: 37.3, borderBottomWidth: 0.8, borderBottomColor: '#f0f0f0' },
  summaryDataRow: { height: 47.8, borderBottomWidth: 0.8 },
  summaryCol0: { width: 100, justifyContent: 'center', paddingHorizontal: 10 },
  summaryColBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 4, paddingVertical: 10 },
  summaryColBtnText: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11, textTransform: 'uppercase', textAlign: 'center' },
  chevronText: { fontSize: 12, fontWeight: '600' },
  summaryColData: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summaryRowLabel: { fontFamily: 'Inter', fontWeight: '400', fontSize: 13, color: '#5c5c5c' },
  summaryDataValue: { fontFamily: 'Inter', fontWeight: '700', fontSize: 18, textAlign: 'center' },

  // Assigned To
  assignedToRow: { backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.8, borderBottomColor: '#f0f0f0' },
  assignedToLabel: { fontFamily: 'Inter', fontWeight: '500', fontSize: 11, color: '#9e9e9e' },
  assignedChips: { flexDirection: 'row', gap: 8 },
  assignedChip: { height: 28, borderRadius: 100, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  assignedChipActive: { backgroundColor: '#1a237e' },
  assignedChipInactive: { backgroundColor: '#ffffff', borderWidth: 0.8, borderColor: '#bdbdbd' },
  assignedChipText: { fontFamily: 'Inter', fontWeight: '600', fontSize: 12, textAlign: 'center' },
  assignedChipTextActive: { color: '#ffffff' },
  assignedChipTextInactive: { color: '#757575' },

  // AWC Dropdown
  dropdownWrapper: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 0.8, borderBottomColor: '#f0f0f0' },
  dropdownCard: { height: 48, borderWidth: 0.8, borderColor: '#bdbdbd', borderRadius: 8, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  dropdownDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a237e' },
  dropdownDivider: { width: 1, height: 24, backgroundColor: '#e0e0e0' },
  dropdownTextBlock: { flex: 1, flexDirection: 'column' },
  dropdownLabel: { fontFamily: 'Inter', fontWeight: '400', fontSize: 10, color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: 0.4 },
  dropdownValue: { fontFamily: 'Inter', fontWeight: '500', fontSize: 13, color: '#424242' },
  dropdownChevron: { width: 14, height: 14 },

  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: '#ffffff', borderBottomWidth: 0.8, borderBottomColor: '#f0f0f0' },
  tabItem: { flex: 1, alignItems: 'center' },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, paddingBottom: 8, paddingHorizontal: 12 },
  tabText: { fontFamily: 'Inter', fontWeight: '500', fontSize: 14, color: '#9e9e9e' },
  tabTextActive: { fontFamily: 'Inter', fontWeight: '700', color: '#1a237e' },
  tabBadge: { minWidth: 22, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  tabBadgeActive: { backgroundColor: '#1a237e' },
  tabBadgeInactive: { backgroundColor: '#f0f0f0' },
  tabBadgeText: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11 },
  tabBadgeTextActive: { color: '#ffffff' },
  tabBadgeTextInactive: { color: '#9e9e9e' },
  tabUnderline: { height: 2, width: '100%', backgroundColor: 'transparent' },
  tabUnderlineActive: { backgroundColor: '#1a237e' },

  // Filter chips
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#ffffff', borderBottomWidth: 0.8, borderBottomColor: '#f0f0f0' },
  filterChip: { height: 32, borderRadius: 100, borderWidth: 0.8, borderColor: '#e0e0e0', backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 4 },
  filterChipActive: { borderColor: '#1a237e', backgroundColor: '#e8eaf6' },
  filterChipOverdueActive: { borderColor: '#d32f2f', backgroundColor: '#ffebee' },
  filterChipText: { fontFamily: 'Inter', fontWeight: '400', fontSize: 13, color: '#424242' },
  filterChipTextActive: { color: '#1a237e', fontWeight: '600' },
  filterChipClose: { fontFamily: 'Inter', fontSize: 15, color: '#1a237e', fontWeight: '700' },
  clearAllRow: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#ffffff' },
  clearAllText: { fontFamily: 'Inter', fontWeight: '500', fontSize: 12, color: '#d32f2f', textDecorationLine: 'underline' },

  // Card list
  cardList: { paddingHorizontal: 12, paddingTop: 12, gap: 10, paddingBottom: 32 },
});

const svModalStyles = StyleSheet.create({
  overlayWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 375 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  dismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#ffffff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 0, overflow: 'hidden' },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 6 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 14 },
  sheetTitle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 16, color: '#1a237e' },
  closeIcon: { width: 20, height: 20 },
  sheetBody: { paddingHorizontal: 16 },
  totalCard: { borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  totalValue: { fontFamily: 'Inter', fontWeight: '700', fontSize: 28 },
  resolvedTotalCard: { backgroundColor: '#e8f5e9', borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tableWrapper: { marginTop: 16, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f0' },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  tableHeaderRow: { height: 40, backgroundColor: '#f5f5f5' },
  tableColRole: { width: 120, paddingHorizontal: 12 },
  tableColStat: { flex: 1, alignItems: 'center' },
  tableHeaderCell: { fontFamily: 'Inter', fontWeight: '700', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, color: '#757575' },
  tableRoleText: { fontFamily: 'Inter', fontWeight: '400', fontSize: 13, color: '#5c5c5c' },
  tableStatVal: { fontFamily: 'Inter', fontWeight: '700', fontSize: 18, textAlign: 'center' },
  subCard: { width: '47.5%', borderRadius: 10, borderWidth: 1, padding: 12 },
  subCardLabel: { fontFamily: 'Inter', fontWeight: '700', fontSize: 9, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  subCardValue: { fontFamily: 'Inter', fontWeight: '700', fontSize: 22, marginBottom: 8 },
  subCardDivider: { borderTopWidth: 1, paddingTop: 8, gap: 4 },
  subCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subCardRowLabel: { fontFamily: 'Inter', fontWeight: '400', fontSize: 11, opacity: 0.75 },
  subCardRowVal: { fontFamily: 'Inter', fontWeight: '700', fontSize: 13 },
  radioRow: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 14 },
  radioOutline: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#bdbdbd', alignItems: 'center', justifyContent: 'center' },
  radioOutlineActive: { borderColor: '#1a237e' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1a237e' },
  radioLabel: { flex: 1, fontFamily: 'Inter', fontWeight: '400', fontSize: 14, color: '#424242' },
  buttonsContainer: { borderTopWidth: 1, borderTopColor: '#eeeeee', flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 14 },
  clearBtn: { flex: 112, height: 46, borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  clearBtnText: { fontFamily: 'Inter', fontWeight: '500', fontSize: 14, color: '#757575' },
  applyBtn: { flex: 220, height: 46, borderRadius: 8, backgroundColor: '#1a237e', alignItems: 'center', justifyContent: 'center' },
  applyBtnDisabled: { backgroundColor: '#e0e0e0' },
  applyBtnText: { fontFamily: 'Inter', fontWeight: '600', fontSize: 14, color: '#ffffff' },
  inputLabel: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11, color: '#9e9e9e', letterSpacing: 0.6, marginBottom: 6 },
  textInput: { height: 40, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, backgroundColor: '#ffffff', paddingLeft: 12, fontFamily: 'Inter', fontSize: 14, color: '#212121' },
});
