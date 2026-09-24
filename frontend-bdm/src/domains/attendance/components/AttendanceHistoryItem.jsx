import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';

export const AttendanceHistoryItem = ({ item }) => {
  const isWeekend = item.is_weekend;
  const isHoliday = item.status === 'holiday';

  return (
    <FluentCard style={[styles.card, isWeekend && styles.weekendCard]}>
      <View style={styles.leftCol}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <Text style={styles.timeDetails}>
          {isHoliday
            ? `🎉 ${item.holiday_name || 'Public Holiday'}`
            : isWeekend
            ? 'Sunday (Weekend Off)'
            : item.punch_in
            ? `In: ${formatTime(item.punch_in)} · Out: ${
                item.punch_out ? formatTime(item.punch_out) : 'Active'
              }`
            : 'No punch recorded'}
        </Text>
        {item.total_hours ? (
          <Text style={styles.hoursText}>Duration: {item.total_hours} hrs</Text>
        ) : null}
      </View>

      <StatusBadge status={item.status} />
    </FluentCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  weekendCard: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.8,
  },
  leftCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  dateText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  timeDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hoursText: {
    ...typography.caption,
    color: colors.primary,
    fontSize: 11,
    marginTop: 2,
  },
});
