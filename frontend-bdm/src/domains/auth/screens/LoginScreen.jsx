import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import {
  KeyboardAvoidingView,
} from 'react-native-keyboard-controller';
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
import { setCredentials, setOnboarded } from '../slice.js';
import { storage } from '../../../shared/utils/storage.js';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your work email and password.');
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
        throw new Error('No authentication token received from server.');
      }

      // Persist token and user in local storage
      await storage.setToken(token);
      if (user) {
        await storage.setUser(user);
        if (user.has_seen_onboarding) {
          await storage.setOnboarded(true);
          dispatch(setOnboarded(true));   
        }
      }

      // Dispatch to Redux store
      dispatch(setCredentials({ token, user }));
    } catch (err) {
      console.error('Login error:', err);
      const msg =
        err?.data?.message ||
        err?.message ||
        'Unable to sign in. Please verify your credentials and network connection.';
      setErrorMessage(msg);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior="padding"
      >
      {/* ── Brand Header – FIXED above keyboard, never scrolls away ── */}
      <View style={styles.header}>
        <View style={styles.logoEmblemContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>CKR</Text>
          </View>
          <View style={styles.logoSubBadge}>
            <Text style={styles.logoDot}>●</Text>
          </View>
        </View>
        <View style={styles.brandPill}>
          <Text style={styles.brandPillText}>INTERNAL ACCESS · BDM MOBILE</Text>
        </View>
        <Text style={styles.title}>CKR Connect</Text>
        <Text style={styles.subtitle}>
          Unified sales intelligence, calling activity & attendance
        </Text>
      </View>

      {/* ── ScrollView smoothly scrolls focused input ── */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
          {/* Login Form Card */}
          <FluentCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Sign in</Text>
              <Text style={styles.cardSubtitle}>
                Enter your enterprise credentials to access your workspace
              </Text>
            </View>

            {/* Inline Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorIcon}>⚠</Text>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <FluentInput
              label="Work Email / Employee ID"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="e.g. aarav.sharma@ckrtechnologies.in"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              blurOnSubmit={false}
              required
            />

            <FluentInput
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter password"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              required
            />

            </FluentCard>
      </ScrollView>

      {/* ── Fixed Bottom CTA ── */}
      <View style={styles.fixedFooter}>
        <FluentButton
          title={isLoading ? 'Signing in...' : 'Sign in to CKR Connect'}
          onPress={handleLogin}
          loading={isLoading}
          variant="primary"
          size="large"
          style={styles.submitBtn}
        />
        <View style={styles.footer}>
          <View style={styles.securityBadge}>
            <Text style={styles.securityIcon}>🛡️</Text>
            <Text style={styles.securityText}>
              Secured by CKR Cloud Infrastructure · 256-bit TLS
            </Text>
          </View>
          <Text style={styles.versionNote}>
            CKR Technologies Connect Platform · v0.1 Mobile
          </Text>
        </View>
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  fixedFooter: {
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoEmblemContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#EFF6FC',
    elevation: 4,
    shadowColor: '#0067B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  logoSubBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#107C10',
    borderWidth: 2,
    borderColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    color: '#FFFFFF',
    fontSize: 8,
  },
  brandPill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#C7E0F4',
    marginBottom: spacing.xs,
  },
  brandPillText: {
    ...typography.overline,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
    lineHeight: 18,
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBanner: {
    backgroundColor: colors.errorBg,
    borderColor: 'rgba(164, 38, 44, 0.25)',
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  errorIcon: {
    fontSize: 14,
    color: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  submitBtn: {
    marginTop: spacing.sm,
    width: '100%',
    alignSelf: 'center',
  },
  demoHelper: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  demoHelperText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: 6,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityIcon: {
    fontSize: 12,
  },
  securityText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  versionNote: {
    fontSize: 10,
    color: colors.textDisabled,
  },
});

