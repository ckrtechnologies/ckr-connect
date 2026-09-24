import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';

export const FilterChip = ({
  label,
  active = false,
  onPress,
  variant = 'default',
  badge = null,
  style = null,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          chip: active ? styles.chipErrorActive : styles.chipErrorInactive,
          text: active ? styles.textActive : styles.textError,
        };
      case 'warning':
        return {
          chip: active ? styles.chipWarningActive : styles.chipWarningInactive,
          text: active ? styles.textActive : styles.textWarning,
        };
      case 'success':
        return {
          chip: active ? styles.chipSuccessActive : styles.chipSuccessInactive,
          text: active ? styles.textActive : styles.textSuccess,
        };
      default:
        return {
          chip: active ? styles.chipDefaultActive : styles.chipDefaultInactive,
          text: active ? styles.textActive : styles.textDefault,
        };
    }
  };

  const v = getVariantStyles();

  return (
    <TouchableOpacity
      style={[styles.baseChip, v.chip, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.baseText, v.text]}>{label}</Text>
      {badge !== null && badge !== undefined ? (
        <Text style={[styles.badgeText, active && styles.badgeTextActive]}>
          {' '}({badge})
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.xs + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    ...typography.captionBold,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badgeTextActive: {
    color: colors.textOnPrimary,
  },
  chipDefaultInactive: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  chipDefaultActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textDefault: {
    color: colors.textPrimary,
  },
  textActive: {
    color: colors.textOnPrimary,
  },
  chipErrorInactive: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
  },
  chipErrorActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  textError: {
    color: colors.error,
  },
  chipWarningInactive: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
  chipWarningActive: {
    backgroundColor: colors.warning,
    borderColor: colors.warning,
  },
  textWarning: {
    color: colors.warningText,
  },
  chipSuccessInactive: {
    backgroundColor: colors.successBg,
    borderColor: '#C3E6CB',
  },
  chipSuccessActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  textSuccess: {
    color: colors.successText,
  },
});
