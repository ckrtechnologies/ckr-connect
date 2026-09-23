import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';

export const CallingTargetCard = ({
  completedCount = 4,
  dailyTarget = 15,
  positiveCount = 3,
  neutralCount = 1,
  meetingCount = 1,
}) => {
  const remaining = Math.max(0, dailyTarget - completedCount);
  const progressPercent = Math.min(100, Math.round((completedCount / dailyTarget) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>DAILY CALLING TARGET & PERFORMANCE</Text>
        <Text style={styles.percentText}>{progressPercent}% COMPLETED</Text>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.bigCount}>
          {completedCount}{' '}
          <Text style={styles.smallCount}>/ {dailyTarget} Calls Logged Today</Text>
        </Text>
        <Text
          style={[
            styles.remainingText,
            { color: progressPercent >= 50 ? colors.success : colors.urgentAmber },
          ]}
        >
          {remaining} more to target
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${progressPercent}%`,
              backgroundColor: progressPercent >= 80 ? colors.success : colors.primary,
            },
          ]}
        />
      </View>

      {/* Summary Pills Breakdown */}
      <View style={styles.pillsContainer}>
        <Text style={styles.summaryLabel}>TODAY'S CALL RESULTS SUMMARY:</Text>
        <View style={styles.pillsRow}>
          <View style={[styles.pill, styles.positivePill]}>
            <Text style={[styles.pillText, { color: colors.success }]}>
              🟢 {positiveCount} Positive / Next Step Set
            </Text>
          </View>

          <View style={[styles.pill, styles.neutralPill]}>
            <Text style={[styles.pillText, { color: colors.urgentAmberText }]}>
              🟡 {neutralCount} Ringing / No Answer
            </Text>
          </View>

          <View style={[styles.pill, styles.demoPill]}>
            <Text style={[styles.pillText, { color: '#0369A1' }]}>
              👥 {meetingCount} Demo Completed
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderTopColor: colors.primary,
    borderTopWidth: 3,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    marginVertical: spacing.xs,
    ...shadows.level1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  percentText: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  bigCount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  smallCount: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  remainingText: {
    ...typography.captionBold,
    fontSize: 11,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  pillsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  pillText: {
    ...typography.captionBold,
    fontSize: 10,
  },
  positivePill: {
    backgroundColor: colors.successBg,
    borderColor: '#C3E6CB',
  },
  neutralPill: {
    backgroundColor: colors.warningBg,
    borderColor: colors.urgentAmberBorder,
  },
  demoPill: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
});

export default CallingTargetCard;
