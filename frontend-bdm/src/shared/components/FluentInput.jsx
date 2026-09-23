import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/index.js';

/**
 * Fluent 2 Input Field
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {boolean} [props.required=false]
 * @param {string} [props.error]
 * @param {string} [props.helperText]
 * @param {boolean} [props.multiline=false]
 * @param {object} [props.containerStyle]
 * @param {object} [props.inputStyle]
 */
export const FluentInput = ({
  label,
  required = false,
  error,
  helperText,
  multiline = false,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
        </Text>
      ) : null}

      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
          inputStyle,
        ]}
        placeholderTextColor={colors.textDisabled}
        multiline={multiline}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodyBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  requiredAsterisk: {
    color: colors.error,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    height: 40,
    ...typography.body,
    color: colors.textPrimary,
  },
  inputMultiline: {
    height: 80,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  helperText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default FluentInput;
