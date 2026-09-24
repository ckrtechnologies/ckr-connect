import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';

const STAGES = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'follow_up', label: 'Follow-up' },
  { key: 'proposal', label: 'Proposal' },
  { key: 'won', label: 'Won' },
];

export const ProcessFlowBar = ({
  currentStatus = 'new',
  onSelectStage = null,
  disabled = false,
}) => {
  const normStatus = (currentStatus || 'new').toLowerCase();
  const currentIndex = STAGES.findIndex((s) => s.key === normStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;
  const isTerminalLost = normStatus === 'lost' || normStatus === 'invalid';

  return (
    <View style={styles.container}>
      {isTerminalLost ? (
        <View style={styles.lostBanner}>
          <Text style={styles.lostText}>
            STATUS: {normStatus.toUpperCase()} (Process Ended)
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <TouchableOpacity
                key={stage.key}
                style={[
                  styles.segment,
                  isCurrent && styles.segmentCurrent,
                  isCompleted && styles.segmentCompleted,
                  idx > activeIdx && styles.segmentUpcoming,
                ]}
                disabled={disabled || !onSelectStage}
                onPress={() => onSelectStage && onSelectStage(stage.key)}
                activeOpacity={0.7}
              >
                <View style={styles.circle}>
                  <Text
                    style={[
                      styles.circleText,
                      isCurrent && styles.circleTextCurrent,
                      isCompleted && styles.circleTextCompleted,
                    ]}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stageLabel,
                    isCurrent && styles.stageLabelCurrent,
                    isCompleted && styles.stageLabelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {stage.label}
                </Text>
                {idx < STAGES.length - 1 ? (
                  <Text style={styles.chevronDivider}>›</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginVertical: spacing.xs,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
    marginRight: 2,
  },
  segmentCurrent: {
    backgroundColor: colors.primary,
  },
  segmentCompleted: {
    backgroundColor: colors.primaryLight,
  },
  segmentUpcoming: {
    opacity: 0.65,
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
  circleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  circleTextCurrent: {
    color: colors.textOnPrimary,
    backgroundColor: colors.primaryDark,
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: 'center',
    lineHeight: 18,
  },
  circleTextCompleted: {
    color: colors.primary,
  },
  stageLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  stageLabelCurrent: {
    color: colors.textOnPrimary,
  },
  stageLabelCompleted: {
    color: colors.primary,
  },
  chevronDivider: {
    fontSize: 14,
    color: colors.textDisabled,
    marginLeft: spacing.xs,
  },
  lostBanner: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  lostText: {
    ...typography.captionBold,
    color: colors.errorText,
  },
});
