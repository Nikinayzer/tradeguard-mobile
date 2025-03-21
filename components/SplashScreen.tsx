import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//todo replace text with svg
export function SplashScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top, paddingBottom: insets.bottom }
        ]}>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>TradeGuard</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    contentContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 42,
        fontWeight: '700',
        color: '#3B82F6',
        letterSpacing: 1,
    },
}); 