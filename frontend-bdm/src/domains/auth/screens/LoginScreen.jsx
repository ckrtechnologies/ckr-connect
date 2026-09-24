import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { useLoginMutation } from '../api.js';
import { setCredentials } from '../slice.js';
import { storage } from '../../../shared/utils/storage.js';

export const LoginScreen = () => {
  const [email, setEmail] = useState('aarav.sharma@ckrtechnologies.in');
  const [password, setPassword] = useState('password123');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your Employee ID/Email and Password.');
      return;
    }

    try {
      const response = await login({
        email: email.trim(),
        password: password.trim(),
      }).unwrap();

      const token =
        response.token ||
        response.data?.token ||
        response.data?.accessToken ||
        response.accessToken;
      const user = response.user || response.data?.user;

      if (!token) {
        throw new Error('Token not returned by authentication server');
      }

      // Persist in secure storage
      await storage.setToken(token);
      await storage.setUser(user);

      // Dispatch to Redux
      dispatch(setCredentials({ token, user }));
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        err?.message ||
        'Invalid credentials. Please verify your email and password.';
      Alert.alert('Sign In Failed', errorMsg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🔒</Text>
            </View>
            <View style={styles.brandPill}>
              <Text style={styles.brandPillText}>CKR CONNECT</Text>
            </View>
            <Text style={styles.title}>BDM Portal Login</Text>
            <Text style={styles.subtitle}>
              Sign in to start telecalling & attendance
            </Text>
          </View>

          {/* Login Form Card */}
          <FluentCard style={styles.card}>
            <FluentInput
              label="Employee ID / Work Email"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. aarav.sharma@ckrtechnologies.in"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />

            <FluentInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••••••"
              secureTextEntry
              required
            />

            <FluentButton
              title="Sign In to My App"
              onPress={handleLogin}
              loading={isLoading}
              variant="primary"
              size="large"
              style={styles.submitBtn}
            />
          </FluentCard>

          {/* Footer Assistance */}
          <Text style={styles.footerNote}>
            CKR Technologies Internal Operations System · v1.0
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#C7E0F4',
  },
  logoIcon: {
    fontSize: 26,
  },
  brandPill: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginBottom: spacing.xs,
  },
  brandPillText: {
    ...typography.overline,
    color: colors.primary,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    padding: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
