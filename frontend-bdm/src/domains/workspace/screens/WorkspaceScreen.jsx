import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { PunchStatusCard } from '../components/PunchStatusCard.jsx';
import { UntouchedAlertBanner } from '../components/UntouchedAlertBanner.jsx';
import { PipelineMatrixGrid } from '../components/PipelineMatrixGrid.jsx';
import { CallingTargetCard } from '../components/CallingTargetCard.jsx';
import { CallLedgerFeed } from '../components/CallLedgerFeed.jsx';
import { FunnelTab } from '../components/FunnelTab.jsx';
import { PerformanceTab } from '../components/PerformanceTab.jsx';
import { useGetBdmDashboardQuery } from '../api.js';
import { setQuickAddModalOpen } from '../../../shared/store/uiSlice.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const WorkspaceScreen = ({ navigation }) => {
  const [activeSubTab, setActiveSubTab] = useState('today'); // 'today' | 'funnel' | 'performance'
  const { data: dashboardData, isLoading, refetch, isFetching } = useGetBdmDashboardQuery();
  const dispatch = useDispatch();

  const kpis = dashboardData?.kpis || {};
  const recentActivities = dashboardData?.recent_activities || [];
  const overdueLeads = dashboardData?.overdue_leads || [];
  const todayFollowups = dashboardData?.today_followups || [];

  // Derived matrix data
  const matrix = {
    untouchedCount: Number(kpis.untouched_leads_count) || 0,
    untouchedValue: Number(kpis.untouched_pipeline_value) || 0,
    followupCount: todayFollowups.length || 0,
    contactedCount: Number(kpis.contacted_leads_count) || 0,
    contactedValue: Number(kpis.contacted_pipeline_value) || 0,
    proposalCount: Number(kpis.proposal_leads_count) || 0,
    proposalValue: Number(kpis.proposal_pipeline_value) || 0,
    wonCount: Number(kpis.won_deals_count ?? kpis.won_leads_count) || 0,
    wonValue: Number(kpis.won_revenue) || 0,
    totalCount: Number(kpis.active_pipeline_count ?? kpis.assigned_leads_count) || 0,
    totalValue: Number(kpis.active_pipeline_value ?? kpis.total_pipeline_value) || 0,
  };

  const handleOpenLead = (leadId) => {
    navigation.navigate(ROUTES.LEAD_DETAIL, { leadId });
  };

  const handleNavigateToLeads = (stageFilter = 'all') => {
    navigation.navigate(ROUTES.MY_LEADS, { stageFilter });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>My Workspace</Text>
        <FluentButton
          title="+ Add Lead"
          onPress={() => {
            console.log('>>> Add Lead button tapped! Dispatching setQuickAddModalOpen(true)');
            dispatch(setQuickAddModalOpen(true));
          }}
          variant="primary"
          size="small"
          style={styles.addLeadPill}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />
        }
      >
        {/* Segmented Sub-Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeSubTab === 'today' && styles.tabItemActive]}
            onPress={() => setActiveSubTab('today')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, activeSubTab === 'today' && styles.tabTextActive]}
            >
              Today's Activity
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeSubTab === 'funnel' && styles.tabItemActive]}
            onPress={() => setActiveSubTab('funnel')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, activeSubTab === 'funnel' && styles.tabTextActive]}
            >
              Pipeline Funnel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeSubTab === 'performance' && styles.tabItemActive]}
            onPress={() => setActiveSubTab('performance')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, activeSubTab === 'performance' && styles.tabTextActive]}
            >
              My Performance
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Syncing sales workspace...</Text>
          </View>
        ) : activeSubTab === 'today' ? (
          <>
            {/* 1. Punch Status Header Card */}
            <PunchStatusCard
              isPunchedIn={Boolean(kpis.attendance_marked)}
              punchInTime={kpis.punch_in_time}
              onPunchOutPress={() => navigation.navigate(ROUTES.ATTENDANCE)}
              onNavigateToPunch={() => navigation.navigate(ROUTES.ATTENDANCE)}
            />

            {/* 2. Quick Action Bar */}
            <View style={styles.quickActionsRow}>
              <FluentButton
                title="➕ Add Inbound Lead"
                onPress={() => dispatch(setQuickAddModalOpen(true))}
                variant="primary"
                size="medium"
                style={styles.quickActionBtn}
              />
              <FluentButton
                title={`📋 My Pipeline (${matrix.totalCount})`}
                onPress={() => handleNavigateToLeads('all')}
                variant="secondary"
                size="medium"
                style={styles.quickActionBtn}
              />
            </View>

            {/* 3. High Urgency Alert: Untouched Leads */}
            <UntouchedAlertBanner
              count={matrix.untouchedCount}
              onCallNowPress={() => handleNavigateToLeads('NEW')}
            />

            {/* 4. My Leads Pipeline Matrix (2-Column Grid) */}
            <PipelineMatrixGrid
              matrix={matrix}
              onSelectStage={(stage) => handleNavigateToLeads(stage)}
              onViewAll={() => handleNavigateToLeads('all')}
            />

            {/* 5. Daily Calling Target & Performance Scorecard */}
            <CallingTargetCard
              loggedCount={kpis.today_interactions?.total_today ?? recentActivities.length}
              targetCount={15}
              positiveCount={
                kpis.today_interactions?.connected_calls ??
                recentActivities.filter((i) => i.call_result_type === 'positive').length
              }
              neutralCount={recentActivities.filter((i) => i.call_result_type === 'neutral').length}
              demoCount={
                kpis.today_interactions?.meetings ??
                recentActivities.filter((i) => i.type === 'meeting' || i.channel === 'meeting').length
              }
            />

            {/* 6. Today's Call Ledger & Results Feed */}
            <CallLedgerFeed
              interactions={recentActivities}
              onSelectLead={handleOpenLead}
            />
          </>
        ) : activeSubTab === 'funnel' ? (
          <FunnelTab
            stageCounts={{
              new: matrix.untouchedCount,
              contacted: matrix.contactedCount,
              follow_up: matrix.followupCount,
              proposal: matrix.proposalCount,
              wonRevenue: matrix.wonValue,
            }}
            overdueLeads={overdueLeads}
            onOpenLead={handleOpenLead}
          />
        ) : (
          <PerformanceTab kpis={kpis} />
        )}
      </ScrollView>
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
  topBarTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  addLeadPill: {
    minHeight: 28,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: 2,
    marginBottom: spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xs,
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 11,
  },
  tabTextActive: {
    color: colors.textOnPrimary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionBtn: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
