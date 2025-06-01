import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home, BarChart2, User, Bot, TrendingUp, HeartPulse} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { 
    MainTabParamList, 
    HomeStackParamList, 
    MarketStackParamList,
    AutoStackParamList,
    PortfolioStackParamList,
    HealthStackParamList,
    ProfileStackParamList,
    SettingsStackParamList
} from './navigation';

// Screens
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
import ExchangeAccountScreen from '../screens/profile/ExchangeAccountScreen';
import AddExchangeScreen from '../screens/profile/AddExchangeScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NewsScreen from '../screens/news/NewsScreen';
import AllPositionsScreen from '../screens/portfolio/AllPositionsScreen';
import PatternDetailScreen from '../screens/health/PatternDetailScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
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
            <Stack.Screen name="Notifications" component={NotificationsScreen}/>
            <Stack.Screen name="News" component={NewsScreen}/>
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
            <Stack.Screen name="CoinDetail" component={CoinDetailScreen}/>
            <Stack.Screen name="News" component={NewsScreen}/>
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
            <Stack.Screen name="JobDetail" component={JobDetailScreen}/>
            <Stack.Screen name="JobList" component={JobListScreen}/>
            <Stack.Screen name="CoinSelector" component={CoinSelectorScreen}/>
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
            <Stack.Screen name="PatternDetail" component={PatternDetailScreen}/>
        </Stack.Navigator>
    );
}

function ProfileStack() {
    const { colors } = useTheme();
    
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'fade' as const,
                animationDuration: 150,
                presentation: 'transparentModal' as const,
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen}/>
            <Stack.Screen name="AccountLimits" component={AccountLimitsScreen}/>
            <Stack.Screen name="ExchangeAccount" component={ExchangeAccountScreen}/>
            <Stack.Screen name="AddExchange" component={AddExchangeScreen}/>
            <Stack.Screen name="SettingsStack" component={SettingsStack}/>
        </Stack.Navigator>
    );
}

function SettingsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                ...commonAnimationConfig,
            }}
        >
            <Stack.Screen name="Settings" component={SettingsScreen}/>
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen}/>
            <Stack.Screen name="AccountLimits" component={AccountLimitsScreen}/>
            <Stack.Screen name="Security" component={SecuritySettingsScreen}/>
            <Stack.Screen name="APISettings" component={APISettingsScreen}/>
            <Stack.Screen name="Notifications" component={NotificationsSettingsScreen}/>
        </Stack.Navigator>
    );
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
            <Stack.Screen name="AllPositions" component={AllPositionsScreen}/>
        </Stack.Navigator>
    );
}

export default function MainTabs() {
    const { colors } = useTheme();
    
    return (
        <Tab.Navigator
            screenOptions={{
                lazy: false, // Initialize all tabs at startup, fixes navigation to unmount stack
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.backgroundSecondary,
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textTertiary,
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
                    tabBarIcon: ({color, size}) => <Home size={size} color={color}/>,
                }}
            />
            <Tab.Screen
                name="Market"
                component={MarketStack}
                options={{
                    tabBarIcon: ({color, size}) => <BarChart2 size={size} color={color}/>,
                }}
            />
            <Tab.Screen
                name="Auto"
                component={AutoStack}
                options={{
                    tabBarIcon: ({color, size}) => <Bot size={size} color={color}/>,
                }}
            />
            <Tab.Screen
                name="Portfolio"
                component={PortfolioStack}
                options={{
                    tabBarIcon: ({color, size}) => <TrendingUp size={size} color={color}/>,
                }}
            />
            <Tab.Screen
                name="Health"
                component={HealthStack}
                options={{
                    tabBarIcon: ({color, size}) => <HeartPulse size={size} color={color}/>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={({navigation}) => ({
                    tabBarIcon: ({color, size}) => <User size={size} color={color}/>,
                    tabBarListeners: {
                        tabPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{name: 'Profile'}],
                            });
                        },
                    },
                })}
            />
        </Tab.Navigator>
    );
} 