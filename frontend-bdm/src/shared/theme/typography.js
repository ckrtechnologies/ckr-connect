/**
 * Segoe UI Variable / System Typography Ramp for React Native
 * v2 – slightly larger scale + heavier weights for readability on mobile
 */

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  display: {
    fontFamily,
    fontSize: 30,      // 28 → 30
    fontWeight: '700',
    lineHeight: 36,
  },
  title: {
    fontFamily,
    fontSize: 21,      // 20 → 21
    fontWeight: '700', // 600 → 700 (titles should read bold)
    lineHeight: 27,
  },
  subtitle: {
    fontFamily,
    fontSize: 17,      // 16 → 17
    fontWeight: '600',
    lineHeight: 23,
  },
  bodyBold: {
    fontFamily,
    fontSize: 15,      // 14 → 15
    fontWeight: '700', // 600 → 700 (truly bold body copy)
    lineHeight: 21,
  },
  body: {
    fontFamily,
    fontSize: 15,      // 14 → 15
    fontWeight: '400',
    lineHeight: 22,
  },
  captionBold: {
    fontFamily,
    fontSize: 13,      // 12 → 13
    fontWeight: '700', // 600 → 700
    lineHeight: 18,
  },
  caption: {
    fontFamily,
    fontSize: 13,      // 12 → 13
    fontWeight: '500', // 400 → 500 (captions are often labels — 500 is much more legible)
    lineHeight: 18,
  },
  overline: {
    fontFamily,
    fontSize: 11,      // 10 → 11
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};
