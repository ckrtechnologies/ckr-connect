import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { useUploadBrdMutation } from '../api.js';

export const UploadBrdScreen = ({ route, navigation }) => {
  const { leadId, currentBrd } = route.params;
  const [uploadBrd, { isLoading }] = useUploadBrdMutation();
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSelectFile = () => {
    // In React Native bare CLI, DocumentPicker opens native file selector.
    // For standard demonstration, simulate selection of client BRD document:
    setSelectedFile({
      name: 'ClientRequirementScope_BRD.pdf',
      type: 'application/pdf',
      size: '2.4 MB',
      uri: 'file:///sample/ClientRequirementScope_BRD.pdf',
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('File Required', 'Please select a PDF or DOCX file to upload.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('brd', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.type,
      });

      await uploadBrd({ id: leadId, formData }).unwrap();
      Alert.alert('Upload Successful', `${selectedFile.name} attached to lead.`);
      navigation.goBack();
    } catch (err) {
      const msg = err?.data?.message || err?.message || 'Could not upload BRD file.';
      Alert.alert('Upload Failed', msg);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ATTACH BRD</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <FluentCard style={styles.card}>
          <Text style={styles.docIcon}>📄</Text>
          <Text style={styles.title}>Attach Client Scope Document (BRD)</Text>
          <Text style={styles.subtitle}>
            PDF or DOCX files stored securely on CKR VPS disk.
          </Text>

          {currentBrd ? (
            <View style={styles.existingBox}>
              <Text style={styles.existingLabel}>CURRENT FILE ATTACHED:</Text>
              <Text style={styles.existingName}>{currentBrd.split('/').pop()}</Text>
            </View>
          ) : null}

          {selectedFile ? (
            <View style={styles.fileSelectedBox}>
              <Text style={styles.fileSelectedName}>✓ {selectedFile.name}</Text>
              <Text style={styles.fileSelectedSize}>{selectedFile.size}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.dropZone}
              onPress={handleSelectFile}
              activeOpacity={0.7}
            >
              <Text style={styles.dropZoneText}>Tap to select document from device</Text>
              <Text style={styles.dropZoneSub}>Max file size 25 MB</Text>
            </TouchableOpacity>
          )}

          <FluentButton
            title={selectedFile ? 'Upload & Attach Document' : 'Choose Document'}
            onPress={selectedFile ? handleUpload : handleSelectFile}
            variant="primary"
            size="large"
            loading={isLoading}
            style={styles.actionBtn}
          />
        </FluentCard>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
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
  },
  placeholder: {
    width: 60,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  docIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  existingBox: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    width: '100%',
    marginBottom: spacing.md,
  },
  existingLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 9,
  },
  existingName: {
    ...typography.captionBold,
    color: colors.primary,
    marginTop: 2,
  },
  fileSelectedBox: {
    backgroundColor: colors.primaryLight,
    borderColor: '#C7E0F4',
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  fileSelectedName: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  fileSelectedSize: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dropZone: {
    width: '100%',
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  dropZoneText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  dropZoneSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actionBtn: {
    width: '100%',
  },
});
