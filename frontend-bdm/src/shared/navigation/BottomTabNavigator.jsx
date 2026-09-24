import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { radius } from '../theme/radius.js';
import { ROUTES } from './routes.js';

import { WorkspaceScreen } from '../../domains/workspace/screens/WorkspaceScreen.jsx';
import { MyLeadsScreen } from '../../domains/leads/screens/MyLeadsScreen.jsx';
import { AttendancePunchScreen } from '../../domains/attendance/screens/AttendancePunchScreen.jsx';
import { NotificationsScreen } from '../../domains/notifications/screens/NotificationsScreen.jsx';

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const unreadCount = useSelector((state) => state.ui.unreadNotificationsCount);

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
            <Text style={[styles.tabIcon, { color }]}>{focused ? '🏠' : '🏚️'}</Text>
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.MY_LEADS}
        component={MyLeadsScreen}
        options={{
          tabBarLabel: 'My Leads',
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Text style={[styles.tabIcon, { color }]}>{focused ? '📋' : '📄'}</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.ATTENDANCE}
        component={AttendancePunchScreen}
        options={{
          tabBarLabel: 'Attendance',
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>{focused ? '⏰' : '⏱️'}</Text>
          ),
        }}
      />

      <Tab.Screen
        name={ROUTES.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badge,
          tabBarIcon: ({ color, focused }) => (
            <Text style={[styles.tabIcon, { color }]}>{focused ? '🔔' : '🔕'}</Text>
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
