import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { NotificationCardItem } from '../components/NotificationCardItem.jsx';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from '../api.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

export const NotificationsScreen = () => {
  const { data: notificationsData, isLoading, refetch, isFetching } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();
  const { showAlert, AlertComponent } = useAlert();

  const notifications =
    notificationsData?.items || (Array.isArray(notificationsData) ? notificationsData : []);
  const unreadCount =
    notificationsData?.unread_count ?? notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id) => {
    try {
      await markRead(id).unwrap();
    } catch (err) {
      showAlert('error', 'Action Failed', 'Could not mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      showAlert('success', 'All Marked Read', 'All notifications cleared.');
    } catch (err) {
      showAlert('error', 'Action Failed', 'Could not clear notifications.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {AlertComponent}
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.title}>My In-App Alerts</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
          </Text>
        </View>

        {unreadCount > 0 ? (
          <FluentButton
            title="Mark All Read"
            onPress={handleMarkAllRead}
            variant="secondary"
            size="small"
            loading={isMarkingAll}
          />
        ) : null}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isFetching}
        renderItem={({ item }) => (
          <NotificationCardItem item={item} onMarkRead={handleMarkRead} />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <EmptyState
              icon="🔔"
              title="No alerts right now"
              message="New lead allocations and follow-up milestones will appear here in real time."
            />
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
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  loader: {
    marginTop: spacing.xxl,
  },
});
