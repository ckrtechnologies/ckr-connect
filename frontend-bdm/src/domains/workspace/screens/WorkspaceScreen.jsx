import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
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
import { FollowupsTab } from '../components/FollowupsTab.jsx';
import { useGetBdmDashboardQuery } from '../api.js';
import { setQuickAddModalOpen } from '../../../shared/store/uiSlice.js';
import { ROUTES } from '../../../shared/navigation/routes.js';
import { logout, updateUserAvatar } from '../../auth/slice.js';
import { storage } from '../../../shared/utils/storage.js';
import { API_BASE_URL } from '../../../shared/store/baseApi.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

export const WorkspaceScreen = ({ navigation }) => {
  const [activeSubTab, setActiveSubTab] = useState('today'); // 'today' | 'funnel' | 'performance'
  const { data: dashboardData, isLoading, refetch, isFetching } = useGetBdmDashboardQuery();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  const { showAlert, AlertComponent } = useAlert();

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
    totalCount: Number(kpis.assigned_leads_count) || 0,
    totalValue: Number(kpis.total_pipeline_value) || 0,
  };

  // Filter recent activities to only today's for the ledger feed
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;

  const todayInteractionsFeed = recentActivities.filter((i) => {
    if (!i.created_at) return false;
    const d = new Date(i.created_at);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return dStr === todayStr;
  });

  const handleOpenLead = (leadId) => {
    navigation.navigate(ROUTES.LEAD_DETAIL, { leadId });
  };

  const handleNavigateToLeads = (stageFilter = 'all') => {
    navigation.navigate(ROUTES.MY_LEADS, { stageFilter });
  };

  const handleLogout = () => {
    showAlert('confirm', 'Sign Out', 'Are you sure you want to sign out of CKR Connect?', {
      confirmLabel: 'Sign Out',
      cancelLabel: 'Stay Signed In',
      onConfirm: async () => {
        await storage.clearSession();
        dispatch(logout());
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {AlertComponent}
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandIconMini}>
            {currentUser?.avatar_url ? (
              <Image 
                source={{ uri: `${API_BASE_URL}${currentUser.avatar_url}` }} 
                style={styles.avatarImage} 
                onError={(e) => {
                  console.log('Image Load Error Workspace:', e.nativeEvent.error);
                  showAlert('error', 'Image Error', `Failed to load: ${API_BASE_URL}${currentUser.avatar_url}`);
                }}
              />
            ) : (
              <Text style={styles.brandIconMiniText}>
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'CKR'}
              </Text>
            )}
          </View>
          <View>
            <Text style={styles.topBarTitle}>My Workspace</Text>
            <Text style={styles.topBarSubtitle}>
              {currentUser?.name || currentUser?.email || 'BDM Executive'}
            </Text>
          </View>
        </View>

        <View style={styles.topBarActions}>
          <FluentButton
            title="+ Add"
            onPress={() => {
              dispatch(setQuickAddModalOpen(true));
            }}
            variant="primary"
            size="small"
            style={styles.addLeadPill}
          />
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
            style={[styles.tabItem, activeSubTab === 'followups' && styles.tabItemActive]}
            onPress={() => setActiveSubTab('followups')}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabText, activeSubTab === 'followups' && styles.tabTextActive]}
            >
              Follow-ups
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
              isPunchedIn={Boolean(kpis.attendance_marked && !kpis.punch_out_time)}
              isPunchedOut={Boolean(kpis.punch_out_time)}
              punchInTime={kpis.punch_in_time}
              punchOutTime={kpis.punch_out_time}
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
              onCallNowPress={() => handleNavigateToLeads('new')}
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
              targetCount={Number(kpis.daily_call_target) || 15}
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
              interactions={todayInteractionsFeed}
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
        ) : activeSubTab === 'followups' ? (
          <FollowupsTab
            overdueLeads={overdueLeads}
            todayFollowups={todayFollowups}
            onOpenLead={handleOpenLead}
          />
        ) : null}
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIconMini: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconMiniText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  topBarSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addLeadPill: {
    minHeight: 28,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
  },
  signOutBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
  },
  signOutBtnText: {
    fontSize: 11,
    color: colors.error,
    fontWeight: '600',
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
