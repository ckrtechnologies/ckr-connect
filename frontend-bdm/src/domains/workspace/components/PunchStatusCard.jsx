import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { formatTime } from '../../../shared/utils/formatters.js';

export const PunchStatusCard = ({
  isPunchedIn,
  punchInTime,
  onPunchOutPress,
  onNavigateToPunch,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.pulseDot,
            { backgroundColor: isPunchedIn ? colors.success : colors.warning },
          ]}
        />
        <Text style={styles.statusText}>
          {isPunchedIn
            ? `Checked In · ${formatTime(punchInTime)}`
            : 'Not Checked In Yet'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        onPress={isPunchedIn ? onPunchOutPress : onNavigateToPunch}
        activeOpacity={0.8}
      >
        <Text style={styles.actionBtnText}>
          {isPunchedIn ? 'Punch Out' : 'Punch In ›'}
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
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
  },
  actionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  actionBtnText: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
  },
});
