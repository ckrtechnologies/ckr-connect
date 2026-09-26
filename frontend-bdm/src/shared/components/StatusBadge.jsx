import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';

export const StatusBadge = ({ status, label = null, style = null }) => {
  const norm = String(status || '').toLowerCase();

  const getStatusConfig = () => {
    switch (norm) {
      case 'won':
      case 'present':
        return {
          bg: colors.successBg,
          text: colors.successText,
          border: '#C3E6CB',
          displayLabel: label || (norm === 'won' ? 'Won' : 'Present'),
        };
      case 'lost':
      case 'absent':
        return {
          bg: colors.errorBg,
          text: colors.errorText,
          border: colors.errorBorder,
          displayLabel: label || (norm === 'lost' ? 'Lost' : 'Absent'),
        };
      case 'follow_up':
      case 'half_day':
      case 'warning':
        return {
          bg: colors.warningBg,
          text: colors.warningText,
          border: colors.warningBorder,
          displayLabel: label || (norm === 'follow_up' ? 'Follow-up' : 'Half Day'),
        };
      case 'proposal':
      case 'negotiation':
        return {
          bg: '#F3EEFC',
          text: '#6E56CF',
          border: '#D6C7F7',
          displayLabel: label || 'Proposal',
        };
      case 'contacted':
        return {
          bg: colors.infoBg,
          text: colors.infoText,
          border: '#C7E0F4',
          displayLabel: label || 'Contacted',
        };
      case 'invalid':
        return {
          bg: '#EDEBE9',
          text: '#605E5C',
          border: '#C8C6C4',
          displayLabel: label || 'Invalid',
        };
      case 'holiday':
        return {
          bg: '#EBF3FC',
          text: '#004E8C',
          border: '#C7E0F4',
          displayLabel: label || 'Holiday',
        };
      case 'not_joined':
      case 'pre_joining':
        return {
          bg: '#F3F2F1',
          text: '#605E5C',
          border: '#E1DFDD',
          displayLabel: label || 'Joined Later',
        };
      case 'new':
      default:
        return {
          bg: colors.primaryLight,
          text: colors.primary,
          border: '#C7E0F4',
          displayLabel: label || 'New',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg, borderColor: config.border },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: config.text }]}>
        {config.displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...typography.overline,
    fontWeight: '700',
  },
});
