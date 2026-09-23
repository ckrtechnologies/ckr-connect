import { Linking, Alert } from 'react-native';
import { sanitizePhone } from './formatters.js';

/**
 * Initiate mobile cellular phone call
 * @param {string} phone
 * @param {string} [name='Contact']
 */
export const makePhoneCall = async (phone, name = 'Contact') => {
  if (!phone) {
    Alert.alert('Missing Phone', `No phone number recorded for ${name}.`);
    return;
  }
  const clean = sanitizePhone(phone);
  const url = `tel:${clean}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Dialer Unavailable', `Cannot initiate cellular call to ${phone} on this device.`);
    }
  } catch (err) {
    console.warn('[makePhoneCall] error:', err);
    Alert.alert('Dialer Error', `Could not open dialer for ${phone}.`);
  }
};

/**
 * Open WhatsApp chat with contact
 * @param {string} phone
 * @param {string} [message='']
 */
export const openWhatsApp = async (phone, message = '') => {
  if (!phone) {
    Alert.alert('Missing Phone', 'No phone number available for WhatsApp.');
    return;
  }
  const clean = phone.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  const url = `https://wa.me/${clean}${message ? `?text=${encodedMsg}` : ''}`;
  try {
    await Linking.openURL(url);
  } catch (err) {
    console.warn('[openWhatsApp] error:', err);
    Alert.alert('WhatsApp Error', 'Could not open WhatsApp. Ensure WhatsApp is installed.');
  }
};

/**
 * Open default email client
 * @param {string} email
 * @param {string} [subject='']
 */
export const openEmail = async (email, subject = '') => {
  if (!email) {
    Alert.alert('Missing Email', 'No email address recorded.');
    return;
  }
  const url = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  try {
    await Linking.openURL(url);
  } catch (err) {
    console.warn('[openEmail] error:', err);
    Alert.alert('Email Error', 'Could not open email application.');
  }
};
