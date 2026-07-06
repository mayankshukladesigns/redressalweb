import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, useWindowDimensions } from 'react-native';
import BeneficiaryRedressalScreen, { pendingCards, resolvedCards, TicketCard, ResolvedTicketCard } from '../screens/BeneficiaryRedressalScreen';
import DPODashboardScreen from '../screens/DPODashboardScreen';
import SupervisorScreen from '../screens/SupervisorScreen';

type Role = 'CDPO' | 'Supervisor' | 'DPO';

const RoleSelectionScreen = ({ onSelectRole }: { onSelectRole: (role: Role) => void }) => {
  return (
    <View style={selStyles.container}>
      {/* Mock Mobile Status Bar */}
      <View style={selStyles.statusBar}>
        <Text style={selStyles.statusTime}>9:41</Text>
        <View style={selStyles.statusIcons}>
          <View style={selStyles.dot} />
          <View style={[selStyles.dot, { width: 6 }]} />
          <View style={[selStyles.dot, { width: 4 }]} />
        </View>
      </View>

      {/* Main Content */}
      <View style={selStyles.content}>
        {/* Header App Brand */}
        <View style={selStyles.brandContainer}>
          <View style={selStyles.appLogo}>
            <Text style={selStyles.appLogoText}>AR</Text>
          </View>
          <Text style={selStyles.brandTitle}>Anganwadi Redressal</Text>
          <Text style={selStyles.brandSubtitle}>Integrated Grievance System</Text>
        </View>

        <Text style={selStyles.sectionTitle}>Select Your Role</Text>

        {/* CDPO Card */}
        <TouchableOpacity
          style={selStyles.card}
          activeOpacity={0.85}
          onPress={() => onSelectRole('CDPO')}
        >
          <View style={[selStyles.cardIconContainer, { backgroundColor: '#e8eaf6' }]}>
            <Text style={[selStyles.cardIconText, { color: '#1a237e' }]}>C</Text>
          </View>
          <View style={selStyles.cardInfo}>
            <Text style={selStyles.cardTitle}>CDPO View</Text>
            <Text style={selStyles.cardSubtitle}>Child Development Project Officer</Text>
            <Text style={selStyles.cardDesc}>
              Track sector performance, resolve & close escalated complaints, and manage project-wide tickets.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Supervisor Card */}
        <TouchableOpacity
          style={selStyles.card}
          activeOpacity={0.85}
          onPress={() => onSelectRole('Supervisor')}
        >
          <View style={[selStyles.cardIconContainer, { backgroundColor: '#ede7f6' }]}>
            <Text style={[selStyles.cardIconText, { color: '#5e35b1' }]}>S</Text>
          </View>
          <View style={selStyles.cardInfo}>
            <Text style={selStyles.cardTitle}>Supervisor View</Text>
            <Text style={selStyles.cardSubtitle}>Sector Supervisor</Text>
            <Text style={selStyles.cardDesc}>
              Monitor Anganwadi centres, resolve self pending complaints, and track AWW activities.
            </Text>
          </View>
        </TouchableOpacity>

        {/* DPO Card */}
        <TouchableOpacity
          style={selStyles.card}
          activeOpacity={0.85}
          onPress={() => onSelectRole('DPO')}
        >
          <View style={[selStyles.cardIconContainer, { backgroundColor: '#e8f5e9' }]}>
            <Text style={[selStyles.cardIconText, { color: '#2e7d32' }]}>D</Text>
          </View>
          <View style={selStyles.cardInfo}>
            <Text style={selStyles.cardTitle}>DPO View</Text>
            <Text style={selStyles.cardSubtitle}>District Programme Officer</Text>
            <Text style={selStyles.cardDesc}>
              Monitor district-wide redressal status, review appeal cases, and resolve overdue grievances.
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={selStyles.footer}>v1.2.0 • Powered by Expo</Text>
    </View>
  );
};

export default function HomeScreen() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [sharedPendingCards, setSharedPendingCards] = useState<TicketCard[]>(() => pendingCards);
  const [sharedResolvedCards, setSharedResolvedCards] = useState<ResolvedTicketCard[]>(() => resolvedCards);
  const { width: windowWidth } = useWindowDimensions();

  const isMobileWeb = Platform.OS === 'web' && windowWidth < 600;

  if (Platform.OS === 'web' && !isMobileWeb) {
    return (
      <View style={styles.webWrapper}>
        {/* Role Switcher */}
        <View style={styles.roleSwitcher}>
          <Text style={styles.switcherLabel}>View as:</Text>
          <View style={styles.switcherPills}>
            {(['CDPO', 'Supervisor', 'DPO'] as Role[]).map(role => (
              <TouchableOpacity
                key={role}
                style={[styles.pill, activeRole === role && styles.pillActive]}
                onPress={() => setActiveRole(role)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, activeRole === role && styles.pillTextActive]}>
                  {role} View
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Phone Frame */}
        <View style={styles.phoneFrame}>
          {activeRole === null ? (
            <RoleSelectionScreen onSelectRole={setActiveRole} />
          ) : activeRole === 'CDPO' ? (
            <BeneficiaryRedressalScreen
              onBack={() => setActiveRole(null)}
              sharedPendingCards={sharedPendingCards}
              setSharedPendingCards={setSharedPendingCards}
              sharedResolvedCards={sharedResolvedCards}
              setSharedResolvedCards={setSharedResolvedCards}
            />
          ) : activeRole === 'Supervisor' ? (
            <SupervisorScreen
              onBack={() => setActiveRole(null)}
              sharedPendingCards={sharedPendingCards}
              setSharedPendingCards={setSharedPendingCards}
              sharedResolvedCards={sharedResolvedCards}
              setSharedResolvedCards={setSharedResolvedCards}
            />
          ) : (
            <DPODashboardScreen
              onBack={() => setActiveRole(null)}
              sharedPendingCards={sharedPendingCards}
              setSharedPendingCards={setSharedPendingCards}
              sharedResolvedCards={sharedResolvedCards}
              setSharedResolvedCards={setSharedResolvedCards}
            />
          )}
        </View>

        {/* Role Label below frame */}
        <Text style={styles.roleCaption}>
          {activeRole === null
            ? 'Choose a role inside the phone frame or switcher to begin'
            : activeRole === 'CDPO'
            ? 'CDPO — Project: Sanganer, 4 Sectors'
            : activeRole === 'Supervisor'
            ? 'Supervisor — Sector 1, AWC 6'
            : 'DPO — District: Jaipur, 5 Projects'}
        </Text>
      </View>
    );
  }

  // Native and Mobile Web: render full screen based on role or show selector
  return (
    <View style={styles.nativeWrapper}>
      {activeRole === null ? (
        <RoleSelectionScreen onSelectRole={setActiveRole} />
      ) : activeRole === 'CDPO' ? (
        <BeneficiaryRedressalScreen
          onBack={() => setActiveRole(null)}
          sharedPendingCards={sharedPendingCards}
          setSharedPendingCards={setSharedPendingCards}
          sharedResolvedCards={sharedResolvedCards}
          setSharedResolvedCards={setSharedResolvedCards}
        />
      ) : activeRole === 'Supervisor' ? (
        <SupervisorScreen
          onBack={() => setActiveRole(null)}
          sharedPendingCards={sharedPendingCards}
          setSharedPendingCards={setSharedPendingCards}
          sharedResolvedCards={sharedResolvedCards}
          setSharedResolvedCards={setSharedResolvedCards}
        />
      ) : (
        <DPODashboardScreen
          onBack={() => setActiveRole(null)}
          sharedPendingCards={sharedPendingCards}
          setSharedPendingCards={setSharedPendingCards}
          sharedResolvedCards={sharedResolvedCards}
          setSharedResolvedCards={setSharedResolvedCards}
        />
      )}
    </View>
  );
}

const selStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 20,
    paddingTop: 12,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  statusBar: {
    height: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  statusTime: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a237e',
    fontFamily: 'Inter, sans-serif',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a237e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appLogo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  appLogoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800' as any,
    color: '#1a237e',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
    fontWeight: '500',
    fontFamily: 'Inter, sans-serif',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5c6bc0',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#e8eaf6',
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconText: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  cardSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
    marginTop: 2,
  },
  cardDesc: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 16,
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#9e9e9e',
    fontSize: 11,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#e8eaf6',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh' as any,
    paddingVertical: 32,
    gap: 20,
  },

  // Role switcher bar
  roleSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switcherLabel: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500' as any,
    fontSize: 13,
    color: '#5c6bc0',
    letterSpacing: 0.3,
  },
  switcherPills: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 100,
    padding: 3,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(26,35,126,0.15)',
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 100,
  },
  pillActive: {
    backgroundColor: '#1a237e',
  },
  pillText: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500' as any,
    fontSize: 13,
    color: '#3949ab',
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '700' as any,
  },

  // Phone frame
  phoneFrame: {
    width: 375,
    height: 812,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    boxShadow: '0px 8px 40px rgba(26,35,126,0.18)',
  } as any,

  // Caption below
  roleCaption: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '500' as any,
    fontSize: 12,
    color: '#7986cb',
    letterSpacing: 0.3,
  },

  nativeWrapper: {
    flex: 1,
    backgroundColor: '#fafafa',
    ...Platform.select({
      web: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
      }
    })
  },
});
