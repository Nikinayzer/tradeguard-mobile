import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps extends Omit<TextInputProps, 'style'> {
    containerStyle?: object;
}

export function SearchBar({ containerStyle, ...props }: SearchBarProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            <Search size={18} color="#748CAB" style={styles.icon} />
            <TextInput
                {...props}
                style={styles.input}
                placeholderTextColor="#748CAB"
                selectionColor="#3B82F6"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B263B',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#22314A',
    },
    icon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        padding: 0,
        height: 24,
    },
}); 