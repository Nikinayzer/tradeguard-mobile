import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedView } from '@/components/ui/ThemedView';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
    containerStyle?: ViewStyle;
}

export function SearchBar({ containerStyle, ...props }: SearchBarProps) {
    const { colors } = useTheme();

    const containerStyles: ViewStyle = {
        ...styles.container,
        ...(containerStyle || {})
    };
    
    return (
        <ThemedView 
            variant="section" 
            rounded 
            border
            style={containerStyles}
        >
            <Search size={18} color={colors.textTertiary} style={styles.icon} />
            <TextInput
                {...props}
                style={[styles.input, { color: colors.text }]}
                placeholderTextColor={colors.textTertiary}
                selectionColor={colors.primary}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        padding: 0,
        height: 24,
    },
}); 