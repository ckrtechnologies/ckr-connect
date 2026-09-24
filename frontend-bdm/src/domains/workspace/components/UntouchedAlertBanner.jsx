import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';

export const UntouchedAlertBanner = ({ count = 0, onCallNowPress }) => {
  if (count <= 0) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          ⚡ {count} Inbound Lead{count === 1 ? '' : 's'} Untouched!
        </Text>
        <Text style={styles.subtitle}>
          Assigned today. Dial immediately to meet daily first-response target!
        </Text>
      </View>
      <TouchableOpacity
        style={styles.callBtn}
        onPress={onCallNowPress}
        activeOpacity={0.8}
      >
        <Text style={styles.callBtnText}>Call Now ({count}) ›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.untouchedBg,
    borderColor: colors.untouchedBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.captionBold,
    color: colors.untouchedText,
    fontSize: 13,
  },
  subtitle: {
    ...typography.caption,
    color: '#92400E',
    marginTop: 2,
    fontSize: 11,
  },
  callBtn: {
    backgroundColor: colors.untouchedBtn,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  callBtnText: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
    fontSize: 11,
  },
});
