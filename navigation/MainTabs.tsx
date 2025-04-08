import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home, BarChart2, User, Bot, TrendingUp, HeartPulse} from 'lucide-react-native';

import HomeScreen from '../screens/home/HomeScreen';
import MarketScreen from '../screens/market/MarketScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AccountLimitsScreen from '../screens/settings/AccountLimitsScreen';
import AutomatedTradeScreen from '../screens/auto/AutomatedTradeScreen';
import HealthScreen from '../screens/health/HealthScreen';
import PortfolioScreen from '../screens/portfolio/PortfolioScreen';
import SecuritySettingsScreen from "@/screens/settings/SecuritySettingsScreen";
import APISettingsScreen from "@/screens/settings/APISettingsScreen";
import NotificationsSettingsScreen from "@/screens/settings/NotificationsSettingsScreen";
import SettingsScreen from "@/screens/settings/SettingsScreen";
import CoinDetailScreen from "@/screens/market/CoinDetailScreen";
import JobDetailScreen from "../screens/auto/JobDetailScreen";
import JobListScreen from "../screens/auto/JobListScreen";
import CoinSelectorScreen from "../screens/auto/CoinSelectorScreen";
import PersonalInfoScreen from '../screens/settings/PersonalInfoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const commonAnimationConfig = {
    animation: 'slide_from_right' as const,
    animationDuration: 150,
    presentation: 'card' as const,
};

function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...commonAnimationConfig,
            }}
        >
            <Stack.Screen name="HomeMain" component={HomeScreen}/>
        </Stack.Navigator>
    );
}

function MarketStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...commonAnimationConfig,
            }}
        >
            <Stack.Screen name="MarketMain" component={MarketScreen}/>
            <Stack.Screen
                name="CoinDetail"
                component={CoinDetailScreen}
                options={{
                    animation: 'slide_from_right',
                    presentation: 'card',
                }}
            />
        </Stack.Navigator>
    );
}

function AutoStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...commonAnimationConfig,
            }}
        >
            <Stack.Screen name="AutoMain" component={AutomatedTradeScreen}/>
            <Stack.Screen
                name="JobDetail"
                component={JobDetailScreen}
                options={{
                    animation: 'slide_from_right',
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name="JobList"
                component={JobListScreen}
                options={{
                    animation: 'slide_from_right',
                    presentation: 'card',
                }}
            />
            <Stack.Screen
                name="CoinSelector"
                component={CoinSelectorScreen}
                options={{
                    animation: 'slide_from_right',
                    presentation: 'card',
                }}
            />
        </Stack.Navigator>
    );
}

function HealthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...commonAnimationConfig,
            }}
        >
            <Stack.Screen name="HealthMain" component={HealthScreen}/>
        </Stack.Navigator>
    );
}

function ProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade' as const,
                animationDuration: 150,
                presentation: 'transparentModal' as const,
                contentStyle: {
                    backgroundColor: '#0D1B2A',
                },
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen}/>
            <Stack.Screen name="AccountLimits" component={AccountLimitsScreen}/>
            <Stack.Screen name="SettingsStack" component={SettingsStack}/>
        </Stack.Navigator>
    );
}

function SettingsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Settings" component={SettingsScreen}/>
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen}/>
            <Stack.Screen name="Security" component={SecuritySettingsScreen}/>
            <Stack.Screen name="APISettings" component={APISettingsScreen}/>
            <Stack.Screen name="Notifications" component={NotificationsSettingsScreen}/>
        </Stack.Navigator>
    )
}


function PortfolioStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...commonAnimationConfig,
            }}
        >
            <Stack.Screen name="PortfolioMain" component={PortfolioScreen}/>
        </Stack.Navigator>
    );
}

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1B263B',
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: '#748CAB',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Home size={size} color={color}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Market"
                component={MarketStack}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <BarChart2 size={size} color={color}/>
                    ),
                }}
            />

            <Tab.Screen
                name="Auto"
                component={AutoStack}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <Bot size={size} color={color}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Portfolio"
                component={PortfolioStack}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <TrendingUp size={size} color={color}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Health"
                component={HealthStack}
                options={{
                    tabBarIcon: ({color, size}) => (
                        <HeartPulse size={size} color={color}/>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={({route, navigation}) => ({
                    tabBarIcon: ({color, size}) => (
                        <User size={size} color={color}/>
                    ),
                    tabBarListeners: {
                        tabBlur: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{name: 'ProfileMain'}],
                            });
                        },
                    },
                })}
            />
        </Tab.Navigator>
    );
} 