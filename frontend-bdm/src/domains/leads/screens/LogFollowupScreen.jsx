import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { shadows } from '../../../shared/theme/shadows.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import {
  DateTimePicker,
  combineDateAndTimeIso,
  formatDateToYmd,
} from '../../../shared/components/DateTimePicker.jsx';
import { useLogInteractionMutation } from '../api.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

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

const TIME_PRESETS = [
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
  '06:30 PM',
];

const DATE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: '+2 Days', days: 2 },
  { label: '+1 Week', days: 7 },
];

const getDateString = (daysAhead) => {
  const d = new Date(Date.now() + daysAhead * 86400000);
  return d.toISOString().slice(0, 10);
};

const combineDateAndTime = (dateStr, timeStr) => {
  if (!dateStr) return undefined;
  let hours = 11;
  let minutes = 0;
  if (timeStr) {
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes('PM');
    const isAM = clean.includes('AM');
    const match = clean.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let h = parseInt(match[1], 10);
      let m = parseInt(match[2], 10);
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      hours = h;
      minutes = m;
    }
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  if (year && month && day) {
    const d = new Date(year, month - 1, day, hours, minutes, 0);
    return d.toISOString();
  }
  return dateStr;
};

export const LogFollowupScreen = ({ route, navigation }) => {
  const { leadId, leadName, companyName } = route.params;
  const [logInteraction, { isLoading }] = useLogInteractionMutation();
  const { showAlert, AlertComponent } = useAlert();

  const [channel, setChannel] = useState('call');
  const [outcomeKey, setOutcomeKey] = useState('interested');
  const [notes, setNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState(
    formatDateToYmd(new Date(Date.now() + 2 * 86400000))
  );
  const [nextActionTime, setNextActionTime] = useState('11:30 AM');
  const [nextActionTitle, setNextActionTitle] = useState('');

  const selectedOutcome = OUTCOMES.find((o) => o.key === outcomeKey);
  const isTerminalOutcome = outcomeKey === 'not_interested';

  const handleSave = async () => {
    if (!notes.trim()) {
      showAlert('error', 'Notes Required', 'Please enter discussion notes or action points.');
      return;
    }

    if (!isTerminalOutcome && !nextActionDate) {
      showAlert('error', 'Schedule Required', 'Please select a Follow-up Date for next action.');
      return;
    }

    const scheduledIso = !isTerminalOutcome && nextActionDate
      ? combineDateAndTimeIso(nextActionDate, nextActionTime)
      : undefined;

    const actionSummary = nextActionTitle.trim()
      ? nextActionTitle.trim()
      : `${selectedOutcome?.label || 'Follow-up'} Callback`;

    const fullActionNote = scheduledIso
      ? `${actionSummary} scheduled for ${nextActionDate} at ${nextActionTime}`
      : actionSummary;

    try {
      await logInteraction({
        lead_id: leadId,
        type: channel,
        call_result: selectedOutcome?.label || 'Call Logged',
        call_result_type: selectedOutcome?.type || 'positive',
        notes: notes.trim(),
        next_action: fullActionNote,
        next_followup_date: scheduledIso,
      }).unwrap();

      showAlert('success', 'Touchpoint Saved', 'Interaction and scheduled follow-up have been recorded.');
      navigation.goBack();
    } catch (err) {
      const msg =
        err?.data?.error?.message ||
        err?.data?.message ||
        err?.message ||
        'Could not log activity.';
      showAlert('error', 'Save Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {AlertComponent}
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

      <View style={styles.keyboardContainer}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bottomOffset={100}
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

            {/* Next Follow-up Scheduling Section */}
            {!isTerminalOutcome && (
              <View style={styles.scheduleBox}>
                <View style={styles.scheduleHeaderRow}>
                  <Text style={styles.scheduleTitle}>⏰ SCHEDULE NEXT FOLLOW-UP</Text>
                </View>

                {/* Next Action Title/Agenda */}
                <FluentInput
                  label="Follow-up Action Agenda"
                  value={nextActionTitle}
                  onChangeText={setNextActionTitle}
                  placeholder="e.g. Product Demo / Commercial Negotiation"
                />

                {/* Interactive Date & Time Picker */}
                <DateTimePicker
                  label="Follow-up Date & Time"
                  dateValue={nextActionDate}
                  timeValue={nextActionTime}
                  onDateChange={setNextActionDate}
                  onTimeChange={setNextActionTime}
                  required
                />
              </View>
            )}
          </FluentCard>
        </KeyboardAwareScrollView>

        {/* Pinned Bottom Docked CTA Bar (always visible above keyboard via KeyboardStickyView) */}
        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <View style={styles.dockedFooter}>
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
        </KeyboardStickyView>
      </View>
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
  keyboardContainer: {
    flex: 1,
  },
  dockedFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.level2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  scheduleBox: {
    marginTop: spacing.md,
    backgroundColor: '#F3F9FD',
    borderWidth: 1,
    borderColor: '#C7E0F4',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  scheduleTitle: {
    ...typography.overline,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  scheduleActiveBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#C7E0F4',
  },
  scheduleActiveBadgeText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 10,
  },
  fieldContainer: {
    marginTop: spacing.xs,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    marginBottom: 4,
  },
  presetChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: colors.textOnPrimary,
  },
});
