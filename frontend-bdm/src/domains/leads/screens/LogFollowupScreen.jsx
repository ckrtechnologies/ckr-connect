import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import {
  FluentButton,
  FluentCard,
  FluentInput,
  StatusBadge,
} from '../../../shared/components/index.js';
import { INITIAL_LEADS } from '../../../shared/utils/mockSeedData.js';

const CHANNELS = [
  { id: 'call', label: '📞 Phone Call' },
  { id: 'whatsapp', label: '💬 WhatsApp' },
  { id: 'meeting', label: '👥 Video Demo' },
  { id: 'site_visit', label: '🏢 On-site Visit' },
  { id: 'note', label: '📝 Internal Note' },
];

const OUTCOMES = [
  { id: 'terms_agreed', label: 'Terms Agreed / Finalizing' },
  { id: 'interested', label: 'Interested / Callback Set' },
  { id: 'demo_scheduled', label: 'Demo Scheduled' },
  { id: 'demo_completed', label: 'Virtual Demo Completed' },
  { id: 'site_visit', label: 'Site Visit Scheduled' },
  { id: 'no_answer', label: 'Ringing / No Answer' },
  { id: 'not_interested', label: 'Not Interested / Drop-off' },
];

export const LogFollowupScreen = ({ route, navigation }) => {
  const leadId = route.params?.leadId || 'lead-101';
  const lead = INITIAL_LEADS.find((l) => l.id === leadId) || INITIAL_LEADS[0];

  const [channel, setChannel] = useState('call');
  const [outcome, setOutcome] = useState('interested');
  const [notes, setNotes] = useState('');
  const [nextDate, setNextDate] = useState('2026-09-25');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!notes.trim()) {
      Alert.alert('Notes Required', 'Please enter discussion notes or key action points.');
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      Alert.alert(
        'Activity Saved',
        `Follow-up logged for ${lead.name}. Interaction history and lead timestamps updated.`
      );
      navigation.goBack();
    } catch (err) {
      console.error('[LogFollowupScreen] error:', err);
      Alert.alert('Failed', 'Could not save interaction. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelBtn}
        >
          <Text style={[styles.cancelText, loading && { opacity: 0.5 }]}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LOG ACTIVITY</Text>
        <StatusBadge status={lead.status} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Context Card */}
        <FluentCard style={styles.leadCard}>
          <Text style={styles.contextLabel}>RECORDING TOUCHPOINT FOR:</Text>
          <Text style={styles.leadName}>{lead.name}</Text>
          <Text style={styles.companyName}>{lead.company_name}</Text>
        </FluentCard>

        {/* Channel Selection */}
        <FluentCard style={styles.formCard}>
          <Text style={styles.fieldLabel}>Interaction Channel</Text>
          <View style={styles.chipRow}>
            {CHANNELS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.channelChip,
                  channel === c.id && styles.activeChannelChip,
                ]}
                onPress={() => setChannel(c.id)}
              >
                <Text
                  style={[
                    styles.channelChipText,
                    channel === c.id && styles.activeChannelChipText,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Outcome Selection */}
          <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
            Call Result / Outcome
          </Text>
          <View style={styles.chipRow}>
            {OUTCOMES.map((o) => (
              <TouchableOpacity
                key={o.id}
                style={[
                  styles.outcomeChip,
                  outcome === o.id && styles.activeOutcomeChip,
                ]}
                onPress={() => setOutcome(o.id)}
              >
                <Text
                  style={[
                    styles.outcomeChipText,
                    outcome === o.id && styles.activeOutcomeChipText,
                  ]}
                >
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notes Input */}
          <FluentInput
            label="Discussion Notes & Action Points"
            required
            placeholder="Summarize the client discussion, key requirements, questions raised, and next commitments..."
            multiline
            value={notes}
            onChangeText={setNotes}
            containerStyle={{ marginTop: spacing.md }}
          />

          {/* Next Action Scheduled Date */}
          <FluentInput
            label="Next Action Scheduled Date"
            placeholder="YYYY-MM-DD"
            value={nextDate}
            onChangeText={setNextDate}
            helperText="Sets the follow-up reminder date on this lead."
          />

          {/* Save Action Buttons */}
          <View style={styles.actionRow}>
            <FluentButton
              variant="secondary"
              title="Cancel"
              onPress={() => navigation.goBack()}
              disabled={loading}
              style={{ flex: 1 }}
            />
            <FluentButton
              variant="primary"
              title="Save to Waterfall"
              loading={loading}
              onPress={handleSave}
              style={{ flex: 1.5 }}
            />
          </View>
        </FluentCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 13,
  },
  headerTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: spacing.pagePaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: 40,
    gap: 10,
  },
  leadCard: {
    padding: 12,
  },
  contextLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
  },
  leadName: {
    ...typography.title,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 2,
  },
  companyName: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 12,
  },
  formCard: {
    padding: 14,
  },
  fieldLabel: {
    ...typography.bodyBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  channelChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  activeChannelChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  channelChipText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  activeChannelChipText: {
    color: colors.primary,
    fontWeight: '700',
  },
  outcomeChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  activeOutcomeChip: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  outcomeChipText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textPrimary,
  },
  activeOutcomeChipText: {
    color: colors.primary,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.md,
  },
});

export default LogFollowupScreen;
