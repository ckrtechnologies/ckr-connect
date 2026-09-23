import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/index.js';
import FluentButton from './FluentButton.jsx';

/**
 * EmptyState Placeholder
 *
 * @param {object} props
 * @param {string} [props.icon='🔍']
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 */
export const EmptyState = ({
  icon = '🔍',
  title = 'No items found',
  message = 'There is currently no data matching this view.',
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <FluentButton
          variant="secondary"
          size="sm"
          title={actionLabel}
          onPress={onAction}
          style={styles.actionBtn}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 18,
    maxWidth: 260,
  },
  actionBtn: {
    minWidth: 120,
  },
});

export default EmptyState;
