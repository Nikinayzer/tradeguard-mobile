import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    subtitle?: string;
    subtitleColor?: string;
    style?: ViewStyle;
}

export function StatCard({ 
    icon: Icon, 
    title, 
    value, 
    subtitle, 
    subtitleColor,
    style 
}: StatCardProps) {
    const { colors } = useTheme();
    const cardStyle = style ? { ...styles.statCard, ...style } : styles.statCard;

    return (
        <ThemedView 
            variant="card" 
            style={cardStyle} 
            border 
            rounded="medium"
        >
            <View style={styles.statHeader}>
                <Icon size={20} color={colors.textSecondary}/>
                <ThemedText variant="caption" secondary style={styles.statTitle}>
                    {title}
                </ThemedText>
            </View>
            <ThemedText variant="heading3" style={styles.statValue}>
                {value}
            </ThemedText>
            {subtitle && (
                <ThemedText 
                    variant="caption" 
                    color={subtitleColor || colors.textSecondary} 
                    style={styles.statChange}
                >
                    {subtitle}
                </ThemedText>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    statCard: {
        flex: 1,
        padding: 16,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    statTitle: {
        fontWeight: '500',
    },
    statValue: {
        marginBottom: 4,
    },
    statChange: {
        fontSize: 12,
    },
}); 