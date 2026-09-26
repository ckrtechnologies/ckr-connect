import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
import { PunchHeroButton } from '../components/PunchHeroButton.jsx';
import {
  useGetTodayAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from '../api.js';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { ROUTES } from '../../../shared/navigation/routes.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

export const AttendancePunchScreen = ({ navigation }) => {
  const { data: todayStatus, isLoading, isFetching, refetch } = useGetTodayAttendanceQuery();
  const [punchIn, { isLoading: isPunchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();
  const { showAlert, AlertComponent } = useAlert();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const isPunchedIn = Boolean(todayStatus?.is_punched_in);
  const isPunchedOut = Boolean(todayStatus?.is_punched_out);
  const punchLoading = isPunchingIn || isPunchingOut;

  const handlePunchToggle = async () => {
    if (isPunchedOut) {
      showAlert('info', 'Shift Completed', 'You have already punched out for today.');
      return;
    }

    try {
      if (!isPunchedIn) {
        await punchIn().unwrap();
        showAlert('success', 'Punch In Successful', 'Your daily attendance has been recorded.');
      } else {
        await punchOut().unwrap();
        showAlert('success', 'Punch Out Successful', 'Your shift check-out has been recorded.');
      }
      refetch();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Attendance action failed.';
      showAlert('error', 'Attendance Error', msg);
    }
  };

  const todayStr = formatDate(new Date());

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {AlertComponent}
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Daily Attendance</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />
        }
      >
        {/* Hero Card */}
        <FluentCard style={styles.heroCard}>
          <Text style={styles.dateLabel}>TODAY · {todayStr.toUpperCase()}</Text>

          {isLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <PunchHeroButton
              isPunchedIn={isPunchedIn}
              isPunchedOut={isPunchedOut}
              onPress={handlePunchToggle}
              loading={punchLoading}
            />
          )}

          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {isPunchedOut
                ? `Shift Completed · Out at ${formatTime(todayStatus?.punch_out)}`
                : isPunchedIn
                ? `Active Shift · Checked In at ${formatTime(todayStatus?.punch_in)}`
                : 'Not Checked In Yet'}
            </Text>
            {todayStatus?.total_hours ? (
              <Text style={styles.hoursText}>
                Total Shift Duration: {todayStatus.total_hours} hrs
              </Text>
            ) : null}
          </View>
        </FluentCard>

        {/* Detailed Times Breakdown Card */}
        <FluentCard style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>TODAY'S SHIFT TIMESTAMPS</Text>
            <StatusBadge status={todayStatus?.status || (isPunchedOut || isPunchedIn ? 'present' : 'pending')} />
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>PUNCH IN</Text>
              <Text style={styles.timeVal}>
                {todayStatus?.punch_in ? formatTime(todayStatus.punch_in) : '--:--'}
              </Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>PUNCH OUT</Text>
              <Text style={styles.timeVal}>
                {todayStatus?.punch_out ? formatTime(todayStatus.punch_out) : '--:--'}
              </Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeCol}>
              <Text style={styles.timeLabel}>DURATION</Text>
              <Text style={[styles.timeVal, { color: colors.primary }]}>
                {todayStatus?.total_hours ? `${todayStatus.total_hours}h` : '--'}
              </Text>
            </View>
          </View>
        </FluentCard>

        {/* View Monthly History CTA */}
        <FluentButton
          title="View Monthly Attendance History ›"
          onPress={() => navigation.navigate(ROUTES.ATTENDANCE_HISTORY)}
          variant="secondary"
          size="large"
          style={styles.historyBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  headerBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  loadingBox: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBox: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusText: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  hoursText: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 4,
  },
  detailsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailsTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.sm,
  },
  timeCol: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  timeVal: {
    ...typography.subtitle,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  timeDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  historyBtn: {
    marginTop: spacing.xs,
  },
});
