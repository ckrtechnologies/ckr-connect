import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { BottomSheet, FluentButton, FluentInput } from '../../../shared/components/index.js';
import { setWonModalLeadId } from '../../../shared/store/slices/uiSlice.js';

export const WonModal = ({ lead, onConfirmWon }) => {
  const dispatch = useDispatch();
  const activeWonId = useSelector((state) => state.ui.wonModalLeadId);
  const visible = Boolean(activeWonId && lead && lead.id === activeWonId);

  const [wonAmount, setWonAmount] = useState(
    lead ? String(lead.expected_value || 480000) : '480000'
  );
  const [dealType, setDealType] = useState('new_business');
  const [accountName, setAccountName] = useState(
    lead ? lead.company_name || 'Heritage Valley International' : ''
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    dispatch(setWonModalLeadId(null));
  };

  const handleConfirm = async () => {
    const amountNum = parseFloat(wonAmount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert(
        'Mandatory Won Amount',
        'Please enter the actual closed deal amount in INR per PRD US-27.'
      );
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (onConfirmWon) {
        onConfirmWon(lead.id, {
          won_amount: amountNum,
          deal_type: dealType,
          account_name: accountName,
          notes,
        });
      }

      Alert.alert('Deal Closed Won! 🏆', `Recorded ₹${amountNum.toLocaleString('en-IN')} in Won Revenue.`);
      handleClose();
    } catch (err) {
      console.error('[WonModal] error:', err);
      Alert.alert('Failed', 'Could not record deal as won. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title="🏆 Convert & Close Deal as Won"
      onClose={handleClose}
      isSubmitting={loading}
    >
      <View style={styles.container}>
        <Text style={styles.explainerText}>
          Record actual closed deal value and customer account linkage per PRD US-27 & US-29.
        </Text>

        <FluentInput
          label="Actual Closed Deal Amount (₹ Mandatory)"
          required
          placeholder="e.g. 480000"
          keyboardType="numeric"
          value={wonAmount}
          onChangeText={setWonAmount}
        />

        {/* Deal Type Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Deal Type</Text>
          <View style={styles.selectorRow}>
            {['new_business', 'upsell', 'resell'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeBtn,
                  dealType === type && styles.activeTypeBtn,
                ]}
                onPress={() => setDealType(type)}
              >
                <Text
                  style={[
                    styles.typeBtnText,
                    dealType === type && styles.activeTypeBtnText,
                  ]}
                >
                  {type === 'new_business'
                    ? 'New Business'
                    : type === 'upsell'
                    ? 'Upsell'
                    : 'Resell / AMC'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FluentInput
          label="Customer Company / Account"
          placeholder="Company Name"
          value={accountName}
          onChangeText={setAccountName}
          helperText="Links to Customer Account to accumulate lifetime revenue."
        />

        <FluentInput
          label="Closing Notes & Payment Terms"
          placeholder="e.g. Signed 3-year agreement with 50% advance received via NEFT"
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
            variant="success"
            title="Confirm & Record Won"
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
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.bodyBold,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  activeTypeBtn: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeBtnText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  activeTypeBtnText: {
    color: colors.primary,
    fontWeight: '700',
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

export default WonModal;
