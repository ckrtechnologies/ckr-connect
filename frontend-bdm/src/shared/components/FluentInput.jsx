import React, { useState, forwardRef } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';

/**
 * FluentInput — shared branded text input.
 * Supports forwardRef for focus chaining (returnKeyType="next" + onSubmitEditing).
 * All extra props are passed through to the underlying TextInput.
 */
export const FluentInput = forwardRef(({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error = null,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  editable = true,
  style = null,
  inputStyle = null,
  // Keyboard chaining props
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  // Any other TextInput props (e.g. autoCorrect, textContentType)
  ...rest
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>
          {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          multiline ? styles.multilineInput : styles.singlelineInput,
          isFocused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          !editable && styles.inputDisabled,
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textDisabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        editable={editable}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
});

FluentInput.displayName = 'FluentInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    width: '100%',
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  requiredMark: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
  },
  singlelineInput: {
    height: 44,
  },
  multilineInput: {
    minHeight: 88,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    textAlignVertical: 'top',
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  inputDisabled: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textDisabled,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
