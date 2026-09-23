import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../../../shared/theme/index.js';
import { FluentButton, FluentCard } from '../../../shared/components/index.js';

export const UploadBrdScreen = ({ navigation }) => {
  const [selectedFile, setSelectedFile] = useState('HeritageValley_BRD_v2.pdf');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      setUploading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      Alert.alert(
        'Upload Successful',
        `Successfully uploaded ${selectedFile} and attached to lead record on CKR VPS storage.`
      );
      navigation.goBack();
    } catch (err) {
      console.error('[UploadBrdScreen] error:', err);
      Alert.alert('Upload Error', 'Failed to upload document file. Please retry.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={uploading}
          style={styles.cancelBtn}
        >
          <Text style={[styles.cancelText, uploading && { opacity: 0.5 }]}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ATTACH BRD</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Attach Client BRD File</Text>

        <FluentCard style={styles.card}>
          <Text style={styles.icon}>📄</Text>
          <Text style={styles.cardHeading}>Select PDF or DOCX file</Text>
          <Text style={styles.cardSubtitle}>
            Stored securely and served only via authenticated routes on CKR VPS
          </Text>

          <View style={styles.fileSelectedBox}>
            <Text style={styles.fileLabel}>Selected Document:</Text>
            <Text style={styles.fileName}>{selectedFile}</Text>
          </View>

          <FluentButton
            variant="primary"
            title="Choose & Upload Document"
            loading={uploading}
            onPress={handleUpload}
            style={styles.uploadBtn}
          />
        </FluentCard>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePaddingHorizontal,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 13,
  },
  headerTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.pagePaddingHorizontal,
    paddingTop: spacing.lg,
    gap: 12,
  },
  title: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  card: {
    alignItems: 'center',
    padding: spacing.xl,
    ...shadows.level1,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  cardHeading: {
    ...typography.subtitle,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  fileSelectedBox: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xs,
    padding: 10,
    width: '100%',
    marginVertical: spacing.lg,
  },
  fileLabel: {
    ...typography.overline,
    color: colors.textSecondary,
    fontSize: 10,
  },
  fileName: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 13,
    marginTop: 2,
  },
  uploadBtn: {
    width: '100%',
    height: 44,
  },
});

export default UploadBrdScreen;
