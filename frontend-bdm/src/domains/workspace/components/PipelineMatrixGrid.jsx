import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { shadows } from '../../../shared/theme/shadows.js';
import { formatLakhs } from '../../../shared/utils/formatters.js';

export const PipelineMatrixGrid = ({
  matrix = {},
  onSelectStage,
  onViewAll,
}) => {
  const {
    untouchedCount = 0,
    untouchedValue = 0,
    followupCount = 0,
    contactedCount = 0,
    contactedValue = 0,
    proposalCount = 0,
    proposalValue = 0,
    wonCount = 0,
    wonValue = 0,
    totalCount = 0,
    totalValue = 0,
  } = matrix;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>MY LEADS PIPELINE MATRIX</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All ({totalCount}) ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {/* Untouched Card */}
        <TouchableOpacity
          style={[styles.card, styles.untouchedCard]}
          onPress={() => onSelectStage('new')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <Text style={[styles.cardTag, { color: '#92400E' }]}>⚡ UNTOUCHED</Text>
            <Text style={[styles.cardCount, { color: '#B45309' }]}>{untouchedCount}</Text>
          </View>
          <Text style={styles.cardValue}>{formatLakhs(untouchedValue)} Pipe</Text>
          <Text style={styles.cardHint}>0 calls made · High Priority</Text>
        </TouchableOpacity>

        {/* Follow-ups Due Card */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}
          onPress={() => onSelectStage('follow_up')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardTag}>⏰ FOLLOW-UPS</Text>
            <Text style={[styles.cardCount, { color: colors.warning }]}>{followupCount}</Text>
          </View>
          <Text style={styles.cardValue}>Scheduled</Text>
          <Text style={styles.cardHint}>Callbacks due</Text>
        </TouchableOpacity>

        {/* Contacted Card */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: colors.info, borderLeftWidth: 4 }]}
          onPress={() => onSelectStage('contacted')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardTag}>📞 CONTACTED</Text>
            <Text style={[styles.cardCount, { color: colors.info }]}>{contactedCount}</Text>
          </View>
          <Text style={styles.cardValue}>{formatLakhs(contactedValue)} Pipe</Text>
          <Text style={styles.cardHint}>First contact logged</Text>
        </TouchableOpacity>

        {/* Proposal Card */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: '#8E44AD', borderLeftWidth: 4 }]}
          onPress={() => onSelectStage('proposal')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardTag}>📄 PROPOSAL</Text>
            <Text style={[styles.cardCount, { color: '#8E44AD' }]}>{proposalCount}</Text>
          </View>
          <Text style={styles.cardValue}>{formatLakhs(proposalValue)} Pipe</Text>
          <Text style={styles.cardHint}>Awaiting closure</Text>
        </TouchableOpacity>

        {/* Won Card */}
        <TouchableOpacity
          style={[styles.card, styles.wonCard]}
          onPress={() => onSelectStage('won')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <Text style={[styles.cardTag, { color: '#1E4620' }]}>🏆 DEALS WON</Text>
            <Text style={[styles.cardCount, { color: colors.success }]}>{wonCount}</Text>
          </View>
          <Text style={[styles.cardValue, { color: colors.success }]}>
            {formatLakhs(wonValue, 2)} Won
          </Text>
          <Text style={[styles.cardHint, { color: '#1E4620' }]}>Closed revenue</Text>
        </TouchableOpacity>

        {/* Total Assigned Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={onViewAll}
          activeOpacity={0.8}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardTag}>📋 TOTAL ASSIGNED</Text>
            <Text style={styles.cardCount}>{totalCount}</Text>
          </View>
          <Text style={styles.cardValue}>{formatLakhs(totalValue)} Total</Text>
          <Text style={styles.cardHint}>Tap to filter ›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  viewAllText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.level1,
  },
  untouchedCard: {
    backgroundColor: '#FFFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#F7B500',
  },
  wonCard: {
    backgroundColor: '#F3FCF3',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTag: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textSecondary,
  },
  cardCount: {
    ...typography.subtitle,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    fontSize: 13,
  },
  cardHint: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
});
