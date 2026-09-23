import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadows } from '../theme/index.js';

/**
 * Fluent 2 Surface Card
 *
 * @param {object} props
 * @param {string} [props.topBorderColor] Accent border on top edge
 * @param {string} [props.leftBorderColor] Accent border on left edge
 * @param {() => void} [props.onPress] If supplied, renders as interactive TouchableOpacity
 * @param {object} [props.style]
 * @param {React.ReactNode} props.children
 */
export const FluentCard = ({
  topBorderColor,
  leftBorderColor,
  onPress,
  style,
  children,
  ...rest
}) => {
  const customStyles = [
    styles.card,
    topBorderColor && { borderTopWidth: 3, borderTopColor: topBorderColor },
    leftBorderColor && { borderLeftWidth: 4, borderLeftColor: leftBorderColor },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={customStyles}
        onPress={onPress}
        activeOpacity={0.75}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={customStyles} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
    ...shadows.level1,
  },
});

export default FluentCard;
