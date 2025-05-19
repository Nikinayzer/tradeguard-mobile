import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import cryptoIconsService from '@/services/cryptoIcons';
import { ThemedView } from '@/components/ui/ThemedView';
import { useTheme } from '@/contexts/ThemeContext';

interface CryptoIconProps {
    symbol: string;
    size?: number;
    style?: ImageStyle;
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ 
    symbol, 
    size = 24,
    style 
}) => {
    const { colors } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [iconSource, setIconSource] = useState<string | number | null>(null);

    useEffect(() => {
        const loadIcon = async () => {
            setIsLoading(true);
            try {
                const source = await cryptoIconsService.getIconUrl(symbol);
                setIconSource(source);
            } catch (error) {
                console.error(`Failed to load icon for ${symbol}:`, error);
            } finally {
                setIsLoading(false);
            }
        };

        loadIcon();
    }, [symbol]);

    const placeholderStyle: ViewStyle = {
        ...styles.placeholder,
        width: size,
        height: size,
        borderRadius: size / 2,
        ...(style as ViewStyle)
    };

    const imageStyle: ImageStyle = {
        ...styles.icon,
        width: size,
        height: size,
        borderRadius: size / 2,
        ...style
    };

    if (isLoading || !iconSource) {
        return (
            <ThemedView style={placeholderStyle}>
                {null}
            </ThemedView>
        );
    }

    return (
        <Image
            source={typeof iconSource === 'string' ? { uri: iconSource } : iconSource}
            style={imageStyle}
        />
    );
};

const styles = StyleSheet.create({
    icon: {
        backgroundColor: 'transparent',
    },
    placeholder: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
}); 