import React, { useCallback, useEffect, useState } from 'react';
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

// Screens
import LoadingScreen from '@/screens/LoadingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import JobsScreen from '@/screens/auto/JobsScreen';

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from "expo-constants";

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
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Register" component={RegisterScreen} />
        </AuthStack.Navigator>
    );
}

function Navigation() {
    const {isAuthenticated, isLoading} = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                <>
                    <Stack.Screen name="Main" component={MainTabs} />
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
async function sendPushNotification(expoPushToken: string) {
    const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Original Title',
        body: 'And here is the body!',
        data: { someData: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}
function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}
async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            handleRegistrationError('Permission not granted to get push token for push notification!');
            return;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            handleRegistrationError('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(pushTokenString);
            return pushTokenString;
        } catch (e: unknown) {
            handleRegistrationError(`${e}`);
        }
    } else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [showSplash, setShowSplash] = useState(true);

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
                <CustomSplashScreen />
            ) : (
                <AuthProvider>
                    <NavigationContainer>
                        <Navigation />
                    </NavigationContainer>
                </AuthProvider>
            )}
        </SafeAreaProvider>
    );
}

registerRootComponent(App);
