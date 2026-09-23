import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/index.js';

/**
 * FilterChip Component
 *
 * @param {object} props
 * @param {string} props.label
 * @param {boolean} [props.active=false]
 * @param {'default'|'error'|'warning'|'success'} [props.variant='default']
 * @param {() => void} props.onPress
 */
export const FilterChip = ({
  label,
  active = false,
  variant = 'default',
  onPress,
}) => {
  const getVariantStyles = () => {
    if (!active) {
      return {
        bg: colors.surface,
        border: colors.border,
        text: colors.textSecondary,
      };
    }

    switch (variant) {
      case 'error':
        return {
          bg: colors.error,
          border: colors.error,
          text: colors.textOnPrimary,
        };
      case 'warning':
        return {
          bg: colors.urgentAmber,
          border: colors.urgentAmberDark,
          text: colors.textOnPrimary,
        };
      case 'success':
        return {
          bg: colors.success,
          border: colors.success,
          text: colors.textOnPrimary,
        };
      case 'default':
      default:
        return {
          bg: colors.primary,
          border: colors.primary,
          text: colors.textOnPrimary,
        };
    }
  };

  const current = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { backgroundColor: current.bg, borderColor: current.border },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.label, { color: current.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.captionBold,
    fontSize: 11,
  },
});

export default FilterChip;
