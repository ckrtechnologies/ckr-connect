/**
 * AppAlert — Shared branded alert/dialog component for CKR Connect BDM
 * Replaces all native Alert.alert() calls with a consistent, beautiful UI.
 *
 * Usage (alert):
 *   import { useAlert } from '../shared/components/AppAlert';
 *   const { showAlert, AlertComponent } = useAlert();
 *   showAlert('error', 'Title', 'Message');
 *   return <>{AlertComponent}</>;
 *
 * Usage (confirm):
 *   showAlert('confirm', 'Are you sure?', 'This cannot be undone.', {
 *     confirmLabel: 'Delete',
 *     onConfirm: () => doDelete(),
 *   });
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';

// ─── Alert type config ───────────────────────────────────────────────────────
const VARIANTS = {
  error: {
    icon: '✕',
    iconBg: colors.errorBg,
    iconColor: colors.error,
    iconBorder: colors.errorBorder,
    accentBar: colors.error,
    titleColor: colors.errorText,
    primaryBg: colors.error,
    primaryLabel: 'OK',
  },
  success: {
    icon: '✓',
    iconBg: colors.successBg,
    iconColor: colors.success,
    iconBorder: '#A8E6A3',
    accentBar: colors.success,
    titleColor: colors.success,
    primaryBg: colors.success,
    primaryLabel: 'Great!',
  },
  warning: {
    icon: '!',
    iconBg: colors.warningBg,
    iconColor: colors.warning,
    iconBorder: colors.warningBorder,
    accentBar: colors.warning,
    titleColor: colors.warningText,
    primaryBg: colors.warning,
    primaryLabel: 'OK',
  },
  info: {
    icon: 'i',
    iconBg: colors.infoBg,
    iconColor: colors.info,
    iconBorder: '#C7E0F4',
    accentBar: colors.info,
    titleColor: colors.infoText,
    primaryBg: colors.info,
    primaryLabel: 'OK',
  },
  confirm: {
    icon: '?',
    iconBg: '#FFF4CE',
    iconColor: '#D97706',
    iconBorder: '#F2C94C',
    accentBar: '#D97706',
    titleColor: colors.textPrimary,
    primaryBg: colors.error,
    primaryLabel: 'Confirm',
  },
};

// ─── Core Alert Dialog ────────────────────────────────────────────────────────
export function AppAlertDialog({
  visible,
  type = 'info',
  title,
  message,
  primaryLabel,
  onPrimary,
  onCancel,       // if provided → shows Cancel button (for confirm dialogs)
  cancelLabel = 'Cancel',
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const v = VARIANTS[type] || VARIANTS.info;
  const resolvedPrimaryLabel = primaryLabel || v.primaryLabel;

  return (
    <Modal
      visible={Boolean(visible)}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel || onPrimary}
    >
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          {/* Top accent bar */}
          <View style={[styles.accentBar, { backgroundColor: v.accentBar }]} />

          {/* Icon badge */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: v.iconBg, borderColor: v.iconBorder },
            ]}
          >
            <Text style={[styles.iconText, { color: v.iconColor }]}>{v.icon}</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: v.titleColor }]}>{title}</Text>

          {/* Message */}
          {Boolean(message) && (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* Buttons */}
          <View style={[styles.buttonRow, onCancel && styles.buttonRowDouble]}>
            {onCancel ? (
              <>
                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={onCancel}
                  activeOpacity={0.75}
                >
                  <Text style={styles.btnCancelText}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, { backgroundColor: v.primaryBg }]}
                  onPress={onPrimary}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnPrimaryText}>{resolvedPrimaryLabel}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.btn, styles.btnFull, { backgroundColor: v.primaryBg }]}
                onPress={onPrimary}
                activeOpacity={0.8}
              >
                <Text style={styles.btnPrimaryText}>{resolvedPrimaryLabel}</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── useAlert hook ─────────────────────────────────────────────────────────────
/**
 * Hook that provides:
 *   showAlert(type, title, message, options?)
 *     type: 'error' | 'success' | 'warning' | 'info' | 'confirm'
 *     options: { confirmLabel, cancelLabel, onConfirm, onCancel, primaryLabel }
 *   AlertComponent: <AppAlertDialog /> to render in JSX
 */
export function useAlert() {
  const [state, setState] = useState({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    primaryLabel: null,
    onConfirm: null,
    onCancel: null,
    cancelLabel: 'Cancel',
  });

  const showAlert = useCallback(
    (type, title, message = '', options = {}) => {
      setState({
        visible: true,
        type,
        title,
        message,
        primaryLabel: options.confirmLabel || options.primaryLabel || null,
        onConfirm: options.onConfirm || null,
        onCancel:
          type === 'confirm'
            ? options.onCancel || null
            : null,
        cancelLabel: options.cancelLabel || 'Cancel',
      });
    },
    []
  );

  const dismiss = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  const handlePrimary = useCallback(() => {
    const cb = state.onConfirm;
    dismiss();
    if (cb) setTimeout(cb, 80); // small delay so modal closes first
  }, [state.onConfirm, dismiss]);

  const handleCancel = useCallback(() => {
    const cb = state.onCancel;
    dismiss();
    if (cb) setTimeout(cb, 80);
  }, [state.onCancel, dismiss]);

  const AlertComponent = (
    <AppAlertDialog
      visible={state.visible}
      type={state.type}
      title={state.title}
      message={state.message}
      primaryLabel={state.primaryLabel}
      onPrimary={handlePrimary}
      onCancel={
        state.type === 'confirm' ? handleCancel : null
      }
      cancelLabel={state.cancelLabel}
    />
  );

  return { showAlert, AlertComponent, dismissAlert: dismiss };
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    paddingBottom: spacing.xl,
    overflow: 'hidden',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: { elevation: 20 },
    }),
  },
  accentBar: {
    width: '100%',
    height: 4,
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconText: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 30,
  },
  title: {
    ...typography.subtitle,
    textAlign: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  buttonRow: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
  buttonRowDouble: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFull: {
    flex: 1,
  },
  btnPrimary: {
    flex: 1,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  btnPrimaryText: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  btnCancelText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});
