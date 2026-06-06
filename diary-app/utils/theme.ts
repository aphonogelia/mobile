/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
    

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
    deep: '#00245acb',
    mid: '#b2d1ffcb',
    glow: '#4a93ff',
  },

  surface: {
    glass: 'rgba(255, 255, 255, 0.06)',
    glassHover: 'rgba(255, 255, 255, 0.10)',
    card: 'rgba(255, 255, 255, 0.045)',
    cardBorder: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(3, 8, 16, 0.72)',
    darkBorder: 'rgba(255, 255, 255, 0.10)',
    solid: 'rgba(7, 10, 16, 0.96)',
    solidBorder: 'rgba(255, 255, 255, 0.16)',
  },

  // Text — for use on top of the background image
  text: {
    primary: '#FFFFFF',
    secondary: '#c7deff',        // was CBD8E8
    muted: '#dbdde0', 
  },
  // Accent — buttons, CTAs, highlights
  accent: {
    primary: '#b2d1ff',
    error: '#ff6b8a',
  },


  // Borders
  border: {
    light: 'rgba(255, 255, 255, 0.20)',
    medium: 'rgba(255, 255, 255, 0.30)',
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
  md: 14,
  lg: 16,
  full: 999,
} as const

export const fontFamilies = {
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
  heading: 'DMSerifDisplay_400Regular',
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
