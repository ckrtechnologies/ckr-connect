import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { BottomSheet, FluentButton, FluentInput } from '../../../shared/components/index.js';
import { setQuickAddModalOpen } from '../../../shared/store/slices/uiSlice.js';

export const QuickAddLeadModal = ({ onSaveLead }) => {
  const dispatch = useDispatch();
  const visible = useSelector((state) => state.ui.quickAddModalOpen);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [expectedValue, setExpectedValue] = useState('250000');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Telangana');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    dispatch(setQuickAddModalOpen(false));
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setNotes('');
    setCompany('');
    setExpectedValue('250000');
    setCity('');
    setEmail('');
  };

  const handleSave = async (openDetail = false) => {
    if (!name.trim() || !phone.trim() || !notes.trim()) {
      Alert.alert(
        'Required Information',
        'Please fill in Contact Person Name, Phone Number, and Discussion Notes.'
      );
      return;
    }

    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newLead = {
        id: `lead-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        phone: phone.trim(),
        company_name: company.trim() || 'Individual',
        city: city.trim() || 'Hyderabad',
        state: state.trim() || 'Telangana',
        email: email.trim(),
        sub_requirement: notes.trim(),
        expected_value: Number(expectedValue) || 250000,
        budget: Number(expectedValue) || 250000,
        status: 'new',
        priority: 'high',
        followup_count: 0,
        deal_type: 'new_business',
        source: 'walk_in',
        tag_id: 'tag-01',
        created_at: new Date().toISOString(),
      };

      if (onSaveLead) {
        onSaveLead(newLead, openDetail);
      }

      Alert.alert(
        'Lead Created',
        `Lead for ${name} has been added to your pipeline and logged in today's ledger.`
      );
      handleClose();
    } catch (err) {
      console.error('[QuickAddLeadModal] error:', err);
      Alert.alert('Error', 'Could not create lead. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      title="⚡ Quick Add Lead"
      onClose={handleClose}
      isSubmitting={loading}
    >
      <View style={styles.container}>
        {/* Required Section Card */}
        <View style={styles.requiredSection}>
          <Text style={styles.sectionHeader}>⭐ Required Information (Mandatory)</Text>

          <FluentInput
            label="Contact Person Name"
            required
            placeholder="e.g. Dr. Harish Reddy / Principal Sharma"
            value={name}
            onChangeText={setName}
          />

          <FluentInput
            label="Phone Number"
            required
            placeholder="e.g. +91 98480 12345"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <FluentInput
            label="Discussion / Requirement Notes"
            required
            placeholder="e.g. Inquired about Campus ERP, parent mobile app, fee gateway..."
            multiline
            value={notes}
            onChangeText={setNotes}
            helperText="Automatically logged into Daily Interaction Waterfall."
          />
        </View>

        {/* Optional Section Card */}
        <View style={styles.optionalSection}>
          <Text style={styles.sectionHeader}>⚙️ Optional Details (Defaults Provided)</Text>

          <FluentInput
            label="Company / School / Organization"
            placeholder="e.g. St. Xavier Senior School"
            value={company}
            onChangeText={setCompany}
          />

          <FluentInput
            label="Expected Deal Value (₹)"
            placeholder="e.g. 250000"
            keyboardType="numeric"
            value={expectedValue}
            onChangeText={setExpectedValue}
          />

          <FluentInput
            label="City"
            placeholder="e.g. Hyderabad / Bengaluru"
            value={city}
            onChangeText={setCity}
          />

          <FluentInput
            label="Email Address"
            placeholder="contact@institution.org"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          <FluentButton
            variant="secondary"
            title="Cancel"
            onPress={handleClose}
            disabled={loading}
            style={styles.cancelBtn}
          />

          <FluentButton
            variant="primary"
            title="Save and Close"
            loading={loading}
            onPress={() => handleSave(false)}
            style={styles.saveBtn}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingBottom: 20,
  },
  requiredSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  optionalSection: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  sectionHeader: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: spacing.sm,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderStyle: 'dashed',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xs,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});

export default QuickAddLeadModal;
