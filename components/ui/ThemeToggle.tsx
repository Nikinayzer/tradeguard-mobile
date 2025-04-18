import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ColorSchemeName } from '@/hooks/useColorScheme';
import { ThemedText } from './ThemedText';
import { Moon, Sun, Smartphone } from 'lucide-react-native';

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = true }: ThemeToggleProps) {
  const { colors, themePreference, setColorScheme, isDark } = useTheme();
  
  const handleThemeChange = async (theme: ColorSchemeName) => {
    await setColorScheme(theme);
  };
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <ThemedText variant="bodySmall" style={styles.label}>
          Theme
        </ThemedText>
      )}
      
      <View style={[
        styles.toggleContainer, 
        { backgroundColor: colors.backgroundTertiary }
      ]}>
        <TouchableOpacity
          style={[
            styles.toggleOption,
            themePreference === 'light' && [styles.activeToggle, { backgroundColor: colors.card }]
          ]}
          onPress={() => handleThemeChange('light')}
          activeOpacity={0.7}
        >
          <Sun 
            size={16} 
            color={themePreference === 'light' ? colors.primary : colors.textSecondary} 
          />
          {showLabel && (
            <ThemedText
              variant="caption"
              color={themePreference === 'light' ? colors.primary : colors.textSecondary}
              style={styles.toggleText}
            >
              Light
            </ThemedText>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleOption,
            themePreference === 'dark' && [styles.activeToggle, { backgroundColor: colors.card }]
          ]}
          onPress={() => handleThemeChange('dark')}
          activeOpacity={0.7}
        >
          <Moon 
            size={16} 
            color={themePreference === 'dark' ? colors.primary : colors.textSecondary} 
          />
          {showLabel && (
            <ThemedText
              variant="caption"
              color={themePreference === 'dark' ? colors.primary : colors.textSecondary}
              style={styles.toggleText}
            >
              Dark
            </ThemedText>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.toggleOption,
            themePreference === 'system' && [styles.activeToggle, { backgroundColor: colors.card }]
          ]}
          onPress={() => handleThemeChange('system')}
          activeOpacity={0.7}
        >
          <Smartphone 
            size={16} 
            color={themePreference === 'system' ? colors.primary : colors.textSecondary} 
          />
          {showLabel && (
            <ThemedText
              variant="caption"
              color={themePreference === 'system' ? colors.primary : colors.textSecondary}
              style={styles.toggleText}
            >
              Auto
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  activeToggle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  toggleText: {
    marginLeft: 4,
  },
}); 