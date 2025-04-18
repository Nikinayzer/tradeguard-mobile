import React, { createContext, useContext, PropsWithChildren, useMemo } from 'react';
import { useColorScheme, ColorSchemeName } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Define the shape of our theme context
export type ThemeContextType = {
  isDark: boolean;
  colors: typeof Colors.light | typeof Colors.dark;
  setColorScheme: (scheme: ColorSchemeName) => Promise<void>;
  themePreference: ColorSchemeName;
  systemColorScheme: 'light' | 'dark';
  toggleTheme: () => Promise<void>;
};

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: Colors.light,
  setColorScheme: async () => {},
  themePreference: 'system',
  systemColorScheme: 'light',
  toggleTheme: async () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Get the color scheme and theme setting functions
  const { colorScheme, setColorScheme, themePreference, systemColorScheme } = useColorScheme();
  
  // Determine if we're in dark mode
  const isDark = colorScheme === 'dark';
  
  // Get the appropriate color set based on the color scheme
  const colors = isDark ? Colors.dark : Colors.light;
  
  // Function to toggle between light and dark mode
  const toggleTheme = async () => {
    if (themePreference === 'system') {
      // If currently using system preference, switch to explicit light/dark
      await setColorScheme(systemColorScheme === 'light' ? 'dark' : 'light');
    } else {
      // If already using explicit setting, toggle it
      await setColorScheme(isDark ? 'light' : 'dark');
    }
  };
  
  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      isDark,
      colors,
      setColorScheme,
      themePreference,
      systemColorScheme,
      toggleTheme,
    }),
    [isDark, colors, setColorScheme, themePreference, systemColorScheme]
  );
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}; 