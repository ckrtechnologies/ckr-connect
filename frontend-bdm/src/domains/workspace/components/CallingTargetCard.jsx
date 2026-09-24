import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';

export const CallingTargetCard = ({
  loggedCount = 0,
  targetCount = 15,
  positiveCount = 0,
  neutralCount = 0,
  demoCount = 0,
}) => {
  const percent = Math.min(100, Math.round((loggedCount / targetCount) * 100));
  const remaining = Math.max(0, targetCount - loggedCount);

  return (
    <FluentCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>DAILY CALLING TARGET & PERFORMANCE</Text>
        <Text style={styles.percentText}>{percent}% COMPLETED</Text>
      </View>

      <View style={styles.statRow}>
        <Text style={styles.bigCount}>
          {loggedCount}{' '}
          <Text style={styles.targetLabel}>/ {targetCount} Calls Logged Today</Text>
        </Text>
        <Text
          style={[
            styles.remainingText,
            { color: percent >= 50 ? colors.success : colors.warning },
          ]}
        >
          {remaining > 0 ? `${remaining} more to target` : '🎯 Target Met!'}
        </Text>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percent}%`,
              backgroundColor: percent >= 80 ? colors.success : colors.primary,
            },
          ]}
        />
      </View>

      {/* Outcome Breakdown Pills */}
      <View style={styles.outcomesContainer}>
        <Text style={styles.outcomeTitle}>TODAY'S CALL RESULTS SUMMARY:</Text>
        <View style={styles.pillsRow}>
          <View style={[styles.pill, styles.positivePill]}>
            <Text style={[styles.pillText, { color: colors.successText }]}>
              🟢 {positiveCount} Positive / Next Step
            </Text>
          </View>
          <View style={[styles.pill, styles.neutralPill]}>
            <Text style={[styles.pillText, { color: colors.warningText }]}>
              🟡 {neutralCount} Ringing / No Answer
            </Text>
          </View>
          <View style={[styles.pill, styles.demoPill]}>
            <Text style={[styles.pillText, { color: '#0369A1' }]}>
              👥 {demoCount} Demo Completed
            </Text>
          </View>
        </View>
      </View>
    </FluentCard>
  );
};

const styles = StyleSheet.create({
  card: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  percentText: {
    ...typography.overline,
    color: colors.primary,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginVertical: spacing.xs,
  },
  bigCount: {
    ...typography.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  targetLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  remainingText: {
    ...typography.captionBold,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  outcomesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  outcomeTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  positivePill: {
    backgroundColor: colors.successBg,
    borderColor: '#C3E6CB',
  },
  neutralPill: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
  demoPill: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
  },
  pillText: {
    ...typography.captionBold,
    fontSize: 10,
  },
});
