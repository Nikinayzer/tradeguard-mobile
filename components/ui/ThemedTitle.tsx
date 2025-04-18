import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type TitleVariant = 
  | 'large'   // 24px, bold
  | 'medium'  // 20px, bold
  | 'small';  // 18px, semibold

export interface ThemedTitleProps extends TextProps {
  children: React.ReactNode;
  variant?: TitleVariant;
  color?: string;
  style?: TextStyle;
  centered?: boolean;
  mt?: number;
  mb?: number;
  ml?: number;
  mr?: number;
  mx?: number;
  my?: number;
  m?: number;
  p?: number;
  pt?: number;
  pb?: number;
  pl?: number;
  pr?: number;
  px?: number;
  py?: number;
  containerStyle?: ViewStyle;
  weight?: 'normal' | '500' | '600' | '700' | 'bold';
  secondary?: boolean;
}

export function ThemedTitle({
  children,
  variant = 'large',
  color,
  style,
  centered = false,
  mt,
  mb = variant === 'large' ? 16 : variant === 'medium' ? 12 : 8, // Default bottom margins based on size
  ml,
  mr,
  mx,
  my,
  m,
  p,
  pt,
  pb,
  pl,
  pr,
  px,
  py,
  containerStyle,
  weight,
  secondary,
  ...rest
}: ThemedTitleProps) {
  const { colors } = useTheme();
  
  // Use provided color or default to appropriate color from theme
  const textColor = color || (secondary ? colors.textSecondary : colors.text);
  
  // Calculate margin and padding styles
  const marginStyle: ViewStyle = {
    marginTop: mt !== undefined ? mt : my !== undefined ? my : m,
    marginBottom: mb !== undefined ? mb : my !== undefined ? my : m,
    marginLeft: ml !== undefined ? ml : mx !== undefined ? mx : m,
    marginRight: mr !== undefined ? mr : mx !== undefined ? mx : m,
  };
  
  const paddingStyle: ViewStyle = {
    paddingTop: pt !== undefined ? pt : py !== undefined ? py : p,
    paddingBottom: pb !== undefined ? pb : py !== undefined ? py : p,
    paddingLeft: pl !== undefined ? pl : px !== undefined ? px : p,
    paddingRight: pr !== undefined ? pr : px !== undefined ? px : p,
  };
  
  // Apply weight override if provided
  const fontWeightStyle = weight ? { fontWeight: weight } : {};
  
  // If we have margin/padding, wrap in a View
  const hasLayout = Object.values(marginStyle).some(val => val !== undefined) || 
                    Object.values(paddingStyle).some(val => val !== undefined);
  
  const textElement = (
    <Text
      style={[
        styles[variant],
        { color: textColor },
        centered && styles.centered,
        fontWeightStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
  
  if (hasLayout || containerStyle) {
    // Clean up undefined values
    const cleanMarginStyle = Object.fromEntries(
      Object.entries(marginStyle).filter(([_, v]) => v !== undefined)
    );
    
    const cleanPaddingStyle = Object.fromEntries(
      Object.entries(paddingStyle).filter(([_, v]) => v !== undefined)
    );
    
    return (
      <View style={[cleanMarginStyle, cleanPaddingStyle, containerStyle]}>
        {textElement}
      </View>
    );
  }
  
  return textElement;
}

const styles = StyleSheet.create({
  large: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  medium: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  small: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  },
  centered: {
    textAlign: 'center',
  },
}); 