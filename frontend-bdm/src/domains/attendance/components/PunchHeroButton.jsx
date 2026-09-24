import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';

export const PunchHeroButton = ({
  isPunchedIn = false,
  onPress,
  loading = false,
}) => {
  return (
    <View style={styles.outerGlow}>
      <TouchableOpacity
        style={[
          styles.circleBtn,
          isPunchedIn ? styles.punchedInBtn : styles.punchedOutBtn,
          loading && styles.btnDisabled,
        ]}
        onPress={onPress}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.textOnPrimary} />
        ) : (
          <View style={styles.content}>
            <Text style={styles.icon}>{isPunchedIn ? '⏹' : '▶'}</Text>
            <Text style={styles.label}>
              {isPunchedIn ? 'PUNCH OUT' : 'PUNCH IN'}
            </Text>
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
  btnDisabled: {
    opacity: 0.6,
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
    ...typography.title,
    color: colors.textOnPrimary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
