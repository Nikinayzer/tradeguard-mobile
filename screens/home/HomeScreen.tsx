import React from "react";
import {View, StyleSheet, ScrollView, TouchableOpacity} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {
    TrendingUp,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    AlertCircle,
    BarChart2,
    Wallet,
    Settings,
    Bell,
} from "lucide-react-native";
import {ThemedHeader} from "@/components/ui/ThemedHeader";
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedView} from "@/components/ui/ThemedView";
import {ThemedText} from "@/components/ui/ThemedText";
import {useAuth} from "@/contexts/AuthContext";
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {HomeStackParamList, RootStackParamList} from "@/navigation/navigation";
import { CompositeNavigationProp } from '@react-navigation/native';
import { MarketFavoritesSection } from "@/components/screens/home/MarketFavoritesSection";
import { NewsSection } from "@/components/screens/news/NewsSection";
import { PortfolioValueCard } from "@/components/screens/home/PortfolioValueCard";
import { OpenPositionsCard } from "@/components/screens/home/OpenPositionsCard";

type HomeScreenNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<HomeStackParamList>,
    NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
    const {colors} = useTheme();
    const {user} = useAuth();
    const navigation = useNavigation<HomeScreenNavigationProp>();

    const headerActions = [
        {
            icon: <Bell size={20} color={colors.primary}/>,
            onPress: () => navigation.navigate('Notifications')
        },
        {
            icon: <Settings size={20} color={colors.primary}/>,
            onPress: () => navigation.navigate('Main', {
                screen: 'Profile',
                params: {
                    screen: 'SettingsStack',
                    params: {
                        screen: 'Settings'
                    }
                }
            })
        },
    ];

    return (
        <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}>
            <ThemedHeader
                title={`Welcome back`}
                subtitle={`Take a look at updates`}
                actions={headerActions}
            />
            <ScrollView
                style={styles.container}
                contentContainerStyle={{paddingBottom: 20}}
            >
                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <PortfolioValueCard />
                    <OpenPositionsCard />
                </View>

                <MarketFavoritesSection navigation={navigation} />
                <NewsSection navigation={navigation} />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
    },
    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    statTitle: {
        fontWeight: "500",
    },
    statValue: {
        marginBottom: 4,
    },
    statChange: {
        fontSize: 12,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sectionTitle: {
        fontWeight: "bold",
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        marginRight: 4,
    },
    activityList: {
        gap: 8,
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    activityIcon: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
    },
    alertsList: {
        gap: 8,
    },
    alertItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
    },
    alertIcon: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        marginBottom: 4,
    },
    alertCondition: {
        fontSize: 14,
    },
    alertStatus: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    alertStatusText: {
        fontSize: 12,
        fontWeight: "500",
    },
});
