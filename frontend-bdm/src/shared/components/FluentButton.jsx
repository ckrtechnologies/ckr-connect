import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/index.js';

/**
 * Fluent 2 CTA Button with Crash-Resilience Loading Guards
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'success'|'urgent'|'danger'|'ghost'} [props.variant='primary']
 * @param {'default'|'sm'|'md'|'large'} [props.size='default']
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.icon]
 * @param {string} props.title
 * @param {() => void} props.onPress
 * @param {object} [props.style]
 * @param {object} [props.textStyle]
 */
export const FluentButton = ({
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  icon = null,
  title,
  children,
  onPress,
  style,
  textStyle,
  ...rest
}) => {
  const isActionDisabled = disabled || loading;

  const getContainerStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.btnSecondary;
      case 'success':
        return styles.btnSuccess;
      case 'urgent':
        return styles.btnUrgent;
      case 'danger':
        return styles.btnDanger;
      case 'ghost':
        return styles.btnGhost;
      case 'primary':
      default:
        return styles.btnPrimary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return colors.textPrimary;
      case 'ghost':
        return colors.primary;
      case 'primary':
      case 'success':
      case 'urgent':
      case 'danger':
      default:
        return colors.textOnPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'md':
        return styles.sizeMd;
      case 'large':
        return styles.sizeLarge;
      case 'default':
      default:
        return styles.sizeDefault;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        isActionDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isActionDisabled}
      activeOpacity={0.75}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <Text
            style={[
              styles.textBase,
              { color: getTextColor() },
              size === 'sm' && styles.textSm,
              textStyle,
            ]}
          >
            {title || children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  textBase: {
    ...typography.bodyBold,
    textAlign: 'center',
  },
  textSm: {
    ...typography.captionBold,
  },

  // Variants
  btnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  btnSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    borderWidth: 1,
  },
  btnUrgent: {
    backgroundColor: colors.urgentAmber,
    borderColor: colors.urgentAmberDark,
    borderWidth: 1,
  },
  btnDanger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    borderWidth: 1,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // Sizes
  sizeSm: {
    height: 32,
    paddingHorizontal: spacing.sm,
  },
  sizeMd: {
    height: 38,
    paddingHorizontal: spacing.md,
  },
  sizeDefault: {
    height: 44,
    paddingHorizontal: spacing.lg,
  },
  sizeLarge: {
    height: 48,
    paddingHorizontal: spacing.xl,
  },

  disabled: {
    opacity: 0.55,
  },
});

export default FluentButton;
