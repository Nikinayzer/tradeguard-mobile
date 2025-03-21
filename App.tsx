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
                    <Stack.Screen name="Jobs" component={JobsScreen} />
                </>
            )}
        </Stack.Navigator>
    );
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
