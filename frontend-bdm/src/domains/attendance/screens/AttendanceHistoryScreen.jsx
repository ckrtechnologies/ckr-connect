import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../shared/theme/index.js';
import { FluentCard, StatusBadge } from '../../../shared/components/index.js';
import { INITIAL_ATTENDANCE } from '../../../shared/utils/mockSeedData.js';
import { formatDate } from '../../../shared/utils/formatters.js';

export const AttendanceHistoryScreen = () => {
  const records = INITIAL_ATTENDANCE;
  const presentCount = records.filter((r) => r.status === 'present').length;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Monthly Summary Card */}
        <FluentCard style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>September 2026 Summary</Text>
          <Text style={styles.summaryCount}>{presentCount} Days Present</Text>
        </FluentCard>

        {/* Daily Log Feed */}
        <Text style={styles.sectionTitle}>ATTENDANCE RECORDS</Text>

        {records.map((item) => {
          const isToday = item.date === '2026-09-22';
          const timeText = item.check_in_time
            ? `In: 09:${item.date.slice(-2)} AM ${
                item.check_out_time ? '· Out: 06:45 PM' : '· Active'
              }`
            : 'No punch recorded';

          return (
            <FluentCard key={item.id} style={styles.itemCard}>
              <View style={styles.leftCol}>
                <Text style={styles.dateText}>
                  {formatDate(item.date)} {isToday ? '(Today)' : ''}
                </Text>
                <Text style={styles.timeText}>{timeText}</Text>
              </View>

              <StatusBadge status={item.status} />
            </FluentCard>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.pagePaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  summaryCount: {
    ...typography.bodyBold,
    color: colors.success,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  leftCol: {
    flex: 1,
  },
  dateText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default AttendanceHistoryScreen;
