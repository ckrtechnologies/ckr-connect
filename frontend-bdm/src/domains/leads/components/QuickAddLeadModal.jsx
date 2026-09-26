import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  KeyboardAwareScrollView,
} from 'react-native-keyboard-controller';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { BottomSheet } from '../../../shared/components/BottomSheet.jsx';
import { FluentInput } from '../../../shared/components/FluentInput.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import {
  DateTimePicker,
  combineDateAndTimeIso,
  formatDateToYmd,
} from '../../../shared/components/DateTimePicker.jsx';
import { setQuickAddModalOpen } from '../../../shared/store/uiSlice.js';
import { useCreateBdmLeadMutation } from '../api.js';
import { useGetBootstrapQuery } from '../../auth/api.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

const STATUS_OPTIONS = [
  { value: 'new', label: '🟢 New' },
  { value: 'contacted', label: '📞 Contacted' },
  { value: 'follow_up', label: '🔄 Follow Up' },
  { value: 'proposal', label: '📋 Proposal' },
  { value: 'won', label: '🏆 Won' },
  { value: 'lost', label: '❌ Lost' },
  { value: 'invalid', label: '🚫 Invalid' },
];

const STATE_OPTIONS = [
  'Delhi',
  'Telangana',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Uttar Pradesh',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
  'Kerala',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Other',
];

const getFutureDate = (days) => {
  const d = new Date(Date.now() + days * 86400000);
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

export const QuickAddLeadModal = () => {
  const visible = useSelector((state) => state.ui.quickAddModalOpen);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const [createLead, { isLoading }] = useCreateBdmLeadMutation();
  const { data: bootstrapData, refetch: refetchBootstrap } = useGetBootstrapQuery(undefined, {
    skip: !token,
  });
  const { showAlert, AlertComponent } = useAlert();

  const allTags = useMemo(() => {
    const list =
      (Array.isArray(bootstrapData?.tags) && bootstrapData.tags) ||
      (Array.isArray(bootstrapData?.data?.tags) && bootstrapData.data.tags) ||
      (Array.isArray(bootstrapData) && bootstrapData) ||
      [];
    return list;
  }, [bootstrapData]);

  useEffect(() => {
    if (visible && token) {
      refetchBootstrap();
    }
  }, [visible, token, refetchBootstrap]);

  // Form states matching Admin QuickCreateDrawer
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [expectedValue, setExpectedValue] = useState('');
  const [city, setCity] = useState('');
  const [selectedState, setSelectedState] = useState('Delhi');
  const [status, setStatus] = useState('new');
  const [followupDate, setFollowupDate] = useState(formatDateToYmd(new Date(Date.now() + 2 * 86400000)));
  const [followupTime, setFollowupTime] = useState('11:30 AM');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [tagSearch, setTagSearch] = useState('');

  // Auto-select first tag when bootstrap loads
  useEffect(() => {
    if (allTags.length > 0 && selectedTagIds.length === 0) {
      setSelectedTagIds([allTags[0].id]);
    }
  }, [allTags]);

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return allTags;
    const q = tagSearch.toLowerCase();
    return allTags.filter((t) => (t.name || '').toLowerCase().includes(q));
  }, [allTags, tagSearch]);

  const scrollViewRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const isTerminal = ['won', 'lost', 'invalid'].includes(status);

  const handleClose = () => {
    setErrorMessage('');
    setFieldErrors({});
    dispatch(setQuickAddModalOpen(false));
  };

  const handleNameChange = (val) => {
    setName(val);
    if (fieldErrors.name && val.trim()) {
      setFieldErrors((prev) => ({ ...prev, name: false }));
      if (errorMessage.toLowerCase().includes('name')) setErrorMessage('');
    }
  };

  const handlePhoneChange = (val) => {
    setPhone(val);
    if (fieldErrors.phone && val.trim()) {
      setFieldErrors((prev) => ({ ...prev, phone: false }));
      if (errorMessage.toLowerCase().includes('phone')) setErrorMessage('');
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  };

  const handleSave = async () => {
    setErrorMessage('');
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      const msg = 'Please enter Contact Person Name.';
      setErrorMessage(msg);
      setFieldErrors({ name: true });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      showAlert('error', 'Required Field', msg);
      return;
    }
    if (!trimmedPhone) {
      const msg = 'Please enter Phone Number.';
      setErrorMessage(msg);
      setFieldErrors({ phone: true });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      showAlert('error', 'Required Field', msg);
      return;
    }
    if (trimmedPhone.replace(/\D/g, '').length < 7) {
      const msg = 'Please enter a valid phone number (at least 7 digits).';
      setErrorMessage(msg);
      setFieldErrors({ phone: true });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      showAlert('error', 'Invalid Phone', msg);
      return;
    }
    if (!isTerminal && !followupDate) {
      const msg = 'A Next Follow-up Date is required for active leads.';
      setErrorMessage(msg);
      showAlert('error', 'Required Field', msg);
      return;
    }
    if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
      const msg = 'Please enter a valid email address or leave blank.';
      setErrorMessage(msg);
      setFieldErrors({ email: true });
      showAlert('error', 'Invalid Email', msg);
      return;
    }

    try {
      const scheduledIso = !isTerminal && followupDate
        ? combineDateAndTimeIso(followupDate, followupTime)
        : undefined;

      const finalNotes = notes.trim() || 'Lead captured via BDM Mobile App';

      await createLead({
        name: trimmedName,
        phone: trimmedPhone,
        notes: finalNotes,
        discussion_notes: finalNotes,
        sub_requirement: finalNotes,
        company_name: company.trim() || trimmedName,
        email: email.trim() || undefined,
        city: city.trim() || undefined,
        state: selectedState || 'Delhi',
        status,
        expected_value: expectedValue ? Number(expectedValue) : 0,
        tag_ids: selectedTagIds.length > 0 ? selectedTagIds : undefined,
        next_followup_date: scheduledIso,
      }).unwrap();

      showAlert('success', 'Lead Created', `${trimmedName} has been added and assigned to you.`);
      // Reset form
      setName('');
      setPhone('');
      setNotes('');
      setCompany('');
      setEmail('');
      setExpectedValue('');
      setCity('');
      setSelectedState('Delhi');
      setStatus('new');
      setFollowupDate(formatDateToYmd(new Date(Date.now() + 2 * 86400000)));
      setFollowupTime('11:30 AM');
      setErrorMessage('');
      setFieldErrors({});
      handleClose();
    } catch (err) {
      const msg =
        err?.data?.error?.message ||
        err?.data?.message ||
        err?.message ||
        'Could not create lead.';
      setErrorMessage(msg);
      showAlert('error', 'Create Lead Failed', msg);
    }
  };

  return (
    <>
      {AlertComponent}
      <BottomSheet
      visible={visible}
      onClose={handleClose}
      title="⚡ Quick Add Lead"
      subtitle="Automatically allocated to your queue"
      footer={
        <View style={styles.footerWrapper}>
          {errorMessage ? (
            <View style={styles.inlineErrorBox}>
              <Text style={styles.inlineErrorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}
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
              title="Create & Assign Lead"
              onPress={handleSave}
              variant="primary"
              size="large"
              loading={isLoading}
              style={styles.actionBtn}
            />
          </View>
        </View>
      }
    >
      <KeyboardAwareScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bottomOffset={60}
      >
        {/* Mandatory Information Card (Matching Admin) */}
        <View style={styles.requiredBox}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderStar}>⭐</Text>
            <Text style={styles.sectionHeader}>REQUIRED INFORMATION (MANDATORY)</Text>
          </View>

          <FluentInput
            label="Contact Person Name"
            value={name}
            onChangeText={handleNameChange}
            placeholder="Full name"
            required
            error={fieldErrors.name ? 'Contact person name is required' : null}
          />

          <FluentInput
            label="Phone Number"
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            required
            error={fieldErrors.phone ? 'Valid phone number is required' : null}
          />

          <FluentInput
            label="Discussion / Requirement Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter initial discussion notes and client requirements..."
            multiline
            numberOfLines={3}
          />
          <Text style={styles.fieldHint}>
            Automatically logged into Daily Interaction Waterfall & Calling Ledger.
          </Text>
        </View>

        {/* Additional Lead Attributes Card (Matching Admin) */}
        <View style={styles.optionalBox}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderIcon}>⚙️</Text>
            <Text style={styles.sectionHeaderOptional}>ADDITIONAL LEAD ATTRIBUTES</Text>
          </View>

          <FluentInput
            label="Company / School / Organization"
            value={company}
            onChangeText={setCompany}
            placeholder="Organization or company name"
          />

          {/* Offering / Solution Tags */}
          <View style={styles.fieldContainer}>
            <View style={styles.tagsHeaderRow}>
              <Text style={styles.fieldLabel}>Offering / Solution Tags</Text>
              <Text style={styles.tagsCountBadge}>
                {selectedTagIds.length} selected
              </Text>
            </View>

            {/* Selected Tags Pills */}
            {selectedTagIds.length > 0 && (
              <View style={styles.selectedPillsContainer}>
                {selectedTagIds.map((tagId) => {
                  const tag = allTags.find((t) => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={styles.selectedPill}
                      onPress={() => toggleTag(tag.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.selectedPillText}>{tag.name} ✕</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Tag search / filter */}
            <TextInput
              style={styles.tagSearchInput}
              value={tagSearch}
              onChangeText={setTagSearch}
              placeholder="🔍 Search offering / solution tags..."
              placeholderTextColor={colors.textTertiary}
            />

            {/* Scrollable Tag Picker */}
            <View style={styles.tagsScrollBox}>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                contentContainerStyle={styles.tagChipsWrap}
              >
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[styles.tagChip, isSelected && styles.tagChipSelected]}
                      onPress={() => toggleTag(tag.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.tagChipText,
                          isSelected && styles.tagChipTextSelected,
                        ]}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                {filteredTags.length === 0 && (
                  <Text style={styles.noTagsText}>No tags match "{tagSearch}"</Text>
                )}
              </ScrollView>
            </View>
          </View>

          <FluentInput
            label="Expected Deal Value (₹)"
            value={expectedValue}
            onChangeText={setExpectedValue}
            placeholder="e.g. 500000"
            keyboardType="numeric"
          />

          {/* Lead Stage / Status */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Lead Stage / Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.statusChipsRow}>
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = status === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.statusChip, isSelected && styles.statusChipSelected]}
                      onPress={() => setStatus(opt.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.statusChipText, isSelected && styles.statusChipTextSelected]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Next Follow-up Date & Time (if active) */}
          {!isTerminal && (
            <DateTimePicker
              label="Next Follow-up Due Date & Time"
              dateValue={followupDate}
              timeValue={followupTime}
              onDateChange={setFollowupDate}
              onTimeChange={setFollowupTime}
              required
            />
          )}

          <FluentInput
            label="City"
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Hyderabad / Delhi"
          />

          {/* State Selection */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>State</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              <View style={styles.statusChipsRow}>
                {STATE_OPTIONS.map((st) => {
                  const isSelected = selectedState === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.stateChip, isSelected && styles.stateChipSelected]}
                      onPress={() => setSelectedState(st)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.stateChipText, isSelected && styles.stateChipTextSelected]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          <FluentInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="contact@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Assignment Note (Exclusive to Current BDM) */}
          <View style={styles.assignedNoteBox}>
            <Text style={styles.assignedNoteIcon}>👤</Text>
            <Text style={styles.assignedNoteText}>
              Assigned directly to your queue. Other agent allocation is restricted to Admin.
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 90,
  },
  requiredBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  sectionHeaderStar: {
    fontSize: 12,
  },
  sectionHeaderIcon: {
    fontSize: 12,
  },
  sectionHeader: {
    ...typography.overline,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  fieldHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
    lineHeight: 15,
  },
  optionalBox: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeaderOptional: {
    ...typography.overline,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  fieldContainer: {
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  tagsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tagsCountBadge: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  selectedPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  selectedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  selectedPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  tagSearchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  tagsScrollBox: {
    maxHeight: 125,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    padding: 6,
    marginBottom: spacing.xs,
  },
  noTagsText: {
    fontSize: 11,
    color: colors.textTertiary,
    fontStyle: 'italic',
    padding: 8,
    alignSelf: 'center',
  },
  horizontalScroll: {
    marginBottom: spacing.xs,
  },
  tagChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 4,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  tagChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tagChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tagChipTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  statusChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  statusChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  statusChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  datePresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: spacing.xs,
  },
  datePresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePresetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  datePresetText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  datePresetTextActive: {
    color: '#FFFFFF',
  },
  scheduleBox: {
    backgroundColor: '#F3F9FD',
    borderWidth: 1,
    borderColor: '#C7E0F4',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
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
  stateChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stateChipText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stateChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  assignedNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xs,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  assignedNoteIcon: {
    fontSize: 14,
  },
  assignedNoteText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 15,
  },
  footerWrapper: {
    width: '100%',
  },
  inlineErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginBottom: spacing.xs,
  },
  inlineErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
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

