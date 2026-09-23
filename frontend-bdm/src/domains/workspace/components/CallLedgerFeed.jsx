import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import { formatTime } from '../../../shared/utils/formatters.js';

export const CallLedgerFeed = ({ interactions = [], leads = [], onSelectLead }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Today's Call Ledger & Results ({interactions.length})
        </Text>
        <Text style={styles.dateBadge}>22 Sep 2026</Text>
      </View>

      {interactions.map((item) => {
        const lead = leads.find((l) => l.id === item.lead_id) || {};
        const isPositive = item.call_result_type === 'positive';
        const isNeutral = item.call_result_type === 'neutral';

        const pillBg = isPositive
          ? colors.successBg
          : isNeutral
          ? colors.warningBg
          : colors.errorBg;
        const pillText = isPositive
          ? colors.success
          : isNeutral
          ? colors.urgentAmberText
          : colors.error;
        const pillBorder = isPositive
          ? '#C3E6CB'
          : isNeutral
          ? colors.urgentAmberBorder
          : '#F5C6CB';

        const icon = item.type === 'call' ? '📞' : item.type === 'whatsapp' ? '💬' : '👥';

        return (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => onSelectLead(item.lead_id)}
            activeOpacity={0.75}
          >
            <View style={styles.cardHeader}>
              <View style={styles.leadInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.icon}>{icon}</Text>
                  <Text style={styles.leadName}>{lead.name || 'Contact'}</Text>
                </View>
                <Text style={styles.companyName}>
                  {lead.company_name || 'Individual'}
                </Text>
              </View>

              <View style={styles.outcomeRight}>
                <View
                  style={[
                    styles.outcomePill,
                    { backgroundColor: pillBg, borderColor: pillBorder },
                  ]}
                >
                  <Text style={[styles.outcomeText, { color: pillText }]}>
                    {item.call_result_label || 'Call Logged'}
                  </Text>
                </View>
                <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
              </View>
            </View>

            {/* Discussion notes quote */}
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>"{item.notes}"</Text>
            </View>

            {/* Next action indicator */}
            {item.next_action ? (
              <View style={styles.nextActionRow}>
                <Text style={styles.nextActionLabel}>⏰ Next Action:</Text>
                <Text style={styles.nextActionText} numberOfLines={1}>
                  {item.next_action}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  title: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dateBadge: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    marginBottom: spacing.sm,
    ...shadows.level1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  leadInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  leadName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  companyName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  outcomeRight: {
    alignItems: 'flex-end',
  },
  outcomePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  outcomeText: {
    ...typography.overline,
    fontSize: 9,
    fontWeight: '700',
  },
  timeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notesBox: {
    backgroundColor: colors.surfaceAlt,
    borderLeftColor: colors.primary,
    borderLeftWidth: 2,
    padding: 6,
    borderRadius: radius.xs,
    marginTop: 6,
  },
  notesText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  nextActionLabel: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.primary,
  },
  nextActionText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
    flex: 1,
  },
});

export default CallLedgerFeed;
