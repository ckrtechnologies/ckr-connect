import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { BottomSheet } from '../../../shared/components/BottomSheet.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { useUpdateLeadDetailsMutation } from '../api.js';
import { spacing } from '../../../shared/theme/spacing.js';

export const LeadEditBottomSheet = ({ visible, onClose, lead, showAlert }) => {
  const [updateLead, { isLoading }] = useUpdateLeadDetailsMutation();

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    email: '',
    phone: '',
    expected_value: '',
    budget: '',
    city: '',
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        company_name: lead.company_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        expected_value: lead.expected_value ? lead.expected_value.toString() : '',
        budget: lead.budget ? lead.budget.toString() : '',
        city: lead.city || '',
      });
    }
  }, [lead]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        id: lead.id,
        name: formData.name.trim(),
        company_name: formData.company_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city.trim(),
        expected_value: formData.expected_value ? Number(formData.expected_value) : null,
        budget: formData.budget ? Number(formData.budget) : null,
      };

      await updateLead(payload).unwrap();
      showAlert('success', 'Lead Updated', 'The details have been updated successfully.');
      setTimeout(() => onClose(), 800);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.error?.message || err?.data?.message || 'Failed to update lead details.';
      showAlert('error', 'Update Failed', msg);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Edit Lead Details"
      footer={
        <View style={styles.footerRow}>
          <FluentButton
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            size="large"
            style={styles.cancelBtn}
            disabled={isLoading}
          />
          <FluentButton
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="large"
            style={styles.saveBtn}
            loading={isLoading}
          />
        </View>
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <FluentInput
          label="Lead Name"
          placeholder="e.g. Rahul Sharma"
          value={formData.name}
          onChangeText={(val) => handleChange('name', val)}
          containerStyle={styles.inputSpacing}
        />
        <FluentInput
          label="Company Name / School"
          placeholder="e.g. Apex High School"
          value={formData.company_name}
          onChangeText={(val) => handleChange('company_name', val)}
          containerStyle={styles.inputSpacing}
        />
        <FluentInput
          label="Expected Deal Value (₹)"
          placeholder="e.g. 150000"
          value={formData.expected_value}
          onChangeText={(val) => handleChange('expected_value', val.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          containerStyle={styles.inputSpacing}
        />
        <FluentInput
          label="Budget (₹)"
          placeholder="e.g. 100000"
          value={formData.budget}
          onChangeText={(val) => handleChange('budget', val.replace(/[^0-9]/g, ''))}
          keyboardType="numeric"
          containerStyle={styles.inputSpacing}
        />
        <FluentInput
          label="Phone Number"
          placeholder="e.g. 9876543210"
          value={formData.phone}
          onChangeText={(val) => handleChange('phone', val)}
          keyboardType="phone-pad"
          containerStyle={styles.inputSpacing}
        />
        <FluentInput
          label="Email Address"
          placeholder="e.g. rahul@apex.edu"
          value={formData.email}
          onChangeText={(val) => handleChange('email', val)}
          keyboardType="email-address"
          autoCapitalize="none"
          containerStyle={styles.inputSpacing}
        />
        <FluentInput
          label="City"
          placeholder="e.g. Bangalore"
          value={formData.city}
          onChangeText={(val) => handleChange('city', val)}
          containerStyle={styles.inputSpacing}
        />
      </ScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.lg,
  },
  inputSpacing: {
    marginBottom: spacing.md,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});
