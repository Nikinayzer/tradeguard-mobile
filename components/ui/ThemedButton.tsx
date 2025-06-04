import React from 'react';
import { 
  TouchableOpacity, 
  TouchableOpacityProps, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import tinycolor from "tinycolor2";

export type ButtonVariant = 
  | 'primary'    // Main CTA button
  | 'secondary'  // Secondary action button
  | 'outlined'   // Outlined button
  | 'ghost';     // Minimal button

export type ButtonSize = 
  | 'small'
  | 'medium'
  | 'large';

export interface ThemedButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  textColor?: string;
}

export function ThemedButton({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  textColor,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const { colors, isDark } = useTheme();
  
  // Determine button style based on variant
  const getButtonStyle = () => {
    if (disabled) {
      return {
        backgroundColor: colors.buttonDisabled,
        borderColor: colors.buttonDisabled,
      };
    }
    
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: tinycolor(colors.primary).lighten(20).toHexString(),
          borderColor: colors.buttonPrimary,
        };
      case 'secondary':
        return {
          backgroundColor: colors.buttonSecondary,
          borderColor: colors.buttonSecondary,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.buttonPrimary,
          borderWidth: 1,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      default:
        return {};
    }
  };
  
  // Determine text color based on variant or custom color
  const getTextColor = () => {
    if (disabled) {
      return colors.buttonDisabledText;
    }
    
    // If custom text color is provided, use it
    if (textColor) {
      // Check if it's a key in the colors object
      if (textColor in colors) {
        return colors[textColor as keyof typeof colors];
      }
      // Otherwise use it as a direct color value
      return textColor;
    }
    
    switch (variant) {
      case 'primary':
        return colors.buttonPrimaryText;
      case 'secondary':
        return colors.buttonSecondaryText;
      case 'outlined':
        return colors.buttonPrimary;
      case 'ghost':
        return colors.buttonPrimary;
      default:
        return colors.text;
    }
  };
  
  // Determine button sizing
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      case 'medium':
      default:
        return styles.mediumButton;
    }
  };
  
  // Determine text sizing
  const getTextSize = (): 'bodySmall' | 'body' | 'bodyBold' => {
    switch (size) {
      case 'small':
        return 'bodySmall';
      case 'large':
        return 'bodyBold';
      case 'medium':
      default:
        return 'body';
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyle(),
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()}
        />
      ) : (
        <>
          {leftIcon && (
            <View style={styles.iconLeft}>
              {React.isValidElement(leftIcon) 
                ? React.cloneElement(leftIcon as React.ReactElement, { 
                    color: (leftIcon as React.ReactElement).props.color || getTextColor(),
                    ...((leftIcon as React.ReactElement).props || {})
                  })
                : leftIcon
              }
            </View>
          )}
          <ThemedText 
            variant={getTextSize()} 
            color={getTextColor()}
            style={{
              ...styles.buttonText,
              ...(textStyle || {})
            }}
          >
            {children}
          </ThemedText>
          {rightIcon && (
            <View style={styles.iconRight}>
              {React.isValidElement(rightIcon) 
                ? React.cloneElement(rightIcon as React.ReactElement, { 
                    color: (rightIcon as React.ReactElement).props.color || getTextColor(),
                    ...((rightIcon as React.ReactElement).props || {})
                  })
                : rightIcon
              }
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  fullWidth: {
    width: '100%',
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
}); 