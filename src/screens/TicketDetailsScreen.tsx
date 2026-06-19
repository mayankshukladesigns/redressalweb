import React, { useState, useEffect, useRef } from 'react';
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
import { ResolvedTicketCard, AssignedFilter } from './BeneficiaryRedressalScreen';

const imgBackIconWhite = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/arrow-left.svg';
const imgIcon  = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/reception-4.svg';
const imgIcon1 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/wifi.svg';
const imgIcon2 = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/battery-full.svg';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG = {
  PENDING:         { label: 'PENDING',         color: '#e65100', bg: '#fff3e0', border: '#ffcc80', hasIcon: false },
  OVERDUE:         { label: 'OVERDUE',         color: '#d32f2f', bg: '#ffebee', border: '#ffcdd2', hasIcon: true  },
  CLOSED:          { label: 'CLOSED',          color: '#2e7d32', bg: '#e8f5e9', border: '#a5d6a7', hasIcon: false },
  CLOSURE_PENDING: { label: 'CLOSURE PENDING', color: '#f57f17', bg: '#fff8e1', border: '#ffe082', hasIcon: true  },
  APPEAL_RAISED:   { label: 'APPEAL RAISED',   color: '#e65100', bg: '#fff3e0', border: '#ffcc80', hasIcon: true  },
  APPEAL_RESOLVED: { label: 'APPEAL RESOLVED', color: '#ffffff', bg: '#4f46e5', border: '#4f46e5', hasIcon: true  },
};

// ─── Timeline definitions ─────────────────────────────────────────────────────

type TimelineItem = { label: string; date: string; dotColor: string };

const TIMELINE: Record<string, TimelineItem[]> = {
  CLOSED: [
    { label: 'Ticket Closed by CDPO',  date: '05 Jul 2025, 10:00 AM', dotColor: '#2e7d32' },
    { label: 'Ticket Resolved by AWW', date: '02 Jul 2025, 03:00 PM', dotColor: '#2e7d32' },
    { label: 'Reminder Sent',          date: '30 Jun 2025, 09:00 AM', dotColor: '#f57f17' },
    { label: 'Assigned to AWW',        date: '23 Jun 2025, 09:00 AM', dotColor: '#1a237e' },
  ],
  CLOSURE_PENDING: [
    { label: 'Closure Pending',        date: '08 Jul 2025, 11:00 AM', dotColor: '#f57f17' },
    { label: 'Ticket Resolved by AWW', date: '05 Jul 2025, 03:00 PM', dotColor: '#2e7d32' },
    { label: 'Reminder Sent',          date: '01 Jul 2025, 09:00 AM', dotColor: '#f57f17' },
    { label: 'Assigned to AWW',        date: '25 Jun 2025, 09:00 AM', dotColor: '#1a237e' },
  ],
  APPEAL_RAISED: [
    { label: 'Appeal Raised by Beneficiary', date: '07 Jul 2025, 02:00 PM', dotColor: '#f57f17' },
    { label: 'Ticket Closed by CDPO',        date: '05 Jul 2025, 10:00 AM', dotColor: '#2e7d32' },
    { label: 'Ticket Resolved by AWW',       date: '02 Jul 2025, 03:00 PM', dotColor: '#2e7d32' },
    { label: 'Reminder Sent',                date: '30 Jun 2025, 09:00 AM', dotColor: '#f57f17' },
    { label: 'Assigned to AWW',              date: '23 Jun 2025, 09:00 AM', dotColor: '#1a237e' },
  ],
  APPEAL_RESOLVED: [
    { label: 'Appeal Resolved by DPO',       date: '12 Jul 2025, 11:00 AM', dotColor: '#1a237e' },
    { label: 'Appeal Raised by Beneficiary', date: '07 Jul 2025, 02:00 PM', dotColor: '#f57f17' },
    { label: 'Ticket Closed by CDPO',        date: '05 Jul 2025, 10:00 AM', dotColor: '#2e7d32' },
    { label: 'Ticket Resolved by AWW',       date: '02 Jul 2025, 03:00 PM', dotColor: '#2e7d32' },
    { label: 'Reminder Sent',                date: '30 Jun 2025, 09:00 AM', dotColor: '#f57f17' },
    { label: 'Assigned to AWW',              date: '23 Jun 2025, 09:00 AM', dotColor: '#1a237e' },
  ],
};

const useSheetAnim = (visible: boolean) => {
  const [mounted, setMounted] = useState(false);
  const slideAnim = useRef(new Animated.Value(600)).current;
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


// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={dtStyles.detailsRow}>
    <Text style={dtStyles.detailsLabel}>{label}</Text>
    <Text style={dtStyles.detailsValue}>{value}</Text>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={dtStyles.sectionHeaderContainer}>
    <Text style={dtStyles.sectionHeaderText}>{title}</Text>
    <View style={dtStyles.sectionLine} />
  </View>
);

const ActionBox = ({ label, text }: { label: string; text: string }) => (
  <View style={dtStyles.actionBoxContainer}>
    <Text style={dtStyles.actionLabel}>{label}</Text>
    <View style={dtStyles.greenBox}>
      <Text style={dtStyles.greenBoxText}>{text}</Text>
    </View>
  </View>
);

const TimelineRow = ({ item, isLast }: { item: TimelineItem; isLast: boolean }) => (
  <View style={dtStyles.timelineRow}>
    <View style={dtStyles.timelineDotCol}>
      <View style={[dtStyles.timelineDot, { backgroundColor: item.dotColor }]} />
      {!isLast && <View style={dtStyles.timelineLine} />}
    </View>
    <View style={dtStyles.timelineTextCol}>
      <Text style={dtStyles.timelineLabel}>{item.label}</Text>
      <Text style={dtStyles.timelineDate}>{item.date}</Text>
    </View>
  </View>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TicketDetailsScreen({
  card,
  assignedFilter,
  onBack,
  onResolveTicket,
  resolveLabel = 'Resolve and Close',
  hideResolveCTA = false,
}: {
  card: any;
  assignedFilter: AssignedFilter;
  onBack: () => void;
  onResolveTicket?: (ticketId: string, closureNote: string) => void;
  resolveLabel?: string;
  hideResolveCTA?: boolean;
}) {
  const [currentCard, setCurrentCard] = useState(card);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [closureNote, setClosureNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setCurrentCard(card);
  }, [card]);

  const isPending = currentCard.isPendingTicket;
  const isOverdue = isPending && (currentCard.isOverdue || currentCard.daysType === 'overdue');
  const statusKey = isOverdue ? 'OVERDUE' : ((isPending ? 'PENDING' : currentCard.status) as keyof typeof STATUS_CFG);
  const cfg = STATUS_CFG[statusKey] ?? STATUS_CFG.CLOSED;

  // Construct timeline items dynamically for pending tickets
  let timelineItems: TimelineItem[] = [];
  if (isPending) {
    const assignedLabel = `Assigned to ${assignedFilter}`;
    const dateSubmitted = currentCard.submittedDate ? currentCard.submittedDate.replace('Submitted: ', '') : '25/06/2025';
    
    // Parse date parts
    const subDateParts = dateSubmitted.split('/');
    let subDay = 25, subMonth = 6, subYear = 2025;
    if (subDateParts.length === 3) {
      subDay = parseInt(subDateParts[0], 10);
      subMonth = parseInt(subDateParts[1], 10);
      subYear = parseInt(subDateParts[2], 10);
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[subMonth - 1] || 'Jun';
    
    // Base Assignment
    timelineItems.push({
      label: assignedLabel,
      date: `${subDay < 10 ? '0' + subDay : subDay} ${monthName} ${subYear}, 09:00 AM`,
      dotColor: '#1a237e'
    });

    // Reminder Sent (if submitted more than a few days ago)
    const reminderDay = subDay + 2;
    timelineItems.push({
      label: 'Reminder Sent to AWC',
      date: `${reminderDay < 10 ? '0' + reminderDay : reminderDay} ${monthName} ${subYear}, 10:30 AM`,
      dotColor: '#f57f17'
    });

    // Overdue event
    if (isOverdue) {
      timelineItems.push({
        label: `Ticket Overdue — Escalated to CDPO`,
        date: `${subDay + 5 < 10 ? '0' + (subDay + 5) : subDay + 5} ${monthName} ${subYear}, 05:00 PM`,
        dotColor: '#d32f2f'
      });
    }
    
    // Reverse so latest is first
    timelineItems.reverse();
  } else {
    timelineItems = TIMELINE[currentCard.status as keyof typeof TIMELINE] ?? [];
  }

  const showDpoSection = !isPending && (currentCard.status === 'APPEAL_RAISED' || currentCard.status === 'APPEAL_RESOLVED');
  const showCloseButton =
    !isPending &&
    currentCard.status === 'CLOSURE_PENDING' &&
    (assignedFilter === 'CDPO' || assignedFilter === 'Supervisor');

  const ticketId = currentCard.ticketNumber.replace('Ticket# ', '#').replace(' ', '');

  const beneficiaryRows: Array<{ label: string; value: string }> = [
    { label: 'Name',     value: currentCard.beneficiaryName },
    { label: 'Mobile',   value: currentCard.beneficiaryMobile ?? '98765 00123' },
    { label: 'Category', value: currentCard.beneficiaryType },
    ...(currentCard.beneficiaryEmail ? [{ label: 'Email', value: currentCard.beneficiaryEmail }] : []),
    { label: 'AWC',      value: currentCard.awcCode ?? currentCard.awcName },
    { label: 'District', value: currentCard.district ?? 'Jaipur' },
    { label: 'Project',  value: currentCard.project ?? 'Sanganer' },
    { label: 'Sector',   value: currentCard.sector ?? 'Sector 1' },
  ];

  const hasBottomCTA = (isPending && !hideResolveCTA) || showCloseButton;

  return (
    <View style={dtStyles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Status bar */}
      <View style={dtStyles.statusBar}>
        <Text style={dtStyles.statusTime}>9:41</Text>
        <View style={dtStyles.statusIcons}>
          <Image source={{ uri: imgIcon }}  style={dtStyles.statusIcon16} />
          <Image source={{ uri: imgIcon1 }} style={dtStyles.statusIcon14} />
          <Image source={{ uri: imgIcon2 }} style={dtStyles.statusIcon20} />
        </View>
      </View>

      {/* Header */}
      <View style={dtStyles.header}>
        <TouchableOpacity style={dtStyles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Image source={{ uri: imgBackIconWhite }} style={dtStyles.backIcon} />
        </TouchableOpacity>
        <Text style={dtStyles.headerTitle}>Ticket Details</Text>
        <View style={dtStyles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={dtStyles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          dtStyles.scrollContent,
          hasBottomCTA && { paddingBottom: 100 }
        ]}
      >
        {/* Ticket # + Status badge */}
        <View style={dtStyles.ticketTopRow}>
          <View>
            <Text style={dtStyles.ticketId}>Ticket {ticketId}</Text>
          </View>
          <View style={[dtStyles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
            <Text style={[dtStyles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
            {cfg.hasIcon && <Text style={[dtStyles.statusBadgeIcon, { color: cfg.color }]}> ⓘ</Text>}
          </View>
        </View>

        {/* Help Topic / Sub Topic / Description */}
        <View style={dtStyles.sectionList}>
          <InfoRow label="Help Topic" value={currentCard.helpTopic ?? currentCard.topic} />
          <InfoRow label="Sub Topic" value={currentCard.subTopic ?? currentCard.topic} />
          
          {currentCard.description && (
            <View style={dtStyles.descContainer}>
              <Text style={dtStyles.descLabel}>Description</Text>
              <Text style={dtStyles.descText}>
                {currentCard.description.length > 250
                  ? currentCard.description.substring(0, 247) + '...'
                  : currentCard.description}
              </Text>
            </View>
          )}
        </View>

        {/* Beneficiary Information */}
        <SectionHeader title="Beneficiary Information" />
        <View style={dtStyles.sectionList}>
          {beneficiaryRows.map((row) => (
            <InfoRow
              key={row.label}
              label={row.label}
              value={row.value}
            />
          ))}
        </View>

        {/* Supporting Documents (if documentsCount > 0 or documents is present) */}
        {(currentCard.documentsCount > 0 || currentCard.documents) && (
          <>
            <SectionHeader title="Supporting Documents" />
            <View style={dtStyles.docsSection}>
              <View style={dtStyles.docItem}>
                <Image source={{ uri: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/file-earmark-pdf-fill.svg' }} style={dtStyles.docIcon} />
                <View style={dtStyles.docInfo}>
                  <Text style={dtStyles.docName}>
                    {currentCard.id === '1' ? 'pmmvy_enrollment_form.pdf' :
                     currentCard.id === '2' ? 'thr_ration_card_copy.pdf' :
                     currentCard.id === '3' ? 'aadhaar_card_scan.pdf' :
                     currentCard.id === '4' ? 'ksy_training_registration.pdf' :
                     currentCard.id === '5' ? 'growth_monitoring_report.pdf' : 'supporting_document.pdf'}
                  </Text>
                  <Text style={dtStyles.docSize}>2.4 MB</Text>
                </View>
                <TouchableOpacity style={dtStyles.viewDocBtn} activeOpacity={0.7}>
                  <Text style={dtStyles.viewDocBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* Resolution Details */}
        {!isPending && (
          <>
            <SectionHeader title="Resolution Details" />
            <ActionBox label="ACTION TAKEN" text={currentCard.actionTaken} />
          </>
        )}

        {/* DPO Appeal Resolution (Appeal Raised / Appeal Resolved) */}
        {!isPending && showDpoSection && (
          <>
            <SectionHeader title="DPO Appeal Resolution" />
            <ActionBox
              label="ACTION TAKEN BY DPO"
              text={
                currentCard.dpoActionTaken ??
                (currentCard.status === 'APPEAL_RAISED'
                  ? 'Appeal under review by DPO. Response expected within 7 working days.'
                  : 'Appeal resolved in favour of existing resolution.')
              }
            />
          </>
        )}

        {/* Timeline */}
        <SectionHeader title="Timeline" />
        <View style={dtStyles.timelineContainer}>
          {timelineItems.map((item, idx) => (
            <TimelineRow key={item.label} item={item} isLast={idx === timelineItems.length - 1} />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Sticky Bottom Footer CTA (Shown for both Pending and closure pending Resolved tickets) */}
      {hasBottomCTA && (
        <View style={dtStyles.stickyFooter}>
          <TouchableOpacity
            style={dtStyles.closeBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (isPending) {
                setActionModalVisible(true);
              } else {
                onBack();
              }
            }}
          >
            <Text style={dtStyles.closeBtnText}>
              {isPending
                ? resolveLabel
                : 'Close Ticket'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Action Taken Modal */}
      <ActionTakenModal
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onSubmit={(note) => {
          if (onResolveTicket) {
            onResolveTicket(currentCard.id, note);
          }
          setClosureNote(note);
          setActionModalVisible(false);
          setShowSuccess(true);
        }}
      />

      {/* Success Screen */}
      {showSuccess && (
        <SuccessScreen
          ticketNumber={currentCard.ticketNumber}
          onBack={onBack}
          onViewDetails={() => {
            setShowSuccess(false);
            setCurrentCard((prev: any) => ({
              ...prev,
              isPendingTicket: false,
              status: 'CLOSED',
              actionTaken: closureNote,
            }));
          }}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const dtStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: '100%',
  },

  // Status bar
  statusBar: {
    height: 24,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statusTime: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
    color: '#333333',
    lineHeight: 21,
  },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusIcon16: { width: 16, height: 12, tintColor: '#333333' },
  statusIcon14: { width: 14, height: 12, tintColor: '#333333' },
  statusIcon20: { width: 20, height: 12, tintColor: '#333333' },

  // Header
  header: {
    height: 56,
    backgroundColor: '#1a237e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: { width: 29, height: 24, justifyContent: 'center' },
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
  headerSpacer: { width: 29, height: 24 },

  // Scroll
  scroll: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20, gap: 28 },

  // Ticket top row
  ticketTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketId: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 20,
    color: '#527cdc',
    lineHeight: 28,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  statusBadgeText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 10,
    lineHeight: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusBadgeIcon: { fontSize: 11, fontWeight: '700' },

  // Section List
  sectionList: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    width: '100%',
  },
  detailsLabel: {
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 11,
    color: '#747474',
    width: 120,
    lineHeight: 18,
  },
  detailsValue: {
    flex: 1,
    fontFamily: 'Inter',
    fontWeight: '500',
    fontSize: 14,
    color: '#333333',
    lineHeight: 18,
  },

  // Section Header
  sectionHeaderContainer: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    marginTop: 4,
  },
  sectionHeaderText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: '#333333',
    textTransform: 'uppercase',
    lineHeight: 18,
  },
  sectionLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },

  // Action box
  actionBoxContainer: {
    width: '100%',
    gap: 12,
  },
  actionLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 11,
    color: '#747474',
    textTransform: 'uppercase',
    lineHeight: 15,
  },
  greenBox: {
    backgroundColor: '#f1faf5',
    borderWidth: 1,
    borderColor: '#e6f4ea',
    borderRadius: 8,
    padding: 16,
    width: '100%',
  },
  greenBoxText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 14,
    color: '#065f46',
    lineHeight: 21,
  },

  // Close Ticket button
  closeSection: {
    paddingVertical: 4,
    width: '100%',
  },
  closeBtn: {
    backgroundColor: '#1a237e',
    borderRadius: 10,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22.5,
  },

  // Timeline
  timelineContainer: {
    paddingLeft: 4,
    paddingBottom: 4,
    width: '100%',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 16,
    minHeight: 52,
    width: '100%',
  },
  timelineDotCol: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    marginBottom: 0,
  },
  timelineTextCol: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: '#333333',
    lineHeight: 19.5,
  },
  timelineDate: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    color: '#747474',
    lineHeight: 16.5,
    marginTop: 2,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  daysLabelText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
  },
  descContainer: {
    marginTop: 8,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  descLabel: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 10,
    color: '#747474',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  descText: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 13,
    color: '#333333',
    lineHeight: 19.5,
  },
  docsSection: {
    width: '100%',
    backgroundColor: '#f5f6ff',
    borderWidth: 1,
    borderColor: '#c5cae9',
    borderRadius: 8,
    padding: 12,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docIcon: {
    width: 20,
    height: 20,
    tintColor: '#1a237e',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 13,
    color: '#1a237e',
  },
  docSize: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  viewDocBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a237e',
    borderRadius: 6,
  },
  viewDocBtnText: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 12,
    color: '#ffffff',
  },
});


// ─── Action Taken Modal ───────────────────────────────────────────────────────

const ActionTakenModal = ({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) => {
  const { slideAnim, fadeAnim, mounted } = useSheetAnim(visible);
  const [closureNote, setClosureNote] = useState('');
  const [confirmClosed, setConfirmClosed] = useState(false);

  useEffect(() => {
    if (visible) {
      setClosureNote('');
      setConfirmClosed(false);
    }
  }, [visible]);

  if (!mounted) return null;

  const isValid = closureNote.trim().length > 0 && confirmClosed;

  return (
    <View pointerEvents={visible ? 'auto' : 'box-none'} style={sheetStyles.inlineOverlayWrapper}>
      <Animated.View style={[sheetStyles.inlineBackdrop, { opacity: fadeAnim }]} />
      <TouchableOpacity style={sheetStyles.inlineDismiss} activeOpacity={1} onPress={onClose} />

      <Animated.View
        style={[
          sheetStyles.inlineSheet,
          { height: 420, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={sheetStyles.handleRow}>
          <View style={sheetStyles.handle} />
        </View>

        {/* Title */}
        <View style={sheetStyles.titleRow}>
          <Text style={sheetStyles.sheetTitle}>Resolve & Close Ticket</Text>
        </View>

        {/* Body */}
        <View style={sheetStyles.body}>
          {/* Label */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text style={sheetStyles.label}>Closure Note</Text>
            <Text style={{ color: '#d32f2f', marginLeft: 3 }}>*</Text>
          </View>

          {/* Text Area Container */}
          <View style={sheetStyles.textareaWrapper}>
            <TextInput
              style={sheetStyles.textarea}
              placeholder="Describe the action taken and reason for closure..."
              placeholderTextColor="#9e9e9e"
              multiline
              numberOfLines={4}
              maxLength={250}
              value={closureNote}
              onChangeText={setClosureNote}
            />
            <Text style={sheetStyles.counter}>{closureNote.length} / 250</Text>
          </View>

          {/* Checkbox Row */}
          <TouchableOpacity
            style={sheetStyles.checkboxRow}
            activeOpacity={0.8}
            onPress={() => setConfirmClosed(prev => !prev)}
          >
            <View
              style={[
                sheetStyles.checkbox,
                confirmClosed && { backgroundColor: '#1a237e', borderColor: '#1a237e' },
              ]}
            >
              {confirmClosed && (
                <Image
                  source={{ uri: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/check.svg' }}
                  style={sheetStyles.checkIcon}
                />
              )}
            </View>
            <Text style={sheetStyles.checkboxText}>
              I confirm the action has been taken and the ticket can be permanently closed.{' '}
              <Text style={{ color: '#d32f2f' }}>*</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer Buttons */}
        <View style={sheetStyles.buttonsContainer}>
          <TouchableOpacity
            style={[sheetStyles.applyBtn, !isValid && sheetStyles.applyBtnDisabled]}
            disabled={!isValid}
            onPress={() => onSubmit(closureNote)}
            activeOpacity={0.7}
          >
            <Text style={sheetStyles.applyBtnText}>Mark as Closed</Text>
          </TouchableOpacity>

          <TouchableOpacity style={sheetStyles.clearBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={sheetStyles.clearBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};


// ─── Success Screen ───────────────────────────────────────────────────────────

const SuccessScreen = ({
  ticketNumber,
  onBack,
  onViewDetails,
}: {
  ticketNumber: string;
  onBack: () => void;
  onViewDetails: () => void;
}) => {
  return (
    <View style={successStyles.container}>
      <View style={successStyles.content}>
        {/* Checked Circle */}
        <View style={successStyles.checkCircle}>
          <Image
            source={{ uri: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/check-circle-fill.svg' }}
            style={successStyles.checkIcon}
          />
        </View>

        {/* Title */}
        <Text style={successStyles.title}>Ticket Closed!</Text>

        {/* Description */}
        <Text style={successStyles.description}>
          Ticket {ticketNumber} has been marked as closed by CDPO.
        </Text>

        {/* Buttons */}
        <View style={successStyles.buttonGroup}>
          <TouchableOpacity style={successStyles.primaryBtn} onPress={onBack} activeOpacity={0.8}>
            <Text style={successStyles.primaryBtnText}>Back to Ticket List</Text>
          </TouchableOpacity>

          <TouchableOpacity style={successStyles.secondaryBtn} onPress={onViewDetails} activeOpacity={0.8}>
            <Text style={successStyles.secondaryBtnText}>View Closed Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


// ─── Style Sheets ─────────────────────────────────────────────────────────────

const sheetStyles = StyleSheet.create({
  inlineOverlayWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    zIndex: 999,
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
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
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
  titleRow: {
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
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: {
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 12,
    color: '#757575',
  },
  textareaWrapper: {
    position: 'relative',
    width: '100%',
  },
  textarea: {
    height: 120,
    borderWidth: 1,
    borderColor: '#1a237e',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    padding: 12,
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#212121',
    textAlignVertical: 'top',
  },
  counter: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#9e9e9e',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#bdbdbd',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkIcon: {
    width: 12,
    height: 12,
    tintColor: '#ffffff',
  },
  checkboxText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#424242',
    lineHeight: 18,
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  applyBtn: {
    height: 44,
    backgroundColor: '#1a237e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  applyBtnDisabled: {
    backgroundColor: '#e0e0e0',
  },
  applyBtnText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
  },
  clearBtn: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a237e',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  clearBtnText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: '#1a237e',
  },
});

const successStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    zIndex: 9999,
  },
  content: {
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkIcon: {
    width: 28,
    height: 28,
    tintColor: '#ffffff',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 20,
    color: '#181818',
    marginTop: 24,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 13,
    color: '#757575',
    lineHeight: 19.5,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 32,
    gap: 12,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#1a237e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryBtnText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
  },
  secondaryBtn: {
    height: 48,
    borderWidth: 1,
    borderColor: '#1a237e',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryBtnText: {
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
    color: '#1a237e',
  },
});


