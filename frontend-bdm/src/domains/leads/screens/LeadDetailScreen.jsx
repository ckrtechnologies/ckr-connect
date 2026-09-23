import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import {
  StatusBadge,
  ProcessFlowBar,
  FluentButton,
  FluentCard,
  WaterfallNode,
} from '../../../shared/components/index.js';
import {
  setWonModalLeadId,
  setDropoffModalData,
} from '../../../shared/store/slices/uiSlice.js';
import {
  INITIAL_LEADS,
  INITIAL_INTERACTIONS,
} from '../../../shared/utils/mockSeedData.js';
import { formatCurrency } from '../../../shared/utils/formatters.js';
import {
  makePhoneCall,
  openWhatsApp,
  openEmail,
} from '../../../shared/utils/communication.js';
import { ROUTES } from '../../../shared/navigation/routes.js';
import LeadSpecsTable from '../components/LeadSpecsTable.jsx';
import WonModal from '../components/WonModal.jsx';
import DropoffModal from '../components/DropoffModal.jsx';

export const LeadDetailScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const leadId = route.params?.leadId || 'lead-101';

  // Seed / local state for this lead
  const initialLead = INITIAL_LEADS.find((l) => l.id === leadId) || INITIAL_LEADS[0];
  const [lead, setLead] = useState(initialLead);

  const [interactions, setInteractions] = useState(
    INITIAL_INTERACTIONS.filter((i) => i.lead_id === lead.id)
  );

  const isWon = (lead.status || '').toUpperCase() === 'WON';
  const isOverdue = lead.id === 'lead-102';
  const isDueToday = lead.id === 'lead-101' || lead.id === 'lead-110';
  const isUntouched = (lead.status || '').toUpperCase() === 'NEW' || lead.followup_count === 0;

  const probability =
    lead.probability_override ||
    (lead.status === 'won'
      ? 100
      : lead.status === 'proposal'
      ? 75
      : lead.status === 'follow_up'
      ? 50
      : lead.status === 'contacted'
      ? 25
      : 10);

  // Status transitions
  const handleStageSelect = (stageId) => {
    if (stageId === 'won') {
      dispatch(setWonModalLeadId(lead.id));
      return;
    }
    setLead((prev) => ({
      ...prev,
      status: stageId,
      probability_override:
        stageId === 'proposal'
          ? 75
          : stageId === 'follow_up'
          ? 50
          : stageId === 'contacted'
          ? 25
          : 10,
    }));
  };

  const handleConfirmWon = (targetLeadId, wonData) => {
    setLead((prev) => ({
      ...prev,
      status: 'won',
      won_amount: wonData.won_amount,
      deal_type: wonData.deal_type,
      company_name: wonData.account_name || prev.company_name,
    }));

    // Add winning interaction to timeline
    const wonInteraction = {
      id: `int-${Date.now()}`,
      lead_id: lead.id,
      bdm_id: 'u-02',
      type: 'meeting',
      call_result_type: 'positive',
      call_result_label: 'Deal Closed as Won',
      notes: `Won revenue recorded: ₹${wonData.won_amount.toLocaleString('en-IN')}. ${wonData.notes || ''}`,
      created_at: new Date().toISOString(),
    };
    setInteractions([wonInteraction, ...interactions]);
  };

  const handleConfirmDropoff = (targetLeadId, dropoffData) => {
    setLead((prev) => ({
      ...prev,
      status: dropoffData.status,
      lost_reason: dropoffData.status === 'lost' ? dropoffData.reason : null,
      invalid_reason: dropoffData.status === 'invalid' ? dropoffData.reason : null,
    }));
  };

  return (
    <View style={styles.container}>
      {/* Detail Header Bar */}
      <View style={styles.topNavHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>‹ My Leads</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle}>LEAD PROFILE</Text>

        <StatusBadge status={lead.status} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 1. Key Entity Header Card */}
        <FluentCard
          topBorderColor={
            isWon
              ? colors.success
              : isOverdue
              ? colors.error
              : isDueToday
              ? colors.urgentAmber
              : isUntouched
              ? colors.urgentAmber
              : colors.primary
          }
          style={styles.entityCard}
        >
          <View style={styles.entityTopRow}>
            <View>
              <View style={styles.titleWithBadge}>
                <Text style={styles.contactName}>{lead.name}</Text>
                {isUntouched ? (
                  <View style={styles.untouchedTag}>
                    <Text style={styles.untouchedTagText}>⚡ Untouched</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.companySubtext}>
                🏢 {lead.company_name}{' '}
                {lead.city ? `· 📍 ${lead.city}, ${lead.state || 'India'}` : ''}
              </Text>
            </View>
          </View>

          {/* Deal Highlight Metrics Bar */}
          <View style={styles.metricsBar}>
            <View>
              <Text style={styles.metricLabel}>Forecast Value</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(lead.expected_value || lead.budget || 0)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View
                style={[
                  styles.priorityTag,
                  lead.priority === 'high' ? styles.highPriority : styles.medPriority,
                ]}
              >
                <Text
                  style={[
                    styles.priorityTagText,
                    lead.priority === 'high' ? { color: colors.error } : { color: colors.primary },
                  ]}
                >
                  {(lead.priority || 'medium').toUpperCase()} PRIORITY
                </Text>
              </View>
              <Text style={styles.prioritySubtext}>
                {lead.deal_type === 'new_business' ? 'New Business' : 'Upsell'} · {probability}% Win
              </Text>
            </View>
          </View>

          {/* Direct Communication Touch Targets */}
          <View style={styles.contactActionsRow}>
            <TouchableOpacity
              style={[styles.contactBtn, styles.callBtn]}
              onPress={() => makePhoneCall(lead.phone, lead.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={[styles.contactBtnText, { color: '#FFFFFF' }]}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, styles.waBtn]}
              onPress={() =>
                openWhatsApp(
                  lead.phone,
                  `Hello ${lead.name}, this is Aarav Sharma from CKR Technologies.`
                )
              }
              activeOpacity={0.8}
            >
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={[styles.contactBtnText, { color: '#FFFFFF' }]}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, styles.emailBtn]}
              onPress={() => openEmail(lead.email, 'CKR Technologies Product Inquiry')}
              activeOpacity={0.8}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactBtnText}>Send Email</Text>
            </TouchableOpacity>
          </View>
        </FluentCard>

        {/* 2. Pipeline Progress Stepper (BPF Bar) */}
        <FluentCard style={styles.bpfCard}>
          <View style={styles.bpfHeaderRow}>
            <Text style={styles.sectionHeading}>Pipeline Progress</Text>
            <TouchableOpacity
              onPress={() =>
                dispatch(
                  setDropoffModalData({
                    leadId: lead.id,
                    defaultStage: 'lost',
                  })
                )
              }
            >
              <Text style={styles.dropoffActionText}>Mark Lost / Invalid ›</Text>
            </TouchableOpacity>
          </View>

          <ProcessFlowBar
            currentStatus={lead.status}
            onSelectStage={handleStageSelect}
          />
        </FluentCard>

        {/* 3. Primary Actions */}
        <View style={styles.actionButtonGroup}>
          {!isWon ? (
            <FluentButton
              variant="success"
              title="🏆 Close Deal as Won"
              onPress={() => dispatch(setWonModalLeadId(lead.id))}
              style={styles.wonBtn}
            />
          ) : (
            <View style={styles.wonBanner}>
              <Text style={styles.wonBannerText}>
                ✓ Deal Closed as Won ({formatCurrency(lead.won_amount || lead.expected_value || 0)})
              </Text>
            </View>
          )}

          <View style={styles.dualActionsRow}>
            <FluentButton
              variant="primary"
              title="+ Log Activity"
              onPress={() =>
                navigation.navigate(ROUTES.LOG_FOLLOWUP, { leadId: lead.id })
              }
              style={{ flex: 1 }}
            />
            <FluentButton
              variant="secondary"
              title="📎 Scope BRD"
              onPress={() =>
                navigation.navigate(ROUTES.UPLOAD_BRD, { leadId: lead.id })
              }
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* 4. Full Lead Specifications */}
        <FluentCard style={styles.specsCard}>
          <View style={styles.specsHeaderRow}>
            <Text style={styles.sectionHeading}>📋 Full Lead Specifications</Text>
            <Text style={styles.idBadge}>ID: #{lead.id}</Text>
          </View>

          {/* Requirement & Scope Callout */}
          {lead.sub_requirement ? (
            <View style={styles.scopeCallout}>
              <Text style={styles.scopeCalloutHeader}>REQUIREMENT & SCOPE:</Text>
              <Text style={styles.scopeCalloutBody}>"{lead.sub_requirement}"</Text>
            </View>
          ) : null}

          {/* Detailed Key-Value Table */}
          <LeadSpecsTable lead={lead} interactionCount={interactions.length} />

          {/* BRD Scope Document Section */}
          <View style={styles.brdSection}>
            <Text style={styles.brdHeader}>ATTACHED SCOPE DOCUMENT (BRD)</Text>
            {lead.brd_url ? (
              <View style={styles.brdItem}>
                <Text style={{ fontSize: 20 }}>📄</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brdFilename}>{lead.brd_url.split('/').pop()}</Text>
                  <Text style={styles.brdFilesize}>BRD Scope Attached · 2.4 MB PDF</Text>
                </View>
                <TouchableOpacity
                  style={styles.brdViewBtn}
                  onPress={() =>
                    Alert.alert('Scope Document', `Previewing ${lead.brd_url.split('/').pop()}`)
                  }
                >
                  <Text style={styles.brdViewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.brdEmptyBox}>
                <Text style={styles.brdEmptyText}>📎 No scope document uploaded yet</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(ROUTES.UPLOAD_BRD, { leadId: lead.id })}
                >
                  <Text style={styles.brdUploadLink}>+ Upload BRD</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </FluentCard>

        {/* 5. Interaction Waterfall History Feed */}
        <FluentCard style={styles.waterfallCard}>
          <View style={styles.waterfallHeader}>
            <View>
              <Text style={styles.sectionHeading}>🌊 Interaction Waterfall History</Text>
              <Text style={styles.waterfallSubtext}>
                {interactions.length + 1} milestones recorded
              </Text>
            </View>

            <TouchableOpacity
              style={styles.waterfallAddBtn}
              onPress={() => navigation.navigate(ROUTES.LOG_FOLLOWUP, { leadId: lead.id })}
            >
              <Text style={styles.waterfallAddBtnText}>+ Log Activity</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.waterfallTimelineContainer}>
            {interactions.map((int) => (
              <WaterfallNode key={int.id} interaction={int} />
            ))}

            {/* Genesis Inbound Node */}
            <WaterfallNode interaction={lead} isGenesis />
          </View>
        </FluentCard>
      </ScrollView>

      {/* Won & Dropoff Modals */}
      <WonModal lead={lead} onConfirmWon={handleConfirmWon} />
      <DropoffModal onConfirmDropoff={handleConfirmDropoff} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    paddingVertical: 4,
  },
  backBtnText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 13,
  },
  navTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: spacing.pagePaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: 40,
    gap: 12,
  },
  entityCard: {
    padding: 14,
  },
  entityTopRow: {
    marginBottom: spacing.xs,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  contactName: {
    ...typography.title,
    fontSize: 17,
    color: colors.textPrimary,
  },
  untouchedTag: {
    backgroundColor: '#FFF4CE',
    borderColor: '#F2C94C',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  untouchedTagText: {
    ...typography.overline,
    color: '#78350F',
    fontSize: 10,
    fontWeight: '700',
  },
  companySubtext: {
    ...typography.body,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: 10,
    borderRadius: radius.sm,
    marginVertical: spacing.xs,
  },
  metricLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
  },
  metricValue: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.primary,
  },
  priorityTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  highPriority: {
    backgroundColor: colors.errorBg,
    borderColor: '#F7B5B9',
  },
  medPriority: {
    backgroundColor: colors.primaryLight,
    borderColor: '#C7E0F4',
  },
  priorityTagText: {
    ...typography.overline,
    fontSize: 10,
    fontWeight: '700',
  },
  prioritySubtext: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  contactActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.xs,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  callBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  waBtn: {
    backgroundColor: colors.whatsapp,
    borderColor: colors.whatsapp,
  },
  emailBtn: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  contactIcon: {
    fontSize: 13,
  },
  contactBtnText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  bpfCard: {
    padding: 12,
  },
  bpfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionHeading: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  dropoffActionText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.error,
  },
  actionButtonGroup: {
    gap: 8,
  },
  wonBtn: {
    height: 44,
  },
  wonBanner: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 12,
    alignItems: 'center',
  },
  wonBannerText: {
    ...typography.bodyBold,
    color: colors.success,
    fontSize: 14,
  },
  dualActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specsCard: {
    padding: 14,
  },
  specsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  idBadge: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  scopeCallout: {
    backgroundColor: '#F3F9FD',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    borderRadius: radius.xs,
    padding: 10,
    marginVertical: spacing.xs,
  },
  scopeCalloutHeader: {
    ...typography.overline,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 2,
  },
  scopeCalloutBody: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  brdSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  brdHeader: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  brdItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 10,
  },
  brdFilename: {
    ...typography.captionBold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  brdFilesize: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  brdViewBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  brdViewBtnText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  brdEmptyBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.sm,
    padding: 10,
  },
  brdEmptyText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  brdUploadLink: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.primary,
  },
  waterfallCard: {
    padding: 14,
  },
  waterfallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  waterfallSubtext: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
  },
  waterfallAddBtn: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  waterfallAddBtnText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textPrimary,
  },
  waterfallTimelineContainer: {
    marginTop: spacing.xs,
  },
});

export default LeadDetailScreen;
