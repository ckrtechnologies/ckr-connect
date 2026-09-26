import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { BottomSheet } from '../../../shared/components/BottomSheet.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { closeWonModal } from '../../../shared/store/uiSlice.js';
import { useUpdateLeadStatusMutation } from '../api.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

export const CloseDealWonModal = () => {
  const leadId = useSelector((state) => state.ui.wonModalLeadId);
  const visible = Boolean(leadId);
  const dispatch = useDispatch();
  const [updateStatus, { isLoading }] = useUpdateLeadStatusMutation();
  const { showAlert, AlertComponent } = useAlert();

  const [wonAmount, setWonAmount] = useState('480000');
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    dispatch(closeWonModal());
  };

  const handleConfirmWon = async () => {
    const num = Number(wonAmount);
    if (!num || num <= 0) {
      showAlert('error', 'Amount Required', 'Please enter a valid closed deal amount in ₹.');
      return;
    }

    try {
      await updateStatus({
        id: leadId,
        status: 'won',
        won_amount: num,
        remarks: notes.trim() || undefined,
      }).unwrap();

      showAlert('success', 'Congratulations! 🏆', 'Deal marked as Won and added to closed revenue.');
      handleClose();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Could not close deal.';
      showAlert('error', 'Update Failed', msg);
    }
  };

  return (
    <>
      {AlertComponent}
      <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="🏆 Convert & Close Deal as Won"
      subtitle="Records revenue & closes opportunity"
      footer={
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
            title="Confirm & Record Won"
            onPress={handleConfirmWon}
            variant="success"
            size="large"
            loading={isLoading}
            style={styles.actionBtn}
          />
        </View>
      }
    >
      <ScrollView
        contentContainerStyle={[styles.formContainer, { paddingBottom: 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FluentInput
          label="Actual Closed Deal Amount (₹ Mandatory)"
          value={wonAmount}
          onChangeText={setWonAmount}
          placeholder="e.g. 480000"
          keyboardType="numeric"
          required
        />

        <FluentInput
          label="Closing Notes & Payment Terms"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Signed 3-year ERP agreement with 50% advance received via NEFT"
          multiline
          numberOfLines={3}
        />
      </ScrollView>
    </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    paddingBottom: spacing.lg,
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
