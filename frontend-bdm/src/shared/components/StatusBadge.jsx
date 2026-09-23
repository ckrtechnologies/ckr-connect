import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../theme/index.js';

/**
 * StatusBadge Component
 * Pairs semantic status color with its matching tint background
 *
 * @param {object} props
 * @param {string} props.status
 * @param {string} [props.label] Optional custom label
 * @param {object} [props.style]
 */
export const StatusBadge = ({ status = 'new', label, style }) => {
  const normStatus = (status || '').toLowerCase().replace('-', '_');

  const getBadgeColors = () => {
    switch (normStatus) {
      case 'won':
      case 'present':
        return { bg: colors.successBg, text: colors.success, border: '#C3E6CB' };
      case 'follow_up':
      case 'negotiation':
      case 'half_day':
        return { bg: colors.warningBg, text: colors.urgentAmberText, border: colors.urgentAmberBorder };
      case 'proposal':
        return { bg: colors.proposalBg, text: colors.proposal, border: '#D6C7F7' };
      case 'lost':
      case 'absent':
        return { bg: colors.errorBg, text: colors.error, border: '#F5C6CB' };
      case 'invalid':
        return { bg: colors.surfaceAlt, text: colors.textSecondary, border: colors.border };
      case 'leave':
      case 'holiday':
        return { bg: colors.surfaceAlt, text: colors.textSecondary, border: colors.border };
      case 'new':
      case 'contacted':
      default:
        return { bg: colors.infoBg, text: colors.info, border: '#B8DAFF' };
    }
  };

  const { bg, text, border } = getBadgeColors();
  const displayLabel = label || normStatus.replace('_', ' ').toUpperCase();

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.badgeText, { color: text }]}>{displayLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...typography.overline,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default StatusBadge;
