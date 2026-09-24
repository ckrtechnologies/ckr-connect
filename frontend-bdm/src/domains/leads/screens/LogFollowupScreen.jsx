import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { useLogInteractionMutation } from '../api.js';

const CHANNELS = [
  { key: 'call', label: '📞 Phone Call' },
  { key: 'whatsapp', label: '💬 WhatsApp' },
  { key: 'meeting', label: '👥 Video Demo' },
  { key: 'site_visit', label: '🏢 Site Visit' },
  { key: 'note', label: '📝 Internal Note' },
];

const OUTCOMES = [
  { key: 'interested', label: 'Interested / Callback Set', type: 'positive' },
  { key: 'terms_agreed', label: 'Terms Agreed / Finalizing', type: 'positive' },
  { key: 'demo_scheduled', label: 'Demo Scheduled', type: 'positive' },
  { key: 'demo_completed', label: 'Demo Completed', type: 'positive' },
  { key: 'site_visit', label: 'Site Visit Scheduled', type: 'positive' },
  { key: 'no_answer', label: 'Ringing / No Answer', type: 'neutral' },
  { key: 'not_interested', label: 'Not Interested / Drop-off', type: 'negative' },
];

export const LogFollowupScreen = ({ route, navigation }) => {
  const { leadId, leadName, companyName } = route.params;
  const [logInteraction, { isLoading }] = useLogInteractionMutation();

  const [channel, setChannel] = useState('call');
  const [outcomeKey, setOutcomeKey] = useState('interested');
  const [notes, setNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
  );

  const handleSave = async () => {
    if (!notes.trim()) {
      Alert.alert('Notes Required', 'Please enter discussion notes or action points.');
      return;
    }

    const selectedOutcome = OUTCOMES.find((o) => o.key === outcomeKey);

    try {
      await logInteraction({
        lead_id: leadId,
        type: channel,
        call_result: selectedOutcome?.label || 'Call Logged',
        call_result_type: selectedOutcome?.type || 'positive',
        notes: notes.trim(),
        next_action: nextActionDate ? `Follow-up on ${nextActionDate}` : undefined,
        next_followup_date: nextActionDate || undefined,
      }).unwrap();

      Alert.alert('Touchpoint Saved', 'Interaction has been logged to the Waterfall timeline.');
      navigation.goBack();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Could not log activity.';
      Alert.alert('Save Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LOG ACTIVITY</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Contact Info Header Card */}
        <FluentCard style={styles.leadHeaderCard}>
          <Text style={styles.recLabel}>RECORDING TOUCHPOINT FOR:</Text>
          <Text style={styles.leadTitle}>{leadName || 'Lead Contact'}</Text>
          <Text style={styles.leadSub}>{companyName || 'Individual'}</Text>
        </FluentCard>

        {/* Form Card */}
        <FluentCard>
          {/* Interaction Channel Picker */}
          <Text style={styles.fieldLabel}>Interaction Channel</Text>
          <View style={styles.optionsWrap}>
            {CHANNELS.map((ch) => (
              <TouchableOpacity
                key={ch.key}
                style={[
                  styles.optionChip,
                  channel === ch.key && styles.optionChipActive,
                ]}
                onPress={() => setChannel(ch.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    channel === ch.key && styles.optionTextActive,
                  ]}
                >
                  {ch.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Outcome Picker */}
          <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>
            Call Result / Outcome
          </Text>
          <View style={styles.optionsWrap}>
            {OUTCOMES.map((oc) => (
              <TouchableOpacity
                key={oc.key}
                style={[
                  styles.optionChip,
                  outcomeKey === oc.key && styles.optionChipActive,
                ]}
                onPress={() => setOutcomeKey(oc.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.optionText,
                    outcomeKey === oc.key && styles.optionTextActive,
                  ]}
                >
                  {oc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Discussion Notes */}
          <View style={{ marginTop: spacing.md }}>
            <FluentInput
              label="Discussion Notes & Commitments"
              value={notes}
              onChangeText={setNotes}
              placeholder="Summarize the client discussion, key requirements raised, and next steps..."
              multiline
              numberOfLines={4}
              required
            />
          </View>

          {/* Next Action Date */}
          <FluentInput
            label="Next Action Scheduled Date (YYYY-MM-DD)"
            value={nextActionDate}
            onChangeText={setNextActionDate}
            placeholder="e.g. 2026-09-28"
          />

          <View style={styles.actionsRow}>
            <FluentButton
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              size="large"
              style={styles.actionBtn}
              disabled={isLoading}
            />
            <FluentButton
              title="Save to Waterfall"
              onPress={handleSave}
              variant="primary"
              size="large"
              loading={isLoading}
              style={styles.actionBtn}
            />
          </View>
        </FluentCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  headerTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  leadHeaderCard: {
    marginBottom: spacing.md,
  },
  recLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
  },
  leadTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    marginTop: 2,
  },
  leadSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  optionChip: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  optionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  optionTextActive: {
    color: colors.textOnPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
});
