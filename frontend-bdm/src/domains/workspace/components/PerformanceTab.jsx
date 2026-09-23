import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { FluentCard } from '../../../shared/components/index.js';

export const PerformanceTab = () => {
  return (
    <View style={styles.container}>
      <FluentCard style={styles.card}>
        <Text style={styles.title}>MY PERFORMANCE METRICS</Text>
        <Text style={styles.subtitle}>Self-scoped metrics · Confidential to you</Text>

        {/* 2x2 Metric Grid */}
        <View style={styles.grid}>
          <View style={styles.tile}>
            <Text style={styles.tileLabel}>REVENUE WON</Text>
            <Text style={[styles.tileValue, { color: colors.success }]}>₹4.50L</Text>
          </View>

          <View style={styles.tile}>
            <Text style={styles.tileLabel}>WEIGHTED PIPE</Text>
            <Text style={[styles.tileValue, { color: colors.primary }]}>₹4.16L</Text>
          </View>

          <View style={styles.tile}>
            <Text style={styles.tileLabel}>AVG DEAL SIZE</Text>
            <Text style={styles.tileValue}>₹4.50L</Text>
          </View>

          <View style={styles.tile}>
            <Text style={styles.tileLabel}>CONVERSION RATE</Text>
            <Text style={styles.tileValue}>25%</Text>
          </View>
        </View>

        {/* Weekly Deal Progress Bar Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Weekly Deal Progress</Text>
          <View style={styles.chartContainer}>
            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 35, backgroundColor: colors.primary }]} />
              <Text style={styles.barLabel}>W1</Text>
            </View>

            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 55, backgroundColor: colors.primary }]} />
              <Text style={styles.barLabel}>W2</Text>
            </View>

            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 95, backgroundColor: colors.success }]} />
              <Text style={styles.barLabel}>W3</Text>
            </View>

            <View style={styles.barCol}>
              <View style={[styles.bar, { height: 65, backgroundColor: colors.primary }]} />
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
    gap: 12,
  },
  card: {
    padding: 14,
  },
  title: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.xs,
  },
  tile: {
    width: '48.5%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: 10,
  },
  tileLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
  },
  tileValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  chartSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chartTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 110,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  barCol: {
    alignItems: 'center',
    width: 40,
  },
  bar: {
    width: 28,
    borderRadius: radius.xs,
  },
  barLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
  },
});

export default PerformanceTab;
