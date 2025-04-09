import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StatusBar} from "react-native";
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList, AuthStackParamList} from '@/navigation/navigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from '@/contexts/AuthContext';
import {registerRootComponent} from "expo";
import * as SplashScreen from 'expo-splash-screen';
import MainTabs from '@/navigation/MainTabs';
import {SplashScreen as CustomSplashScreen} from './components/SplashScreen';
import MarketDataManager from '@/services/MarketDataManager';
import * as Linking from 'expo-linking';
import {LinkingOptions} from '@react-navigation/native';

// Screens
import LoadingScreen from '@/screens/LoadingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import DiscordAuthScreen from '@/screens/auth/DiscordAuthScreen';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {Platform, SafeAreaView, View} from 'react-native';
import Constants from "expo-constants";
import {PushTokenProvider, usePushToken} from "@/contexts/PushTokenContext";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

SplashScreen.preventAutoHideAsync();

function AuthNavigator() {
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <AuthStack.Screen name="Login" component={LoginScreen}/>
            <AuthStack.Screen name="Register" component={RegisterScreen}/>
            <AuthStack.Screen name="DiscordAuth" component={DiscordAuthScreen}/>
        </AuthStack.Navigator>
    );
}

function Navigation() {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return <LoadingScreen/>;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthNavigator}/>
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainTabs}/>
                </>
            )}
        </Stack.Navigator>
    );
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Add this before the Navigation component
const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [
        Linking.createURL('/'),
        'tradeguard://',
        'exp://localhost:19000',
    ],
    config: {
        screens: {
            Auth: {
                screens: {
                    Login: 'login',
                    Register: 'register',
                    DiscordAuth: 'auth/discord',
                }
            },
            Main: 'main'
        }
    },
    // Log all links for debugging
    subscribe(listener) {
        const onReceiveURL = ({url}: { url: string }) => {
            console.log('Received URL:', url);
            listener(url);
        };

        // Listen to incoming links from deep linking
        const subscription = Linking.addEventListener('url', onReceiveURL);

        return () => {
            subscription.remove();
        };
    },
};

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();
    useEffect(() => {
        const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log('Notification response:', response);
        });

        return () => {
            Notifications.removeNotificationSubscription(notificationListener);
            Notifications.removeNotificationSubscription(responseListener);
        };
    }, []);

    useEffect(() => {
        async function prepare() {
            try {
                const marketManager = MarketDataManager.getInstance();
                while (marketManager.isLoadingInitialData()) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                //mb something better than just a delay
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn(e);
            } finally {
                setIsReady(true);
            }
        }

        prepare();
    }, []);
    useEffect(() => {
        //StatusBar.setBarStyle(theme == 'Light' ? 'dark-content' : 'light-content'); //todo its time to cook some themes
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setBackgroundColor('#0D1B2A');
        StatusBar.setTranslucent(true)
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (isReady) {
            await SplashScreen.hideAsync();
            setTimeout(() => setShowSplash(false), 500);
        }
    }, [isReady]);

    if (!isReady) {
        return null;
    }
    return (
        <SafeAreaProvider onLayout={onLayoutRootView}>
            {showSplash ? (
                <CustomSplashScreen/>
            ) : (
                <PushTokenProvider>
                    <AuthProvider>

                        <NavigationContainer linking={linking}>
                            <Navigation/>
                        </NavigationContainer>
                    </AuthProvider>
                </PushTokenProvider>
            )}
        </SafeAreaProvider>
    );
}

registerRootComponent(App);
