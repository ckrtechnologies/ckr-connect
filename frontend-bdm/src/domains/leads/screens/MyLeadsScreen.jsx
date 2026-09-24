import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { FilterChip } from '../../../shared/components/FilterChip.jsx';
import { EmptyState } from '../../../shared/components/EmptyState.jsx';
import { LeadCardItem } from '../components/LeadCardItem.jsx';
import { useGetMyLeadsQuery } from '../api.js';
import {
  setSearchQuery,
  setUrgencyFilter,
  setStageFilter,
  resetFilters,
} from '../slice.js';
import { setQuickAddModalOpen } from '../../../shared/store/uiSlice.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const MyLeadsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { searchQuery, urgencyFilter, stageFilter } = useSelector((state) => state.leads);

  // Allow setting initial stage from route params (e.g. from Dashboard matrix click)
  useEffect(() => {
    if (route.params?.stageFilter) {
      dispatch(setStageFilter(route.params.stageFilter));
    }
  }, [route.params?.stageFilter]);

  const { data: leadsData, isLoading, refetch, isFetching } = useGetMyLeadsQuery({
    search: searchQuery || undefined,
    status: stageFilter !== 'all' ? stageFilter.toLowerCase() : undefined,
  });

  const rawLeads = leadsData?.items || [];

  // Filter client-side by urgency chips
  const filteredLeads = rawLeads.filter((l) => {
    const isUntouched = (l.status || '').toLowerCase() === 'new' || l.followup_count === 0;
    const isWon = (l.status || '').toLowerCase() === 'won';
    const isOverdue = l.is_overdue || (l.next_followup_date && new Date(l.next_followup_date) < new Date());
    const isDueToday = l.is_due_today;

    if (urgencyFilter === 'overdue') return isOverdue;
    if (urgencyFilter === 'today') return isDueToday;
    if (urgencyFilter === 'won') return isWon;

    if (stageFilter === 'NEW') return isUntouched;
    return true;
  });

  const hasActiveFilters = searchQuery !== '' || urgencyFilter !== 'all' || stageFilter !== 'all';

  const handleOpenLead = (leadId) => {
    navigation.navigate(ROUTES.LEAD_DETAIL, { leadId });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Pipeline</Text>
          <Text style={styles.subtitle}>
            ({rawLeads.length} leads assigned)
          </Text>
        </View>
        <FluentButton
          title="+ Add Lead"
          onPress={() => dispatch(setQuickAddModalOpen(true))}
          variant="primary"
          size="small"
          style={styles.addLeadBtn}
        />
      </View>

      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search school, contact, phone, city..."
          placeholderTextColor={colors.textDisabled}
          value={searchQuery}
          onChangeText={(txt) => dispatch(setSearchQuery(txt))}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => dispatch(setSearchQuery(''))}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Urgency Filter Chips (Horizontal Scrolling) */}
      <View style={styles.chipsScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <FilterChip
            label="All"
            active={urgencyFilter === 'all'}
            onPress={() => dispatch(setUrgencyFilter('all'))}
            badge={rawLeads.length}
          />
          <FilterChip
            label="🚨 Overdue"
            variant="error"
            active={urgencyFilter === 'overdue'}
            onPress={() => dispatch(setUrgencyFilter('overdue'))}
          />
          <FilterChip
            label="⏰ Due Today"
            variant="warning"
            active={urgencyFilter === 'today'}
            onPress={() => dispatch(setUrgencyFilter('today'))}
          />
          <FilterChip
            label="🏆 Won"
            variant="success"
            active={urgencyFilter === 'won'}
            onPress={() => dispatch(setUrgencyFilter('won'))}
          />
        </ScrollView>
      </View>

      {/* Stage Filter Chips (Horizontal Scrolling) */}
      <View style={styles.chipsScrollWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          <FilterChip
            label="All Stages"
            active={stageFilter === 'all'}
            onPress={() => dispatch(setStageFilter('all'))}
          />
          <FilterChip
            label="⚡ Untouched"
            active={stageFilter === 'NEW'}
            onPress={() => dispatch(setStageFilter('NEW'))}
          />
          <FilterChip
            label="Follow-up"
            active={stageFilter === 'FOLLOW_UP'}
            onPress={() => dispatch(setStageFilter('FOLLOW_UP'))}
          />
          <FilterChip
            label="Proposal"
            active={stageFilter === 'PROPOSAL'}
            onPress={() => dispatch(setStageFilter('PROPOSAL'))}
          />
          <FilterChip
            label="Contacted"
            active={stageFilter === 'CONTACTED'}
            onPress={() => dispatch(setStageFilter('CONTACTED'))}
          />
          <FilterChip
            label="Won"
            active={stageFilter === 'WON'}
            onPress={() => dispatch(setStageFilter('WON'))}
          />
        </ScrollView>
      </View>

      {/* Counter & Reset action */}
      <View style={styles.metaRow}>
        <Text style={styles.counterText}>
          Showing <Text style={styles.counterBold}>{filteredLeads.length}</Text> of {rawLeads.length} leads
        </Text>
        {hasActiveFilters ? (
          <TouchableOpacity onPress={() => dispatch(resetFilters())}>
            <Text style={styles.resetText}>Reset Filters</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onRefresh={refetch}
        refreshing={isFetching}
        renderItem={({ item }) => (
          <LeadCardItem
            lead={item}
            onPress={() => handleOpenLead(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <EmptyState
              title="No matching leads"
              message="Try adjusting your search terms or active filter chips."
              actionLabel="Clear All Filters"
              onAction={() => dispatch(resetFilters())}
            />
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  addLeadBtn: {
    minHeight: 28,
    borderRadius: radius.pill,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    height: 40,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipsScrollWrapper: {
    marginTop: spacing.xs,
  },
  chipsRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  counterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  counterBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  resetText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxxl,
  },
  loader: {
    marginTop: spacing.xxl,
  },
});
