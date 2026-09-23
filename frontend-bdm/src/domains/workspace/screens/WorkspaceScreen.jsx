import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../shared/theme/index.js';
import { FluentButton } from '../../../shared/components/index.js';
import {
  setWorkspaceTab,
  setLeadsFilterStage,
  setLeadsFilterUrgency,
  setQuickAddModalOpen,
  toggleAttendancePunch,
} from '../../../shared/store/slices/uiSlice.js';
import {
  INITIAL_LEADS,
  INITIAL_INTERACTIONS,
} from '../../../shared/utils/mockSeedData.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

// Sub-components
import PunchStatusCard from '../components/PunchStatusCard.jsx';
import UntouchedAlertBanner from '../components/UntouchedAlertBanner.jsx';
import PipelineMatrixGrid from '../components/PipelineMatrixGrid.jsx';
import CallingTargetCard from '../components/CallingTargetCard.jsx';
import CallLedgerFeed from '../components/CallLedgerFeed.jsx';
import FunnelTab from '../components/FunnelTab.jsx';
import PerformanceTab from '../components/PerformanceTab.jsx';

export const WorkspaceScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const currentTab = useSelector((state) => state.ui.workspaceTab || 'today');
  const isPunchedIn = useSelector((state) => state.ui.isPunchedIn);
  const lastPunchTime = useSelector((state) => state.ui.lastPunchTime);

  const leads = INITIAL_LEADS;
  const interactions = INITIAL_INTERACTIONS;

  // Breakdown calculations
  const newUntouchedLeads = leads.filter(
    (l) => (l.status || '').toLowerCase() === 'new' || l.followup_count === 0
  );
  const contactedLeads = leads.filter((l) => (l.status || '').toLowerCase() === 'contacted');
  const followupLeads = leads.filter((l) => (l.status || '').toLowerCase() === 'follow_up');
  const proposalLeads = leads.filter(
    (l) => (l.status || '').toLowerCase() === 'proposal' || (l.status || '').toLowerCase() === 'negotiation'
  );
  const wonLeads = leads.filter((l) => (l.status || '').toLowerCase() === 'won');

  const untouchedValue = newUntouchedLeads.reduce((sum, l) => sum + (l.expected_value || l.budget || 0), 0);
  const proposalValue = proposalLeads.reduce((sum, l) => sum + (l.expected_value || l.budget || 0), 0);
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.won_amount || l.expected_value || 0), 0);
  const totalValue = leads.reduce((sum, l) => sum + (l.expected_value || l.budget || 0), 0);

  // Navigation handlers
  const handleOpenLead = (leadId) => {
    navigation.navigate(ROUTES.LEAD_DETAIL, { leadId });
  };

  const handleFilterStage = (stage) => {
    dispatch(setLeadsFilterStage(stage));
    navigation.navigate(ROUTES.MY_LEADS);
  };

  const handleFilterUrgency = (urgency) => {
    dispatch(setLeadsFilterUrgency(urgency));
    navigation.navigate(ROUTES.MY_LEADS);
  };

  return (
    <View style={styles.container}>
      {/* 3 Header Segmented Sub-Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'today' && styles.activeTabItem]}
          onPress={() => dispatch(setWorkspaceTab('today'))}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, currentTab === 'today' && styles.activeTabText]}>
            Today's Activity
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'funnel' && styles.activeTabItem]}
          onPress={() => dispatch(setWorkspaceTab('funnel'))}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, currentTab === 'funnel' && styles.activeTabText]}>
            Pipeline Funnel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, currentTab === 'performance' && styles.activeTabItem]}
          onPress={() => dispatch(setWorkspaceTab('performance'))}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, currentTab === 'performance' && styles.activeTabText]}>
            My Performance
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentTab === 'today' ? (
          <>
            {/* Punch Status Card */}
            <PunchStatusCard
              isPunchedIn={isPunchedIn}
              lastPunchTime={lastPunchTime}
              onTogglePunch={() => dispatch(toggleAttendancePunch())}
            />

            {/* Quick Actions Bar */}
            <View style={styles.quickActionsRow}>
              <FluentButton
                variant="primary"
                size="sm"
                title="➕ Add Inbound Lead"
                onPress={() => dispatch(setQuickAddModalOpen(true))}
                style={styles.quickBtn}
              />
              <FluentButton
                variant="secondary"
                size="sm"
                title={`📋 My Pipeline (${leads.length})`}
                onPress={() => navigation.navigate(ROUTES.MY_LEADS)}
                style={styles.quickBtn}
              />
            </View>

            {/* High Urgency Alert Banner for Untouched Leads */}
            <UntouchedAlertBanner
              count={newUntouchedLeads.length}
              onCallNow={() => handleFilterStage('NEW')}
            />

            {/* 2-Column Pipeline Matrix */}
            <PipelineMatrixGrid
              newCount={newUntouchedLeads.length}
              newValue={untouchedValue}
              followupCount={followupLeads.length}
              contactedCount={contactedLeads.length}
              proposalCount={proposalLeads.length}
              proposalValue={proposalValue}
              wonCount={wonLeads.length}
              wonValue={wonValue}
              totalCount={leads.length}
              totalValue={totalValue}
              onSelectStage={handleFilterStage}
              onSelectUrgency={handleFilterUrgency}
            />

            {/* Calling Targets Scorecard */}
            <CallingTargetCard
              completedCount={interactions.length}
              dailyTarget={15}
              positiveCount={interactions.filter((i) => i.call_result_type === 'positive').length}
              neutralCount={interactions.filter((i) => i.call_result_type === 'neutral').length}
              meetingCount={interactions.filter((i) => i.type === 'meeting').length}
            />

            {/* Quick Action Navigation Bar */}
            <View style={styles.actionRow}>
              <FluentButton
                variant="primary"
                size="md"
                title="+ Log Call / Interaction"
                onPress={() => navigation.navigate(ROUTES.LOG_FOLLOWUP, { leadId: 'lead-101' })}
                style={styles.logCallBtn}
              />
              <FluentButton
                variant="secondary"
                size="md"
                title="Filter My Leads ›"
                onPress={() => navigation.navigate(ROUTES.MY_LEADS)}
                style={styles.filterLeadsBtn}
              />
            </View>

            {/* Today's Call Ledger Feed */}
            <CallLedgerFeed
              interactions={interactions}
              leads={leads}
              onSelectLead={handleOpenLead}
            />
          </>
        ) : currentTab === 'funnel' ? (
          <FunnelTab onOpenLead={handleOpenLead} />
        ) : (
          <PerformanceTab />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: 3,
    marginHorizontal: spacing.pagePaddingHorizontal,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  tabItem: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  activeTabItem: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.pagePaddingHorizontal,
    paddingBottom: 40,
    gap: 8,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickBtn: {
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: spacing.xs,
  },
  logCallBtn: {
    flex: 1,
  },
  filterLeadsBtn: {
    paddingHorizontal: 12,
  },
});

export default WorkspaceScreen;
