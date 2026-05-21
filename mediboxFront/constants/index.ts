// ─── Cores do tema ──────────────────────────────────────────────
export const Colors = {
  primary: '#0F6E56',
  primaryLight: '#1D9E75',
  primaryDark: '#085041',

  background: '#F8FAF9',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F3',

  textPrimary: '#1A2E28',
  textSecondary: '#5A7A72',
  textMuted: '#8FA8A1',

  border: '#DDE8E5',
  borderLight: '#EEF3F2',

  success: '#3B6D11',
  successBg: '#EAF3DE',
  warning: '#854F0B',
  warningBg: '#FAEEDA',
  danger: '#A32D2D',
  dangerBg: '#FCEBEB',
  info: '#185FA5',
  infoBg: '#E6F1FB',

  white: '#FFFFFF',
  black: '#000000',
};

export const ColorsDark = {
  primary: '#1D9E75',
  primaryLight: '#5DCAA5',
  primaryDark: '#0F6E56',

  background: '#0D1F1A',
  surface: '#152920',
  surfaceAlt: '#1C3529',

  textPrimary: '#E8F5F0',
  textSecondary: '#7AB09F',
  textMuted: '#4D7A6C',

  border: '#2A4A3E',
  borderLight: '#1E3830',

  success: '#9FE1CB',
  successBg: '#0D2E22',
  warning: '#FAC775',
  warningBg: '#2E1E05',
  danger: '#F09595',
  dangerBg: '#2E0D0D',
  info: '#85B7EB',
  infoBg: '#0A1E35',

  white: '#FFFFFF',
  black: '#000000',
};

// ─── Cores dos medicamentos ──────────────────────────────────────
export const MedicationColors = {
  blue:   { bg: '#E6F1FB', text: '#185FA5', dot: '#378ADD' },
  green:  { bg: '#EAF3DE', text: '#3B6D11', dot: '#639922' },
  amber:  { bg: '#FAEEDA', text: '#854F0B', dot: '#EF9F27' },
  coral:  { bg: '#FAECE7', text: '#993C1D', dot: '#D85A30' },
  teal:   { bg: '#E1F5EE', text: '#0F6E56', dot: '#1D9E75' },
} as const;

// ─── Espaçamentos ────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// ─── Tipografia ──────────────────────────────────────────────────
export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
};

// ─── Border Radius ───────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

// ─── Config da API ───────────────────────────────────────────────
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

// ─── Config de compartimentos ────────────────────────────────────
export const MAX_COMPARTMENTS = 6;
