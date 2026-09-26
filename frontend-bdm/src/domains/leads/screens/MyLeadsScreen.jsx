import React, { useState, useEffect, useMemo } from 'react';
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
import { LeadFilterBottomSheet } from '../components/LeadFilterBottomSheet.jsx';
import { useGetMyLeadsQuery } from '../api.js';
import {
  setSearchQuery,
  setUrgencyFilter,
  setStageFilter,
  setAllFilters,
  resetFilters,
} from '../slice.js';
import { setQuickAddModalOpen } from '../../../shared/store/uiSlice.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const MyLeadsScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { searchQuery, urgencyFilter, stageFilter, priorityFilter, sortFilter } = useSelector(
    (state) => state.leads
  );

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Sync initial stage from route params (e.g. from Dashboard matrix click)
  useEffect(() => {
    if (route.params?.stageFilter) {
      dispatch(setStageFilter(route.params.stageFilter));
    }
  }, [route.params?.stageFilter]);

  const [page, setPage] = useState(1);
  const LIMIT = 100;

  // Determine sort_by and sort_order from sortFilter
  const sortConfig = useMemo(() => {
    switch (sortFilter) {
      case 'created_asc':
        return { sort_by: 'created_at', sort_order: 'ASC' };
      case 'value_desc':
        return { sort_by: 'expected_value', sort_order: 'DESC' };
      case 'value_asc':
        return { sort_by: 'expected_value', sort_order: 'ASC' };
      case 'created_desc':
      default:
        return { sort_by: 'created_at', sort_order: 'DESC' };
    }
  }, [sortFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, stageFilter, urgencyFilter, priorityFilter, sortFilter]);

  const { data: leadsData, isLoading, refetch, isFetching } = useGetMyLeadsQuery({
    search: searchQuery?.trim() || undefined,
    status: stageFilter !== 'all' ? stageFilter : undefined,
    urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    sort_by: sortConfig.sort_by,
    sort_order: sortConfig.sort_order,
    limit: LIMIT,
    page,
  });

  const rawLeads = leadsData?.items || [];
  const totalLeads = leadsData?.pagination?.total || 0;
  
  const handleLoadMore = () => {
    if (leadsData?.pagination && page < leadsData.pagination.totalPages && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  // Client-side fallback matching including wildcard support
  const filteredLeads = useMemo(() => {
    return rawLeads.filter((l) => {
      // 1. Wildcard search matching (handles '*' and substring)
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const searchableText = `${l.name || ''} ${l.company_name || ''} ${l.phone || ''} ${
          l.email || ''
        } ${l.city || ''} ${l.sub_requirement || ''}`.toLowerCase();

        if (q.includes('*')) {
          const parts = q.split('*').filter(Boolean);
          const matchesAll = parts.every((part) => searchableText.includes(part));
          if (!matchesAll) return false;
        } else {
          if (!searchableText.includes(q)) return false;
        }
      }

      // 2. Stage filter
      if (stageFilter && stageFilter !== 'all') {
        const leadStatus = (l.status || '').toLowerCase().replace(/-/g, '_');
        if (stageFilter === 'new') {
          if (leadStatus !== 'new' || l.followup_count > 0) return false;
        } else if (stageFilter === 'follow_up') {
          if (leadStatus !== 'follow_up' && !l.next_followup_date) return false;
        } else if (leadStatus !== stageFilter) {
          return false;
        }
      }

      // 3. Urgency filter
      if (urgencyFilter && urgencyFilter !== 'all') {
        const isWon = (l.status || '').toLowerCase() === 'won';
        const isOverdue =
          Boolean(l.is_overdue) ||
          (l.next_followup_date && new Date(l.next_followup_date) < new Date());
        const isDueToday = Boolean(l.is_due_today);

        if (urgencyFilter === 'overdue' && !isOverdue) return false;
        if (urgencyFilter === 'today' && !isDueToday) return false;
        if (urgencyFilter === 'won' && !isWon) return false;
      }

      // 4. Priority filter
      if (priorityFilter && priorityFilter !== 'all') {
        if ((l.priority || '').toLowerCase() !== priorityFilter) return false;
      }

      return true;
    });
  }, [rawLeads, searchQuery, stageFilter, urgencyFilter, priorityFilter]);

  const activeFiltersCount = [
    stageFilter !== 'all',
    urgencyFilter !== 'all',
    priorityFilter !== 'all',
    sortFilter !== 'created_desc',
  ].filter(Boolean).length;

  const hasActiveFilters = searchQuery !== '' || activeFiltersCount > 0;

  const handleOpenLead = (leadId) => {
    navigation.navigate(ROUTES.LEAD_DETAIL, { leadId });
  };

  const handleApplyFilters = (filters) => {
    dispatch(setAllFilters(filters));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Pipeline</Text>
          <Text style={styles.subtitle}>
            ({totalLeads} leads assigned)
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

      {/* Search Input Box & Filter Button Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search school, phone, city, *wildcard..."
            placeholderTextColor={colors.textDisabled}
            value={searchQuery}
            onChangeText={(txt) => dispatch(setSearchQuery(txt))}
            autoCapitalize="none"
            returnKeyType="search"
            blurOnSubmit={false}
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

        {/* Dedicated 2-Column Bottom Sheet Trigger */}
        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            activeFiltersCount > 0 && styles.filterTriggerBtnActive,
          ]}
          onPress={() => setIsFilterModalOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.filterTriggerIcon}>⚡</Text>
          <Text
            style={[
              styles.filterTriggerText,
              activeFiltersCount > 0 && styles.filterTriggerTextActive,
            ]}
          >
            Filter {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stage Filter Chips (Horizontal Scrolling) */}
      <View style={styles.chipsScrollWrapper}>
        <View style={styles.chipsRow}>
          <FilterChip
            label="All Stages"
            active={stageFilter === 'all'}
            onPress={() => dispatch(setStageFilter('all'))}
          />
          <FilterChip
            label="⚡ Untouched"
            active={stageFilter === 'new'}
            onPress={() => dispatch(setStageFilter('new'))}
          />
          <FilterChip
            label="Contacted"
            active={stageFilter === 'contacted'}
            onPress={() => dispatch(setStageFilter('contacted'))}
          />
          <FilterChip
            label="Follow-up"
            active={stageFilter === 'follow_up'}
            onPress={() => dispatch(setStageFilter('follow_up'))}
          />
          <FilterChip
            label="Proposal"
            active={stageFilter === 'proposal'}
            onPress={() => dispatch(setStageFilter('proposal'))}
          />
          <FilterChip
            label="Won"
            active={stageFilter === 'won'}
            onPress={() => dispatch(setStageFilter('won'))}
          />
        </View>
      </View>

      {/* Counter & Reset Action */}
      <View style={styles.metaRow}>
        <Text style={styles.counterText}>
          Showing <Text style={styles.counterBold}>{filteredLeads.length}</Text> of {totalLeads} leads
        </Text>
        {hasActiveFilters ? (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={styles.resetText}>Reset All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Leads List */}
      <FlatList
        data={filteredLeads}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        onRefresh={() => {
          setPage(1);
          refetch();
        }}
        refreshing={isFetching && page === 1}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetching && page > 1 ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ margin: spacing.md }} />
          ) : null
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <LeadCardItem
            lead={item}
            onPress={() => handleOpenLead(item.id)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={styles.loader}
            />
          ) : (
            <EmptyState
              icon="🔍"
              title="No Leads Found"
              subtitle={
                hasActiveFilters
                  ? 'No leads match your active filters or wildcard search. Try resetting filters.'
                  : 'You do not have any leads in this pipeline stage.'
              }
              actionTitle={hasActiveFilters ? 'Clear Filters' : '+ Add New Lead'}
              onActionPress={() => {
                if (hasActiveFilters) {
                  handleResetFilters();
                } else {
                  dispatch(setQuickAddModalOpen(true));
                }
              }}
            />
          )
        }
      />

      {/* Dedicated 2-Column Bottom Sheet Filter Panel */}
      <LeadFilterBottomSheet
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        activeFilters={{
          stage: stageFilter,
          urgency: urgencyFilter,
          priority: priorityFilter,
          sort: sortFilter,
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
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
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  addLeadBtn: {
    minWidth: 90,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    paddingVertical: 0,
    height: '100%',
  },
  clearBtn: {
    padding: spacing.xs,
  },
  clearBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  filterTriggerBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterTriggerIcon: {
    fontSize: 14,
  },
  filterTriggerText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 12,
  },
  filterTriggerTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  chipsScrollWrapper: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.xs + 2,
  },
  chipsRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
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
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  loader: {
    marginTop: spacing.xxl,
  },
});
