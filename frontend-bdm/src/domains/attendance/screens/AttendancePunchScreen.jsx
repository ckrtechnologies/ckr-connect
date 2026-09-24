import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { PunchHeroButton } from '../components/PunchHeroButton.jsx';
import {
  useGetTodayAttendanceQuery,
  usePunchInMutation,
  usePunchOutMutation,
} from '../api.js';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const AttendancePunchScreen = ({ navigation }) => {
  const { data: todayStatus, isLoading, refetch } = useGetTodayAttendanceQuery();
  const [punchIn, { isLoading: isPunchingIn }] = usePunchInMutation();
  const [punchOut, { isLoading: isPunchingOut }] = usePunchOutMutation();

  const isPunchedIn = Boolean(todayStatus?.is_punched_in);
  const isPunchedOut = Boolean(todayStatus?.is_punched_out);
  const punchLoading = isPunchingIn || isPunchingOut;

  const handlePunchToggle = async () => {
    try {
      if (!isPunchedIn) {
        await punchIn().unwrap();
        Alert.alert('Punch In Successful', 'Your daily attendance has been recorded.');
      } else {
        await punchOut().unwrap();
        Alert.alert('Punch Out Successful', 'Your shift check-out has been recorded.');
      }
      refetch();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Attendance action failed.';
      Alert.alert('Attendance Error', msg);
    }
  };

  const todayStr = formatDate(new Date());

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                Total Hours: {todayStatus.total_hours} hrs
              </Text>
            ) : null}
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
  scrollContent: {
    padding: spacing.md,
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
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  hoursText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 4,
  },
  historyBtn: {
    marginTop: spacing.xs,
  },
});
