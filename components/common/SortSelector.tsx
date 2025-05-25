import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SortAsc, SortDesc, Filter, LucideIcon } from 'lucide-react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';

export interface SortField {
    key: string;
    label: string;
    icon?: LucideIcon;
}

interface SortConfig {
    field: string;
    order: 'asc' | 'desc';
}

interface SortSelectorProps {
    fields: SortField[];
    sortConfig: SortConfig;
    onSort: (field: string) => void;
}

export function SortSelector({ fields, sortConfig, onSort }: SortSelectorProps) {
    const { colors } = useTheme();

    const renderSortButton = (field: SortField) => {
        const isActive = sortConfig.field === field.key;
        const SortIcon = isActive && sortConfig.order === 'desc' ? SortDesc : SortAsc;
        
        return (
            <TouchableOpacity
                key={field.key}
                onPress={() => onSort(field.key)}
            >
                <ThemedView
                    variant="section"
                    style={{
                        ...styles.sortButton,
                        ...(isActive ? { backgroundColor: `${colors.primary}B3` } : {})
                    }}
                    rounded="medium"
                >
                    <View style={styles.sortButtonContent}>
                        <SortIcon 
                            size={14} 
                            color={isActive ? colors.background : colors.textSecondary} 
                        />
                        <ThemedText 
                            variant="caption" 
                            color={isActive ? colors.background : colors.textSecondary}
                            style={styles.sortButtonText}
                        >
                            {field.label}
                        </ThemedText>
                        {field.icon && (
                            <field.icon 
                                size={14} 
                                color={isActive ? colors.background : colors.textSecondary}
                                style={styles.fieldIcon}
                            />
                        )}
                    </View>
                </ThemedView>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView variant="transparent" style={styles.container}>
            <ThemedView variant="transparent" style={styles.header}>
                <View style={styles.headerContent}>
                    <Filter size={16} color={colors.textSecondary} />
                    <ThemedText variant="caption" secondary style={styles.headerText}>
                        Sort by
                    </ThemedText>
                </View>
            </ThemedView>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.buttonsContainer}
            >
                {fields.map(renderSortButton)}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 13,
        marginLeft: 6,
    },
    buttonsContainer: {
        paddingRight: 16,
    },
    sortButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    sortButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fieldIcon: {
        marginLeft: 4,
    },
    sortButtonText: {
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },
}); 