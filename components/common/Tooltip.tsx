import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Info } from 'lucide-react-native';
import { TooltipContext } from '@/screens/auto/AutomatedTradeScreen';

interface TooltipProps {
    content: string;
    position?: 'left' | 'right';
    size?: number;
    color?: string;
}

export function Tooltip({ 
    content, 
    position = 'right', 
    size = 32,
    color = "#748CAB" 
}: TooltipProps) {
    // Use a unique ID for this tooltip instance
    const [tooltipId] = useState(() => Math.random().toString(36).substring(2, 11));
    const [visible, setVisible] = useState(false);
    const { activeTooltipId, setActiveTooltipId } = useContext(TooltipContext);

    // When this tooltip becomes visible, close any other active tooltips
    const handleToggleTooltip = () => {
        if (visible) {
            setVisible(false);
            setActiveTooltipId(null);
        } else {
            if (activeTooltipId && activeTooltipId !== tooltipId) {
                setActiveTooltipId(tooltipId);
            } else {
                setActiveTooltipId(tooltipId);
                setVisible(true);
            }
        }
    };

    // Check if we need to close this tooltip when another one opens
    useEffect(() => {
        if (activeTooltipId && activeTooltipId !== tooltipId && visible) {
            setVisible(false);
        } else if (activeTooltipId === tooltipId && !visible) {
            setVisible(true);
        }
    }, [activeTooltipId, tooltipId, visible]);

    return (
        <View style={styles.tooltipContainer}>
            <TouchableOpacity
                onPress={handleToggleTooltip}
                style={[
                    styles.infoIconContainer, 
                    { 
                        width: size, 
                        height: size,
                        padding: 6
                    }
                ]}
            >
                <Info size={size * 0.7} color={color} />
            </TouchableOpacity>

            {visible && (
                <View
                    style={[
                        styles.tooltipContent,
                        position === 'left' ? styles.tooltipContentLeft : styles.tooltipContentRight
                    ]}
                >
                    <Text style={styles.tooltipText}>{content}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    tooltipContainer: {
        position: 'relative',
        zIndex: 2,
    },
    infoIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
    },
    tooltipContent: {
        position: 'absolute',
        top: 35,
        backgroundColor: '#0D1B2A',
        padding: 10,
        borderRadius: 6,
        width: 200,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tooltipContentRight: {
        right: 0,
    },
    tooltipContentLeft: {
        left: -180,
    },
    tooltipText: {
        color: '#E2E8F0',
        fontSize: 12,
        lineHeight: 16,
    },
}); 