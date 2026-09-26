import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';

export const PunchHeroButton = ({
  isPunchedIn = false,
  isPunchedOut = false,
  onPress,
  loading = false,
}) => {
  const getButtonContent = () => {
    if (isPunchedOut) {
      return {
        icon: '✓',
        label: 'SHIFT COMPLETED',
        btnStyle: styles.completedBtn,
        disabled: true,
      };
    }
    if (isPunchedIn) {
      return {
        icon: '⏹',
        label: 'PUNCH OUT',
        btnStyle: styles.punchedInBtn,
        disabled: false,
      };
    }
    return {
      icon: '▶',
      label: 'PUNCH IN',
      btnStyle: styles.punchedOutBtn,
      disabled: false,
    };
  };

  const config = getButtonContent();

  return (
    <View style={styles.outerGlow}>
      <TouchableOpacity
        style={[
          styles.circleBtn,
          config.btnStyle,
          (loading || config.disabled) && styles.btnDisabled,
        ]}
        onPress={onPress}
        disabled={loading || config.disabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.textOnPrimary} />
        ) : (
          <View style={styles.content}>
            <Text style={styles.icon}>{config.icon}</Text>
            <Text style={styles.label}>{config.label}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerGlow: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 103, 184, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
    alignSelf: 'center',
  },
  circleBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  punchedOutBtn: {
    backgroundColor: colors.primary,
  },
  punchedInBtn: {
    backgroundColor: colors.error,
  },
  completedBtn: {
    backgroundColor: colors.success,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  btnDisabled: {
    opacity: 0.85,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 32,
    color: colors.textOnPrimary,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
});
