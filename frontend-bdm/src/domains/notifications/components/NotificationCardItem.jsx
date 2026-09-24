import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { formatDate, formatTime } from '../../../shared/utils/formatters.js';

export const NotificationCardItem = ({ item, onMarkRead }) => {
  const isOverdue = item.type === 'followup_overdue';
  const isUnread = !item.is_read;

  return (
    <FluentCard
      style={[
        styles.card,
        isOverdue ? styles.cardError : styles.cardPrimary,
        isUnread && styles.cardUnread,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.contentCol}>
          <Text style={styles.messageText}>{item.message || item.title}</Text>
          <Text style={styles.metaText}>
            {formatDate(item.created_at)} at {formatTime(item.created_at)} · Delivered via Socket.io
          </Text>
        </View>

        {isUnread ? (
          <TouchableOpacity
            style={styles.markBtn}
            onPress={() => onMarkRead(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.markBtnText}>Mark read</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </FluentCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderLeftWidth: 4,
    marginBottom: spacing.xs + 2,
  },
  cardPrimary: {
    borderLeftColor: colors.primary,
  },
  cardError: {
    borderLeftColor: colors.error,
  },
  cardUnread: {
    backgroundColor: '#FAFDFE',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentCol: {
    flex: 1,
    marginRight: spacing.sm,
  },
  messageText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  markBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  markBtnText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
  },
});
