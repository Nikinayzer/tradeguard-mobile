import React from 'react';
import { View, ViewProps, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type ViewVariant = 
  | 'screen'     // Main screen background
  | 'card'       // Card container
  | 'modal'      // Modal container
  | 'input'      // Input container
  | 'section'    // Section container
  | 'transparent'; // Transparent background

export interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
  variant?: ViewVariant;
  style?: ViewStyle;
  border?: boolean;
  padding?: boolean | 'small' | 'medium' | 'large';
  margin?: boolean | 'small' | 'medium' | 'large';
  rounded?: boolean | 'small' | 'medium' | 'large' | 'full';
}

export function ThemedView({
  children,
  variant = 'transparent',
  style,
  border = false,
  padding = false,
  margin = false,
  rounded = false,
  ...rest
}: ThemedViewProps) {
  const { colors, isDark } = useTheme();
  
  // Determine background color based on variant
  const getBackgroundColor = () => {
    switch (variant) {
      case 'screen':
        return colors.background;
      case 'card':
        return colors.card;
      case 'modal':
        return colors.modalBackground;
      case 'input':
        return colors.inputBackground;
      case 'section':
        return colors.backgroundSecondary;
      case 'transparent':
      default:
        return undefined;
    }
  };
  
  // Determine border style if enabled
  const getBorderStyle = () => {
    if (!border) return {};
    return {
      borderWidth: 1,
      borderColor: colors.cardBorder,
    };
  };
  
  // Determine padding value
  const getPadding = () => {
    if (padding === false) return {};
    if (padding === true) return { padding: 16 };
    
    switch (padding) {
      case 'small': return { padding: 8 };
      case 'medium': return { padding: 16 };
      case 'large': return { padding: 24 };
      default: return {};
    }
  };
  
  // Determine margin value
  const getMargin = () => {
    if (margin === false) return {};
    if (margin === true) return { margin: 16 };
    
    switch (margin) {
      case 'small': return { margin: 8 };
      case 'medium': return { margin: 16 };
      case 'large': return { margin: 24 };
      default: return {};
    }
  };
  
  // Determine border radius
  const getBorderRadius = () => {
    if (rounded === false) return {};
    if (rounded === true) return { borderRadius: 12 };
    
    switch (rounded) {
      case 'small': return { borderRadius: 8 };
      case 'medium': return { borderRadius: 12 };
      case 'large': return { borderRadius: 16 };
      case 'full': return { borderRadius: 9999 };
      default: return {};
    }
  };
  
  return (
    <View
      style={[
        { backgroundColor: getBackgroundColor() },
        getBorderStyle(),
        getPadding(),
        getMargin(),
        getBorderRadius(),
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
} 