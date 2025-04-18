import {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';

/**
 * Manages visual state of status bar based on current theme
 */
export function StatusBarManager() {
    const {isDark, colors} = useTheme();

    useEffect(() => {
        StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
        StatusBar.setBackgroundColor(colors.background);
        StatusBar.setTranslucent(true);
    }, [isDark, colors.background]);

    return null;
}