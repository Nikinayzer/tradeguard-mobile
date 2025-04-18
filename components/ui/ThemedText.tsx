import React from 'react';
import {Text, StyleSheet, TextProps, TextStyle, View, ViewStyle} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';

export type TextVariant =
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'body'
    | 'bodyBold'
    | 'bodySmall'
    | 'caption'
    | 'button'
    | 'label';

export interface ThemedTextProps extends TextProps {
    children: React.ReactNode;
    variant?: TextVariant;
    size?: number;
    color?: string;
    style?: TextStyle;
    centered?: boolean;
    mt?: number;
    mb?: number;
    ml?: number;
    mr?: number;
    mx?: number;
    my?: number;
    m?: number;
    p?: number;
    pt?: number;
    pb?: number;
    pl?: number;
    pr?: number;
    px?: number;
    py?: number;
    containerStyle?: ViewStyle;
    weight?: 'normal' | '500' | '600' | '700' | 'bold';
    secondary?: boolean;
    tertiary?: boolean;
}

export function ThemedText({
                               children,
                               variant = 'body',
                               size,
                               color,
                               style,
                               centered = false,
                               mt,
                               mb,
                               ml,
                               mr,
                               mx,
                               my,
                               m,
                               p,
                               pt,
                               pb,
                               pl,
                               pr,
                               px,
                               py,
                               containerStyle,
                               weight,
                               secondary,
                               tertiary,
                               ...rest
                           }: ThemedTextProps) {
    const {colors, isDark} = useTheme();

    let textColor = colors.text;
    if (secondary) textColor = colors.textSecondary;
    if (tertiary) textColor = colors.textTertiary;
    if (color) textColor = color;

    const marginStyle: ViewStyle = {
        marginTop: mt !== undefined ? mt : my !== undefined ? my : m,
        marginBottom: mb !== undefined ? mb : my !== undefined ? my : m,
        marginLeft: ml !== undefined ? ml : mx !== undefined ? mx : m,
        marginRight: mr !== undefined ? mr : mx !== undefined ? mx : m,
    };

    const paddingStyle: ViewStyle = {
        paddingTop: pt !== undefined ? pt : py !== undefined ? py : p,
        paddingBottom: pb !== undefined ? pb : py !== undefined ? py : p,
        paddingLeft: pl !== undefined ? pl : px !== undefined ? px : p,
        paddingRight: pr !== undefined ? pr : px !== undefined ? px : p,
    };

    const fontWeightStyle = weight ? {fontWeight: weight} : {};

    const hasLayout = Object.values(marginStyle).some(val => val !== undefined) ||
        Object.values(paddingStyle).some(val => val !== undefined);

    const textElement = (
        <Text
            style={[
                styles[variant],
                {fontSize: size},
                {color: textColor},
                centered && styles.centered,
                fontWeightStyle,
                style,
            ]}
            {...rest}
        >
            {children}
        </Text>
    );

    if (hasLayout || containerStyle) {
        const cleanMarginStyle = Object.fromEntries(
            Object.entries(marginStyle).filter(([_, v]) => v !== undefined)
        );

        const cleanPaddingStyle = Object.fromEntries(
            Object.entries(paddingStyle).filter(([_, v]) => v !== undefined)
        );

        return (
            <View style={[cleanMarginStyle, cleanPaddingStyle, containerStyle]}>
                {textElement}
            </View>
        );
    }

    return textElement;
}

const styles = StyleSheet.create({
    heading1: {
        fontSize: 28,
        fontWeight: '700',
        lineHeight: 34,
    },
    heading2: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 30,
    },
    heading3: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 26,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 22,
    },
    bodyBold: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },
    bodySmall: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    centered: {
        textAlign: 'center',
    },
}); 