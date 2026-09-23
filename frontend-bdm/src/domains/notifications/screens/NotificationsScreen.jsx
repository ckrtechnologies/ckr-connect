import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import { FluentCard } from '../../../shared/components/index.js';
import { INITIAL_NOTIFICATIONS } from '../../../shared/utils/mockSeedData.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const handlePress = (notif) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
    );

    if (notif.lead_id) {
      navigation.navigate(ROUTES.LEAD_DETAIL, { leadId: notif.lead_id });
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My In-App Alerts</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {notifications.map((item) => {
          const isOverdue = item.type === 'followup_overdue';
          const borderColor = isOverdue ? colors.error : colors.primary;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                { borderLeftColor: borderColor, borderLeftWidth: 3.5 },
                !item.is_read && styles.unreadCard,
              ]}
              onPress={() => handlePress(item)}
              activeOpacity={0.75}
            >
              <View style={styles.cardTop}>
                <Text style={styles.messageText}>{item.message}</Text>
                {!item.is_read ? <View style={styles.unreadDot} /> : null}
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.sourceText}>Delivered via Socket.io</Text>
                {item.lead_id ? (
                  <Text style={styles.viewLeadLink}>Tap to view lead ›</Text>
                ) : null}
              </View>
            </TouchableOpacity>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    fontSize: 16,
    color: colors.textPrimary,
  },
  markAllText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.primary,
  },
  scrollContent: {
    padding: spacing.pagePaddingHorizontal,
    paddingBottom: 40,
    gap: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 12,
    ...shadows.level1,
  },
  unreadCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#C7E0F4',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageText: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sourceText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  viewLeadLink: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.primary,
  },
});

export default NotificationsScreen;
