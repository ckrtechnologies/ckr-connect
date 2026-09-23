import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import { StatusBadge } from '../../../shared/components/index.js';
import { formatCurrency } from '../../../shared/utils/formatters.js';
import { makePhoneCall, openWhatsApp } from '../../../shared/utils/communication.js';

export const LeadCard = ({ lead, onPress }) => {
  const isOverdue = lead.id === 'lead-102';
  const isDueToday = lead.id === 'lead-101' || lead.id === 'lead-110';
  const isWon = (lead.status || '').toUpperCase() === 'WON';
  const isUntouched = (lead.status || '').toUpperCase() === 'NEW' || lead.followup_count === 0;

  const getBorderColor = () => {
    if (isWon) return colors.success;
    if (isOverdue) return colors.error;
    if (isDueToday) return colors.urgentAmber;
    if (isUntouched) return colors.urgentAmber;
    return colors.border;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: getBorderColor(), borderLeftWidth: 4 },
        isUntouched && styles.untouchedBg,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.topRow}>
        <View style={styles.leftInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{lead.name}</Text>
            {isUntouched ? (
              <View style={styles.untouchedBadge}>
                <Text style={styles.untouchedBadgeText}>⚡ Untouched</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.companyText}>
            🏢 {lead.company_name || 'Individual'} {lead.city ? `· 📍 ${lead.city}` : ''}
          </Text>
        </View>

        <StatusBadge status={lead.status} />
      </View>

      {/* Quick Communication Action Row */}
      <View style={styles.bottomRow}>
        <View style={styles.valueRow}>
          <Text style={styles.valueText}>
            {formatCurrency(lead.expected_value || lead.budget || 0)}
          </Text>
          {isOverdue ? (
            <Text style={[styles.urgencyTag, { color: colors.error }]}>🚨 Overdue</Text>
          ) : isDueToday ? (
            <Text style={[styles.urgencyTag, { color: colors.urgentAmber }]}>⏰ Due Today</Text>
          ) : isWon ? (
            <Text style={[styles.urgencyTag, { color: colors.success }]}>🏆 Deal Won</Text>
          ) : isUntouched ? (
            <Text style={[styles.urgencyTag, { color: colors.urgentAmberDark }]}>
              0 Calls Made
            </Text>
          ) : null}
        </View>

        {/* Action Buttons: Direct Call & WhatsApp */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={[styles.actionBtn, isUntouched ? styles.callBtnPrimary : styles.callBtn]}
            onPress={() => makePhoneCall(lead.phone, lead.name)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.actionBtnText,
                isUntouched ? { color: '#FFFFFF' } : { color: colors.primary },
              ]}
            >
              📞 Call
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.waBtn]}
            onPress={() =>
              openWhatsApp(
                lead.phone,
                `Hello ${lead.name}, this is Aarav Sharma from CKR Technologies regarding your requirement.`
              )
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.actionBtnText, { color: colors.whatsapp }]}>
              💬 WA
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.cardPadding,
    marginBottom: spacing.xs,
    ...shadows.level1,
  },
  untouchedBg: {
    backgroundColor: '#FFFDF5',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  leftInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  untouchedBadge: {
    backgroundColor: '#FFF4CE',
    borderColor: '#F2C94C',
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  untouchedBadgeText: {
    ...typography.overline,
    color: '#78350F',
    fontSize: 9,
    fontWeight: '700',
  },
  companyText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  urgencyTag: {
    ...typography.captionBold,
    fontSize: 11,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtn: {
    backgroundColor: colors.primaryLight,
    borderColor: '#C7E0F4',
  },
  callBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  waBtn: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
  },
  actionBtnText: {
    ...typography.captionBold,
    fontSize: 11,
  },
});

export default LeadCard;
