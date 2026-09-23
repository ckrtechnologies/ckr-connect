import { Platform } from 'react-native';

/**
 * Microsoft Fluent 2 Typography Ramp — CKR Connect BDM Mobile
 * Source of truth: docs/DESIGN.md §1.2 & prototype/tokens.css
 */
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  fontFamily,

  display: {
    fontFamily,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  title: {
    fontFamily,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodyBold: {
    fontFamily,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  captionBold: {
    fontFamily,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  overline: {
    fontFamily,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
};

export default typography;
