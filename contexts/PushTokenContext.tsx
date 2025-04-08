import React, {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform} from 'react-native';
import Constants from 'expo-constants';

interface PushTokenContextProps {
    pushToken: string;
}

interface PushTokenProviderProps {
    children: ReactNode;
}

const PushTokenContext = createContext<PushTokenContextProps>({pushToken: ''});

export const usePushToken = () => useContext(PushTokenContext);

async function registerForPushNotificationsAsync(): Promise<string> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        console.warn('Push notifications require a physical device.');
        return '';
    }

    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const {status} = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.warn('Permission not granted for push notifications!');
        return '';
    }

    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
        console.warn('Project ID not found');
        return '';
    }

    try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({projectId});
        return tokenResponse.data;
    } catch (error) {
        console.warn('Error getting Expo push token:', error);
        return '';
    }
}

export const PushTokenProvider: React.FC<PushTokenProviderProps> = ({children}) => {
    const [pushToken, setPushToken] = useState('');

    useEffect(() => {
        async function fetchPushToken() {
            const token = await registerForPushNotificationsAsync();
            if (token) {
                setPushToken(token);
                try {
                    await SecureStore.setItemAsync('expoPushToken', token);
                } catch (error) {
                    console.warn('Failed to save push token to SecureStore:', error);
                }
            }
        }

        fetchPushToken();
    }, []);

    return (
        <PushTokenContext.Provider value={{
            pushToken
        }}>
            {children}
        </PushTokenContext.Provider>
    );
};
