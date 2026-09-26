import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { radius } from '../theme/radius.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from './routes.js';

import { WorkspaceScreen } from '../../domains/workspace/screens/WorkspaceScreen.jsx';
import { MyLeadsScreen } from '../../domains/leads/screens/MyLeadsScreen.jsx';
import { AttendancePunchScreen } from '../../domains/attendance/screens/AttendancePunchScreen.jsx';
import { ProfileScreen } from '../../domains/profile/screens/ProfileScreen.jsx';
import { LayoutDashboard, FileSpreadsheet, Timer, CircleUserRound } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.WORKSPACE}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: [
          styles.tabBar,
          {
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 8,
          },
        ],
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name={ROUTES.WORKSPACE}
        component={WorkspaceScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.MY_LEADS}
        component={MyLeadsScreen}
        options={{
          tabBarLabel: 'My Leads',
          tabBarIcon: ({ color, focused }) => (
            <FileSpreadsheet size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.ATTENDANCE}
        component={AttendancePunchScreen}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, focused }) => (
            <Timer size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <CircleUserRound size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
          ),
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
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabBarLabel: {
    ...typography.captionBold,
    fontSize: 11,
  },
  tabIcon: {
    fontSize: 18,
  },
  badge: {
    backgroundColor: colors.error,
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
    borderRadius: radius.pill,
  },
});
