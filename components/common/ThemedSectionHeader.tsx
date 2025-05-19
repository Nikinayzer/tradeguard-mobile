import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemedSectionHeaderProps {
    title: string;
    icon?: React.ReactNode;
    showSeeAll?: boolean;
    onSeeAll?: () => void;
}

export const ThemedSectionHeader: React.FC<ThemedSectionHeaderProps> = ({
    title,
    icon,
    showSeeAll = false,
    onSeeAll
}) => {
    const { colors } = useTheme();

    return (
        <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
                {icon && (
                    <View style={styles.iconContainer}>
                        {icon}
                    </View>
                )}
                <ThemedText variant="heading3" style={styles.sectionTitle}>{title}</ThemedText>
            </View>
            {showSeeAll && onSeeAll && (
                <TouchableOpacity 
                    style={styles.seeAllButton}
                    onPress={onSeeAll}
                >
                    <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>
                        See All
                    </ThemedText>
                    <ChevronRight size={16} color={colors.primary}/>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: 'bold',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        marginRight: 4,
    },
}); 