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
import {
  pendingCards,
  resolvedCards,
  TicketCard,
  ResolvedTicketCard,
  ResolvedStatus,
  getStatusLabel,
  TicketCardComponent,
  ResolvedTicketCardComponent,
} from './BeneficiaryRedressalScreen';
import TicketDetailsScreen from './TicketDetailsScreen';

// ─── Assets ───────────────────────────────────────────────────────────────────
const imgIcon        = 'http://localhost:3845/assets/68a3d96cc9d535751db0556c4ec051a7b10232bc.svg';
const imgIcon1       = 'http://localhost:3845/assets/4e4c20143662c7fa550404d6af1b4a67fff5a25a.svg';
const imgIcon2       = 'http://localhost:3845/assets/d8fb18a3620042e5865afa1aa020f61987b34fbb.svg';
const imgBackIcon    = 'http://localhost:3845/assets/7f8f3adda2b5ee6b329aa4bec9e698dafbe66a4e.svg';
const imgCloseIcon   = 'http://localhost:3845/assets/67d1da512779267315b557231287a65b73068fac.svg';
const imgIcon3       = 'http://localhost:3845/assets/73be45dd812dab1ed305e0e71138eed35eb8bd6d.svg';
const imgCalendarIcon1 = 'http://localhost:3845/assets/266749b2e21c71d3d5c06cac6425a6fd2ad0fba5.svg';

// ─── Types ────────────────────────────────────────────────────────────────────
type AssignFilter = 'DPO' | 'CDPO' | 'Supervisor' | 'AWW';

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
const PROJECT_OPTIONS = ['All Projects', 'Sanganer', 'Jotwara', 'Amer', 'Sanganer II', 'Phagi'];

// Helper functions for date filtering (mock current date 30/06/2025)
function parseDateString(str: string): Date | null {
  const cleanStr = str.replace('Submitted:', '').replace('Resolved:', '').trim();
  const match = cleanStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
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

const DPOHeader = () => (
  <View style={s.header}>
    <TouchableOpacity style={s.backBtn} activeOpacity={0.7}>
      <Text style={s.backArrow}>{'←'}</Text>
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
        { label: 'DPO',        pending: '8',     resolved: '8',     total: '16' },
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
        <View style={s.sColData}><Text style={[s.sDataVal, { color: '#e65100' }]}>2,065</Text></View>
        <View style={s.sColData}><Text style={[s.sDataVal, { color: '#2e7d32' }]}>1,163</Text></View>
        <View style={s.sColData}><Text style={[s.sDataVal, { color: '#1a237e' }]}>3,228</Text></View>
      </View>
    </View>
  </View>
);

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

const CDPOTabBar = ({
  active,
  onChange,
  pendingCount,
  resolvedCount,
}: {
  active: 'Pending' | 'Resolved';
  onChange: (t: 'Pending' | 'Resolved') => void;
  pendingCount: number;
  resolvedCount: number;
}) => (
  <View style={s.tabBar}>
    {(['Pending', 'Resolved'] as const).map(tab => (
      <TouchableOpacity key={tab} style={s.tabItem} onPress={() => onChange(tab)} activeOpacity={0.8}>
        <View style={s.tabContent}>
          <Text style={[s.tabText, active === tab && s.tabTextActive]}>{tab}</Text>
          <View style={[s.tabBadge, active === tab ? s.tabBadgeOn : s.tabBadgeOff]}>
            <Text style={[s.tabBadgeTxt, active === tab ? s.tabBadgeTxtOn : s.tabBadgeTxtOff]}>
              {tab === 'Pending' ? pendingCount.toString() : resolvedCount.toString()}
            </Text>
          </View>
        </View>
        <View style={[s.tabUnderline, active === tab && s.tabUnderlineActive]} />
      </TouchableOpacity>
    ))}
  </View>
);

const SectorDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={s.dropdownWrapper}>
    <TouchableOpacity style={s.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={s.dropdownDot} />
      <View style={s.dropdownTextBlock}>
        <Text style={s.dropdownLabel}>SECTOR</Text>
        <Text style={s.dropdownValue}>{value}</Text>
      </View>
      <Text style={s.dropdownChevron}>▾</Text>
    </TouchableOpacity>
  </View>
);

const ProjectDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={s.dropdownWrapper}>
    <TouchableOpacity style={s.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={s.dropdownDot} />
      <View style={s.dropdownTextBlock}>
        <Text style={s.dropdownLabel}>PROJECT</Text>
        <Text style={s.dropdownValue}>{value}</Text>
      </View>
      <Text style={s.dropdownChevron}>▾</Text>
    </TouchableOpacity>
  </View>
);

const AnganwadiCentreDropdown = ({ value, onPress }: { value: string; onPress: () => void }) => (
  <View style={s.dropdownWrapper}>
    <TouchableOpacity style={s.dropdownCard} activeOpacity={0.75} onPress={onPress}>
      <View style={s.dropdownDot} />
      <View style={s.dropdownTextBlock}>
        <Text style={s.dropdownLabel}>ANGANWADI CENTRE</Text>
        <Text style={s.dropdownValue}>{value}</Text>
      </View>
      <Text style={s.dropdownChevron}>▾</Text>
    </TouchableOpacity>
  </View>
);

// ─── Filter Chips ─────────────────────────────────────────────────────────────

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
  activeTab: 'Pending' | 'Resolved';
  assignedFilter: AssignFilter;
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
  const isTypeFilter = assignedFilter === 'DPO' || assignedFilter === 'CDPO';
  const isAnyFilterActive =
    isOverdueActive ||
    appliedDateOption !== null ||
    safeTypes.length > 0 ||
    safeCategories.length > 0 ||
    safeStatuses.length > 0;

  return (
    <View>
      <View style={s.filterRow}>
        {activeTab === 'Pending' ? (
          <>
            <TouchableOpacity
              style={[s.filterChip, isOverdueActive && s.filterChipOverdueActive]}
              onPress={onOverdueToggle}
              activeOpacity={0.7}
            >
              <Text style={[s.filterChipTxt, isOverdueActive && s.filterChipTextActive]}>
                Overdue
              </Text>
              {isOverdueActive && <Text style={s.filterChipClose}> ×</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.filterChip, appliedDateOption !== null && s.filterChipActive]}
              onPress={onDateRangePress}
              activeOpacity={0.7}
            >
              <Text style={[s.filterChipTxt, appliedDateOption !== null && s.filterChipTextActive]}>
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
                  <Text style={s.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {isTypeFilter ? (
              <TouchableOpacity
                style={[s.filterChip, safeTypes.length > 0 && s.filterChipActive]}
                onPress={onTypePress}
                activeOpacity={0.7}
              >
                <Text style={[s.filterChipTxt, safeTypes.length > 0 && s.filterChipTextActive]}>
                  {safeTypes.length === 0
                    ? 'Type ▾'
                    : safeTypes.length === 1
                    ? safeTypes[0]
                    : `${safeTypes.length} Types`}
                </Text>
                {safeTypes.length > 0 && (
                  <TouchableOpacity onPress={onClearType} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                    <Text style={s.filterChipClose}> ×</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.filterChip, safeCategories.length > 0 && s.filterChipActive]}
                onPress={onCategoryPress}
                activeOpacity={0.7}
              >
                <Text style={[s.filterChipTxt, safeCategories.length > 0 && s.filterChipTextActive]}>
                  {safeCategories.length === 0
                    ? 'Category ▾'
                    : safeCategories.length === 1
                    ? safeCategories[0]
                    : `${safeCategories.length} Categories`}
                </Text>
                {safeCategories.length > 0 && (
                  <TouchableOpacity onPress={onClearCategory} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                    <Text style={s.filterChipClose}> ×</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[s.filterChip, safeStatuses.length > 0 && s.filterChipActive]}
              onPress={onStatusPress}
              activeOpacity={0.7}
            >
              <Text style={[s.filterChipTxt, safeStatuses.length > 0 && s.filterChipTextActive]}>
                {safeStatuses.length === 0
                  ? 'Status ▾'
                  : safeStatuses.length === 1
                  ? getStatusLabel(safeStatuses[0])
                  : `${safeStatuses.length} Statuses`}
              </Text>
              {safeStatuses.length > 0 && (
                <TouchableOpacity onPress={onClearStatus} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={s.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.filterChip, appliedDateOption !== null && s.filterChipActive]}
              onPress={onDateRangePress}
              activeOpacity={0.7}
            >
              <Text style={[s.filterChipTxt, appliedDateOption !== null && s.filterChipTextActive]}>
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
                  <Text style={s.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.filterChip, safeCategories.length > 0 && s.filterChipActive]}
              onPress={onCategoryPress}
              activeOpacity={0.7}
            >
              <Text style={[s.filterChipTxt, safeCategories.length > 0 && s.filterChipTextActive]}>
                {safeCategories.length === 0
                  ? 'Category ▾'
                  : safeCategories.length === 1
                  ? safeCategories[0]
                  : `${safeCategories.length} Categories`}
              </Text>
              {safeCategories.length > 0 && (
                <TouchableOpacity onPress={onClearCategory} hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}>
                  <Text style={s.filterChipClose}> ×</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
      {isAnyFilterActive && (
        <TouchableOpacity style={s.clearAllRow} onPress={onClearAll} activeOpacity={0.7}>
          <Text style={s.clearAllText}>Clear all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─── Date Range Sheet ──────────────────────────────────────────────────────────

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
  const [selectedOption, setSelectedOption] = useState<'7' | '14' | '21' | 'custom' | null>(appliedOption);
  const [fromText, setFromText] = useState(appliedFrom);
  const [toText, setToText] = useState(appliedTo);

  useEffect(() => {
    if (visible) {
      setSelectedOption(appliedOption);
      setFromText(appliedFrom);
      setToText(appliedTo);
    }
  }, [visible, appliedOption, appliedFrom, appliedTo]);

  if (!mounted) return null;

  const handleApply = () => {
    onApply(selectedOption, fromText, toText);
  };

  const handleClear = () => {
    onApply(null, '', '');
  };

  const isApplyDisabled =
    selectedOption === 'custom' &&
    (fromText.length !== 10 || toText.length !== 10);

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[ms.sheet, { height: selectedOption === 'custom' ? 440 : 330, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Filter by Date Range</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={ms.body}>
            {[
              { value: '7',  label: 'Last 7 Days' },
              { value: '14', label: 'Last 14 Days' },
              { value: '21', label: 'Last 21 Days' },
              { value: 'custom', label: 'Custom Range' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={ms.radioRow}
                onPress={() => setSelectedOption(opt.value as any)}
                activeOpacity={0.7}
              >
                <View style={[ms.radioCircle, selectedOption === opt.value && { borderColor: '#1a237e' }]}>
                  {selectedOption === opt.value && <View style={[ms.radioDot, { backgroundColor: '#1a237e' }]} />}
                </View>
                <Text style={ms.radioLabel}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

            {selectedOption === 'custom' && (
              <View style={ms.customInputs}>
                <Text style={ms.inputLabel}>FROM DATE</Text>
                <View style={ms.inputWrapper}>
                  <TextInput
                    style={ms.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9e9e9e"
                    value={fromText}
                    maxLength={10}
                    onChangeText={t => handleDateChange(t, setFromText)}
                  />
                  <Image source={{ uri: imgCalendarIcon1 }} style={ms.inputCalIcon} />
                </View>

                <Text style={[ms.inputLabel, { marginTop: 12 }]}>TO DATE</Text>
                <View style={ms.inputWrapper}>
                  <TextInput
                    style={ms.textInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9e9e9e"
                    value={toText}
                    maxLength={10}
                    onChangeText={t => handleDateChange(t, setToText)}
                  />
                  <Image source={{ uri: imgCalendarIcon1 }} style={ms.inputCalIcon} />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={ms.buttonsContainer}>
          <TouchableOpacity style={ms.clearBtn} onPress={handleClear} activeOpacity={0.7}>
            <Text style={ms.clearBtnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[ms.applyBtn, isApplyDisabled && ms.applyBtnDisabled]}
            disabled={isApplyDisabled}
            onPress={handleApply}
            activeOpacity={0.7}
          >
            <Text style={ms.applyBtnText}>Apply Filters</Text>
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
      setTempTypes(tempTypes.filter(t => t !== type));
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
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={handleCancel} />

      <Animated.View style={[ms.sheet, { height: 340, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Filter by Type</Text>
        </View>

        <View style={ms.optionsList}>
          {options.map(opt => {
            const isSelected = tempTypes.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={ms.radioRow}
                onPress={() => handleToggle(opt)}
                activeOpacity={0.7}
              >
                <View style={[ms.radioCircle, isSelected && { borderColor: '#1a237e' }]}>
                  {isSelected && <View style={[ms.radioDot, { backgroundColor: '#1a237e' }]} />}
                </View>
                <Text style={ms.radioLabel}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={ms.buttonsContainer}>
          <TouchableOpacity style={ms.clearBtn} onPress={handleCancel} activeOpacity={0.7}>
            <Text style={ms.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.applyBtn} onPress={handleApply} activeOpacity={0.7}>
            <Text style={ms.applyBtnText}>Apply Filters</Text>
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
      setTempCategories(tempCategories.filter(c => c !== opt));
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
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={handleCancel} />

      <Animated.View style={[ms.sheet, { height: 490, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Filter by Category</Text>
        </View>

        <View style={ms.optionsList}>
          {options.map(opt => {
            const isSelected = tempCategories.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={ms.radioRow}
                onPress={() => handleToggle(opt)}
                activeOpacity={0.7}
              >
                <View style={[ms.radioCircle, isSelected && { borderColor: '#1a237e' }]}>
                  {isSelected && <View style={[ms.radioDot, { backgroundColor: '#1a237e' }]} />}
                </View>
                <Text style={ms.radioLabel}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={ms.buttonsContainer}>
          <TouchableOpacity style={ms.clearBtn} onPress={handleCancel} activeOpacity={0.7}>
            <Text style={ms.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.applyBtn} onPress={handleApply} activeOpacity={0.7}>
            <Text style={ms.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// ─── Status Filter Sheet ──────────────────────────────────────────────────────

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
  const [tempStatuses, setTempStatuses] = useState<ResolvedStatus[]>(appliedStatuses);

  useEffect(() => {
    if (visible) {
      setTempStatuses(appliedStatuses);
    }
  }, [visible, appliedStatuses]);

  if (!mounted) return null;

  const handleToggle = (opt: ResolvedStatus) => {
    if (tempStatuses.includes(opt)) {
      setTempStatuses(tempStatuses.filter(s => s !== opt));
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

  const options: { value: ResolvedStatus; label: string; color: string }[] = [
    { value: 'CLOSURE_PENDING', label: 'Closure Pending', color: '#f57f17' },
    { value: 'CLOSED',          label: 'Closed',          color: '#2e7d32' },
    { value: 'APPEAL_RAISED',   label: 'Appeal Raised',   color: '#e65100' },
    { value: 'APPEAL_RESOLVED', label: 'Appeal Resolved', color: '#1565c0' },
  ];

  const selectedCount = tempStatuses.length;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={handleCancel} />

      <Animated.View style={[ms.sheet, { height: 390, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Filter by Status</Text>
        </View>

        <View style={ms.optionsList}>
          {options.map(opt => {
            const isSelected = tempStatuses.includes(opt.value);
            return (
              <TouchableOpacity
                key={opt.value}
                style={[ms.radioRow, isSelected && { backgroundColor: '#f3f4fb' }]}
                onPress={() => handleToggle(opt.value)}
                activeOpacity={0.7}
              >
                <View style={[ms.radioCircle, isSelected && { borderColor: '#1a237e', backgroundColor: '#1a237e' }]}>
                  {isSelected && <Image source={{ uri: imgIcon3 }} style={{ width: 10, height: 10, tintColor: '#ffffff' }} />}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: opt.color }} />
                  <Text style={[ms.radioLabel, isSelected && { color: '#1a237e', fontWeight: '600' }]}>
                    {opt.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={ms.buttonsContainer}>
          <TouchableOpacity style={ms.clearBtn} onPress={handleCancel} activeOpacity={0.7}>
            <Text style={ms.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.applyBtn} onPress={handleApply} activeOpacity={0.7}>
            <Text style={ms.applyBtnText}>
              {selectedCount > 0 ? `Apply Filters (${selectedCount})` : 'Apply Filters'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 20 }} />
      </Animated.View>
    </View>
  );
};

// ─── Dropdown Sheet ───────────────────────────────────────────────────────────

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
      <Animated.View style={[ms.sheet, { height: 80 + options.length * 52, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={ms.optionsList}>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                style={ms.radioRow}
                onPress={() => { onSelect(opt); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={[ms.radioCircle, selected === opt && { borderColor: '#1a237e' }]}>
                  {selected === opt && <View style={[ms.radioDot, { backgroundColor: '#1a237e' }]} />}
                </View>
                <Text style={[ms.radioLabel, selected === opt && { color: '#1a237e', fontWeight: '600' }]}>
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

// ─── Pending Breakdown Sheet ──────────────────────────────────────────────────

const PendingBreakdownSheet = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  if (!mounted) return null;

  const rows = [
    { role: 'DPO',         pending: '8',     overdue: '2',   isSeparatorLight: true },
    { role: 'CDPO',        pending: '7',     overdue: '3',   isSeparatorLight: true },
    { role: 'Supervisor',  pending: '50',    overdue: '10',  isSeparatorLight: true },
    { role: 'AWW',         pending: '2,000', overdue: '503', isSeparatorLight: false },
    { role: 'Total',       pending: '2,065', overdue: '518', isTotal: true },
  ];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[ms.sheet, { height: 630, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={ms.titleRow}>
          <Text style={ms.sheetTitle}>Pending Breakdown</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>
        <View style={ms.body}>
          <View style={[ms.pendingTotalCard, { backgroundColor: '#e8eaf6' }]}>
            <Text style={[ms.pendingTotalLabel, { color: '#5c67b5' }]}>TOTAL PENDING</Text>
            <Text style={[ms.pendingTotalValue, { color: '#1a237e' }]}>2,065</Text>
          </View>
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
              <Text style={ms.helpNoteHighlight}>Pending</Text> is the count of tickets still awaiting action. <Text style={ms.helpNoteHighlight}>Overdue</Text> is the subset that has crossed its resolution deadline (SLA) and needs urgent attention.
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
      label: 'Appeal Raised', value: '94', color: '#e65100',
      bg: '#fff3e0', border: '#ffcc80', divider: '#ffcc80',
      rows: [{ role: 'DPO', val: '2' }, { role: 'CDPO', val: '0' }, { role: 'Supervisor', val: '12' }, { role: 'AWW', val: '80' }],
    },
    {
      label: 'Appeal Resolved', value: '81', color: '#1565c0',
      bg: '#e8eaf6', border: '#90caf9', divider: '#90caf9',
      rows: [{ role: 'DPO', val: '2' }, { role: 'CDPO', val: '1' }, { role: 'Supervisor', val: '8' }, { role: 'AWW', val: '70' }],
    },
  ];

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={ms.overlayWrapper}>
      <Animated.View style={[ms.backdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={ms.dismiss} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[ms.sheet, { height: 560, transform: [{ translateY: slideAnim }] }]}>
        <View style={ms.handleRow}><View style={ms.handle} /></View>
        <View style={titleRowStyle}>
          <Text style={ms.sheetTitle}>Resolved Breakdown</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={{ uri: imgCloseIcon }} style={ms.closeIcon} />
          </TouchableOpacity>
        </View>
        <View style={ms.body}>
          <View style={ms.resolvedTotalCard}>
            <View>
              <Text style={[ms.totalLabel, { color: '#388e3c' }]}>TOTAL RESOLVED</Text>
              <Text style={[ms.totalVal, { color: '#2e7d32' }]}>1,163</Text>
            </View>
            <View style={{ gap: 3, alignItems: 'flex-end' }}>
              {[{ label: 'DPO', val: '8' }, { label: 'CDPO', val: '5' }, { label: 'Supervisor', val: '150' }, { label: 'AWW', val: '1,000' }].map(r => (
                <View key={r.label} style={{ flexDirection: 'row', gap: 6 }}>
                  <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#66bb6a' }}>{r.label}</Text>
                  <Text style={{ fontFamily: 'Inter', fontWeight: '700', fontSize: 13, color: '#2e7d32' }}>{r.val}</Text>
                </View>
              ))}
            </View>
          </View>

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

// ─── Main DPO Screen ──────────────────────────────────────────────────────────

export default function DPODashboardScreen() {
  const [activeTab, setActiveTab] = useState<'Pending' | 'Resolved'>('Pending');
  const [assignFilter, setAssignFilter] = useState<AssignFilter>('DPO');

  // Interactive local states for cards
  const [myPendingCards, setMyPendingCards] = useState<TicketCard[]>(pendingCards);
  const [myResolvedCards, setMyResolvedCards] = useState<ResolvedTicketCard[]>(resolvedCards);

  // Filter states
  const [isOverdueActive, setIsOverdueActive] = useState(false);
  const [appliedDateOption, setAppliedDateOption] = useState<'7' | '14' | '21' | 'custom' | null>(null);
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');
  const [appliedTypes, setAppliedTypes] = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedStatuses, setAppliedStatuses] = useState<ResolvedStatus[]>([]);

  // Sector / AWC / Project dropdowns
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedAWC, setSelectedAWC] = useState('All Centres');
  const [selectedProject, setSelectedProject] = useState('All Projects');

  // Sheet visibilities
  const [pendingBreakdown, setPendingBreakdown] = useState(false);
  const [resolvedBreakdown, setResolvedBreakdown] = useState(false);
  const [dateRangeModalVisible, setDateRangeModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [sectorPickVisible, setSectorPickVisible] = useState(false);
  const [awcPickVisible, setAwcPickVisible] = useState(false);
  const [projectPickVisible, setProjectPickVisible] = useState(false);

  // Selected card for details overlay
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const getTicketAge = (submittedDate?: string) => {
    if (!submittedDate) return 0;
    const cleanStr = submittedDate.replace('Submitted:', '').replace('Resolved:', '').trim();
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

  const handleResolveTicket = (ticketId: string, closureNote: string, decision?: 'uphold' | 'dismiss') => {
    const pendingTicket = myPendingCards.find(t => t.id === ticketId);
    if (pendingTicket) {
      const newResolvedCard: ResolvedTicketCard = {
        id: pendingTicket.id,
        ticketNumber: pendingTicket.ticketNumber,
        beneficiaryName: pendingTicket.beneficiaryName,
        beneficiaryType: pendingTicket.beneficiaryType,
        topic: pendingTicket.topic ?? pendingTicket.title ?? '',
        description: pendingTicket.description,
        resolvedDate: 'Resolved: 30/06/2025',
        status: 'CLOSED',
        actionTaken: closureNote,
        awcName: pendingTicket.awcName,
        helpTopic: pendingTicket.helpTopic ?? pendingTicket.topic ?? '',
        subTopic: pendingTicket.subTopic ?? pendingTicket.topic ?? '',
        beneficiaryMobile: pendingTicket.beneficiaryMobile ?? '',
        beneficiaryEmail: pendingTicket.beneficiaryEmail,
        awcCode: pendingTicket.awcCode ?? '',
        district: pendingTicket.district ?? 'Jaipur',
        project: pendingTicket.project ?? 'Sanganer',
        sector: pendingTicket.sector ?? 'Sector 1',
        assignedTo: 'DPO',
      };
      setMyPendingCards(prev => prev.filter(t => t.id !== ticketId));
      setMyResolvedCards(prev => [newResolvedCard, ...prev]);
    } else {
      setMyResolvedCards(prev =>
        prev.map(t =>
          t.id === ticketId
            ? {
                ...t,
                status: decision === 'uphold' ? 'APPEAL_RESOLVED' : 'CLOSED',
                dpoActionTaken: closureNote,
                actionTaken: t.actionTaken + `\n\nAppeal Resolution: ${closureNote}`,
              }
            : t
        )
      );
    }
  };

  // Base list filtering (by assignedTo role and DPO 14-days viewing window)
  const basePendingForRole = myPendingCards.filter(c => {
    if (assignFilter === 'DPO') {
      return c.assignedTo === 'DPO';
    } else {
      return c.assignedTo === assignFilter && getTicketAge(c.submittedDate) >= 14;
    }
  });
  const baseResolvedForRole = myResolvedCards.filter(c => {
    if (assignFilter === 'DPO') {
      return c.assignedTo === 'DPO';
    } else {
      return c.assignedTo === assignFilter && getTicketAge(c.resolvedDate) >= 14;
    }
  });

  // Calculate dynamic tab counts
  const totalPendingCount = basePendingForRole.length;
  const totalResolvedCount = baseResolvedForRole.length;

  // Apply filters to Pending
  let displayedPending = [...basePendingForRole];

  if (isOverdueActive) {
    displayedPending = displayedPending.filter(c => c.isOverdue || c.daysType === 'overdue' || c.status === 'APPEAL_RAISED');
  }

  if (appliedDateOption) {
    displayedPending = displayedPending.filter(c => {
      const dateStr = c.submittedDate ? c.submittedDate.replace('Submitted:', '').trim() : '';
      const tDate = parseDateString(dateStr);
      if (!tDate) return true;
      const diffDays = getTicketAge(dateStr);
      if (appliedDateOption === '7') return diffDays <= 7;
      if (appliedDateOption === '14') return diffDays <= 14;
      if (appliedDateOption === '21') return diffDays <= 21;
      if (appliedDateOption === 'custom' && appliedFromDate && appliedToDate) {
        const fromD = parseInputDate(appliedFromDate);
        const toD = parseInputDate(appliedToDate);
        if (fromD && toD) {
          return tDate >= fromD && tDate <= toD;
        }
      }
      return true;
    });
  }

  if ((assignFilter === 'DPO' || assignFilter === 'CDPO') && appliedTypes.length > 0) {
    displayedPending = displayedPending.filter(c => c.complaintType && appliedTypes.includes(c.complaintType));
  }

  if ((assignFilter === 'Supervisor' || assignFilter === 'AWW') && appliedCategories.length > 0) {
    displayedPending = displayedPending.filter(c => c.beneficiaryType && appliedCategories.includes(c.beneficiaryType));
  }

  if (assignFilter === 'Supervisor' && selectedSector !== 'All Sectors') {
    displayedPending = displayedPending.filter(c => c.sector === selectedSector);
  }

  if (assignFilter === 'AWW' && selectedAWC !== 'All Centres') {
    displayedPending = displayedPending.filter(c => c.awcName === selectedAWC);
  }

  if (assignFilter === 'CDPO' && selectedProject !== 'All Projects') {
    displayedPending = displayedPending.filter(c => c.project === selectedProject);
  }

  // Apply filters to Resolved
  let displayedResolved = [...baseResolvedForRole];

  if (appliedDateOption) {
    displayedResolved = displayedResolved.filter(c => {
      const dateStr = c.resolvedDate ? c.resolvedDate.replace('Resolved:', '').trim() : '';
      const tDate = parseDateString(dateStr);
      if (!tDate) return true;
      const diffDays = getTicketAge(dateStr);
      if (appliedDateOption === '7') return diffDays <= 7;
      if (appliedDateOption === '14') return diffDays <= 14;
      if (appliedDateOption === '21') return diffDays <= 21;
      if (appliedDateOption === 'custom' && appliedFromDate && appliedToDate) {
        const fromD = parseInputDate(appliedFromDate);
        const toD = parseInputDate(appliedToDate);
        if (fromD && toD) {
          return tDate >= fromD && tDate <= toD;
        }
      }
      return true;
    });
  }

  if (appliedCategories.length > 0) {
    displayedResolved = displayedResolved.filter(c => c.beneficiaryType && appliedCategories.includes(c.beneficiaryType));
  }

  if (appliedStatuses.length > 0) {
    displayedResolved = displayedResolved.filter(c => appliedStatuses.includes(c.status));
  }

  if (assignFilter === 'Supervisor' && selectedSector !== 'All Sectors') {
    displayedResolved = displayedResolved.filter(c => c.sector === selectedSector);
  }

  if (assignFilter === 'AWW' && selectedAWC !== 'All Centres') {
    displayedResolved = displayedResolved.filter(c => c.awcName === selectedAWC);
  }

  if (assignFilter === 'CDPO' && selectedProject !== 'All Projects') {
    displayedResolved = displayedResolved.filter(c => c.project === selectedProject);
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      <DPOStatusBar_ />
      <DPOHeader />
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
          onSelect={val => {
            setAssignFilter(val);
            // Reset filters on role change
            setIsOverdueActive(false);
            setAppliedDateOption(null);
            setAppliedFromDate('');
            setAppliedToDate('');
            setAppliedTypes([]);
            setAppliedCategories([]);
            setAppliedStatuses([]);
            setSelectedSector('All Sectors');
            setSelectedAWC('All Centres');
            setSelectedProject('All Projects');
          }}
        />

        {/* Sector dropdown (Supervisor chip) or Anganwadi Centre dropdown (AWW chip) */}
        {assignFilter === 'Supervisor' && (
          <SectorDropdown value={selectedSector} onPress={() => setSectorPickVisible(true)} />
        )}
        {assignFilter === 'AWW' && (
          <AnganwadiCentreDropdown value={selectedAWC} onPress={() => setAwcPickVisible(true)} />
        )}
        {assignFilter === 'CDPO' && (
          <ProjectDropdown value={selectedProject} onPress={() => setProjectPickVisible(true)} />
        )}

        {/* Tab Bar */}
        <CDPOTabBar
          active={activeTab}
          onChange={setActiveTab}
          pendingCount={totalPendingCount}
          resolvedCount={totalResolvedCount}
        />

        {/* Filter Chips */}
        <FilterChips
          activeTab={activeTab}
          assignedFilter={assignFilter}
          isOverdueActive={isOverdueActive}
          onOverdueToggle={() => setIsOverdueActive(v => !v)}
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

        {/* Appeal Raised info banner — resolved tab */}
        {activeTab === 'Resolved' && (() => {
          const appealRaisedTickets = displayedResolved.filter(c => c.status === 'APPEAL_RAISED');
          const appealRaisedCount = appealRaisedTickets.length;
          if (appealRaisedCount === 0) return null;
          let bannerText = '';
          if (appealRaisedCount === 1) {
            const tNum = appealRaisedTickets[0].ticketNumber.replace('Ticket# ', '#').replace(' ', '');
            bannerText = `Appeal resolution is awaited for Ticket ${tNum} — tap to resolve`;
          } else {
            bannerText = `Appeal resolution is awaited for ${appealRaisedCount} tickets — tap to resolve`;
          }
          return (
            <View style={s.closureBanner}>
              <Text style={s.closureBannerText}>{bannerText}</Text>
            </View>
          );
        })()}

        {/* Cards */}
        <View style={s.cardList}>
          {activeTab === 'Pending' ? (
            displayedPending.map(card => {
              const isAppeal = card.status === 'APPEAL_RAISED';
              return (
                <TicketCardComponent
                  key={card.id}
                  card={isAppeal ? {
                    ...card,
                    isOverdue: true,
                    daysLabel: 'Appeal Raised',
                    daysType: 'overdue',
                    borderColor: '#ffcc80',
                  } : card}
                  showDocs={true}
                  onPress={() => setSelectedTicket({ ...card, isPendingTicket: !isAppeal })}
                />
              );
            })
          ) : (
            displayedResolved.map(card => (
              <ResolvedTicketCardComponent
                key={card.id}
                card={card}
                onPress={() => setSelectedTicket(card)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Filter Sheets ── */}
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
        onApply={types => {
          setAppliedTypes(types);
          setTypeModalVisible(false);
        }}
      />

      <CategoryFilterSheet
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        appliedCategories={appliedCategories}
        onApply={categories => {
          setAppliedCategories(categories);
          setCategoryModalVisible(false);
        }}
      />

      <StatusFilterSheet
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        appliedStatuses={appliedStatuses}
        onApply={statuses => {
          setAppliedStatuses(statuses);
          setStatusModalVisible(false);
        }}
      />

      {/* Dropdown Pick Sheets */}
      <DropdownPickSheet
        visible={sectorPickVisible}
        title="Select Sector"
        options={SECTOR_OPTIONS}
        selected={selectedSector}
        onSelect={val => {
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

      {/* Breakdown Sheets */}
      <PendingBreakdownSheet  visible={pendingBreakdown} onClose={() => setPendingBreakdown(false)} />
      <ResolvedBreakdownSheet   visible={resolvedBreakdown}  onClose={() => setResolvedBreakdown(false)} />

      {/* Details Overlay */}
      {selectedTicket && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 375, zIndex: 999 }}>
          <TicketDetailsScreen
            card={selectedTicket}
            assignedFilter={selectedTicket.assignedTo || 'AWW'}
            onBack={() => setSelectedTicket(null)}
            onResolveTicket={handleResolveTicket}
            isDpoView={true}
          />
        </View>
      )}
    </View>
  );
}

// ─── Screen Styles ────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, width: 375, backgroundColor: '#fafafa', overflow: 'hidden' },

  // Status bar
  statusBar: { height: 24, backgroundColor: '#1a237e', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  statusTime: { fontFamily: 'Inter', fontWeight: '600', fontSize: 14, color: '#fff', lineHeight: 21 },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sIcon16: { width: 16, height: 12, tintColor: '#ffffff' },
  sIcon14: { width: 14, height: 12, tintColor: '#ffffff' },
  sIcon20: { width: 20, height: 12, tintColor: '#ffffff' },

  // Header
  header: { height: 56, backgroundColor: '#1a237e', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 },
  backBtn: { width: 29, height: 24, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 28, color: '#ffffff', lineHeight: 28, fontWeight: '300' },
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
  filterChip: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 100, paddingHorizontal: 13, paddingVertical: 5, flexDirection: 'row', alignItems: 'center' },
  filterChipActive: { borderColor: '#1a237e', backgroundColor: '#e8eaf6' },
  filterChipOverdueActive: { borderColor: '#d32f2f', backgroundColor: '#ffebee' },
  filterChipTxt: { fontFamily: 'Inter', fontWeight: '400', fontSize: 13, color: '#424242' },
  filterChipTextActive: { color: '#1a237e', fontWeight: '600' },
  filterChipClose: { fontSize: 14, fontWeight: '700', color: '#1a237e' },
  clearAllRow: { paddingHorizontal: 16, paddingVertical: 6, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  clearAllText: { color: '#1a237e', fontWeight: '600', fontSize: 12 },

  // Dropdown card styling
  dropdownWrapper: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f6ff', borderWidth: 1, borderColor: '#c5cae9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  dropdownDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1a237e', marginRight: 10 },
  dropdownTextBlock: { flex: 1 },
  dropdownLabel: { fontFamily: 'Inter', fontWeight: '600', fontSize: 10, color: '#5c6bc0', letterSpacing: 0.6 },
  dropdownValue: { fontFamily: 'Inter', fontWeight: '700', fontSize: 14, color: '#1a237e', marginTop: 2 },
  dropdownChevron: { fontSize: 16, color: '#1a237e', fontWeight: '700' },

  // Card list
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  cardList: { padding: 12, gap: 10 },

  // Closure info banner
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
});

// ─── Sheet Styles ─────────────────────────────────────────────────────────────

const ms = StyleSheet.create({
  overlayWrapper: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: 375, zIndex: 999 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  dismiss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, width: 375,
    backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden',
  },

  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 2 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0' },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 13, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sheetTitle: { fontFamily: 'Inter', fontWeight: '700', fontSize: 15, color: '#1a237e' },
  closeIcon: { width: 18, height: 18 },

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

  // Filter layouts
  radioRow: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#bdbdbd', justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontFamily: 'Inter', fontSize: 14, color: '#424242' },

  customInputs: { paddingHorizontal: 16, paddingVertical: 10 },
  inputLabel: { fontFamily: 'Inter', fontWeight: '600', fontSize: 11, color: '#757575', marginBottom: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, height: 44, backgroundColor: '#fafafa' },
  textInput: { flex: 1, fontFamily: 'Inter', fontSize: 14, color: '#212121' },
  inputCalIcon: { width: 20, height: 20, tintColor: '#757575' },

  buttonsContainer: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 14 },
  applyBtn: { flex: 1, height: 44, backgroundColor: '#1a237e', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  applyBtnDisabled: { backgroundColor: '#e0e0e0' },
  applyBtnText: { fontFamily: 'Inter', fontWeight: '700', fontSize: 14, color: '#ffffff' },
  clearBtn: { flex: 1, height: 44, borderRadius: 8, borderWidth: 1, borderColor: '#1a237e', backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  clearBtnText: { fontFamily: 'Inter', fontWeight: '700', fontSize: 14, color: '#1a237e' },

  optionsList: { paddingTop: 8 },

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
});
