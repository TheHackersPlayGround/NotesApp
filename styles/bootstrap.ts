import { StyleSheet } from 'react-native';

// Bootstrap 5 Color Palette
export const c = {
  PRIMARY: '#0d6efd',
  SECONDARY: '#6c757d',
  SUCCESS: '#198754',
  INFO: '#0dcaf0',
  WARNING: '#ffc107',
  DANGER: '#dc3545',
  LIGHT: '#f8f9fa',
  DARK: '#212529',
  WHITE: '#ffffff',
  TRANSPARENT: 'transparent',
};

export const s = StyleSheet.create({
  // Layout & Flex
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  justifyContentBetween: { justifyContent: 'space-between' },
  justifyContentCenter: { justifyContent: 'center' },
  justifyContentEnd: { justifyContent: 'flex-end' },
  alignItemsCenter: { alignItems: 'center' },
  w100: { width: '100%' },

  // Spacing (Margins)
  m1: { margin: 4 },
  m2: { margin: 8 },
  m3: { margin: 16 },
  mt1: { marginTop: 4 },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 16 },
  mt4: { marginTop: 24 },
  mt5: { marginTop: 48 },
  mb1: { marginBottom: 4 },
  mb2: { marginBottom: 8 },
  mb3: { marginBottom: 16 },
  ml2: { marginLeft: 8 },
  my3: { marginVertical: 16 },
  m4: { margin: 24 },       // Added this
  mb4: { marginBottom: 24 }, // Added this
  mx3: { marginLeft: 16, marginRight: 16 },
  px3: { paddingLeft: 16, paddingRight: 16 },
  mx2: { marginLeft: 8, marginRight: 8 },

  // Spacing (Padding)
  p1: { padding: 4 },
  p2: { padding: 8 },
  p3: { padding: 16 },
  p4: { padding: 24 },
  p5: { padding: 48 },

  // Typography
  h3: { fontSize: 28 },
  h4: { fontSize: 24 },
  textCenter: { textAlign: 'center' },
  textWhite: { color: c.WHITE },
  textMuted: { color: c.SECONDARY },
  textDark: { color: c.DARK },
  textPrimary: { color: c.PRIMARY },
  textDanger: { color: c.DANGER },
  fontWeightBold: { fontWeight: 'bold' },

  // Backgrounds
  bgPrimary: { backgroundColor: c.PRIMARY },
  bgWhite: { backgroundColor: c.WHITE },
  bgLight: { backgroundColor: c.LIGHT },
  bgTransparent: { backgroundColor: c.TRANSPARENT },

  // Components
  rounded: { borderRadius: 8 },
  roundedLg: { borderRadius: 20 },
  shadowSm: {
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shadow: {
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});