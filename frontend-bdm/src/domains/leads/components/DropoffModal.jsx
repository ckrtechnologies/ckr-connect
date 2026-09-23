import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { BottomSheet, FluentButton, FluentInput } from '../../../shared/components/index.js';
import { setDropoffModalData } from '../../../shared/store/slices/uiSlice.js';

const INVALID_REASONS = [
  { id: 'wrong_number', label: 'Wrong Number / Not Working' },
  { id: 'duplicate', label: 'Duplicate Lead Record' },
  { id: 'not_interested', label: 'Not Interested at First Contact' },
  { id: 'spam', label: 'Spam / Junk Inquiry' },
  { id: 'out_of_service_area', label: 'Out of Service Area' },
  { id: 'other', label: 'Other Data Quality Issue' },
];

const LOST_REASONS = [
  { id: 'competitor_chosen', label: 'Competitor Chosen' },
  { id: 'pricing_budget', label: 'Budget / Pricing Mismatch' },
  { id: 'feature_gap', label: 'Product Feature Gap' },
  { id: 'decision_delayed', label: 'Management Delayed Decision' },
  { id: 'other', label: 'Other Sales Loss Reason' },
];

export const DropoffModal = ({ onConfirmDropoff }) => {
  const dispatch = useDispatch();
  const modalData = useSelector((state) => state.ui.dropoffModalData);
  const visible = Boolean(modalData);

  const [status, setStatus] = useState(modalData?.defaultStage || 'lost');
  const [selectedReason, setSelectedReason] = useState(
    modalData?.defaultStage === 'invalid' ? 'wrong_number' : 'pricing_budget'
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    dispatch(setDropoffModalData(null));
  };

  const handleConfirm = async () => {
    if (!selectedReason) {
      Alert.alert(
        'Reason Required',
        `A mandatory reason is required to mark this lead as ${status.toUpperCase()} per PRD rules.`
      );
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (onConfirmDropoff && modalData?.leadId) {
        onConfirmDropoff(modalData.leadId, {
          status,
          reason: selectedReason,
          notes,
        });
      }

      Alert.alert('Status Updated', `Lead has been marked as ${status.toUpperCase()}.`);
      handleClose();
    } catch (err) {
      console.error('[DropoffModal] error:', err);
      Alert.alert('Update Failed', 'Could not update lead status. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const currentReasons = status === 'invalid' ? INVALID_REASONS : LOST_REASONS;

  return (
    <BottomSheet
      visible={visible}
      title="🛑 Mark Lead as Lost or Invalid"
      onClose={handleClose}
      isSubmitting={loading}
    >
      <View style={styles.container}>
        <Text style={styles.explainerText}>
          Lost (genuine opportunity lost) is kept distinct from Invalid (bad data) to protect
          lost-reason analytics integrity per PRD §3.
        </Text>

        {/* Status Toggle (Lost vs Invalid) */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Drop-off Classification *</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                status === 'lost' && styles.activeLostBtn,
              ]}
              onPress={() => {
                setStatus('lost');
                setSelectedReason('pricing_budget');
              }}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  status === 'lost' && styles.activeLostBtnText,
                ]}
              >
                Lost (Genuine Deal)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                status === 'invalid' && styles.activeInvalidBtn,
              ]}
              onPress={() => {
                setStatus('invalid');
                setSelectedReason('wrong_number');
              }}
            >
              <Text
                style={[
                  styles.toggleBtnText,
                  status === 'invalid' && styles.activeInvalidBtnText,
                ]}
              >
                Invalid / Junk Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mandatory Reason Radio Options */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>
            Mandatory Reason ({status.toUpperCase()}) *
          </Text>
          <View style={styles.reasonsList}>
            {currentReasons.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.reasonItem,
                  selectedReason === r.id && styles.selectedReasonItem,
                ]}
                onPress={() => setSelectedReason(r.id)}
              >
                <View style={styles.radioCircle}>
                  {selectedReason === r.id ? <View style={styles.radioDot} /> : null}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === r.id && styles.selectedReasonText,
                  ]}
                >
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FluentInput
          label="Additional Explanation / Context"
          placeholder="Enter any context or client feedback..."
          multiline
          value={notes}
          onChangeText={setNotes}
        />

        <View style={styles.actionsRow}>
          <FluentButton
            variant="secondary"
            title="Cancel"
            onPress={handleClose}
            disabled={loading}
            style={styles.cancelBtn}
          />

          <FluentButton
            variant="danger"
            title={`Confirm as ${status.toUpperCase()}`}
            loading={loading}
            onPress={handleConfirm}
            style={styles.confirmBtn}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 24,
  },
  explainerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    ...typography.bodyBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  activeLostBtn: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  activeLostBtnText: {
    color: colors.error,
    fontWeight: '700',
  },
  activeInvalidBtn: {
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceHover,
  },
  activeInvalidBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  toggleBtnText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  reasonsList: {
    gap: 6,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedReasonItem: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  reasonText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textPrimary,
  },
  selectedReasonText: {
    fontWeight: '700',
    color: colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
  },
  confirmBtn: {
    flex: 2,
  },
});

export default DropoffModal;
