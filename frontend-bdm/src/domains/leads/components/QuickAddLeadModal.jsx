import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { BottomSheet } from '../../../shared/components/BottomSheet.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { setQuickAddModalOpen } from '../../../shared/store/uiSlice.js';
import { useCreateBdmLeadMutation } from '../api.js';

export const QuickAddLeadModal = () => {
  const visible = useSelector((state) => state.ui.quickAddModalOpen);
  console.log('QuickAddLeadModal render, visible =', visible);
  const dispatch = useDispatch();
  const [createLead, { isLoading }] = useCreateBdmLeadMutation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Delhi');

  const handleClose = () => {
    dispatch(setQuickAddModalOpen(false));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter the contact person name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required Field', 'Please enter the phone number.');
      return;
    }
    if (!notes.trim()) {
      Alert.alert('Required Field', 'Please enter initial discussion/requirement notes.');
      return;
    }

    try {
      await createLead({
        name: name.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        company_name: company.trim() || undefined,
        expected_value: expectedValue ? Number(expectedValue) : 0,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        next_followup_date: new Date(Date.now() + 2 * 86400000)
          .toISOString()
          .slice(0, 10),
      }).unwrap();

      Alert.alert('Lead Created', `${name} has been added and assigned to you.`);
      // Reset fields
      setName('');
      setPhone('');
      setNotes('');
      setCompany('');
      setExpectedValue('');
      setCity('');
      handleClose();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Could not create lead.';
      Alert.alert('Create Lead Failed', msg);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="⚡ Quick Add Inbound Lead"
      subtitle="Automatically allocated to your queue"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Required Section */}
        <View style={styles.requiredBox}>
          <Text style={styles.sectionHeader}>⭐ Required Information</Text>
          <FluentInput
            label="Contact Person Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Dr. Harish Reddy / Principal Sharma"
            required
          />
          <FluentInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +91 98480 12345"
            keyboardType="phone-pad"
            required
          />
          <FluentInput
            label="Discussion / Requirement Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Summarize requirements, key modules requested, and commitments..."
            multiline
            numberOfLines={3}
            required
          />
        </View>

        {/* Optional Section */}
        <View style={styles.optionalBox}>
          <Text style={styles.sectionHeaderOptional}>⚙️ Optional Details</Text>
          <FluentInput
            label="Company / School Name"
            value={company}
            onChangeText={setCompany}
            placeholder="e.g. Heritage Valley School"
          />
          <FluentInput
            label="Expected Deal Value (₹)"
            value={expectedValue}
            onChangeText={setExpectedValue}
            placeholder="e.g. 250000"
            keyboardType="numeric"
          />
          <FluentInput
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Hyderabad / Delhi"
          />
        </View>

        {/* Action Buttons */}
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
            title="Save and Close"
            onPress={handleSave}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xxl,
  },
  requiredBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontSize: 11,
  },
  optionalBox: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeaderOptional: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
