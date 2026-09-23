import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import { FluentCard, FluentButton, StatusBadge } from '../../../shared/components/index.js';

export const FunnelTab = ({ onOpenLead }) => {
  return (
    <View style={styles.container}>
      {/* Quick Status Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>PUNCH STATUS: TODAY</Text>
        <Text style={styles.heroTitle}>Checked In · 09:28 AM</Text>
        <Text style={styles.heroSubtitle}>2 Follow-ups Due Today · 2 Untouched</Text>
      </View>

      {/* Urgent Leads Alert Card */}
      <FluentCard leftBorderColor={colors.urgentAmber} style={styles.urgentCard}>
        <View style={styles.urgentHeader}>
          <Text style={styles.urgentTitle}>Due Today</Text>
          <StatusBadge status="negotiation" label="Action Required" />
        </View>
        <Text style={styles.urgentLeadName}>Dr. Rajeshwar Rao (Heritage Valley)</Text>
        <FluentButton
          variant="secondary"
          size="sm"
          title="Open Lead & Log Call ›"
          onPress={() => onOpenLead('lead-101')}
          style={styles.urgentBtn}
        />
      </FluentCard>

      {/* Pipeline Stage Breakdown */}
      <FluentCard style={styles.pipelineCard}>
        <Text style={styles.sectionHeader}>My Active Pipeline</Text>

        <View style={styles.stageRows}>
          <View style={styles.row}>
            <Text style={styles.stageLabel}>New / Untouched (₹8.0L)</Text>
            <Text style={[styles.stageValue, { color: colors.urgentAmberDark }]}>
              2 leads
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.stageLabel}>Proposal (₹10.3L expected)</Text>
            <Text style={styles.stageValue}>2 leads</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.stageLabel}>Follow-up (₹6.0L expected)</Text>
            <Text style={styles.stageValue}>2 leads</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.stageLabel}>Contacted (₹2.6L expected)</Text>
            <Text style={styles.stageValue}>1 lead</Text>
          </View>

          <View style={[styles.row, styles.wonRow]}>
            <Text style={styles.wonLabel}>Won Revenue</Text>
            <Text style={styles.wonValue}>₹4,50,000</Text>
          </View>
        </View>
      </FluentCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heroCard: {
    backgroundColor: '#004578',
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadows.level1,
  },
  heroLabel: {
    ...typography.overline,
    color: '#D6ECFF',
    fontSize: 10,
  },
  heroTitle: {
    ...typography.title,
    color: '#FFFFFF',
    marginVertical: 2,
    fontSize: 18,
  },
  heroSubtitle: {
    ...typography.caption,
    color: '#D6ECFF',
    fontSize: 11,
  },
  urgentCard: {
    padding: 12,
  },
  urgentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgentTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  urgentLeadName: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 13,
  },
  urgentBtn: {
    marginTop: 8,
  },
  pipelineCard: {
    padding: 12,
  },
  sectionHeader: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginBottom: 8,
    fontSize: 14,
  },
  stageRows: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  stageLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
  },
  stageValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  wonRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    marginTop: 2,
  },
  wonLabel: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  wonValue: {
    ...typography.bodyBold,
    color: colors.success,
  },
});

export default FunnelTab;
