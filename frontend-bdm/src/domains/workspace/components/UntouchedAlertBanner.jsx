import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';

export const UntouchedAlertBanner = ({ count, onCallNow }) => {
  if (!count || count <= 0) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>⚡ {count} Inbound Leads Untouched!</Text>
        <Text style={styles.subtitle}>
          Assigned today. Dial immediately to meet daily first-response target!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.callNowBtn}
        onPress={onCallNow}
        activeOpacity={0.8}
      >
        <Text style={styles.callNowBtnText}>Call Now ({count}) ›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.urgentAmberBg,
    borderColor: colors.urgentAmberBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.urgentAmberText,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 11,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 15,
  },
  callNowBtn: {
    backgroundColor: colors.urgentAmber,
    borderColor: colors.urgentAmberDark,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callNowBtnText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    fontSize: 11,
  },
});

export default UntouchedAlertBanner;
