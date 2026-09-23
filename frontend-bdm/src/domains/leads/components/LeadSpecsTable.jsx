import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters.js';
import { makePhoneCall, openEmail } from '../../../shared/utils/communication.js';

export const LeadSpecsTable = ({ lead, interactionCount = 0 }) => {
  const isOverdue = lead.id === 'lead-102';
  const isDueToday = lead.id === 'lead-101' || lead.id === 'lead-110';

  return (
    <View style={styles.table}>
      {/* 1. Phone */}
      <View style={styles.row}>
        <Text style={styles.label}>📞 Phone</Text>
        <TouchableOpacity onPress={() => makePhoneCall(lead.phone, lead.name)}>
          <Text style={[styles.value, styles.linkValue]}>{lead.phone}</Text>
        </TouchableOpacity>
      </View>

      {/* 2. Email */}
      <View style={styles.row}>
        <Text style={styles.label}>✉️ Email</Text>
        <TouchableOpacity onPress={() => openEmail(lead.email)}>
          <Text style={[styles.value, styles.linkValue]}>{lead.email || 'N/A'}</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Location */}
      <View style={styles.row}>
        <Text style={styles.label}>📍 Location</Text>
        <Text style={styles.value}>
          {lead.city || 'N/A'}, {lead.state || 'India'}
        </Text>
      </View>

      {/* 4. Institution / Account */}
      <View style={styles.row}>
        <Text style={styles.label}>🏢 Institution</Text>
        <Text style={styles.value}>{lead.company_name || 'Individual'}</Text>
      </View>

      {/* 5. Solution Product */}
      <View style={styles.row}>
        <Text style={styles.label}>🏷️ Solution Product</Text>
        <View style={styles.tagBadge}>
          <Text style={styles.tagBadgeText}>
            {lead.tag_id === 'tag-01'
              ? 'School Management ERP'
              : lead.tag_id === 'tag-02'
              ? 'Custom App Development'
              : 'Software ERP'}
          </Text>
        </View>
      </View>

      {/* 6. Client Budget */}
      <View style={styles.row}>
        <Text style={styles.label}>💰 Client Budget</Text>
        <Text style={styles.value}>{formatCurrency(lead.budget || 0)}</Text>
      </View>

      {/* 7. Expected Value */}
      <View style={styles.row}>
        <Text style={styles.label}>📈 Expected Value</Text>
        <Text style={[styles.value, { color: colors.primary }]}>
          {formatCurrency(lead.expected_value || 0)}
        </Text>
      </View>

      {/* 8. Next Action Due */}
      <View style={styles.row}>
        <Text style={styles.label}>⏰ Next Action Due</Text>
        <Text style={styles.value}>
          {lead.next_followup_date || 'None scheduled'}{' '}
          {isOverdue ? (
            <Text style={{ color: colors.error, fontWeight: '700' }}>(🚨 Overdue)</Text>
          ) : isDueToday ? (
            <Text style={{ color: colors.urgentAmber, fontWeight: '700' }}>(⏰ Today)</Text>
          ) : null}
        </Text>
      </View>

      {/* 9. Touchpoints Logged */}
      <View style={styles.row}>
        <Text style={styles.label}>🔄 Touchpoints Logged</Text>
        <Text style={styles.value}>{interactionCount} activity entries</Text>
      </View>

      {/* 10. Assigned BDM */}
      <View style={styles.row}>
        <Text style={styles.label}>👤 Assigned BDM</Text>
        <Text style={styles.value}>Aarav Sharma (You)</Text>
      </View>

      {/* 11. Inbound Source */}
      <View style={styles.row}>
        <Text style={styles.label}>🌐 Inbound Source</Text>
        <Text style={styles.value}>
          {(lead.source || 'Inbound').replace('_', ' ').toUpperCase()}
        </Text>
      </View>

      {/* 12. Lead Created */}
      <View style={[styles.row, { borderBottomWidth: 0 }]}>
        <Text style={styles.label}>🗓️ Lead Created</Text>
        <Text style={styles.value}>{formatDate(lead.created_at)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flex: 1,
  },
  value: {
    ...typography.bodyBold,
    fontSize: 12,
    color: colors.textPrimary,
    textAlign: 'right',
    maxWidth: '60%',
  },
  linkValue: {
    color: colors.primary,
  },
  tagBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  tagBadgeText: {
    ...typography.captionBold,
    color: '#004578',
    fontSize: 10,
  },
});

export default LeadSpecsTable;
