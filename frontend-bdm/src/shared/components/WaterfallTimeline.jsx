import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/index.js';
import { formatDate, formatTime } from '../utils/formatters.js';

/**
 * Connected Vertical Interaction Waterfall Node
 *
 * @param {object} props
 * @param {object} props.interaction
 * @param {boolean} [props.isGenesis=false]
 */
export const WaterfallNode = ({ interaction, isGenesis = false }) => {
  if (isGenesis) {
    return (
      <View style={styles.nodeWrapper}>
        <View style={styles.verticalLine} />
        <View style={[styles.iconContainer, styles.genesisIconContainer]}>
          <Text style={styles.iconText}>⚡</Text>
        </View>
        <View style={[styles.card, styles.genesisCard]}>
          <View style={styles.topRow}>
            <Text style={[styles.channelTitle, { color: '#6E56CF' }]}>
              INBOUND LEAD RECEIVED
            </Text>
            <Text style={styles.timeText}>{formatDate(interaction.created_at)}</Text>
          </View>
          <Text style={styles.genesisBodyText}>
            Lead captured via{' '}
            <Text style={{ fontWeight: '700' }}>
              {(interaction.source || 'Website').toUpperCase()}
            </Text>{' '}
            and assigned to BDM.
          </Text>
        </View>
      </View>
    );
  }

  const getChannelIcon = (type) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'whatsapp':
        return '💬';
      case 'meeting':
        return '👥';
      case 'site_visit':
        return '🏢';
      case 'note':
      default:
        return '📝';
    }
  };

  const getChannelLabel = (type) => {
    switch (type) {
      case 'call':
        return 'PHONE CALL';
      case 'whatsapp':
        return 'WHATSAPP';
      case 'meeting':
        return 'VIDEO DEMO';
      case 'site_visit':
        return 'SITE VISIT';
      default:
        return 'NOTE';
    }
  };

  const getOutcomeStyle = (outcomeType) => {
    switch (outcomeType) {
      case 'positive':
        return { bg: colors.successBg, text: colors.success, border: '#C3E6CB' };
      case 'neutral':
        return { bg: colors.warningBg, text: colors.urgentAmberText, border: colors.urgentAmberBorder };
      case 'negative':
        return { bg: colors.errorBg, text: colors.error, border: '#F5C6CB' };
      default:
        return { bg: colors.infoBg, text: colors.info, border: '#B8DAFF' };
    }
  };

  const outcomeColors = getOutcomeStyle(interaction.call_result_type);

  return (
    <View style={styles.nodeWrapper}>
      <View style={styles.verticalLine} />
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{getChannelIcon(interaction.type)}</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.channelTitle}>
              {getChannelLabel(interaction.type)}{' '}
              <Text style={styles.authorText}>· {interaction.author_name || 'Aarav Sharma'}</Text>
            </Text>
            <Text style={styles.timeText}>
              {formatDate(interaction.created_at)} at {formatTime(interaction.created_at)}
            </Text>
          </View>

          {interaction.call_result_label ? (
            <View
              style={[
                styles.outcomePill,
                {
                  backgroundColor: outcomeColors.bg,
                  borderColor: outcomeColors.border,
                },
              ]}
            >
              <Text style={[styles.outcomePillText, { color: outcomeColors.text }]}>
                {interaction.call_result_label}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Discussion notes quotation box */}
        <View style={styles.notesBox}>
          <Text style={styles.notesText}>"{interaction.notes}"</Text>
        </View>

        {/* Next action indicator */}
        {interaction.next_action ? (
          <View style={styles.nextActionRow}>
            <Text style={styles.nextActionLabel}>⏰ Next Action:</Text>
            <Text style={styles.nextActionText}>{interaction.next_action}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nodeWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    marginBottom: spacing.md,
  },
  verticalLine: {
    position: 'absolute',
    top: 24,
    left: 14,
    bottom: -16,
    width: 2,
    backgroundColor: colors.border,
    zIndex: 1,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    zIndex: 2,
  },
  genesisIconContainer: {
    backgroundColor: '#F3EEFC',
    borderColor: '#D6C7F7',
  },
  iconText: {
    fontSize: 14,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  genesisCard: {
    backgroundColor: '#FAFAFA',
    borderLeftWidth: 3,
    borderLeftColor: '#6E56CF',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  channelTitle: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  authorText: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  timeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  outcomePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  outcomePillText: {
    ...typography.overline,
    fontSize: 9,
    fontWeight: '700',
  },
  notesBox: {
    backgroundColor: colors.surfaceAlt,
    borderLeftColor: colors.primary,
    borderLeftWidth: 2,
    padding: 6,
    borderRadius: radius.xs,
    marginTop: 2,
  },
  notesText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  nextActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  nextActionLabel: {
    ...typography.captionBold,
    fontSize: 10,
    color: colors.primary,
  },
  nextActionText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
    flex: 1,
  },
  genesisBodyText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

export default WaterfallTimeline;
