import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import BeneficiaryRedressalScreen from '../screens/BeneficiaryRedressalScreen';
import DPODashboardScreen from '../screens/DPODashboardScreen';
import SupervisorScreen from '../screens/SupervisorScreen';

type Role = 'CDPO' | 'Supervisor' | 'DPO';

export default function HomeScreen() {
  const [activeRole, setActiveRole] = useState<Role>('CDPO');

  if (Platform.OS === 'web') {
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
          {activeRole === 'CDPO'
            ? <BeneficiaryRedressalScreen />
            : activeRole === 'Supervisor'
            ? <SupervisorScreen />
            : <DPODashboardScreen />}
        </View>

        {/* Role Label below frame */}
        <Text style={styles.roleCaption}>
          {activeRole === 'CDPO'
            ? 'CDPO — Project: Sanganer, 4 Sectors'
            : activeRole === 'Supervisor'
            ? 'Supervisor — Sector 1, AWC 6'
            : 'DPO — District: Jaipur, 5 Projects'}
        </Text>
      </View>
    );
  }

  // Native: render based on role
  return (
    <View style={styles.nativeWrapper}>
      {activeRole === 'CDPO'
        ? <BeneficiaryRedressalScreen />
        : activeRole === 'Supervisor'
        ? <SupervisorScreen />
        : <DPODashboardScreen />}
    </View>
  );
}

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
  },
});
