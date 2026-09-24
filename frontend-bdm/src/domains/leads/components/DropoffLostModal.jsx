import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { BottomSheet } from '../../../shared/components/BottomSheet.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { closeDropoffModal } from '../../../shared/store/uiSlice.js';
import { useUpdateLeadStatusMutation } from '../api.js';

export const DropoffLostModal = () => {
  const dropoffData = useSelector((state) => state.ui.dropoffModalData);
  const visible = Boolean(dropoffData);
  const dispatch = useDispatch();
  const [updateStatus, { isLoading }] = useUpdateLeadStatusMutation();

  const [mode, setMode] = useState(dropoffData?.defaultStage || 'lost'); // 'lost' | 'invalid'
  const [lostReason, setLostReason] = useState('Competitor Chosen (Price)');
  const [invalidReason, setInvalidReason] = useState('wrong_number');
  const [remarks, setRemarks] = useState('');

  const handleClose = () => {
    dispatch(closeDropoffModal());
  };

  const handleConfirm = async () => {
    const leadId = dropoffData?.leadId;
    if (!leadId) return;

    try {
      if (mode === 'lost') {
        if (!lostReason.trim()) {
          Alert.alert('Reason Required', 'Please provide a reason why this lead was lost.');
          return;
        }
        await updateStatus({
          id: leadId,
          status: 'lost',
          lost_reason: lostReason,
          remarks: remarks.trim() || undefined,
        }).unwrap();
        Alert.alert('Lead Updated', 'Lead status has been updated to Lost.');
      } else {
        await updateStatus({
          id: leadId,
          status: 'invalid',
          invalid_reason: invalidReason,
          remarks: remarks.trim() || undefined,
        }).unwrap();
        Alert.alert('Lead Updated', 'Lead status has been updated to Invalid.');
      }

      handleClose();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Could not update status.';
      Alert.alert('Update Failed', msg);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="⚠️ Mark Opportunity Drop-off"
      subtitle="Close opportunity with audit trail"
    >
      <View style={styles.formContainer}>
        {/* Toggle Mode */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'lost' && styles.toggleBtnActive]}
            onPress={() => setMode('lost')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, mode === 'lost' && styles.toggleTextActive]}>
              Lost (Genuine Lead)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'invalid' && styles.toggleBtnActive]}
            onPress={() => setMode('invalid')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleText, mode === 'invalid' && styles.toggleTextActive]}>
              Invalid (Bad Data)
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'lost' ? (
          <FluentInput
            label="Lost Reason *"
            value={lostReason}
            onChangeText={setLostReason}
            placeholder="e.g. Price too high, Competitor chosen, Budget frozen"
            required
          />
        ) : (
          <FluentInput
            label="Invalid Reason Code *"
            value={invalidReason}
            onChangeText={setInvalidReason}
            placeholder="e.g. wrong_number, duplicate, spam, not_interested"
            required
          />
        )}

        <FluentInput
          label="Additional Remarks"
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Detailed context regarding client refusal or drop-off..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.actionsRow}>
          <FluentButton
            title="Cancel"
            onPress={handleClose}
            variant="secondary"
            size="large"
            style={styles.actionBtn}
            disabled={isLoading}
          />
          <FluentButton
            title={`Confirm as ${mode === 'lost' ? 'Lost' : 'Invalid'}`}
            onPress={handleConfirm}
            variant="danger"
            size="large"
            loading={isLoading}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingBottom: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: 2,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  toggleTextActive: {
    color: colors.textOnPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
