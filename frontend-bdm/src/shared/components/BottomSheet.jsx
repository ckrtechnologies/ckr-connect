import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';

export const BottomSheet = ({
  visible,
  onClose,
  title,
  subtitle = null,
  children,
  footer = null,
}) => {
  return (
    <Modal
      visible={Boolean(visible)}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Top Dismissable Backdrop Area (flex: 1 above sheet, never overlaps content) */}
        <TouchableOpacity
          style={styles.backdropTop}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={0}
          style={styles.sheet}
        >
          <View style={styles.handleBar} />
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? (
                <Text style={styles.subtitle}>{subtitle}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>{children}</View>
          {footer ? <View style={styles.footerContainer}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropTop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: '92%',
    display: 'flex',
    zIndex: 10,
    elevation: 24,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderStrong,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  content: {
    paddingTop: spacing.md,
    flexShrink: 1,
  },
  footerContainer: {
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    zIndex: 20,
    elevation: 24,
  },
});
