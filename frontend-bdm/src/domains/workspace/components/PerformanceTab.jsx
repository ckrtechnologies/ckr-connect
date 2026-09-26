import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { MetricTile } from '../../../shared/components/MetricTile.jsx';
import { formatLakhs } from '../../../shared/utils/formatters.js';

export const PerformanceTab = ({
  kpis = {},
}) => {
  const wonRevenue = Number(kpis.won_revenue) || 0;
  const weightedPipeline = Number(kpis.weighted_pipeline) || 0;
  const avgDealSize = Number(kpis.avg_deal_size) || 0;
  const conversionRate = Number(kpis.conversion_rate) || 0;

  return (
    <View style={styles.container}>
      <FluentCard>
        <Text style={styles.sectionTitle}>MY PERFORMANCE METRICS (SELF-SCOPED)</Text>

        <View style={styles.metricsGrid}>
          <MetricTile
            label="REVENUE WON"
            value={formatLakhs(wonRevenue, 2)}
            valueColor={colors.success}
            style={styles.tileMargin}
          />
          <MetricTile
            label="WEIGHTED PIPE"
            value={formatLakhs(weightedPipeline, 2)}
            valueColor={colors.primary}
            style={styles.tileMargin}
          />
        </View>

        <View style={styles.metricsGrid}>
          <MetricTile
            label="AVG DEAL SIZE"
            value={formatLakhs(avgDealSize, 2)}
            style={styles.tileMargin}
          />
          <MetricTile
            label="CONVERSION RATE"
            value={`${conversionRate}%`}
            style={styles.tileMargin}
          />
        </View>

        {/* Weekly Deal Progress Bar Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Deal Progress (This Month)</Text>
          <View style={styles.barsArea}>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: '35%', backgroundColor: colors.primary }]} />
              <Text style={styles.barLabel}>W1</Text>
            </View>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: '55%', backgroundColor: colors.primary }]} />
              <Text style={styles.barLabel}>W2</Text>
            </View>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: '90%', backgroundColor: colors.success }]} />
              <Text style={styles.barLabel}>W3</Text>
            </View>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: '65%', backgroundColor: colors.primary }]} />
              <Text style={styles.barLabel}>W4</Text>
            </View>
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
  sectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  tileMargin: {
    marginHorizontal: spacing.xs,
  },
  chartContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  barsArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 28,
    borderRadius: radius.xs,
  },
  barLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: 10,
  },
});
