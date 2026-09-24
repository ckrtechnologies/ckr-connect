import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { formatLakhs } from '../../../shared/utils/formatters.js';

export const FunnelTab = ({
  stageCounts = {},
  overdueLeads = [],
  onOpenLead,
}) => {
  const overdueLead = overdueLeads[0];

  return (
    <View style={styles.container}>
      {/* Overdue Urgent Alert Card */}
      {overdueLead ? (
        <FluentCard style={styles.urgentCard}>
          <View style={styles.urgentHeader}>
            <Text style={styles.urgentLabel}>Action Required · Overdue</Text>
            <StatusBadge status="warning" label="Overdue" />
          </View>
          <Text style={styles.leadName}>
            {overdueLead.name} ({overdueLead.company_name || 'Individual'})
          </Text>
          <FluentButton
            title="Open Lead & Log Call ›"
            onPress={() => onOpenLead(overdueLead.id)}
            variant="secondary"
            size="small"
            style={styles.openBtn}
          />
        </FluentCard>
      ) : null}

      {/* Stage Breakdown Card */}
      <FluentCard>
        <Text style={styles.cardTitle}>My Active Pipeline</Text>
        <View style={styles.stagesList}>
          <View style={styles.stageRow}>
            <Text style={styles.stageName}>New / Untouched</Text>
            <Text style={[styles.stageValue, { color: colors.warning }]}>
              {stageCounts.new || 0} leads
            </Text>
          </View>
          <View style={styles.stageRow}>
            <Text style={styles.stageName}>Contacted</Text>
            <Text style={styles.stageValue}>{stageCounts.contacted || 0} leads</Text>
          </View>
          <View style={styles.stageRow}>
            <Text style={styles.stageName}>Follow-up</Text>
            <Text style={styles.stageValue}>{stageCounts.follow_up || 0} leads</Text>
          </View>
          <View style={styles.stageRow}>
            <Text style={styles.stageName}>Proposal</Text>
            <Text style={styles.stageValue}>{stageCounts.proposal || 0} leads</Text>
          </View>
          <View style={[styles.stageRow, styles.wonRow]}>
            <Text style={styles.stageNameWon}>Won Revenue</Text>
            <Text style={styles.stageValueWon}>
              {formatLakhs(stageCounts.wonRevenue || 0, 2)}
            </Text>
          </View>
        </View>
      </FluentCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  urgentLabel: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  leadName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  openBtn: {
    alignSelf: 'flex-start',
  },
  cardTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  stagesList: {
    gap: spacing.sm,
  },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  stageName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  stageValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  wonRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  stageNameWon: {
    ...typography.bodyBold,
    color: colors.successText,
  },
  stageValueWon: {
    ...typography.bodyBold,
    color: colors.successText,
    fontSize: 16,
  },
});
