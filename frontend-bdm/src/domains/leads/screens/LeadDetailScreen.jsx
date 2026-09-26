import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { StatusBadge } from '../../../shared/components/StatusBadge.jsx';
import { ProcessFlowBar } from '../../../shared/components/ProcessFlowBar.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { BottomSheet } from '../../../shared/components/BottomSheet.jsx';
import { DateTimePicker, combineDateAndTimeIso } from '../../../shared/components/DateTimePicker.jsx';
import { LeadSpecsTable } from '../components/LeadSpecsTable.jsx';
import { LeadEditBottomSheet } from '../components/LeadEditBottomSheet.jsx';
import { WaterfallNode } from '../../../shared/components/WaterfallNode.jsx';
import { useGetLeadDetailQuery, useUpdateLeadStatusMutation, useDeleteDocumentMutation } from '../api.js';
import { openWonModal, openDropoffModal } from '../../../shared/store/uiSlice.js';
import { formatCurrency } from '../../../shared/utils/formatters.js';
import { makePhoneCall, openWhatsApp, sendEmail } from '../../../shared/utils/communication.js';
import { Phone, MessageCircle, Mail } from 'lucide-react-native';
import { ROUTES } from '../../../shared/navigation/routes.js';
import { useFocusEffect } from '@react-navigation/native';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

export const LeadDetailScreen = ({ route, navigation }) => {
  const { leadId } = route.params;
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth?.token);

  const { data: lead, isLoading, refetch } = useGetLeadDetailQuery(leadId);
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateLeadStatusMutation();
  const [deleteDocument, { isLoading: isDeletingDoc }] = useDeleteDocumentMutation();
  const { showAlert, AlertComponent } = useAlert();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Advance stage & mandatory next follow-up state
  const [advanceModalVisible, setAdvanceModalVisible] = useState(false);
  const [pendingStage, setPendingStage] = useState(null);
  const [nextFollowupDate, setNextFollowupDate] = useState('');
  const [nextFollowupTime, setNextFollowupTime] = useState('11:00 AM');
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  if (isLoading || !lead) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lead specifications...</Text>
      </SafeAreaView>
    );
  }

  const isWon = (lead.status || '').toLowerCase() === 'won';
  const isUntouched = (lead.status || '').toLowerCase() === 'new' && lead.followup_count === 0;
  const interactions = lead.interactions || [];

  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const baseUrl = __DEV__ ? `http://${host}:4003/api/v1` : 'https://connect.ckrtechnologies.in/api/v1';

  const handleStageChange = async (newStage) => {
    if (newStage === lead.status) return;

    if (newStage === 'won') {
      dispatch(openWonModal(lead.id));
      return;
    }
    if (newStage === 'lost' || newStage === 'invalid') {
      dispatch(openDropoffModal({ leadId: lead.id, defaultStage: newStage }));
      return;
    }

    // Non-terminal stages require mandatory next follow-up per Admin panel rules
    setPendingStage(newStage);
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    setNextFollowupDate(`${yr}-${mo}-${da}`);
    setNextFollowupTime('11:00 AM');
    setAdvanceRemarks(`Advancing stage to ${newStage.toUpperCase()}. Scheduled next follow-up call.`);
    setAdvanceModalVisible(true);
  };

  const handleConfirmAdvanceStage = async () => {
    if (!nextFollowupDate) {
      showAlert('error', 'Follow-up Required', 'A Next Follow-up Date/Time is mandatory before advancing lead status.');
      return;
    }

    const isoDate = combineDateAndTimeIso(nextFollowupDate, nextFollowupTime);

    try {
      await updateStatus({
        id: lead.id,
        status: pendingStage,
        next_followup_date: isoDate,
        remarks: advanceRemarks.trim(),
      }).unwrap();

      showAlert('info', 'Stage Advanced', `Opportunity moved to ${pendingStage.toUpperCase()} with scheduled follow-up.`);
      setAdvanceModalVisible(false);
      setPendingStage(null);
      refetch();
    } catch (err) {
      const msg = err?.data?.error?.message || err?.data?.message || err?.message || 'Could not advance stage.';
      showAlert('error', 'Update Failed', msg);
    }
  };

  const leadDocuments = Array.isArray(lead?.documents) && lead.documents.length > 0
    ? lead.documents
    : (lead?.brd_url ? [{ id: 'legacy', name: lead.brd_url.split('/').pop(), url: lead.brd_url, uploaded_at: lead.updated_at }] : []);

  const handleDownloadDoc = async (doc) => {
    const docParam = doc?.id && doc.id !== 'legacy' ? `?doc_id=${doc.id}&` : '?';
    const downloadUrl = `${baseUrl}/media/brd/${lead.id}${docParam}token=${encodeURIComponent(token || '')}`;
    try {
      await Linking.openURL(downloadUrl);
    } catch (e) {
      showAlert('error', 'Cannot Open Document', 'Failed to open document URL in browser or viewer.');
    }
  };

  const handleDeleteDoc = (doc) => {
    if (!doc?.id || doc.id === 'legacy') {
      showAlert('warning', 'Cannot Delete', 'This is a legacy single-file attachment. Please attach a new document to update.');
      return;
    }
    showAlert('confirm', 'Delete Document', `Remove "${doc.name || 'this document'}"? This cannot be undone.`, {
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await deleteDocument({ leadId: lead.id, docId: doc.id }).unwrap();
          showAlert('success', 'Deleted', 'Document attachment removed.');
          refetch();
        } catch (err) {
          showAlert('error', 'Delete Failed', err?.data?.message || err?.message || 'Could not delete document.');
        }
      },
    });
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
      {AlertComponent}
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
              <Text style={styles.leadName} numberOfLines={2}>
                {lead.name}
              </Text>
              {isUntouched ? (
                <View style={styles.untouchedTag}>
                  <Text style={styles.untouchedTagText}>⚡ Untouched</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.companySub} numberOfLines={2}>
              🏢 {lead.company_name || 'Individual'} {lead.city ? `· 📍 ${lead.city}, ${lead.state || ''}` : ''}
            </Text>
          </View>

          {/* Deal Highlight Box */}
          <View style={styles.metricsBox}>
            <View style={styles.leftMetricCol}>
              <Text style={styles.metricLabel}>FORECAST VALUE</Text>
              <Text style={styles.metricValue} numberOfLines={1}>
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
              <Text style={styles.dealTypeSub} numberOfLines={1}>
                {lead.deal_type === 'new_business' ? 'New Business' : 'Upsell'} · {probability}% Win
              </Text>
            </View>
          </View>

          {/* Direct Communication Touch Targets (US-06) */}
          <View style={styles.contactRow}>
            <TouchableOpacity
              style={[styles.contactBtn, styles.callBtn]}
              onPress={() => makePhoneCall(lead.phone, (t, m) => showAlert('error', t, m))}
              activeOpacity={0.8}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={[styles.contactBtnText, styles.callBtnText, { marginLeft: 6 }]}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.contactBtn, styles.waBtn]}
              onPress={() => openWhatsApp(lead.phone, `Hi ${lead.name}, regarding your requirement.`, (t, m) => showAlert('error', t, m))}
              activeOpacity={0.8}
            >
              <MessageCircle size={16} color="#055E38" />
              <Text style={[styles.contactBtnText, styles.waBtnText, { marginLeft: 6 }]}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => sendEmail(lead.email, `CKR Technologies — Discussion with ${lead.name}`, (t, m) => showAlert('error', t, m))}
              activeOpacity={0.8}
            >
              <Mail size={16} color={colors.textSecondary} />
              <Text style={[styles.contactBtnText, { marginLeft: 6 }]}>Email</Text>
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
              onPress={() =>
                navigation.navigate(ROUTES.LOG_FOLLOWUP, {
                  leadId: lead.id,
                  leadName: lead.name,
                  companyName: lead.company_name,
                })
              }
              variant="primary"
              size="medium"
              style={styles.actionBtnHalf}
            />
            <FluentButton
              title="📎 Upload / BRD"
              onPress={() =>
                navigation.navigate(ROUTES.UPLOAD_BRD, {
                  leadId: lead.id,
                  currentBrd: lead.brd_url,
                })
              }
              variant="secondary"
              size="medium"
              style={styles.actionBtnHalf}
            />
          </View>
        </View>

        {/* --- TABS ROW --- */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'details' && styles.tabButtonActive]} 
            onPress={() => setActiveTab('details')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details & Docs
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'interactions' && styles.tabButtonActive]} 
            onPress={() => setActiveTab('interactions')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'interactions' && styles.tabTextActive]}>
              Interactions
            </Text>
          </TouchableOpacity>
        </View>

        {/* 4. Full Lead Specifications & Scope */}
        {activeTab === 'details' ? (
          <FluentCard>
            <View style={[styles.specsHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <Text style={styles.specsTitle}>📋 Full Lead Specifications</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
            </View>

            {lead.sub_requirement ? (
              <View style={styles.scopeCallout}>
                <Text style={styles.scopeCalloutLabel}>REQUIREMENT & SCOPE:</Text>
                <Text style={styles.scopeCalloutText}>"{lead.sub_requirement}"</Text>
              </View>
            ) : null}

            <LeadSpecsTable lead={lead} interactionCount={interactions.length} />

            {/* Attached Documents & BRDs ({leadDocuments.length}) */}
            <View style={styles.brdSection}>
              <View style={styles.brdHeaderRow}>
                <Text style={styles.brdHeader}>
                  ATTACHED DOCUMENTS & BRDS ({leadDocuments.length})
                </Text>
              </View>

              {leadDocuments.length === 0 ? (
                <View style={styles.brdEmptyBox}>
                  <Text style={styles.brdEmptyText}>📎 No documents attached yet to this lead.</Text>
                </View>
              ) : (
                <View style={styles.docsListContainer}>
                  {leadDocuments.map((doc, idx) => {
                    const docName = doc.name || doc.file_name || `Document_${idx + 1}`;
                    const ext = docName.split('.').pop().toLowerCase();
                    const icon =
                      ext === 'pdf'
                        ? '📕'
                        : ['xls', 'xlsx', 'csv'].includes(ext)
                        ? '📊'
                        : ['doc', 'docx'].includes(ext)
                        ? '📘'
                        : ['png', 'jpg', 'jpeg'].includes(ext)
                        ? '🖼️'
                        : '📄';
                    const formattedSize = doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '';
                    const uploadDate = doc.uploaded_at
                      ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'recently';

                    return (
                      <View key={doc.id || idx} style={styles.docItemCard}>
                        <View style={styles.docItemLeft}>
                          <Text style={styles.docTypeEmoji}>{icon}</Text>
                          <View style={styles.docItemTextCol}>
                            <Text style={styles.docItemName} numberOfLines={1}>
                              {docName}
                            </Text>
                            <Text style={styles.docItemMeta}>
                              {formattedSize ? `${formattedSize} · ` : ''}Uploaded {uploadDate}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.docItemActions}>
                          <TouchableOpacity
                            style={styles.docDownloadIconBtn}
                            onPress={() => handleDownloadDoc(doc)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.docDownloadBtnText}>📥 Open</Text>
                          </TouchableOpacity>
                          {doc.id !== 'legacy' && (
                            <TouchableOpacity
                              style={styles.docDeleteIconBtn}
                              onPress={() => handleDeleteDoc(doc)}
                              activeOpacity={0.8}
                              disabled={isDeletingDoc}
                            >
                              <Text style={styles.docDeleteBtnText}>✕</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </FluentCard>
        ) : (
        /* 5. Interaction Waterfall History */
        <FluentCard>
          <View style={styles.waterfallHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.waterfallTitle} numberOfLines={1}>
                🌊 Interaction Waterfall History
              </Text>
              <Text style={styles.waterfallSubtitle}>
                {interactions.length + 1} milestone{interactions.length === 0 ? '' : 's'} recorded
              </Text>
            </View>
          </View>

          <View style={styles.waterfallList}>
            {interactions.map((int, idx) => (
              <WaterfallNode
                key={int.id || idx}
                item={int}
                isLast={false}
              />
            ))}
          </View>
        </FluentCard>
        )}
      </ScrollView>

      {/* Mandatory Next Follow-up BottomSheet Modal for Stage Transition */}
      <BottomSheet
        visible={advanceModalVisible}
        onClose={() => setAdvanceModalVisible(false)}
        title={`ADVANCE TO ${pendingStage ? pendingStage.toUpperCase() : 'STAGE'}`}
        footer={
          <View style={styles.modalFooterRow}>
            <FluentButton
              title="Cancel"
              onPress={() => setAdvanceModalVisible(false)}
              variant="secondary"
              size="large"
              style={styles.modalCancelBtn}
            />
            <FluentButton
              title="Advance & Save"
              onPress={handleConfirmAdvanceStage}
              variant="primary"
              size="large"
              loading={isUpdatingStatus}
              style={styles.modalConfirmBtn}
            />
          </View>
        }
      >
        <ScrollView
          contentContainerStyle={[styles.modalBody, { paddingBottom: 20 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modalLeadTarget}>
            Lead: <Text style={styles.modalLeadName}>{lead.name}</Text>
          </Text>
          <Text style={styles.modalSubtitle}>
            Mandatory CRM requirement: Set your next follow-up date and time before saving this status.
          </Text>

          <DateTimePicker
            date={nextFollowupDate}
            time={nextFollowupTime}
            onDateChange={setNextFollowupDate}
            onTimeChange={setNextFollowupTime}
            label="MANDATORY NEXT FOLLOW-UP DATE & TIME *"
          />

          <Text style={styles.inputLabel}>STAGE TRANSITION REMARKS</Text>
          <TextInput
            style={styles.remarksInput}
            value={advanceRemarks}
            onChangeText={setAdvanceRemarks}
            placeholder="Key discussion points, requirement updates, or next steps..."
            placeholderTextColor={colors.textDisabled}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
      </BottomSheet>

      <LeadEditBottomSheet 
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        lead={lead}
        showAlert={showAlert}
      />
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
    gap: spacing.xs,
  },
  leadName: {
    ...typography.title,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  untouchedTag: {
    backgroundColor: colors.untouchedBg,
    borderColor: colors.untouchedBorder,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
    borderRadius: radius.xs,
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
    gap: spacing.xs,
  },
  leftMetricCol: {
    flex: 1,
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
    flexShrink: 1,
  },
  rightMetricCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
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
    flexShrink: 1,
  },
  bpfSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    flexShrink: 0,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.sm,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonText: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeActive: {
    backgroundColor: colors.primary + '18',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.primary,
  },
  specsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  specsTitle: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
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
  brdHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brdHeader: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  attachBtnSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
  },
  attachBtnSmallText: {
    ...typography.captionBold,
    color: '#ffffff',
    fontSize: 11,
  },
  docsListContainer: {
    gap: spacing.xs,
  },
  docItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.xs,
  },
  docTypeEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  docItemTextCol: {
    flex: 1,
  },
  docItemName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 12,
  },
  docItemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 1,
  },
  docItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docDownloadIconBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#C7E0F4',
  },
  docDownloadBtnText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 11,
  },
  docDeleteIconBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  docDeleteBtnText: {
    ...typography.captionBold,
    color: colors.error,
    fontSize: 12,
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
    flexShrink: 1,
  },
  uploadPrompt: {
    ...typography.captionBold,
    color: colors.primary,
    marginLeft: spacing.xs,
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
  // Modal styles
  modalBody: {
    paddingVertical: spacing.xs,
  },
  modalLeadTarget: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  modalLeadName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  remarksInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    padding: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 64,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalCancelBtn: {
    flex: 1,
  },
  modalConfirmBtn: {
    flex: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginHorizontal: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  tabText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
});
