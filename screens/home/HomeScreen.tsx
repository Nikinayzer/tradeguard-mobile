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
    Newspaper
} from "lucide-react-native";
import {NewsItem} from "@/components/screens/home/NewsItem";
import {ThemedHeader} from "@/components/ui/ThemedHeader";
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedView} from "@/components/ui/ThemedView";
import {ThemedText} from "@/components/ui/ThemedText";
import {useAuth} from "@/contexts/AuthContext";

const marketOverview = {
    btc: {price: "65432", change: "+2.45%", direction: "up"},
    eth: {price: "3456", change: "-1.23%", direction: "down"},
    sol: {price: "142.39", change: "+5.67%", direction: "up"},
};

const recentActivity = [
    {id: "1", type: "trade", symbol: "BTC", action: "Long", price: "65432", time: "2m ago"},
    {id: "2", type: "deposit", amount: "1000 USDT", time: "15m ago"},
    {id: "3", type: "withdrawal", amount: "500 USDT", time: "1h ago"},
];

const alerts = [
    {id: "1", type: "price", symbol: "BTC", condition: "Above 66000", status: "active"},
    {id: "2", type: "price", symbol: "ETH", condition: "Below 3400", status: "active"},
];

const news = [
    {
        id: "1",
        title: "Bitcoin Surges Past $65,000 as Institutional Investors Show Strong Interest",
        source: "CryptoNews",
        timeAgo: "2h ago",
        imageUrl: "https://picsum.photos/200/200",
        url: "https://coindesk.com/markets/bitcoin-surges-past-65000",
    },
    {
        id: "2",
        title: "Ethereum Layer 2 Solutions See Record Growth in Daily Transactions",
        source: "BlockchainDaily",
        timeAgo: "4h ago",
        imageUrl: "https://picsum.photos/200/201",
        url: "https://cointelegraph.com/news/ethereum-layer-2-solutions",
    },
    {
        id: "3",
        title: "Major Banks Partner to Launch Cryptocurrency Trading Platform",
        source: "FinanceWire",
        timeAgo: "6h ago",
        imageUrl: "https://picsum.photos/200/202",
        url: "https://reuters.com/technology/crypto-trading-platform",
    },
];

export default function HomeScreen() {
    const {colors} = useTheme();
    const {user} = useAuth();

    const headerActions = [
        {
            icon: <Bell size={20} color={colors.primary}/>,
            onPress: () => console.log('Notifications pressed')
        },
        {
            icon: <Settings size={20} color={colors.primary}/>,
            onPress: () => console.log('Settings pressed')
        }
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
                    <ThemedView variant="card" style={styles.statCard} border rounded="medium">
                        <View style={styles.statHeader}>
                            <DollarSign size={20} color={colors.textSecondary}/>
                            <ThemedText variant="caption" secondary style={styles.statTitle}>Portfolio
                                Value</ThemedText>
                        </View>
                        <ThemedText variant="heading3" style={styles.statValue}>$23,815.20</ThemedText>
                        <ThemedText variant="caption" color={colors.success} style={styles.statChange}>+2.45%
                            today</ThemedText>
                    </ThemedView>
                    <ThemedView variant="card" style={styles.statCard} border rounded="medium">
                        <View style={styles.statHeader}>
                            <TrendingUp size={20} color={colors.textSecondary}/>
                            <ThemedText variant="caption" secondary style={styles.statTitle}>Open Positions</ThemedText>
                        </View>
                        <ThemedText variant="heading3" style={styles.statValue}>3</ThemedText>
                        <ThemedText variant="caption" color={colors.success} style={styles.statChange}>2 in
                            profit</ThemedText>
                    </ThemedView>
                </View>

                {/* Market Overview */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText variant="heading3" style={styles.sectionTitle}>Market Overview</ThemedText>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>See
                                All</ThemedText>
                            <ChevronRight size={16} color={colors.primary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.marketList}>
                        {Object.entries(marketOverview).map(([symbol, data]) => (
                            <TouchableOpacity key={symbol}>
                                <ThemedView
                                    variant="card"
                                    style={styles.marketItem}
                                    border
                                    rounded="medium"
                                >
                                    <View style={styles.marketInfo}>
                                        <ThemedText variant="bodyBold"
                                                    style={styles.marketSymbol}>{symbol.toUpperCase()}</ThemedText>
                                        <ThemedText variant="body" secondary>${data.price}</ThemedText>
                                    </View>
                                    <View style={[
                                        styles.marketChange,
                                        {
                                            backgroundColor: data.direction === "up"
                                                ? `${colors.success}15`
                                                : `${colors.error}15`
                                        }
                                    ]}>
                                        {data.direction === "up" ? (
                                            <ArrowUpRight size={16} color={colors.success}/>
                                        ) : (
                                            <ArrowDownRight size={16} color={colors.error}/>
                                        )}
                                        <ThemedText
                                            variant="bodySmall"
                                            color={data.direction === "up" ? colors.success : colors.error}
                                            style={styles.changeText}
                                        >
                                            {data.change}
                                        </ThemedText>
                                    </View>
                                </ThemedView>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ThemedView>

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

                {/* News Section */}
                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Newspaper size={20} color={colors.primary}/>
                            <ThemedText variant="heading3" style={styles.sectionTitle}>Latest News</ThemedText>
                        </View>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <ThemedText variant="bodySmall" color={colors.primary} style={styles.seeAllText}>See
                                All</ThemedText>
                            <ChevronRight size={16} color={colors.primary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.newsList}>
                        {news.map((item) => (
                            <NewsItem
                                key={item.id}
                                title={item.title}
                                source={item.source}
                                timeAgo={item.timeAgo}
                                imageUrl={item.imageUrl}
                                url={item.url}
                            />
                        ))}
                    </View>
                </ThemedView>

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
    marketList: {
        gap: 8,
    },
    marketItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    marketInfo: {
        flex: 1,
    },
    marketSymbol: {
        marginBottom: 4,
    },
    marketChange: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    changeText: {
        fontWeight: "600",
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
    newsList: {
        gap: 8,
    },
});
