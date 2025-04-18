import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ColorSchemeName = 'light' | 'dark' | 'system';

// Key for storing theme preference
const THEME_PREFERENCE_KEY = '@theme_preference';

export function useColorScheme(forceUpdate = false) {
  const systemColorScheme = useNativeColorScheme() as 'light' | 'dark';
  const [themePreference, setThemePreference] = useState<ColorSchemeName>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on first render
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
        if (savedPreference) {
          setThemePreference(savedPreference as ColorSchemeName);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadThemePreference();
  }, []);

  // Set theme preference and save it
  const setTheme = async (newTheme: ColorSchemeName) => {
    setThemePreference(newTheme);
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Determine the actual color scheme based on preference
  const actualColorScheme = 
    themePreference === 'system'
      ? systemColorScheme
      : themePreference;

  return {
    colorScheme: isLoaded ? actualColorScheme : 'light',
    setColorScheme: setTheme,
    themePreference,
    systemColorScheme,
    isLoaded
  };
}
