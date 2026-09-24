import { Linking, Alert } from 'react-native';

/**
 * Trigger Native Phone Dialer
 */
export const makePhoneCall = async (phone) => {
  if (!phone) {
    Alert.alert('Phone Missing', 'No phone number available for this contact.');
    return;
  }
  const cleanPhone = String(phone).replace(/[^0-9+]/g, '');
  const url = `tel:${cleanPhone}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Not Supported', `Your device cannot dial ${phone} directly.`);
    }
  } catch (err) {
    Alert.alert('Dialer Error', err.message || 'Could not launch cellular dialer.');
  }
};

/**
 * Trigger WhatsApp Chat
 */
export const openWhatsApp = async (phone, defaultText = '') => {
  if (!phone) {
    Alert.alert('Phone Missing', 'No phone number available for WhatsApp.');
    return;
  }
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const textParam = defaultText ? `?text=${encodeURIComponent(defaultText)}` : '';
  const url = `https://wa.me/${cleanPhone}${textParam}`;
  try {
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert('WhatsApp Error', 'Could not open WhatsApp on this device.');
  }
};

/**
 * Trigger Email Client
 */
export const sendEmail = async (email, subject = '') => {
  if (!email) {
    Alert.alert('Email Missing', 'No email address available.');
    return;
  }
  const url = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  try {
    await Linking.openURL(url);
  } catch (err) {
    Alert.alert('Email Error', 'Could not launch email app.');
  }
};
