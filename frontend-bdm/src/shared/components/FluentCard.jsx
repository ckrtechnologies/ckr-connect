import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';
import { shadows } from '../theme/shadows.js';

export const FluentCard = ({ children, style = null }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.level1,
  },
});
