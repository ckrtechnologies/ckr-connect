import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';

export const FILTER_CATEGORIES = [
  { id: 'stage', label: 'Pipeline Stage' },
  { id: 'urgency', label: 'Urgency & Due' },
  { id: 'priority', label: 'Lead Priority' },
  { id: 'sort', label: 'Sort Order' },
];

export const FILTER_OPTIONS = {
  stage: [
    { id: 'all', label: 'All Stages' },
    { id: 'new', label: '⚡ Untouched (New)' },
    { id: 'contacted', label: '📞 Contacted' },
    { id: 'follow_up', label: '⏰ Follow-up' },
    { id: 'proposal', label: '📄 Proposal Sent' },
    { id: 'won', label: '🏆 Deals Won' },
    { id: 'lost', label: '❌ Deals Lost' },
  ],
  urgency: [
    { id: 'all', label: 'All Urgencies' },
    { id: 'overdue', label: '🚨 Overdue Callbacks' },
    { id: 'today', label: '⏰ Due Today' },
    { id: 'upcoming', label: '📅 Upcoming Follow-up' },
    { id: 'won', label: '🏆 Won' },
  ],
  priority: [
    { id: 'all', label: 'All Priorities' },
    { id: 'urgent', label: '🔴 Urgent' },
    { id: 'high', label: '🟠 High' },
    { id: 'medium', label: '🔵 Medium' },
    { id: 'low', label: '⚪ Low' },
  ],
  sort: [
    { id: 'created_desc', label: 'Newest First (Default)', sortBy: 'created_at', sortOrder: 'DESC' },
    { id: 'created_asc', label: 'Oldest First', sortBy: 'created_at', sortOrder: 'ASC' },
    { id: 'value_desc', label: 'Deal Value: High to Low', sortBy: 'expected_value', sortOrder: 'DESC' },
    { id: 'value_asc', label: 'Deal Value: Low to High', sortBy: 'expected_value', sortOrder: 'ASC' },
  ],
};

export const LeadFilterBottomSheet = ({
  visible,
  onClose,
  activeFilters = { stage: 'all', urgency: 'all', priority: 'all', sort: 'created_desc' },
  onApply,
  onReset,
}) => {
  const [activeCategory, setActiveCategory] = useState('stage');
  const [tempFilters, setTempFilters] = useState(activeFilters);

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (visible) {
      setTempFilters(activeFilters);
    }
  }, [visible, activeFilters]);

  const handleSelectOption = (categoryId, optionId) => {
    setTempFilters((prev) => ({
      ...prev,
      [categoryId]: optionId,
    }));
  };

  const handleReset = () => {
    const defaultFilters = { stage: 'all', urgency: 'all', priority: 'all', sort: 'created_desc' };
    setTempFilters(defaultFilters);
    if (onReset) onReset(defaultFilters);
  };

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  // Count active non-default filters
  const activeCount = Object.entries(tempFilters).filter(
    ([k, v]) => (k === 'sort' ? v !== 'created_desc' : v !== 'all')
  ).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheetContainer}>
              {/* Drag Handle Bar */}
              <View style={styles.handleBar} />

              {/* Sheet Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>Filter Pipeline</Text>
                  <Text style={styles.headerSubtitle}>
                    Select category on left, pick options on right
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* 2-Column Filter Body */}
              <View style={styles.bodyRow}>
                {/* Left Column: Filter Categories */}
                <View style={styles.leftCol}>
                  {FILTER_CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.id;
                    const catVal = tempFilters[cat.id];
                    const isFiltered = cat.id === 'sort' ? catVal !== 'created_desc' : catVal !== 'all';

                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catTab, isSelected && styles.catTabActive]}
                        onPress={() => setActiveCategory(cat.id)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.catLabel,
                            isSelected && styles.catLabelActive,
                          ]}
                          numberOfLines={1}
                        >
                          {cat.label}
                        </Text>
                        {isFiltered ? (
                          <View style={styles.catDot} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Right Column: Options of that Category */}
                <ScrollView
                  style={styles.rightCol}
                  contentContainerStyle={styles.optionsContent}
                  showsVerticalScrollIndicator={false}
                >
                  {(FILTER_OPTIONS[activeCategory] || []).map((opt) => {
                    const isChecked = tempFilters[activeCategory] === opt.id;

                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[styles.optionRow, isChecked && styles.optionRowChecked]}
                        onPress={() => handleSelectOption(activeCategory, opt.id)}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.radioOuter, isChecked && styles.radioOuterChecked]}>
                          {isChecked ? <View style={styles.radioInner} /> : null}
                        </View>
                        <Text
                          style={[
                            styles.optionLabel,
                            isChecked && styles.optionLabelChecked,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Bottom Sticky Action Footer */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleReset}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetBtnText}>Clear All</Text>
                </TouchableOpacity>

                <View style={styles.applyBtnWrapper}>
                  <FluentButton
                    title={`Apply Filters ${activeCount > 0 ? `(${activeCount})` : ''}`}
                    onPress={handleApply}
                    variant="primary"
                    size="medium"
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '80%',
    minHeight: 460,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  bodyRow: {
    flex: 1,
    flexDirection: 'row',
  },
  leftCol: {
    width: 140,
    backgroundColor: colors.surfaceAlt,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  catTab: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catTabActive: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  catLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  catLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginLeft: 4,
  },
  rightCol: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  optionsContent: {
    padding: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  optionRowChecked: {
    backgroundColor: colors.primaryLight,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  radioOuterChecked: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 13,
    flex: 1,
  },
  optionLabelChecked: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  resetBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  resetBtnText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    fontSize: 13,
  },
  applyBtnWrapper: {
    flex: 1,
    marginLeft: spacing.md,
  },
});
