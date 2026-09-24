import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';
import { spacing } from '../theme/spacing.js';
import { radius } from '../theme/radius.js';
import { formatDate, formatTime } from '../utils/formatters.js';

export const WaterfallNode = ({
  item,
  isLast = false,
  isGenesis = false,
}) => {
  const getChannelIcon = (type) => {
    switch (type) {
      case 'call': return '📞';
      case 'whatsapp': return '💬';
      case 'meeting': return '👥';
      case 'site_visit': return '🏢';
      case 'note': return '📝';
      default: return isGenesis ? '⚡' : '🔄';
    }
  };

  const getChannelLabel = (type) => {
    switch (type) {
      case 'call': return 'PHONE CALL';
      case 'whatsapp': return 'WHATSAPP';
      case 'meeting': return 'VIDEO DEMO';
      case 'site_visit': return 'SITE VISIT';
      case 'note': return 'NOTE';
      default: return isGenesis ? 'INBOUND LEAD CAPTURE' : 'TOUCHPOINT';
    }
  };

  const icon = getChannelIcon(item.type);
  const label = getChannelLabel(item.type);
  const timeFormatted = item.created_at ? `${formatDate(item.created_at)} · ${formatTime(item.created_at)}` : '';

  return (
    <View style={styles.container}>
      <View style={styles.timelineColumn}>
        <View style={[styles.iconCircle, isGenesis && styles.genesisCircle]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        {!isLast ? <View style={styles.verticalLine} /> : null}
      </View>

      <View style={[styles.card, isGenesis && styles.genesisCard]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.typeLabel, isGenesis && styles.genesisLabel]}>
              {label}
            </Text>
            {item.bdm_name ? (
              <Text style={styles.authorText}> · {item.bdm_name}</Text>
            ) : null}
          </View>
          {item.call_result || item.call_result_label ? (
            <View style={styles.outcomePill}>
              <Text style={styles.outcomeText}>
                {item.call_result_label || item.call_result}
              </Text>
            </View>
          ) : null}
        </View>

        {timeFormatted ? (
          <Text style={styles.timeText}>{timeFormatted}</Text>
        ) : null}

        {item.notes ? (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>"{item.notes}"</Text>
          </View>
        ) : null}

        {item.next_action ? (
          <View style={styles.nextActionRow}>
            <Text style={styles.nextActionLabel}>⏰ Next Action: </Text>
            <Text style={styles.nextActionVal}>{item.next_action}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  timelineColumn: {
    width: 32,
    alignItems: 'center',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  genesisCircle: {
    backgroundColor: '#F3EEFC',
    borderColor: '#D6C7F7',
  },
  iconText: {
    fontSize: 12,
  },
  verticalLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginLeft: spacing.xs,
    marginBottom: spacing.sm,
  },
  genesisCard: {
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 3,
    borderLeftColor: '#6E56CF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  typeLabel: {
    ...typography.overline,
    color: colors.primary,
  },
  genesisLabel: {
    color: '#6E56CF',
  },
  authorText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  outcomePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.pill,
    borderWidth: 0.5,
    borderColor: '#C7E0F4',
  },
  outcomeText: {
    ...typography.overline,
    color: colors.primary,
    fontSize: 9,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  notesContainer: {
    backgroundColor: colors.surfaceAlt,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    padding: spacing.xs + 2,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
  },
  notesText: {
    ...typography.body,
    fontSize: 12,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  nextActionLabel: {
    ...typography.captionBold,
    color: colors.primary,
  },
  nextActionVal: {
    ...typography.caption,
    color: colors.textPrimary,
  },
});
