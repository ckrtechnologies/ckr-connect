import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import { FluentButton } from '../../../shared/components/index.js';
import { toggleAttendancePunch } from '../../../shared/store/slices/uiSlice.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const AttendancePunchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const isPunchedIn = useSelector((state) => state.ui.isPunchedIn);
  const lastPunchTime = useSelector((state) => state.ui.lastPunchTime);
  const [loading, setLoading] = useState(false);

  const handlePunchToggle = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      dispatch(toggleAttendancePunch());
      Alert.alert(
        'Punch Recorded',
        isPunchedIn
          ? 'You have successfully punched out for today.'
          : 'You have successfully punched in for today.'
      );
    } catch (err) {
      console.error('[AttendancePunch] error:', err);
      Alert.alert('Punch Failed', 'Could not record attendance. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero Punch Card */}
      <View style={styles.heroCard}>
        <Text style={styles.dateLabel}>TODAY · 22 SEPTEMBER 2026</Text>

        <TouchableOpacity
          style={[
            styles.punchCircle,
            isPunchedIn ? styles.punchedInCircle : styles.punchedOutCircle,
            loading && styles.disabled,
          ]}
          onPress={handlePunchToggle}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.clockIcon}>⏰</Text>
          <Text style={styles.punchActionText}>
            {isPunchedIn ? 'PUNCH OUT' : 'PUNCH IN'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.punchTimestamp}>
          {isPunchedIn ? `Checked in at ${lastPunchTime}` : 'Not checked in yet'}
        </Text>
      </View>

      <FluentButton
        variant="secondary"
        size="default"
        title="View Monthly Attendance History ›"
        onPress={() => navigation.navigate(ROUTES.ATTENDANCE_HISTORY)}
        style={styles.historyBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.pagePaddingHorizontal,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: '#004578',
    borderRadius: radius.md,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.level2,
  },
  dateLabel: {
    ...typography.overline,
    color: '#D6ECFF',
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: spacing.xl,
  },
  punchCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 4,
    ...shadows.level3,
  },
  punchedInCircle: {
    backgroundColor: colors.error,
    borderColor: '#F1707B',
  },
  punchedOutCircle: {
    backgroundColor: colors.success,
    borderColor: '#82C982',
  },
  clockIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  punchActionText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  punchTimestamp: {
    ...typography.body,
    color: '#FFFFFF',
    fontSize: 13,
  },
  historyBtn: {
    marginTop: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AttendancePunchScreen;
