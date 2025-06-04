import React, {useEffect} from 'react';
import {View, StyleSheet, StatusBar, Platform, Animated, Easing} from 'react-native';
import {ThemedText} from '@/components/ui/ThemedText';
import {useTheme} from '@/contexts/ThemeContext';
import {useSelector} from 'react-redux';
import {selectIsConnected, selectLastError, selectIsInitialized} from '@/services/redux/slices/connectionSlice';
import {WifiOff} from 'lucide-react-native';

export const ConnectionStatusBar: React.FC = () => {
    const {colors} = useTheme();
    const isConnected = useSelector(selectIsConnected);
    const lastError = useSelector(selectLastError);
    const isInitialized = useSelector(selectIsInitialized);
    const isAuthorized = useSelector((state: any) => state.auth.isAuthenticated);
    const slideAnim = React.useRef(new Animated.Value(-100)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        console.log('ConnectionStatusBar mounted');
    }, []);

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();

        if (!isConnected) {
            // Slide in
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Slide out
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.cubic),
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [isConnected]);

    if (!isInitialized || isConnected || !isAuthorized) return null;

    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: colors.error,
                    transform: [{translateY: slideAnim}],
                    opacity: opacityAnim,
                    top: statusBarHeight
                }
            ]}
        >
            <View style={styles.content}>
                <Animated.View style={{transform: [{scale: pulseAnim}]}}>
                    <WifiOff size={20} color="white" style={styles.icon}/>
                </Animated.View>
                <ThemedText style={styles.text}>
                    {`Connection lost. Attempting to reconnect...`}
                </ThemedText>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        left: 0,
        right: 0,
        height: 48,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 8,
    },
    text: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
}); 