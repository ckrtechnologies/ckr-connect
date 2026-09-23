import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../theme/index.js';
import { setQuickAddModalOpen } from '../store/slices/uiSlice.js';
import { ROUTES } from './routes.js';

// Screens
import LoginScreen from '../../domains/auth/screens/LoginScreen.jsx';
import WelcomeWalkthroughScreen from '../../domains/auth/screens/WelcomeWalkthroughScreen.jsx';
import BottomTabNavigator from './BottomTabNavigator.jsx';
import LeadDetailScreen from '../../domains/leads/screens/LeadDetailScreen.jsx';
import LogFollowupScreen from '../../domains/leads/screens/LogFollowupScreen.jsx';
import UploadBrdScreen from '../../domains/leads/screens/UploadBrdScreen.jsx';
import AttendanceHistoryScreen from '../../domains/attendance/screens/AttendanceHistoryScreen.jsx';

const Stack = createNativeStackNavigator();

/**
 * Top App Bar matching prototype header (prototype/app.js lines 2867-2878)
 */
export const HeaderAppBar = ({ navigation }) => {
  const dispatch = useDispatch();
  const unreadCount = 2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>CKR Connect · BDM</Text>

        <View style={styles.appBarActions}>
          {/* + Add Lead Pill CTA */}
          <TouchableOpacity
            style={styles.addLeadBtn}
            onPress={() => dispatch(setQuickAddModalOpen(true))}
            activeOpacity={0.8}
          >
            <Text style={styles.addLeadBtnText}>+ Add Lead</Text>
          </TouchableOpacity>

          {/* Bell Icon with Unread Badge */}
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate(ROUTES.MAIN_TABS, { screen: ROUTES.NOTIFICATIONS })}
            activeOpacity={0.7}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 ? (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unreadCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export const RootNavigator = () => {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? ROUTES.MAIN_TABS : ROUTES.LOGIN}
      screenOptions={({ navigation, route }) => {
        const isAuthScreen = route.name === ROUTES.LOGIN || route.name === ROUTES.ONBOARDING;
        const isModalDetail =
          route.name === ROUTES.LEAD_DETAIL ||
          route.name === ROUTES.LOG_FOLLOWUP ||
          route.name === ROUTES.UPLOAD_BRD;

        return {
          header: () =>
            isAuthScreen || isModalDetail ? null : <HeaderAppBar navigation={navigation} />,
          headerShown: !isAuthScreen && !isModalDetail,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        };
      }}
    >
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.ONBOARDING}
        component={WelcomeWalkthroughScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.MAIN_TABS}
        component={BottomTabNavigator}
      />
      <Stack.Screen
        name={ROUTES.LEAD_DETAIL}
        component={LeadDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.LOG_FOLLOWUP}
        component={LogFollowupScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.UPLOAD_BRD}
        component={UploadBrdScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.ATTENDANCE_HISTORY}
        component={AttendanceHistoryScreen}
        options={{
          headerShown: true,
          title: 'Attendance History',
          headerBackTitle: 'Punch',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.surface,
  },
  appBar: {
    height: spacing.appBarHeight,
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingHorizontal,
  },
  appBarTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  appBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addLeadBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  addLeadBtnText: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
    fontSize: 11,
  },
  bellBtn: {
    padding: 4,
    position: 'relative',
  },
  bellIcon: {
    fontSize: 18,
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bellBadgeText: {
    ...typography.overline,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default RootNavigator;
