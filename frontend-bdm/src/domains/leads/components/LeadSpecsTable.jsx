import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { formatCurrency, formatDate, formatDateTime } from '../../../shared/utils/formatters.js';

export const LeadSpecsTable = ({ lead, interactionCount = 0, currentUser }) => {
  const specs = [
    { label: '📞 Phone', value: lead.phone || 'N/A' },
    { label: '✉️ Email', value: lead.email || 'N/A' },
    {
      label: '📍 Location',
      value: `${lead.city || 'N/A'}${lead.state ? `, ${lead.state}` : ''}`,
    },
    {
      label: '🏢 Institution / Account',
      value: lead.account_name || lead.company_name || 'Individual',
    },
    {
      label: '🏷️ Solution Product',
      value: lead.tags?.[0]?.name || lead.tag_name || 'General Suite',
    },
    {
      label: '💰 Client Budget',
      value: formatCurrency(lead.budget || 0),
    },
    {
      label: '📈 Expected Value',
      value: formatCurrency(lead.expected_value || 0),
      highlight: true,
    },
    {
      label: '⏰ Next Action Due',
      value: lead.next_followup_date
        ? formatDateTime(lead.next_followup_date)
        : 'None scheduled',
    },
    {
      label: '🔄 Touchpoints Logged',
      value: `${interactionCount} activity entries`,
    },
    {
      label: '👤 Assigned BDM',
      value: lead.assigned_bdm_name || (currentUser?.name ? `${currentUser.name} (Self)` : 'Self'),
    },
    {
      label: '🌐 Inbound Source',
      value: String(lead.source || 'Inbound').replace('_', ' ').toUpperCase(),
    },
    {
      label: '🗓️ Lead Created',
      value: formatDate(lead.created_at),
    },
  ];

  return (
    <View style={styles.table}>
      {specs.map((row, idx) => (
        <View
          key={idx}
          style={[styles.row, idx === specs.length - 1 && styles.lastRow]}
        >
          <Text style={styles.label}>{row.label}</Text>
          <Text
            style={[styles.value, row.highlight && styles.valueHighlight]}
            numberOfLines={2}
          >
            {row.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  value: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
    flex: 1.4,
    textAlign: 'right',
  },
  valueHighlight: {
    color: colors.primary,
  },
});
