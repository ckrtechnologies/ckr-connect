import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
import { formatLakhs, formatDateTime } from '../../../shared/utils/formatters.js';

export const FollowupsTab = ({ overdueLeads = [], todayFollowups = [], onOpenLead }) => {
  const renderItem = (item, isOverdue) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.7}
      onPress={() => onOpenLead(item.id)}
    >
      <FluentCard style={[styles.card, isOverdue && styles.overdueCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.leadName} numberOfLines={1}>
            {item.lead_name || item.name}
          </Text>
          <StatusBadge 
            status={isOverdue ? 'warning' : 'info'} 
            label={isOverdue ? 'Overdue' : 'Due Today'} 
          />
        </View>
        <Text style={styles.companyName} numberOfLines={1}>
          {item.company_name || 'Individual'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.valueText}>{formatLakhs(item.expected_value || 0)}</Text>
          {item.next_followup_date ? (
            <Text style={[styles.dateText, isOverdue && styles.dateTextOverdue]}>
              ⏰ {formatDateTime(item.next_followup_date)}
            </Text>
          ) : null}
        </View>
      </FluentCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {overdueLeads.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overdue ({overdueLeads.length})</Text>
          {overdueLeads.map(lead => renderItem(lead, true))}
        </View>
      )}

      {todayFollowups.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Due Today ({todayFollowups.length})</Text>
          {todayFollowups.map(lead => renderItem(lead, false))}
        </View>
      )}

      {overdueLeads.length === 0 && todayFollowups.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyDesc}>You have no pending follow-ups for today.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leadName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  companyName: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  dateText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  dateTextOverdue: {
    color: colors.warning,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
