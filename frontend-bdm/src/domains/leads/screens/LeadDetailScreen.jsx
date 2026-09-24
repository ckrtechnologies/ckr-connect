import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
import { ProcessFlowBar } from '../../../shared/components/ProcessFlowBar.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { LeadSpecsTable } from '../components/LeadSpecsTable.jsx';
import { WaterfallNode } from '../../../shared/components/WaterfallNode.jsx';
import { useGetLeadDetailQuery, useUpdateLeadStatusMutation } from '../api.js';
import { openWonModal, openDropoffModal } from '../../../shared/store/uiSlice.js';
import { formatCurrency } from '../../../shared/utils/formatters.js';
import { makePhoneCall, openWhatsApp, sendEmail } from '../../../shared/utils/communication.js';
import { ROUTES } from '../../../shared/navigation/routes.js';

export const LeadDetailScreen = ({ route, navigation }) => {
  const { leadId } = route.params;
  const dispatch = useDispatch();

  const { data: lead, isLoading, refetch } = useGetLeadDetailQuery(leadId);
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateLeadStatusMutation();

  if (isLoading || !lead) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lead specifications...</Text>
      </SafeAreaView>
    );
  }

  const isWon = (lead.status || '').toLowerCase() === 'won';
  const isUntouched = (lead.status || '').toLowerCase() === 'new' || lead.followup_count === 0;
  const interactions = lead.interactions || [];

  const handleStageChange = async (newStage) => {
    if (newStage === 'won') {
      dispatch(openWonModal(lead.id));
      return;
    }
    if (newStage === 'lost' || newStage === 'invalid') {
      dispatch(openDropoffModal({ leadId: lead.id, defaultStage: newStage }));
      return;
    }

    try {
      await updateStatus({
        id: lead.id,
        status: newStage,
      }).unwrap();
      Alert.alert('Stage Advanced', `Opportunity moved to ${newStage.toUpperCase()}.`);
      refetch();
    } catch (err) {
      Alert.alert('Update Failed', err?.data?.message || 'Could not advance stage.');
    }
  };

  const probability =
    lead.status === 'won'
      ? 100
      : lead.status === 'proposal'
      ? 75
      : lead.status === 'follow_up'
      ? 50
      : lead.status === 'contacted'
      ? 25
      : 10;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹ My Leads</Text>
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>LEAD PROFILE</Text>
        <StatusBadge status={lead.status} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. Key Entity Header Card */}
        <FluentCard
          style={[
            styles.entityCard,
            isWon && styles.cardWon,
            isUntouched && styles.cardUntouched,
          ]}
        >
          <View style={styles.nameHeader}>
            <View style={styles.nameRow}>
              <Text style={styles.leadName}>{lead.name}</Text>
              {isUntouched ? (
                <View style={styles.untouchedTag}>
                  <Text style={styles.untouchedTagText}>⚡ Untouched</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.companySub}>
              🏢 {lead.company_name || 'Individual'} {lead.city ? `· 📍 ${lead.city}, ${lead.state || ''}` : ''}
            </Text>
          </View>

          {/* Deal Highlight Box */}
          <View style={styles.metricsBox}>
            <View>
              <Text style={styles.metricLabel}>FORECAST VALUE</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(lead.expected_value || lead.budget || 0)}
              </Text>
            </View>
            <View style={styles.rightMetricCol}>
              <View
                style={[
                  styles.priorityBadge,
                  lead.priority === 'high' ? styles.priorityHigh : styles.priorityMed,
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    lead.priority === 'high' ? styles.priorityHighText : styles.priorityMedText,
                  ]}
                >
                  {(lead.priority || 'medium').toUpperCase()} PRIORITY
                </Text>
              </View>
              <Text style={styles.dealTypeSub}>
                {lead.deal_type === 'new_business' ? 'New Business' : 'Upsell'} · {probability}% Win
              </Text>
            </View>
          </View>

          {/* Direct Communication Touch Targets (US-06) */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactBtn, styles.callBtn]}
              onPress={() => makePhoneCall(lead.phone)}
              activeOpacity={0.8}
            >
              <Text style={styles.contactBtnIcon}>📞</Text>
              <Text style={[styles.contactBtnText, styles.callBtnText]}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, styles.waBtn]}
              onPress={() => openWhatsApp(lead.phone, `Hi ${lead.name}, regarding your requirement.`)}
              activeOpacity={0.8}
            >
              <Text style={styles.contactBtnIcon}>💬</Text>
              <Text style={[styles.contactBtnText, styles.waBtnText]}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => sendEmail(lead.email, `CKR Technologies — Discussion with ${lead.name}`)}
              activeOpacity={0.8}
            >
              <Text style={styles.contactBtnIcon}>✉️</Text>
              <Text style={styles.contactBtnText}>Email</Text>
            </TouchableOpacity>
          </View>
        </FluentCard>

        {/* 2. Pipeline Progress Stepper (BPF) */}
        <FluentCard>
          <View style={styles.bpfHeader}>
            <Text style={styles.bpfTitle}>Pipeline Progress</Text>
            <Text style={styles.bpfSubtitle}>Tap chevron to advance stage</Text>
          </View>
          <ProcessFlowBar
            currentStatus={lead.status}
            onSelectStage={handleStageChange}
            disabled={isUpdatingStatus}
          />
        </FluentCard>

        {/* 3. Primary Actions Bar */}
        <View style={styles.actionsBar}>
          {!isWon ? (
            <FluentButton
              title="🏆 Close Deal as Won"
              onPress={() => dispatch(openWonModal(lead.id))}
              variant="success"
              size="large"
              style={styles.wonBtn}
            />
          ) : (
            <View style={styles.wonBanner}>
              <Text style={styles.wonBannerText}>
                ✓ Deal Closed as Won ({formatCurrency(lead.won_amount || lead.expected_value || 0)})
              </Text>
            </View>
          )}

          <View style={styles.subActionsRow}>
            <FluentButton
              title="+ Log Activity"
              onPress={() => navigation.navigate(ROUTES.LOG_FOLLOWUP, { leadId: lead.id, leadName: lead.name, companyName: lead.company_name })}
              variant="primary"
              size="medium"
              style={styles.actionBtnHalf}
            />
            <FluentButton
              title="📎 Scope BRD"
              onPress={() => navigation.navigate(ROUTES.UPLOAD_BRD, { leadId: lead.id, currentBrd: lead.brd_url })}
              variant="secondary"
              size="medium"
              style={styles.actionBtnHalf}
            />
          </View>
        </View>

        {/* 4. Full Lead Specifications (Specs Table) */}
        <FluentCard>
          <View style={styles.specsHeader}>
            <Text style={styles.specsTitle}>📋 Full Lead Specifications</Text>
            <Text style={styles.specsId}>ID: #{lead.id}</Text>
          </View>

          {lead.sub_requirement ? (
            <View style={styles.scopeCallout}>
              <Text style={styles.scopeCalloutLabel}>REQUIREMENT & SCOPE:</Text>
              <Text style={styles.scopeCalloutText}>"{lead.sub_requirement}"</Text>
            </View>
          ) : null}

          <LeadSpecsTable lead={lead} interactionCount={interactions.length} />

          {/* BRD Document Status */}
          <View style={styles.brdSection}>
            <Text style={styles.brdHeader}>ATTACHED SCOPE DOCUMENT (BRD)</Text>
            {lead.brd_url ? (
              <View style={styles.brdAttachedBox}>
                <Text style={styles.brdDocIcon}>📄</Text>
                <View style={styles.brdInfo}>
                  <Text style={styles.brdFileName} numberOfLines={1}>
                    {lead.brd_url.split('/').pop()}
                  </Text>
                  <Text style={styles.brdSub}>BRD Scope Attached · PDF/DOCX</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.brdEmptyBox}
                onPress={() => navigation.navigate(ROUTES.UPLOAD_BRD, { leadId: lead.id })}
              >
                <Text style={styles.brdEmptyText}>📎 No scope document uploaded yet</Text>
                <Text style={styles.uploadPrompt}>+ Upload BRD</Text>
              </TouchableOpacity>
            )}
          </View>
        </FluentCard>

        {/* 5. Interaction Waterfall History */}
        <FluentCard>
          <View style={styles.waterfallHeader}>
            <View>
              <Text style={styles.waterfallTitle}>🌊 Interaction Waterfall History</Text>
              <Text style={styles.waterfallSubtitle}>
                {interactions.length + 1} milestone{interactions.length === 0 ? '' : 's'} recorded
              </Text>
            </View>
            <FluentButton
              title="+ Log Activity"
              onPress={() => navigation.navigate(ROUTES.LOG_FOLLOWUP, { leadId: lead.id, leadName: lead.name, companyName: lead.company_name })}
              variant="secondary"
              size="small"
            />
          </View>

          <View style={styles.waterfallList}>
            {interactions.map((int, idx) => (
              <WaterfallNode
                key={int.id || idx}
                item={int}
                isLast={false}
              />
            ))}

            {/* Genesis Inbound Lead Node */}
            <WaterfallNode
              item={{
                type: 'inbound',
                bdm_name: lead.assigned_bdm_name || 'System Auto-Capture',
                created_at: lead.created_at,
                notes: `Lead captured via ${lead.source || 'Website Inbound'} and assigned to ${lead.assigned_bdm_name || 'Aarav Sharma'}.`,
              }}
              isLast={true}
              isGenesis={true}
            />
          </View>
        </FluentCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  headerBarTitle: {
    ...typography.overline,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  entityCard: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  cardWon: {
    borderTopColor: colors.success,
  },
  cardUntouched: {
    borderTopColor: '#D97706',
  },
  nameHeader: {
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  leadName: {
    ...typography.title,
    color: colors.textPrimary,
  },
  untouchedTag: {
    backgroundColor: colors.untouchedBg,
    borderColor: colors.untouchedBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
    marginLeft: spacing.xs,
  },
  untouchedTagText: {
    ...typography.overline,
    color: colors.untouchedText,
    fontSize: 9,
  },
  companySub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  metricLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
  },
  metricValue: {
    ...typography.title,
    color: colors.primary,
    fontWeight: '700',
  },
  rightMetricCol: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  priorityHigh: {
    backgroundColor: colors.priorityHighBg,
    borderColor: colors.priorityHighBorder,
  },
  priorityHighText: {
    color: colors.priorityHighText,
  },
  priorityMed: {
    backgroundColor: colors.priorityMediumBg,
    borderColor: colors.priorityMediumBorder,
  },
  priorityMedText: {
    color: colors.priorityMediumText,
  },
  priorityText: {
    ...typography.overline,
    fontSize: 9,
  },
  dealTypeSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    height: 40,
  },
  callBtn: {
    backgroundColor: colors.primaryLight,
    borderColor: '#C7E0F4',
  },
  callBtnText: {
    color: colors.primary,
  },
  waBtn: {
    backgroundColor: colors.successBg,
    borderColor: '#C3E6CB',
  },
  waBtnText: {
    color: colors.successText,
  },
  contactBtnIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  contactBtnText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  bpfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bpfTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  bpfSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  actionsBar: {
    marginBottom: spacing.md,
  },
  wonBtn: {
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  wonBanner: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  wonBannerText: {
    ...typography.bodyBold,
    color: colors.success,
  },
  subActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtnHalf: {
    flex: 1,
  },
  specsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  specsTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  specsId: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  scopeCallout: {
    backgroundColor: '#F3F9FD',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: spacing.sm,
    borderRadius: radius.xs,
    marginVertical: spacing.xs,
  },
  scopeCalloutLabel: {
    ...typography.overline,
    color: colors.primary,
    fontSize: 10,
    marginBottom: 2,
  },
  scopeCalloutText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  brdSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  brdHeader: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  brdAttachedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brdDocIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  brdInfo: {
    flex: 1,
  },
  brdFileName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  brdSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  brdEmptyBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  brdEmptyText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  uploadPrompt: {
    ...typography.captionBold,
    color: colors.primary,
  },
  waterfallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  waterfallTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  waterfallSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  waterfallList: {
    marginTop: spacing.xs,
  },
});
