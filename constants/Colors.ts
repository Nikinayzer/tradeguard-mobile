/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primaryBlue = '#0A2463';        // Dark blue
const primaryBlueDark = '#061A4B';    // Darker blue
const primaryBlueLight = '#173480';   // Slightly lighter blue
const accentBlue = '#3E7BFA';         // Bright accent blue
const accentBlueDark = '#2D5BD1';     // Darker accent
const accentBlueLight = '#5C8FFF';    // Lighter accent

export const Colors = {
  light: {
    // Basic UI
    text: '#000814',           // Almost black
    textSecondary: '#1B2B40',  // Dark blue-gray
    textTertiary: '#3F5671',   // Medium blue-gray
    background: '#EDF2F7',     // Slightly darker gray-blue (was F8FAFC)
    backgroundSecondary: '#DCE6F2', // Slightly darker (was EDF2F7)
    backgroundTertiary: '#C9D8E8', // Slightly darker (was D9E2EC)
    tint: accentBlue,
    tabIconDefault: '#5D7290',
    tabIconSelected: accentBlue,
    
    // Cards and Containers
    card: '#FFFFFF',
    cardBorder: '#C5D5E5',     // Slightly darker border (was D2DCE8)
    modalBackground: '#FFFFFF',
    
    // Investment-specific
    profit: '#057A55',
    loss: '#C81E1E',
    warning: '#B45309',
    
    // Feature colors
    primary: primaryBlue,
    primaryLight: 'rgba(10, 36, 99, 0.1)',
    primaryDark: primaryBlueDark,
    secondary: '#5E3AD1',      // Purple that complements dark blue
    secondaryLight: 'rgba(94, 58, 209, 0.1)',
    secondaryDark: '#4822BD',
    
    // Status colors
    success: '#057A55',
    successLight: 'rgba(5, 122, 85, 0.1)',
    error: '#C81E1E',
    errorLight: 'rgba(200, 30, 30, 0.1)',
    inactive: '#5D7290',
    inactiveLight: 'rgba(93, 114, 144, 0.1)',
    
    // UI Element colors
    divider: '#C5D5E5',        // Slightly darker divider (was D2DCE8)
    inputBackground: '#EDF2F7', // Slightly darker (was F8FAFC)
    inputBorder: '#97AABF',
    inputText: '#000814',
    
    // Button colors
    buttonPrimary: accentBlue,
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: '#DCE6F2',
    buttonSecondaryText: '#1B2B40',
    buttonDisabled: '#CBD5E1',
    buttonDisabledText: '#64748B',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    background: '#020A18',     // Very dark blue
    backgroundSecondary: '#0A1A31',  // Dark blue background
    backgroundTertiary: '#142847',   // Medium-dark blue
    tint: accentBlueLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: accentBlueLight,
    
    // Cards and Containers
    card: 'rgba(10, 26, 49, 0.8)',
    cardBorder: 'rgba(20, 40, 71, 0.9)',
    modalBackground: '#0A1A31',
    
    // Investment-specific
    profit: '#10B981',
    loss: '#F87171',
    warning: '#FBBF24',
    
    // Feature colors
    primary: accentBlue,
    primaryLight: 'rgba(62, 123, 250, 0.15)',
    primaryDark: accentBlueDark,
    secondary: '#8B5CF6',
    secondaryLight: 'rgba(139, 92, 246, 0.15)',
    secondaryDark: '#7C3AED',
    
    // Status colors
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    error: '#EF4444',
    errorLight: 'rgba(239, 68, 68, 0.15)',
    inactive: '#94A3B8',
    inactiveLight: 'rgba(148, 163, 184, 0.15)',
    
    // UI Element colors
    divider: 'rgba(20, 40, 71, 0.9)',
    inputBackground: 'rgba(10, 26, 49, 0.7)',
    inputBorder: 'rgba(20, 40, 71, 0.9)',
    inputText: '#F8FAFC',
    
    // Button colors
    buttonPrimary: accentBlue,
    buttonPrimaryText: '#FFFFFF',
    buttonSecondary: 'rgba(20, 40, 71, 0.8)',
    buttonSecondaryText: '#CBD5E1',
    buttonDisabled: 'rgba(20, 40, 71, 0.4)',
    buttonDisabledText: '#64748B',
  },
};
