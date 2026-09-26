import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { colors } from '../../../shared/theme/colors.js';
import { typography } from '../../../shared/theme/typography.js';
import { spacing } from '../../../shared/theme/spacing.js';
import { radius } from '../../../shared/theme/radius.js';
import { FluentCard } from '../../../shared/components/FluentCard.jsx';
import { FluentButton } from '../../../shared/components/FluentButton.jsx';
import { logout, updateUserAvatar } from '../../auth/slice.js';
import { useUploadAvatarMutation } from '../../auth/api.js';
import { API_BASE_URL } from '../../../shared/store/baseApi.js';
import { ROUTES } from '../../../shared/navigation/routes.js';
import { storage } from '../../../shared/utils/storage.js';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters.js';
import { useAlert } from '../../../shared/components/AppAlert.jsx';

export const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user) || {};
  const { showAlert, AlertComponent } = useAlert();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();

  const handleLogout = () => {
    showAlert('confirm', 'Sign Out', 'Are you sure you want to sign out of CKR Connect Sales?', {
      confirmLabel: 'Sign Out',
      cancelLabel: 'Stay Signed In',
      onConfirm: async () => {
        try {
          await storage.clearAll();
          dispatch(logout());
        } catch (err) {
          console.error('Logout error:', err);
          dispatch(logout());
        }
      },
    });
  };

  const initials = (user.name || 'BDM')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'BD';

  const handleUploadDP = () => {
    Alert.alert(
      'Update Profile Picture',
      'Choose an option to update your display picture:',
      [
        {
          text: 'Take Photo',
          onPress: () => launchCamera({ mediaType: 'photo', quality: 0.8 }, handleImageResponse),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, handleImageResponse),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleImageResponse = async (res) => {
    if (res.didCancel) return;
    if (res.errorCode) {
      showAlert('error', 'Error', res.errorMessage || 'Camera/Gallery error');
      return;
    }
    const asset = res.assets && res.assets[0];
    if (!asset) return;

    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'avatar.jpg',
      });
      
      const uploadRes = await uploadAvatar(formData).unwrap();
      
      // uploadRes is the unpacked data from baseApi, so it's directly { profile_photo_url: '...' }
      if (uploadRes?.profile_photo_url) {
        dispatch(updateUserAvatar(uploadRes.profile_photo_url));
        storage.setUser({ ...user, avatar_url: uploadRes.profile_photo_url });
        showAlert('success', 'Profile Picture Updated', 'Your display picture has been updated successfully.');
      } else {
        showAlert('error', 'Upload Failed', 'Invalid response from server.');
      }
    } catch (err) {
      console.log('Upload error:', err);
      showAlert('error', 'Upload Failed', err?.data?.error || err?.error || err?.message || 'Could not upload display picture.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {AlertComponent}
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Identity Card */}
        <FluentCard style={styles.identityCard}>
          <View style={styles.avatarRow}>
            <TouchableOpacity 
              style={styles.avatarCircle}
              onPress={handleUploadDP}
              disabled={isUploadingAvatar}
              activeOpacity={0.8}
            >
              {user.avatar_url ? (
                <Image 
                  source={{ uri: `${API_BASE_URL}${user.avatar_url}` }} 
                  style={{ width: '100%', height: '100%', borderRadius: 32 }}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
              {isUploadingAvatar && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 32, justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              )}
              <View style={styles.editIconBadge}>
                <Text style={{fontSize: 10}}>✏️</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.identityDetails}>
              <Text style={styles.userName}>{user.name || 'Sales Representative'}</Text>
              <Text style={styles.userRole}>
                {user.designation || 'Business Development Manager'}
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.empIdBadge}>
                  <Text style={styles.empIdText}>
                    {user.employee_id || 'CKR-BDM-001'}
                  </Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              </View>
            </View>
          </View>
        </FluentCard>

        {/* Contact Information */}
        <FluentCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CONTACT & CREDENTIALS</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Work Email</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {user.email || 'bdm@ckrtechnologies.in'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user.phone || '+91 98765 43210'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{user.department || 'Enterprise Sales & BD'}</Text>
          </View>
        </FluentCard>

        {/* Tenure & Joining */}
        <FluentCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ORGANIZATION DETAILS</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date of Joining</Text>
            <Text style={styles.infoValue}>
              {user.date_of_joining ? formatDate(user.date_of_joining) : '24 Sep 2026'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>System Role</Text>
            <Text style={styles.infoValue}>BDM (Field & Telesales)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Branch / Division</Text>
            <Text style={styles.infoValue}>CKR Technologies HQ</Text>
          </View>
        </FluentCard>

        {/* Performance Targets */}
        <FluentCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ASSIGNED TARGETS</Text>
          <View style={styles.targetGrid}>
            <View style={styles.targetBox}>
              <Text style={styles.targetNum}>
                {user.daily_call_target || 15}
              </Text>
              <Text style={styles.targetLabel}>Daily Calls Target</Text>
            </View>
            <View style={styles.targetBox}>
              <Text style={[styles.targetNum, { color: colors.primary }]}>
                {user.target_amount ? formatCurrency(user.target_amount) : '₹25,00,000'}
              </Text>
              <Text style={styles.targetLabel}>Monthly Won Target</Text>
            </View>
          </View>
        </FluentCard>

        {/* Quick Shortcuts */}
        <FluentCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>SHORTCUTS & SETTINGS</Text>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate(ROUTES.ATTENDANCE_HISTORY)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>📅</Text>
            <Text style={styles.menuTitle}>Monthly Attendance Audit</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.menuRow}>
            <Text style={styles.menuIcon}>📱</Text>
            <Text style={styles.menuTitle}>App Version</Text>
            <Text style={styles.menuValue}>v1.0.0 (Build 2026.09.24)</Text>
          </View>
        </FluentCard>

        {/* Sign Out CTA */}
        <View style={styles.logoutWrapper}>
          <FluentButton
            title="Sign Out of Account"
            onPress={handleLogout}
            variant="danger"
            size="large"
          />
        </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topBarTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 40,
  },
  identityCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  identityDetails: {
    flex: 1,
  },
  userName: {
    ...typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  userRole: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  empIdBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  empIdText: {
    ...typography.captionBold,
    color: colors.primaryDark,
    fontSize: 11,
  },
  activeBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  activeBadgeText: {
    ...typography.captionBold,
    color: colors.successText,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: 4,
  },
  targetGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  targetBox: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  targetNum: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  targetLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  menuTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  menuArrow: {
    fontSize: 20,
    color: colors.textDisabled,
  },
  menuValue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  logoutWrapper: {
    marginTop: spacing.sm,
  },
});
