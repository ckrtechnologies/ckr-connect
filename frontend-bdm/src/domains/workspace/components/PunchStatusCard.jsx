import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';

export const PunchStatusCard = ({ isPunchedIn, lastPunchTime, onTogglePunch }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: isPunchedIn ? colors.success : colors.warning },
          ]}
        />
        <Text style={styles.statusText}>
          {isPunchedIn ? `Checked In · ${lastPunchTime}` : 'Not Checked In'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.punchBtn}
        onPress={onTogglePunch}
        activeOpacity={0.8}
      >
        <Text style={styles.punchBtnText}>
          {isPunchedIn ? 'Punch Out' : 'Punch In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#004578',
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    fontSize: 12,
  },
  punchBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  punchBtnText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    fontSize: 11,
  },
});

export default PunchStatusCard;
