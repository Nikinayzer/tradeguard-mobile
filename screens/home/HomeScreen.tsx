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

const recentActivity = [
    {id: "1", type: "trade", symbol: "BTC", action: "Long", price: "65432", time: "2m ago"},
    {id: "2", type: "deposit", amount: "1000 USDT", time: "15m ago"},
    {id: "3", type: "withdrawal", amount: "500 USDT", time: "1h ago"},
];

const alerts = [
    {id: "1", type: "price", symbol: "BTC", condition: "Above 66000", status: "active"},
    {id: "2", type: "price", symbol: "ETH", condition: "Below 3400", status: "active"},
];

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

                {/* Recent Activity */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText variant="heading3" style={styles.sectionTitle}>Recent Activity</ThemedText>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>See
                                All</ThemedText>
                            <ChevronRight size={16} color={colors.primary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activityList}>
                        {recentActivity.map((item) => (
                            <TouchableOpacity key={item.id}>
                                <ThemedView
                                    variant="card"
                                    style={styles.activityItem}
                                    border
                                    rounded="medium"
                                >
                                    <ThemedView variant="section" style={styles.activityIcon} rounded="full">
                                        {item.type === "trade" ? (
                                            <BarChart2 size={20} color={colors.primary}/>
                                        ) : item.type === "deposit" ? (
                                            <Wallet size={20} color={colors.success}/>
                                        ) : (
                                            <Wallet size={20} color={colors.error}/>
                                        )}
                                    </ThemedView>
                                    <View style={styles.activityContent}>
                                        <ThemedText variant="bodyBold" style={styles.activityTitle}>
                                            {item.type === "trade"
                                                ? `${item.symbol} ${item.action} @ $${item.price}`
                                                : `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${item.amount}`
                                            }
                                        </ThemedText>
                                        <ThemedText variant="caption" secondary
                                                    style={styles.activityTime}>{item.time}</ThemedText>
                                    </View>
                                </ThemedView>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ThemedView>

                <NewsSection navigation={navigation} />

                {/* Active Alerts */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText variant="heading3" style={styles.sectionTitle}>Active Alerts</ThemedText>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>See
                                All</ThemedText>
                            <ChevronRight size={16} color={colors.primary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.alertsList}>
                        {alerts.map((alert) => (
                            <TouchableOpacity key={alert.id}>
                                <ThemedView
                                    variant="card"
                                    style={styles.alertItem}
                                    border
                                    rounded="medium"
                                >
                                    <ThemedView
                                        variant="section"
                                        style={styles.alertIcon}
                                        rounded="full"
                                    >
                                        <AlertCircle size={20} color={colors.warning}/>
                                    </ThemedView>
                                    <View style={styles.alertContent}>
                                        <ThemedText variant="bodyBold" style={styles.alertTitle}>
                                            {alert.symbol} Price Alert
                                        </ThemedText>
                                        <ThemedText variant="body" secondary style={styles.alertCondition}>
                                            {alert.condition}
                                        </ThemedText>
                                    </View>
                                    <ThemedView
                                        variant="transparent"
                                        style={{
                                            ...styles.alertStatus,
                                            backgroundColor: `${colors.success}15`
                                        }}
                                        rounded="small"
                                    >
                                        <ThemedText variant="caption" color={colors.success}
                                                    style={styles.alertStatusText}>
                                            Active
                                        </ThemedText>
                                    </ThemedView>
                                </ThemedView>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ThemedView>
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
