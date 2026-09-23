import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, radius, spacing, typography } from '../theme/index.js';
import { ROUTES } from './routes.js';

// Screens
import WorkspaceScreen from '../../domains/workspace/screens/WorkspaceScreen.jsx';
import MyLeadsScreen from '../../domains/leads/screens/MyLeadsScreen.jsx';
import AttendancePunchScreen from '../../domains/attendance/screens/AttendancePunchScreen.jsx';
import NotificationsScreen from '../../domains/notifications/screens/NotificationsScreen.jsx';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.WORKSPACE}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {/* 1. Dashboard */}
      <Tab.Screen
        name={ROUTES.WORKSPACE}
        component={WorkspaceScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📊</Text>,
        }}
      />

      {/* 2. My Leads */}
      <Tab.Screen
        name={ROUTES.MY_LEADS}
        component={MyLeadsScreen}
        options={{
          tabBarLabel: 'My Leads',
          tabBarBadge: 2,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>📋</Text>,
        }}
      />

      {/* 3. Attendance */}
      <Tab.Screen
        name={ROUTES.ATTENDANCE_PUNCH}
        component={AttendancePunchScreen}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>⏰</Text>,
        }}
      />

      {/* 4. Alerts */}
      <Tab.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: 2,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color }) => <Text style={[styles.tabIcon, { color }]}>🔔</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: spacing.bottomNavHeight,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    ...typography.captionBold,
    fontSize: 10,
  },
  tabIcon: {
    fontSize: 18,
  },
  badge: {
    backgroundColor: colors.error,
    fontSize: 10,
    fontWeight: '700',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});

export default BottomTabNavigator;
