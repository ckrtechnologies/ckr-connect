import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/index.js';

export const BPF_STAGES = [
  { id: 'new', label: '1. New', probability: 10 },
  { id: 'contacted', label: '2. Contacted', probability: 25 },
  { id: 'follow_up', label: '3. Follow-up', probability: 50 },
  { id: 'proposal', label: '4. Proposal', probability: 75 },
  { id: 'won', label: '5. Won', probability: 100 },
];

/**
 * Business Process Flow (BPF) Chevron Stepper
 * Authentically styled per Microsoft Dynamics 365 / Fluent
 *
 * @param {object} props
 * @param {string} props.currentStatus
 * @param {(stageId: string) => void} [props.onSelectStage]
 * @param {boolean} [props.disabled=false]
 */
export const ProcessFlowBar = ({
  currentStatus = 'new',
  onSelectStage,
  disabled = false,
}) => {
  const normStatus = (currentStatus || 'new').toLowerCase();
  const currentIndex = BPF_STAGES.findIndex((s) => s.id === normStatus);
  const isTerminalLost = normStatus === 'lost' || normStatus === 'invalid';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {BPF_STAGES.map((stage, idx) => {
          const isActive = stage.id === normStatus;
          const isPassed = currentIndex > idx && !isTerminalLost;

          let stageBg = colors.surfaceAlt;
          let stageTextColor = colors.textSecondary;
          let borderColor = colors.border;

          if (isActive) {
            stageBg = colors.primary;
            stageTextColor = colors.textOnPrimary;
            borderColor = colors.primary;
          } else if (isPassed) {
            stageBg = colors.primaryLight;
            stageTextColor = colors.primary;
            borderColor = '#C7E0F4';
          }

          return (
            <TouchableOpacity
              key={stage.id}
              style={[
                styles.stageButton,
                { backgroundColor: stageBg, borderColor },
                isActive && styles.activeStageButton,
              ]}
              onPress={() => {
                if (!disabled && onSelectStage) {
                  onSelectStage(stage.id);
                }
              }}
              disabled={disabled || !onSelectStage}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.stageText,
                  { color: stageTextColor },
                  isActive && styles.activeStageText,
                ]}
                numberOfLines={1}
              >
                {isPassed ? `✓ ${stage.label}` : stage.label}
              </Text>
              <Text
                style={[
                  styles.probText,
                  { color: isActive ? '#D6ECFF' : colors.textSecondary },
                ]}
              >
                {stage.probability}%
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isTerminalLost ? (
        <View style={styles.lostBanner}>
          <Text style={styles.lostBannerText}>
            🛑 Lead status is marked as {normStatus.toUpperCase()}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  stageButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.xs,
    borderWidth: 1,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStageButton: {
    borderWidth: 1.5,
  },
  stageText: {
    ...typography.captionBold,
    fontSize: 11,
  },
  activeStageText: {
    fontWeight: '700',
  },
  probText: {
    ...typography.overline,
    fontSize: 9,
    marginTop: 1,
  },
  lostBanner: {
    backgroundColor: colors.errorBg,
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: radius.xs,
    padding: spacing.xs,
    marginTop: spacing.xs,
    alignItems: 'center',
  },
  lostBannerText: {
    ...typography.captionBold,
    color: colors.error,
  },
});

export default ProcessFlowBar;
