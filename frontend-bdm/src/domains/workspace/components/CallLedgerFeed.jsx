import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { formatTime } from '../../../shared/utils/formatters.js';

export const CallLedgerFeed = ({ interactions = [], onSelectLead }) => {
  if (interactions.length === 0) {
    return (
      <FluentCard style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>📞</Text>
        <Text style={styles.emptyTitle}>No calls logged today yet</Text>
        <Text style={styles.emptySubtitle}>
          Use "Add Inbound Lead" or tap on an untouched lead to start dialing.
        </Text>
      </FluentCard>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Today's Call Ledger & Results ({interactions.length})
        </Text>
        <Text style={styles.dateLabel}>Live Feed</Text>
      </View>

      {interactions.map((int, idx) => {
        const channel = int.channel || int.type;
        const icon = channel === 'whatsapp' ? '💬' : channel === 'meeting' ? '👥' : '📞';
        const isPositive =
          int.call_result_type === 'positive' ||
          int.outcome === 'Requirement Captured' ||
          int.outcome === 'connected' ||
          int.outcome === 'Interested';
        const isNeutral =
          int.call_result_type === 'neutral' ||
          int.outcome === 'callback_requested' ||
          int.outcome === 'ringing';

        const resultLabel = int.outcome || int.call_result_label || int.call_result || 'Call Logged';
        const notesText = int.discussion_notes || int.notes;

        return (
          <TouchableOpacity
            key={int.id || idx}
            onPress={() => onSelectLead(int.lead_id)}
            activeOpacity={0.7}
          >
            <FluentCard style={styles.itemCard}>
              <View style={styles.topRow}>
                <View style={styles.contactInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.icon}>{icon}</Text>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {int.lead_name || int.contact_name || int.name || 'Contact'}
                    </Text>
                  </View>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {int.company_name || 'Individual / Institution'}
                  </Text>
                </View>

                <View style={styles.resultCol}>
                  <View
                    style={[
                      styles.resultPill,
                      isPositive
                        ? styles.pillPositive
                        : isNeutral
                        ? styles.pillNeutral
                        : styles.pillNegative,
                    ]}
                  >
                    <Text
                      style={[
                        styles.resultText,
                        {
                          color: isPositive
                            ? colors.successText
                            : isNeutral
                            ? colors.warningText
                            : colors.errorText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {resultLabel}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>{formatTime(int.created_at)}</Text>
                </View>
              </View>

              {notesText ? (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText} numberOfLines={2}>
                    "{notesText}"
                  </Text>
                </View>
              ) : null}

              {int.next_action ? (
                <View style={styles.nextActionRow}>
                  <Text style={styles.nextActionLabel}>⏰ Next Action: </Text>
                  <Text style={styles.nextActionVal} numberOfLines={1}>
                    {int.next_action}
                  </Text>
                </View>
              ) : null}
            </FluentCard>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemCard: {
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  contactName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  companyName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultCol: {
    alignItems: 'flex-end',
  },
  resultPill: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  pillPositive: {
    backgroundColor: colors.successBg,
    borderColor: '#C3E6CB',
  },
  pillNeutral: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
  },
  pillNegative: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
  },
  resultText: {
    ...typography.overline,
    fontSize: 9,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    padding: spacing.xs + 2,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
  },
  notesText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  nextActionLabel: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
  },
  nextActionVal: {
    ...typography.caption,
    color: colors.textPrimary,
    fontSize: 11,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
