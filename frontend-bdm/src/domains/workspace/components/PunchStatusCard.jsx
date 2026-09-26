import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { formatTime } from '../../../shared/utils/formatters.js';

export const PunchStatusCard = ({
  isPunchedIn,
  isPunchedOut,
  punchInTime,
  punchOutTime,
  onPunchOutPress,
  onNavigateToPunch,
}) => {
  const getStatusText = () => {
    if (isPunchedOut) {
      return `Shift Completed · Out at ${formatTime(punchOutTime)}`;
    }
    if (isPunchedIn) {
      return `Checked In · ${formatTime(punchInTime)}`;
    }
    return 'Not Checked In Yet';
  };

  const getActionBtnText = () => {
    if (isPunchedOut) {
      return 'View Audit ›';
    }
    if (isPunchedIn) {
      return 'Punch Out';
    }
    return 'Punch In ›';
  };

  const dotColor = isPunchedOut
    ? colors.success
    : isPunchedIn
    ? colors.success
    : colors.warning;

  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <View style={[styles.pulseDot, { backgroundColor: dotColor }]} />
        <Text style={styles.statusText} numberOfLines={1}>
          {getStatusText()}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          isPunchedOut && styles.completedActionBtn,
        ]}
        onPress={isPunchedOut ? onNavigateToPunch : isPunchedIn ? onPunchOutPress : onNavigateToPunch}
        activeOpacity={0.8}
      >
        <Text style={styles.actionBtnText}>
          {getActionBtnText()}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#004578',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
    fontSize: 13,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  completedActionBtn: {
    backgroundColor: 'rgba(16, 124, 16, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionBtnText: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
  },
});
