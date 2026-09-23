import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { FluentButton, FluentInput, FluentCard } from '../../../shared/components/index.js';
import { setCredentials } from '../../../shared/store/slices/authSlice.js';
import { INITIAL_BDM_USER } from '../../../shared/utils/mockSeedData.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('aarav.sharma@ckrtechnologies.in');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your Employee ID/Email and Password.');
      return;
    }

    try {
      setLoading(true);
      // Simulate authentication / network request
      await new Promise((resolve) => setTimeout(resolve, 600));

      dispatch(
        setCredentials({
          user: INITIAL_BDM_USER,
          token: 'mock-jwt-token-aarav',
        })
      );

      if (!INITIAL_BDM_USER.has_seen_onboarding) {
        navigation.replace(ROUTES.ONBOARDING);
      } else {
        navigation.replace(ROUTES.MAIN_TABS);
      }
    } catch (err) {
      console.error('[LoginScreen] login failed:', err);
      Alert.alert('Sign In Failed', 'Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>CKR CONNECT</Text>
          </View>
          <Text style={styles.title}>BDM Portal Login</Text>
          <Text style={styles.subtitle}>Sign in to start telecalling & attendance</Text>
        </View>

        {/* Credentials Form Card */}
        <FluentCard style={styles.formCard}>
          <FluentInput
            label="Employee ID / Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="e.g. aarav.sharma@ckrtechnologies.in"
          />

          <FluentInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />

          <FluentButton
            title="Sign In to My App"
            loading={loading}
            onPress={handleLogin}
            style={styles.submitBtn}
          />
        </FluentCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.pagePaddingHorizontal,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#C7E0F4',
    marginBottom: spacing.sm,
  },
  brandBadgeText: {
    ...typography.overline,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  formCard: {
    padding: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.sm,
    height: 44,
  },
});

export default LoginScreen;
