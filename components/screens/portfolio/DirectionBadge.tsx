import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ArrowUpRight, ArrowDownRight} from 'lucide-react-native';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedText} from '@/components/ui/ThemedText';

interface DirectionBadgeProps {
    isLong: boolean;
}

export const DirectionBadge: React.FC<DirectionBadgeProps> = ({isLong}) => {
    const {colors} = useTheme();
    
    return (
        <View 
            style={[
                styles.badge, 
                { backgroundColor: isLong ? `${colors.success}15` : `${colors.error}15` }
            ]}
        >
            {isLong ? (
                <ArrowUpRight size={14} color={colors.success}/>
            ) : (
                <ArrowDownRight size={14} color={colors.error}/>
            )}
            <ThemedText 
                variant="caption" 
                color={isLong ? colors.success : colors.error}
                weight="bold"
            >
                {isLong ? 'LONG' : 'SHORT'}
            </ThemedText>
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
        gap: 4,
    },
});

export default DirectionBadge;
