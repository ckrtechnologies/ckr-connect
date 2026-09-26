import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { AttendanceHistoryItem } from '../components/AttendanceHistoryItem.jsx';
import { useGetMyAttendanceHistoryQuery } from '../api.js';

export const AttendanceHistoryScreen = ({ navigation }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: historyData, isLoading, refetch, isFetching } = useGetMyAttendanceHistoryQuery({
    year,
    month,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const summary = historyData?.summary || {
    present: 0,
    half_day: 0,
    absent: 0,
    holidays: 0,
  };

  const days = historyData?.days || [];

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return;
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const formattedMonthTitle = new Date(year, month - 1, 1).toLocaleString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹ Attendance</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Audit</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Month Navigation Control Bar */}
      <View style={styles.monthNavigator}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.monthNavBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.monthNavArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.monthTitleWrapper}>
          <Text style={styles.monthTitleText}>{formattedMonthTitle}</Text>
          {isCurrentMonth ? (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleNextMonth}
          disabled={isCurrentMonth}
          style={[styles.monthNavBtn, isCurrentMonth && styles.monthNavBtnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={[styles.monthNavArrow, isCurrentMonth && styles.monthNavArrowDisabled]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={days}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isFetching}
        ListHeaderComponent={
          <View>
            {/* Monthly Summary Card */}
            <FluentCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>
                  {formattedMonthTitle} Summary
                </Text>
                <Text style={styles.presentCount}>
                  {summary.present} Days Present
                </Text>
              </View>

              <View style={styles.summaryStatsRow}>
                <View style={styles.statCol}>
                  <Text style={styles.statNum}>{summary.present}</Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statNum, { color: colors.warning }]}>
                    {summary.half_day}
                  </Text>
                  <Text style={styles.statLabel}>Half-Day</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statNum, { color: colors.error }]}>
                    {summary.absent}
                  </Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statNum, { color: colors.info }]}>
                    {summary.holidays}
                  </Text>
                  <Text style={styles.statLabel}>Holidays</Text>
                </View>
              </View>
            </FluentCard>

            <Text style={styles.listTitle}>DAILY PUNCH LOGS ({days.length} DAYS)</Text>
          </View>
        }
        renderItem={({ item }) => <AttendanceHistoryItem item={item} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <Text style={styles.emptyText}>No attendance records for {formattedMonthTitle}.</Text>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 60,
  },
  monthNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  monthNavBtn: {
    width: 40,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavBtnDisabled: {
    opacity: 0.4,
  },
  monthNavArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  monthNavArrowDisabled: {
    color: colors.textDisabled,
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  monthTitleText: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  currentBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  currentBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 9,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  presentCount: {
    ...typography.captionBold,
    color: colors.successText,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  statCol: {
    alignItems: 'center',
  },
  statNum: {
    ...typography.title,
    fontWeight: '700',
    color: colors.successText,
  },
  statLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  loader: {
    marginTop: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
