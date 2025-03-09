import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ArrowUpRight, ArrowDownRight} from 'lucide-react-native';

interface DirectionBadgeProps {
    isLong: boolean;
}

export const DirectionBadge: React.FC<DirectionBadgeProps> = ({isLong}) => {
    return (
        <View style={[styles.badge, isLong ? styles.longBadge : styles.shortBadge]}>
            {isLong ? (
                <ArrowUpRight size={16} color="#22C55E"/>
            ) : (
                <ArrowDownRight size={16} color="#EF4444"/>
            )}
            <Text style={[styles.badgeText, isLong ? styles.longText : styles.shortText]}>
                {isLong ? 'LONG' : 'SHORT'}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 6,
        borderRadius: 4,
        gap: 8,
    },
    longBadge: {backgroundColor: 'rgba(56,255,2,0.07)'},
    shortBadge: {backgroundColor: 'rgba(254,226,226,0.07)'},
    badgeText: {fontSize: 12, fontWeight: 'bold'},
    longText: {color: '#2ac819'},
    shortText: {color: '#B91C1C'},
});

export default DirectionBadge;
