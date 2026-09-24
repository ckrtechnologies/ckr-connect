import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';

export const FluentButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon = null,
  style = null,
  textStyle = null,
}) => {
  const isActionDisabled = disabled || loading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          btn: styles.btnSecondary,
          text: styles.textSecondary,
          spinnerColor: colors.primary,
        };
      case 'success':
        return {
          btn: styles.btnSuccess,
          text: styles.textSuccess,
          spinnerColor: colors.textOnPrimary,
        };
      case 'danger':
        return {
          btn: styles.btnDanger,
          text: styles.textDanger,
          spinnerColor: colors.textOnPrimary,
        };
      case 'subtle':
        return {
          btn: styles.btnSubtle,
          text: styles.textSubtle,
          spinnerColor: colors.primary,
        };
      case 'primary':
      default:
        return {
          btn: styles.btnPrimary,
          text: styles.textPrimary,
          spinnerColor: colors.textOnPrimary,
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      style={[
        styles.baseBtn,
        size === 'small' ? styles.btnSmall : size === 'large' ? styles.btnLarge : styles.btnMedium,
        vStyles.btn,
        isActionDisabled && styles.btnDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isActionDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator size="small" color={vStyles.spinnerColor} />
      ) : (
        <View style={styles.contentContainer}>
          {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
          {title ? <Text style={[vStyles.text, textStyle]}>{title}</Text> : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseBtn: {
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: spacing.xs,
  },
  btnSmall: {
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  btnMedium: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  btnLarge: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  textPrimary: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
  },
  textSecondary: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  btnSuccess: {
    backgroundColor: colors.success,
    borderColor: colors.success,
    borderWidth: 1,
  },
  textSuccess: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
  },
  btnDanger: {
    backgroundColor: colors.error,
    borderColor: colors.error,
    borderWidth: 1,
  },
  textDanger: {
    ...typography.bodyBold,
    color: colors.textOnPrimary,
  },
  btnSubtle: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 1,
  },
  textSubtle: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  btnDisabled: {
    opacity: 0.55,
  },
});
