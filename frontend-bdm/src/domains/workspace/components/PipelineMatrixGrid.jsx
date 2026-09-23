import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import { formatCurrency } from '../../../shared/utils/formatters.js';

export const PipelineMatrixGrid = ({
  newCount,
  newValue,
  followupCount,
  contactedCount,
  proposalCount,
  proposalValue,
  wonCount,
  wonValue,
  totalCount,
  totalValue,
  onSelectStage,
  onSelectUrgency,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>MY LEADS PIPELINE MATRIX</Text>
        <TouchableOpacity onPress={() => onSelectStage('all')}>
          <Text style={styles.viewAllText}>View All ({totalCount}) ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {/* 1. Untouched / New Leads Card */}
        <TouchableOpacity
          style={[styles.card, styles.untouchedCard]}
          onPress={() => onSelectStage('NEW')}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <Text style={[styles.cardLabel, { color: colors.urgentAmberDark }]}>
              ⚡ NEW / UNTOUCHED
            </Text>
            <Text style={[styles.cardCount, { color: colors.urgentAmberDark }]}>
              {newCount}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={[styles.cardValue, { color: colors.urgentAmberText }]}>
              {formatCurrency(newValue, true)} Pipeline
            </Text>
            <Text style={styles.cardSubtext}>0 calls made · High Priority</Text>
          </View>
        </TouchableOpacity>

        {/* 2. Follow-ups Due Card */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: colors.warning, borderLeftWidth: 4 }]}
          onPress={() => onSelectUrgency('today')}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>⏰ FOLLOW-UPS DUE</Text>
            <Text style={[styles.cardCount, { color: colors.urgentAmber }]}>
              {followupCount}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>1 Overdue · 1 Today</Text>
            <Text style={styles.cardSubtext}>Scheduled callbacks</Text>
          </View>
        </TouchableOpacity>

        {/* 3. In Contacted / Active Card */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: colors.info, borderLeftWidth: 4 }]}
          onPress={() => onSelectStage('CONTACTED')}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>📞 CONTACTED</Text>
            <Text style={[styles.cardCount, { color: colors.info }]}>
              {contactedCount}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>₹2.6L Pipeline</Text>
            <Text style={styles.cardSubtext}>First contact done</Text>
          </View>
        </TouchableOpacity>

        {/* 4. In Proposal Card */}
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: colors.proposal, borderLeftWidth: 4 }]}
          onPress={() => onSelectStage('PROPOSAL')}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>📄 PROPOSAL</Text>
            <Text style={[styles.cardCount, { color: colors.proposal }]}>
              {proposalCount}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>
              {formatCurrency(proposalValue, true)} Expected
            </Text>
            <Text style={styles.cardSubtext}>Awaiting client closure</Text>
          </View>
        </TouchableOpacity>

        {/* 5. Deals Won Card */}
        <TouchableOpacity
          style={[styles.card, styles.wonCard]}
          onPress={() => onSelectStage('WON')}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <Text style={[styles.cardLabel, { color: '#1E4620' }]}>🏆 DEALS WON</Text>
            <Text style={[styles.cardCount, { color: colors.success }]}>
              {wonCount}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={[styles.cardValue, { color: colors.success }]}>
              {formatCurrency(wonValue, true)} Won
            </Text>
            <Text style={styles.cardSubtext}>Closed this month</Text>
          </View>
        </TouchableOpacity>

        {/* 6. Total Assigned Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => onSelectStage('all')}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <Text style={styles.cardLabel}>📋 TOTAL ASSIGNED</Text>
            <Text style={[styles.cardCount, { color: colors.textPrimary }]}>
              {totalCount}
            </Text>
          </View>
          <View style={styles.cardBottom}>
            <Text style={styles.cardValue}>
              {formatCurrency(totalValue, true)} Total
            </Text>
            <Text style={styles.cardSubtext}>Tap to filter & search ›</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    ...typography.overline,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  viewAllText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  card: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: 10,
    ...shadows.level1,
  },
  untouchedCard: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderLeftColor: colors.urgentAmber,
    borderLeftWidth: 4,
  },
  wonCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    borderLeftColor: colors.success,
    borderLeftWidth: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    flex: 1,
  },
  cardCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardBottom: {
    marginTop: 4,
  },
  cardValue: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  cardSubtext: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
});

export default PipelineMatrixGrid;
