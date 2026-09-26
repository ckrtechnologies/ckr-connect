import { Linking, Alert } from 'react-native';

/**
 * Trigger Native Phone Dialer
 * @param {string} phone
 * @param {Function} [onError] - optional branded alert callback: (title, msg) => void
 */
export const makePhoneCall = async (phone, onError) => {
  const alert = onError || ((t, m) => Alert.alert(t, m));
  if (!phone) {
    alert('Phone Missing', 'No phone number available for this contact.');
    return;
  }
  const cleanPhone = String(phone).replace(/[^0-9+]/g, '');
  const url = `tel:${cleanPhone}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert('Not Supported', `Your device cannot dial ${phone} directly.`);
    }
  } catch (err) {
    alert('Dialer Error', err.message || 'Could not launch cellular dialer.');
  }
};

/**
 * Trigger WhatsApp Chat
 * @param {string} phone
 * @param {string} [defaultText]
 * @param {Function} [onError] - optional branded alert callback: (title, msg) => void
 */
export const openWhatsApp = async (phone, defaultText = '', onError) => {
  const alert = onError || ((t, m) => Alert.alert(t, m));
  if (!phone) {
    alert('Phone Missing', 'No phone number available for WhatsApp.');
    return;
  }
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const textParam = defaultText ? `?text=${encodeURIComponent(defaultText)}` : '';
  const url = `https://wa.me/${cleanPhone}${textParam}`;
  try {
    await Linking.openURL(url);
  } catch (err) {
    alert('WhatsApp Error', 'Could not open WhatsApp on this device.');
  }
};

/**
 * Trigger Email Client
 * @param {string} email
 * @param {string} [subject]
 * @param {Function} [onError] - optional branded alert callback: (title, msg) => void
 */
export const sendEmail = async (email, subject = '', onError) => {
  const alert = onError || ((t, m) => Alert.alert(t, m));
  if (!email) {
    alert('Email Missing', 'No email address available.');
    return;
  }
  const url = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  try {
    await Linking.openURL(url);
  } catch (err) {
    alert('Email Error', 'Could not launch email app.');
  }
};
