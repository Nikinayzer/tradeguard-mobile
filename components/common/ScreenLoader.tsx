import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedLogo from './AnimatedLogo';

interface ScreenLoaderProps {
    message?: string;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({ 
    message = 'Loading...' 
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.container,
            {
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
                paddingLeft: insets.left,
                paddingRight: insets.right,
            }
        ]}>
            <AnimatedLogo size={300} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
        alignItems: 'center',
        justifyContent: 'center',
    },
    message: {
        color: 'white',
        fontSize: 16,
        marginTop: 20,
        fontWeight: '600',
    },
});

export default ScreenLoader; 