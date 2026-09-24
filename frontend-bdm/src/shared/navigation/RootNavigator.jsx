import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from '../theme/colors.js';
import { ROUTES } from './routes.js';
import { storage } from '../utils/storage.js';
import { setCredentials, setOnboarded, setHydrated } from '../../domains/auth/slice.js';

import { LoginScreen } from '../../domains/auth/screens/LoginScreen.jsx';
import { WelcomeWalkthroughScreen } from '../../domains/auth/screens/WelcomeWalkthroughScreen.jsx';
import { BottomTabNavigator } from './BottomTabNavigator.jsx';
import { LeadDetailScreen } from '../../domains/leads/screens/LeadDetailScreen.jsx';
import { LogFollowupScreen } from '../../domains/leads/screens/LogFollowupScreen.jsx';
import { UploadBrdScreen } from '../../domains/leads/screens/UploadBrdScreen.jsx';
import { AttendanceHistoryScreen } from '../../domains/attendance/screens/AttendanceHistoryScreen.jsx';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isOnboarded, isHydrated } = useSelector((state) => state.auth);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await storage.getToken();
        const user = await storage.getUser();
        const onboarded = await storage.getOnboarded();

        if (token && user) {
          dispatch(setCredentials({ token, user }));
        }
        dispatch(setOnboarded(onboarded));
      } catch (err) {
        console.warn('Failed restoring session', err);
      } finally {
        dispatch(setHydrated(true));
      }
    };

    restoreSession();
  }, [dispatch]);

  if (!isHydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        ) : !isOnboarded ? (
          <Stack.Screen
            name={ROUTES.WALKTHROUGH}
            component={WelcomeWalkthroughScreen}
          />
        ) : (
          <>
            <Stack.Screen name={ROUTES.MAIN_TABS} component={BottomTabNavigator} />
            <Stack.Screen
              name={ROUTES.LEAD_DETAIL}
              component={LeadDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name={ROUTES.LOG_FOLLOWUP}
              component={LogFollowupScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name={ROUTES.UPLOAD_BRD}
              component={UploadBrdScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name={ROUTES.ATTENDANCE_HISTORY}
              component={AttendanceHistoryScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
