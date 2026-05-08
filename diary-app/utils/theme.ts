/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';


export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const colors = {
  // Brand — background image colors, do not use as UI surfaces
  brand: {
    deep: '#014DB4',
    mid: '#09ABE8',
    glow: '#82F9FD',
  },

  surface: {
    glass: 'rgba(0, 0, 0, 0.40)',
    glassHover: 'rgba(0, 0, 0, 0.60)',
    card: 'rgba(0, 0, 0, 0.62)',           // dark enough to read on any background
    cardBorder: 'rgba(255, 255, 255, 0.14)',
    dark: 'rgba(0, 0, 0, 0.78)',
    darkBorder: 'rgba(255, 255, 255, 0.12)',
    solid: 'rgba(15, 15, 15, 0.95)',
    solidBorder: 'rgba(255, 255, 255, 0.20)',
  },

  // Text — for use on top of the background image
  text: {
    primary: '#FFFFFF',
    secondary: '#D0E4FF',        // was CBD8E8
    muted: '#90AECE',            // was 7A9CC4 — slightly brighter
    onLight: '#012A6B',
    onLightMuted: '#3A5F99',
  },
  // Accent — buttons, CTAs, highlights
  accent: {
    white: '#FFFFFF',         // primary button
    ghost: '#E8F4FF',         // ghost / secondary button
    yellow: '#FFD166',        // warm highlight
    coral: '#FF6B8A',         // destructive / emotional
  },

  // Semantic
  semantic: {
    success: '#00E5A0',
    warning: '#FFD166',
    error: '#FF6B8A',
  },

  // Borders
  border: {
    light: 'rgba(255, 255, 255, 0.20)',
    medium: 'rgba(255, 255, 255, 0.30)',
    dark: 'rgba(1, 20, 60, 0.20)',
  },
} as const

export const typography = {
  sizes: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 60,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const

export const shadows = {
  card: {
    shadowColor: '#001433',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  subtle: {
    shadowColor: '#001433',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
} as const
