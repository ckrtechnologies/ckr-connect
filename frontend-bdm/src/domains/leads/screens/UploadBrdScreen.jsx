import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import * as DocumentPicker from '@react-native-documents/picker';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import {
  useUploadBrdMutation,
  useGetLeadDetailQuery,
  useDeleteDocumentMutation,
} from '../api.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

const getFileIcon = (fileName = '', mimeType = '') => {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  if (ext === 'pdf' || mimeType.includes('pdf')) return '📕';
  if (['xls', 'xlsx', 'csv'].includes(ext) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (['doc', 'docx'].includes(ext) || mimeType.includes('word') || mimeType.includes('document')) return '📘';
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext) || mimeType.includes('image')) return '🖼️';
  return '📄';
};

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const UploadBrdScreen = ({ route, navigation }) => {
  const { leadId } = route.params;
  const token = useSelector((state) => state.auth?.token);

  const { data: lead, refetch } = useGetLeadDetailQuery(leadId);
  const { showAlert, AlertComponent } = useAlert();
  const [uploadBrd, { isLoading }] = useUploadBrdMutation();
  const [deleteDocument, { isLoading: isDeletingDoc }] = useDeleteDocumentMutation();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileTitle, setFileTitle] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const baseUrl = __DEV__ ? `http://${host}:4003/api/v1` : 'https://connect.ckrtechnologies.in/api/v1';

  const leadDocuments = Array.isArray(lead?.documents) && lead.documents.length > 0
    ? lead.documents
    : (lead?.brd_url ? [{ id: 'legacy', name: lead.brd_url.split('/').pop(), url: lead.brd_url, uploaded_at: lead.updated_at }] : []);

  const handlePickFile = async () => {
    try {
      setIsPicking(true);
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
      const picked = Array.isArray(res) ? res[0] : res;
      if (picked) {
        setSelectedFile(picked);
        const rawName = picked.name || 'Document';
        const cleanTitle = rawName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (!fileTitle.trim()) {
          setFileTitle(cleanTitle);
        }
      }
    } catch (err) {
      if (DocumentPicker.isErrorWithCode(err) && err.code === DocumentPicker.errorCodes.OPERATION_CANCELED) {
        return;
      }
      showAlert('error', 'File Selection Error', err?.message || 'Could not select document file.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleDownloadDoc = async (doc) => {
    const docParam = doc?.id && doc.id !== 'legacy' ? `?doc_id=${doc.id}&` : '?';
    const downloadUrl = `${baseUrl}/media/brd/${leadId}${docParam}token=${encodeURIComponent(token || '')}`;
    try {
      await Linking.openURL(downloadUrl);
    } catch (err) {
      showAlert('error', 'Cannot Open Document', 'Failed to open document URL in browser or viewer.');
    }
  };

  const handleDeleteDoc = (doc) => {
    if (!doc?.id || doc.id === 'legacy') {
      showAlert('warning', 'Cannot Delete', 'This is a legacy single-file attachment. Please upload a new document.');
      return;
    }
    showAlert('confirm', 'Delete Document', `Remove "${doc.name || 'this document'}"? This cannot be undone.`, {
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await deleteDocument({ leadId, docId: doc.id }).unwrap();
          showAlert('success', 'Deleted', 'Document attachment removed.');
          refetch();
        } catch (err) {
          showAlert('error', 'Delete Failed', err?.data?.message || err?.message || 'Could not delete document.');
        }
      },
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showAlert('warning', 'No File Selected', 'Please tap "Browse Device Storage" to select a file first.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name || 'document',
        type: selectedFile.type || 'application/octet-stream',
      });
      if (fileTitle.trim()) {
        formData.append('title', fileTitle.trim());
      }

      await uploadBrd({ id: leadId, formData }).unwrap();
      refetch();
      showAlert('success', 'Upload Successful', `"${selectedFile.name || 'Document'}" attached to lead.`);
      setSelectedFile(null);
      setFileTitle('');
      navigation.goBack();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Could not upload document.';
      showAlert('error', 'Upload Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {AlertComponent}
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ATTACH DOCUMENT / BRD</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.keyboardContainer}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bottomOffset={100}
        >
          <FluentCard style={styles.card}>
            <Text style={styles.docIcon}>☁️</Text>
            <Text style={styles.title}>Select File from Device</Text>
            <Text style={styles.subtitle}>
              Attach client BRDs, proposals, quotes, and specs directly from your phone's storage.
            </Text>

            {/* File Picker Dropzone / Card */}
            {!selectedFile ? (
              <TouchableOpacity
                style={styles.uploadDropzone}
                onPress={handlePickFile}
                activeOpacity={0.7}
                disabled={isPicking}
              >
                {isPicking ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <View style={styles.dropzoneIconCircle}>
                      <Text style={styles.dropzoneIcon}>📥</Text>
                    </View>
                    <Text style={styles.dropzoneTitle}>Browse Device Storage</Text>
                    <Text style={styles.dropzoneSubtitle}>
                      PDF, Word (DOCX), Excel (XLSX), CSV, Images, or TXT
                    </Text>
                    <View style={styles.browseBadge}>
                      <Text style={styles.browseBadgeText}>+ Choose File</Text>
                    </View>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.selectedFileCard}>
                <View style={styles.fileCardRow}>
                  <Text style={styles.fileCardEmoji}>
                    {getFileIcon(selectedFile.name, selectedFile.type)}
                  </Text>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.selectedFileName} numberOfLines={2}>
                      {selectedFile.name || 'Selected Document'}
                    </Text>
                    <View style={styles.fileMetaRow}>
                      {selectedFile.size ? (
                        <Text style={styles.fileSizeText}>
                          {formatFileSize(selectedFile.size)}
                        </Text>
                      ) : null}
                      <View style={styles.readyBadge}>
                        <Text style={styles.readyBadgeText}>✓ Ready to Upload</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* File actions */}
                <View style={styles.fileCardActions}>
                  <TouchableOpacity
                    style={styles.changeFileBtn}
                    onPress={handlePickFile}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.changeFileBtnText}>🔄 Change File</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeFileBtn}
                    onPress={() => setSelectedFile(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.removeFileBtnText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Optional Document Title Input */}
            <Text style={styles.inputLabel}>DOCUMENT TITLE (OPTIONAL)</Text>
            <TextInput
              style={styles.textInput}
              value={fileTitle}
              onChangeText={setFileTitle}
              placeholder="e.g. Client Scope Specification v1.0"
              placeholderTextColor={colors.textDisabled}
            />

            {/* Currently Attached Documents List */}
            <View style={styles.attachedSection}>
              <Text style={styles.sectionLabel}>
                CURRENTLY ATTACHED DOCUMENTS ({leadDocuments.length})
              </Text>
              {leadDocuments.length === 0 ? (
                <View style={styles.noDocsBox}>
                  <Text style={styles.noDocsText}>No documents attached yet to this lead.</Text>
                </View>
              ) : (
                <View style={styles.docsList}>
                  {leadDocuments.map((doc, idx) => {
                    const docName = doc.name || doc.file_name || `Document_${idx + 1}`;
                    const icon = getFileIcon(docName);
                    const formattedSize = doc.size ? formatFileSize(doc.size) : '';
                    const uploadDate = doc.uploaded_at
                      ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'recently';

                    return (
                      <View key={doc.id || idx} style={styles.docItemRow}>
                        <View style={styles.docItemLeft}>
                          <Text style={styles.itemEmoji}>{icon}</Text>
                          <View style={{ flex: 1 }}>
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
                            style={styles.docDownloadBtn}
                            onPress={() => handleDownloadDoc(doc)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.docDownloadBtnText}>📥 Open</Text>
                          </TouchableOpacity>
                          {doc.id !== 'legacy' && (
                            <TouchableOpacity
                              style={styles.docDeleteBtn}
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
        </KeyboardAwareScrollView>

        {/* Docked CTA Button pinned above keyboard via KeyboardStickyView */}
        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <View style={styles.footerDock}>
            <FluentButton
              title={
                selectedFile
                  ? `Upload ${selectedFile.name}`
                  : 'Choose File from Device'
              }
              onPress={selectedFile ? handleUpload : handlePickFile}
              variant="primary"
              size="large"
              loading={isLoading}
              style={styles.actionBtn}
            />
          </View>
        </KeyboardStickyView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  keyboardContainer: {
    flex: 1,
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
  headerTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: spacing.md,
  },
  docIcon: {
    fontSize: 36,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  /* Dropzone styles */
  uploadDropzone: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dropzoneIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropzoneIcon: {
    fontSize: 24,
  },
  dropzoneTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  dropzoneSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  browseBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  browseBadgeText: {
    ...typography.captionBold,
    color: '#FFFFFF',
    fontSize: 12,
  },
  /* Selected file card */
  selectedFileCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  fileCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileCardEmoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  selectedFileName: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.xs,
  },
  fileSizeText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  readyBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  readyBadgeText: {
    ...typography.captionBold,
    color: '#03543F',
    fontSize: 10,
  },
  fileCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  changeFileBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  changeFileBtnText: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
  },
  removeFileBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
  },
  removeFileBtnText: {
    ...typography.captionBold,
    color: colors.error,
    fontSize: 11,
  },
  /* Attached docs section */
  attachedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  noDocsBox: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
  },
  noDocsText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  docsList: {
    gap: spacing.xs,
  },
  docItemRow: {
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
  itemEmoji: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  docItemName: {
    ...typography.captionBold,
    color: colors.textPrimary,
    fontSize: 11,
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
  docDownloadBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: '#C7E0F4',
  },
  docDownloadBtnText: {
    ...typography.captionBold,
    color: colors.primary,
    fontSize: 10,
  },
  docDeleteBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  docDeleteBtnText: {
    ...typography.captionBold,
    color: colors.error,
    fontSize: 11,
  },
  inputLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  footerDock: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'android' ? spacing.lg : spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    width: '100%',
  },
});
