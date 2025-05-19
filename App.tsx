import React, {useCallback, useEffect, useState} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList, AuthStackParamList} from '@/navigation/navigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AuthProvider, useAuth} from '@/contexts/AuthContext';
import {registerRootComponent} from "expo";
import * as SplashScreen from 'expo-splash-screen';
import MainTabs from '@/navigation/MainTabs';
import {SplashScreen as CustomSplashScreen} from './components/SplashScreen';
import * as Linking from 'expo-linking';
import {LinkingOptions} from '@react-navigation/native';
import { useEventConnection } from '@/hooks/useEventConnection';
import * as Notifications from 'expo-notifications';
import {PushTokenProvider} from "@/contexts/PushTokenContext";
import {Provider} from "react-redux";
import {store} from "@/services/redux/store";
import {ThemeProvider} from "@/contexts/ThemeContext";
import {ThemedView} from "@/components/ui/ThemedView";
import {StatusBarManager} from "@/components/StatusBarManager";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import { loadPersistedFavorites } from '@/services/redux/slices/favoritesSlice';
import { ConnectionStatusBar } from '@/components/common/ConnectionStatusBar';

// Screens
import LoadingScreen from '@/screens/LoadingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import DiscordAuthScreen from '@/screens/auth/DiscordAuthScreen';

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
    const [isInitializing, setIsInitializing] = useState(true);

    useEventConnection(isAuthenticated);

    useEffect(() => {
        async function initialize() {
            try {
                await loadPersistedFavorites(store.dispatch);
            } catch (e) {
                console.warn('Failed to load persisted favorites:', e);
            } finally {
                setIsInitializing(false);
            }
        }

        initialize();
    }, []);

    if (isLoading || isInitializing) {
        return <LoadingScreen/>;
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: {
                    backgroundColor: 'transparent',
                }
            }}
        >
            {!isAuthenticated ? (
                <Stack.Screen name="Auth" component={AuthNavigator}/>
            ) : (
                <Stack.Screen name="Main" component={MainTabs}/>
            )}
            <Stack.Screen
                name="DiscordAuth"
                component={DiscordAuthScreen}
                options={{
                    presentation: 'modal',
                }}
            />
        </Stack.Navigator>
    );
}

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
                }
            },
            DiscordAuth: 'auth/discord',
            Main: 'main'
        }
    },
    subscribe(listener) {
        const onReceiveURL = ({url}: { url: string }) => {
            console.log('Received URL:', url);
            listener(url);
        };
        const subscription = Linking.addEventListener('url', onReceiveURL);
        return () => {
            subscription.remove();
        };
    },
};

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function App() {
    const [isReady, setIsReady] = useState(false);
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );

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
                // Any other initialization logic can go here
                await SplashScreen.hideAsync();
                setIsReady(true);
            } catch (e) {
                console.warn(e);
                setIsReady(true);
            }
        }

        prepare();
    }, []);

    if (!isReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{flex: 1}}>
            <SafeAreaProvider>
                <Provider store={store}>
                    <AuthProvider>
                        <PushTokenProvider>
                            <ThemeProvider>
                                <StatusBarManager/>
                                <ThemedView variant="screen" style={{flex: 1}}>
                                    <NavigationContainer linking={linking}>
                                        <ConnectionStatusBar />
                                        <Navigation/>
                                    </NavigationContainer>
                                </ThemedView>
                            </ThemeProvider>
                        </PushTokenProvider>
                    </AuthProvider>
                </Provider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

registerRootComponent(App);
