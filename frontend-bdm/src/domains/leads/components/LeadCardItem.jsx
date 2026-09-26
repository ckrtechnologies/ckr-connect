import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters.js';
import { makePhoneCall, openWhatsApp } from '../../../shared/utils/communication.js';
import { Phone, MessageCircle } from 'lucide-react-native';

export const LeadCardItem = ({ lead, onPress }) => {
  const isUntouched = (lead.status || '').toLowerCase() === 'new' && lead.followup_count === 0;
  const isWon = (lead.status || '').toLowerCase() === 'won';
  const isOverdue = lead.is_overdue || (lead.next_followup_date && new Date(lead.next_followup_date) < new Date());
  const isDueToday = lead.is_due_today;

  const handleCall = (e) => {
    e?.stopPropagation();
    makePhoneCall(lead.phone);
  };

  const handleWhatsApp = (e) => {
    e?.stopPropagation();
    openWhatsApp(lead.phone, `Hello ${lead.name}, regarding your requirement with CKR Technologies.`);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <FluentCard
        style={[
          styles.card,
          isUntouched && styles.cardUntouched,
          isOverdue && styles.cardOverdue,
          isWon && styles.cardWon,
        ]}
      >
        {/* Top Header */}
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.leadName} numberOfLines={1}>
                {lead.name}
              </Text>
              {isUntouched ? (
                <View style={styles.untouchedTag}>
                  <Text style={styles.untouchedTagText}>⚡ Untouched</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.companyText} numberOfLines={1}>
              🏢 {lead.company_name || 'Individual'} {lead.city ? `· 📍 ${lead.city}` : ''}
            </Text>
          </View>
          <StatusBadge status={lead.status} />
        </View>

        {/* Value and Actions Row */}
        <View style={styles.bottomRow}>
          <View style={styles.valueRow}>
            <Text style={styles.leadValue}>
              {formatCurrency(lead.expected_value || lead.budget || 0)}
            </Text>
            {isOverdue ? (
              <Text style={styles.overdueAlert} numberOfLines={1}>🚨 Overdue</Text>
            ) : isDueToday ? (
              <Text style={styles.dueTodayAlert} numberOfLines={1}>⏰ Due Today</Text>
            ) : isWon ? (
              <Text style={styles.wonAlert} numberOfLines={1}>🏆 Deal Won</Text>
            ) : lead.next_followup_date ? (
              <Text style={styles.scheduledAlert} numberOfLines={1}>
                ⏰ {formatDateTime(lead.next_followup_date)}
              </Text>
            ) : isUntouched ? (
              <Text style={styles.zeroCallsAlert} numberOfLines={1}>0 Calls Made</Text>
            ) : null}
          </View>

          {/* Quick Action Touch Targets */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={[styles.actionBtn, isUntouched ? styles.callBtnPrimary : styles.callBtnSecondary, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Phone size={12} color={isUntouched ? colors.textOnPrimary : colors.textPrimary} />
              <Text
                style={[
                  styles.actionBtnText,
                  isUntouched ? styles.callBtnTextPrimary : styles.callBtnTextSecondary,
                ]}
              >
                Call
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.waBtn, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
              onPress={handleWhatsApp}
              activeOpacity={0.8}
            >
              <MessageCircle size={12} color="#055E38" />
              <Text style={styles.waBtnText}>WA</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FluentCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.xs + 2,
  },
  cardUntouched: {
    borderLeftWidth: 4,
    borderLeftColor: '#F7B500',
    backgroundColor: '#FFFDF5',
  },
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  cardWon: {
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  leadName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  untouchedTag: {
    backgroundColor: colors.untouchedBg,
    borderColor: colors.untouchedBorder,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
    marginLeft: spacing.xs,
  },
  untouchedTagText: {
    ...typography.overline,
    fontSize: 9,
    color: colors.untouchedText,
  },
  companyText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    overflow: 'hidden',
    gap: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden',
    marginRight: spacing.xs,
  },
  leadValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginRight: spacing.xs,
    flexShrink: 0,
  },
  overdueAlert: {
    ...typography.captionBold,
    color: colors.error,
    fontSize: 11,
    flexShrink: 1,
  },
  dueTodayAlert: {
    ...typography.captionBold,
    color: colors.warning,
    fontSize: 11,
    flexShrink: 1,
  },
  scheduledAlert: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 10,
    flex: 1,
  },
  wonAlert: {
    ...typography.captionBold,
    color: colors.success,
    fontSize: 11,
    flexShrink: 1,
  },
  zeroCallsAlert: {
    ...typography.captionBold,
    color: '#B45309',
    fontSize: 11,
    flexShrink: 1,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexShrink: 0,
  },
  actionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  callBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  callBtnTextPrimary: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
    fontSize: 11,
  },
  callBtnSecondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  callBtnTextSecondary: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  waBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  waBtnText: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
});
