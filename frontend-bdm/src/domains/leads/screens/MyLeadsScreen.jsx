import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { FilterChip, EmptyState } from '../../../shared/components/index.js';
import {
  setLeadsSearchQuery,
  setLeadsFilterUrgency,
  setLeadsFilterStage,
  clearLeadsFilters,
  setQuickAddModalOpen,
} from '../../../shared/store/slices/uiSlice.js';
import { INITIAL_LEADS } from '../../../shared/utils/mockSeedData.js';
import { ROUTES } from '../../../shared/navigation/routes.js';
import LeadCard from '../components/LeadCard.jsx';
import QuickAddLeadModal from '../components/QuickAddLeadModal.jsx';

export const MyLeadsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const searchQuery = useSelector((state) => state.ui.leadsSearchQuery);
  const filterUrgency = useSelector((state) => state.ui.leadsFilterUrgency);
  const filterStage = useSelector((state) => state.ui.leadsFilterStage);

  const [leadsList, setLeadsList] = useState(INITIAL_LEADS);

  // Counts
  const allCount = leadsList.length;
  const overdueCount = leadsList.filter((l) => l.id === 'lead-102').length;
  const dueTodayCount = leadsList.filter((l) => l.id === 'lead-101' || l.id === 'lead-110').length;
  const wonCount = leadsList.filter((l) => (l.status || '').toUpperCase() === 'WON').length;
  const untouchedCount = leadsList.filter(
    (l) => (l.status || '').toUpperCase() === 'NEW' || l.followup_count === 0
  ).length;
  const followupCount = leadsList.filter((l) => (l.status || '').toUpperCase() === 'FOLLOW_UP').length;
  const proposalCount = leadsList.filter(
    (l) => (l.status || '').toUpperCase() === 'PROPOSAL' || (l.status || '').toUpperCase() === 'NEGOTIATION'
  ).length;
  const contactedCount = leadsList.filter((l) => (l.status || '').toUpperCase() === 'CONTACTED').length;

  // Filter evaluation
  let filtered = leadsList;
  const q = (searchQuery || '').trim().toLowerCase();
  if (q) {
    filtered = filtered.filter(
      (l) =>
        (l.name && l.name.toLowerCase().includes(q)) ||
        (l.company_name && l.company_name.toLowerCase().includes(q)) ||
        (l.phone && l.phone.includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q))
    );
  }

  if (filterUrgency === 'overdue') {
    filtered = filtered.filter((l) => l.id === 'lead-102');
  } else if (filterUrgency === 'today') {
    filtered = filtered.filter((l) => l.id === 'lead-101' || l.id === 'lead-110');
  } else if (filterUrgency === 'won') {
    filtered = filtered.filter((l) => (l.status || '').toUpperCase() === 'WON');
  }

  if (filterStage !== 'all') {
    if (filterStage === 'NEW') {
      filtered = filtered.filter(
        (l) => (l.status || '').toUpperCase() === 'NEW' || l.followup_count === 0
      );
    } else if (filterStage === 'PROPOSAL') {
      filtered = filtered.filter(
        (l) => (l.status || '').toUpperCase() === 'PROPOSAL' || (l.status || '').toUpperCase() === 'NEGOTIATION'
      );
    } else {
      filtered = filtered.filter(
        (l) => (l.status || '').toUpperCase() === filterStage.toUpperCase()
      );
    }
  }

  const hasActiveFilters = Boolean(q || filterUrgency !== 'all' || filterStage !== 'all');

  const handleSaveNewLead = (newLead, openDetail = false) => {
    setLeadsList([newLead, ...leadsList]);
    if (openDetail) {
      navigation.navigate(ROUTES.LEAD_DETAIL, { leadId: newLead.id });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Pipeline</Text>
          <Text style={styles.headerSubtitle}>({leadsList.length} leads assigned)</Text>
        </View>

        <TouchableOpacity
          style={styles.addLeadBtn}
          onPress={() => dispatch(setQuickAddModalOpen(true))}
          activeOpacity={0.8}
        >
          <Text style={styles.addLeadBtnText}>+ Add Lead</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search school, contact, phone, city..."
          placeholderTextColor={colors.textDisabled}
          value={searchQuery}
          onChangeText={(val) => dispatch(setLeadsSearchQuery(val))}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => dispatch(setLeadsSearchQuery(''))}>
            <Text style={styles.clearSearchIcon}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Scrollable Filter Chips - Urgency */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        <FilterChip
          label={`All (${allCount})`}
          active={filterUrgency === 'all'}
          onPress={() => dispatch(setLeadsFilterUrgency('all'))}
        />
        <FilterChip
          label={`🚨 Overdue (${overdueCount})`}
          variant="error"
          active={filterUrgency === 'overdue'}
          onPress={() => dispatch(setLeadsFilterUrgency('overdue'))}
        />
        <FilterChip
          label={`⏰ Due Today (${dueTodayCount})`}
          variant="warning"
          active={filterUrgency === 'today'}
          onPress={() => dispatch(setLeadsFilterUrgency('today'))}
        />
        <FilterChip
          label={`🏆 Won (${wonCount})`}
          variant="success"
          active={filterUrgency === 'won'}
          onPress={() => dispatch(setLeadsFilterUrgency('won'))}
        />
      </ScrollView>

      {/* Scrollable Filter Chips - Stage */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipsScroll, { marginTop: -2 }]}
      >
        <FilterChip
          label={`All Stages (${allCount})`}
          active={filterStage === 'all'}
          onPress={() => dispatch(setLeadsFilterStage('all'))}
        />
        <FilterChip
          label={`⚡ Untouched (${untouchedCount})`}
          variant="warning"
          active={filterStage === 'NEW'}
          onPress={() => dispatch(setLeadsFilterStage('NEW'))}
        />
        <FilterChip
          label={`Follow-up (${followupCount})`}
          active={filterStage === 'FOLLOW_UP'}
          onPress={() => dispatch(setLeadsFilterStage('FOLLOW_UP'))}
        />
        <FilterChip
          label={`Proposal (${proposalCount})`}
          active={filterStage === 'PROPOSAL'}
          onPress={() => dispatch(setLeadsFilterStage('PROPOSAL'))}
        />
        <FilterChip
          label={`Contacted (${contactedCount})`}
          active={filterStage === 'CONTACTED'}
          onPress={() => dispatch(setLeadsFilterStage('CONTACTED'))}
        />
        <FilterChip
          label={`Won (${wonCount})`}
          variant="success"
          active={filterStage === 'WON'}
          onPress={() => dispatch(setLeadsFilterStage('WON'))}
        />
      </ScrollView>

      {/* Result Meta Bar */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          Showing <Text style={{ fontWeight: '700' }}>{filtered.length}</Text> of {allCount} leads
        </Text>
        {hasActiveFilters ? (
          <TouchableOpacity onPress={() => dispatch(clearLeadsFilters())}>
            <Text style={styles.resetFiltersText}>Reset Filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Leads List Feed */}
      <ScrollView
        contentContainerStyle={styles.leadsFeed}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matching leads"
            message="Try adjusting your search terms or active filter chips."
            actionLabel="Clear All Filters"
            onAction={() => dispatch(clearLeadsFilters())}
          />
        ) : (
          filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onPress={() => navigation.navigate(ROUTES.LEAD_DETAIL, { leadId: lead.id })}
            />
          ))
        )}
      </ScrollView>

      {/* Quick Add Lead Modal */}
      <QuickAddLeadModal onSaveLead={handleSaveNewLead} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  addLeadBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  addLeadBtnText: {
    ...typography.captionBold,
    color: colors.textOnPrimary,
    fontSize: 11,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    marginHorizontal: spacing.pagePaddingHorizontal,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    height: 38,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    fontSize: 12,
    color: colors.textPrimary,
    padding: 0,
  },
  clearSearchIcon: {
    fontSize: 14,
    color: colors.textSecondary,
    padding: 4,
  },
  chipsScroll: {
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingVertical: 4,
  },
  metaText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  resetFiltersText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.primary,
  },
  leadsFeed: {
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingBottom: 40,
    gap: 8,
  },
});

export default MyLeadsScreen;
