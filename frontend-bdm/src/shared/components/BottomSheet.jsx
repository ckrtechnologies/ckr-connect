import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme/index.js';

/**
 * BottomSheet Modal Component
 *
 * @param {object} props
 * @param {boolean} props.visible
 * @param {string} props.title
 * @param {() => void} props.onClose
 * @param {boolean} [props.isSubmitting=false] Crash resilience: blocks dismiss while submitting
 * @param {React.ReactNode} props.children
 */
export const BottomSheet = ({
  visible,
  title,
  onClose,
  isSubmitting = false,
  children,
}) => {
  const handleBackdropPress = () => {
    if (!isSubmitting && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!isSubmitting && onClose) {
          onClose();
        }
      }}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheetContainer}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  disabled={isSubmitting}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.closeIcon, isSubmitting && styles.closeDisabled]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Body */}
              <ScrollView
                style={styles.body}
                contentContainerStyle={styles.bodyContent}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '90%',
    minHeight: 350,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    flex: 1,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  closeDisabled: {
    opacity: 0.3,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: spacing.lg,
  },
});

export default BottomSheet;
