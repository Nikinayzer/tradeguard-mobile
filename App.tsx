import { registerRootComponent } from "expo";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "./screens/HomeScreen";
import MarketScreen from "./screens/MarketScreen";
import TradeScreen from "./screens/TradeScreen";
import PortfolioScreen from "./screens/PortfolioScreen";

import { DollarSign, LineChart, TrendingUp } from "lucide-react-native";
import { View, Text, StyleSheet } from "react-native";
import React from "react";
import JobsScreen from "@/screens/JobsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarStyle: styles.tabBar,
                    tabBarActiveTintColor: "#ffffff",
                    tabBarInactiveTintColor: "#748CAB",
                    tabBarLabel: ({ color }) => (
                        <Text style={[styles.tabLabel, { color }]}>{route.name}</Text>
                    ),
                })}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Market" component={MarketScreen} />
                <Tab.Screen name="Trade" component={TradeScreen} />
                <Tab.Screen name="Jobs" component={JobsScreen} />
                <Tab.Screen name="Portfolio" component={PortfolioScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: "#0D1B2A",
        borderTopWidth: 0,
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: "600",
    },
});

registerRootComponent(App);