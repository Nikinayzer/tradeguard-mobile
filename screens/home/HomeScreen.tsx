import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ArrowUpRight, 
    ArrowDownRight, 
    ChevronRight, 
    Clock, 
    AlertCircle,
    BarChart2,
    Wallet,
    Settings,
    Bell,
    Newspaper
} from "lucide-react-native";
import { NewsItem } from "@/components/screens/home/NewsItem";

const marketOverview = {
    btc: { price: "65432", change: "+2.45%", direction: "up" },
    eth: { price: "3456", change: "-1.23%", direction: "down" },
    sol: { price: "142.39", change: "+5.67%", direction: "up" },
};

const recentActivity = [
    { id: "1", type: "trade", symbol: "BTC", action: "Long", price: "65432", time: "2m ago" },
    { id: "2", type: "deposit", amount: "1000 USDT", time: "15m ago" },
    { id: "3", type: "withdrawal", amount: "500 USDT", time: "1h ago" },
];

const alerts = [
    { id: "1", type: "price", symbol: "BTC", condition: "Above 66000", status: "active" },
    { id: "2", type: "price", symbol: "ETH", condition: "Below 3400", status: "active" },
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
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Welcome Back</Text>
                        <Text style={styles.headerSubtitle}>Let's check your portfolio</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerButton}>
                            <Bell size={24} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton}>
                            <Settings size={24} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <DollarSign size={20} color="#748CAB" />
                            <Text style={styles.statTitle}>Portfolio Value</Text>
                        </View>
                        <Text style={styles.statValue}>$23,815.20</Text>
                        <Text style={styles.statChange}>+2.45% today</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <TrendingUp size={20} color="#748CAB" />
                            <Text style={styles.statTitle}>Open Positions</Text>
                        </View>
                        <Text style={styles.statValue}>3</Text>
                        <Text style={styles.statChange}>2 in profit</Text>
                    </View>
                </View>

                {/* Market Overview */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Market Overview</Text>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <Text style={styles.seeAllText}>See All</Text>
                            <ChevronRight size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.marketList}>
                        {Object.entries(marketOverview).map(([symbol, data]) => (
                            <TouchableOpacity key={symbol} style={styles.marketItem}>
                                <View style={styles.marketInfo}>
                                    <Text style={styles.marketSymbol}>{symbol.toUpperCase()}</Text>
                                    <Text style={styles.marketPrice}>${data.price}</Text>
                                </View>
                                <View style={[
                                    styles.marketChange,
                                    data.direction === "up" ? styles.positiveChange : styles.negativeChange
                                ]}>
                                    {data.direction === "up" ? (
                                        <ArrowUpRight size={16} color="#22C55E" />
                                    ) : (
                                        <ArrowDownRight size={16} color="#EF4444" />
                                    )}
                                    <Text style={[
                                        styles.changeText,
                                        data.direction === "up" ? styles.positiveText : styles.negativeText
                                    ]}>
                                        {data.change}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <Text style={styles.seeAllText}>See All</Text>
                            <ChevronRight size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.activityList}>
                        {recentActivity.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.activityItem}>
                                <View style={styles.activityIcon}>
                                    {item.type === "trade" ? (
                                        <BarChart2 size={20} color="#3B82F6" />
                                    ) : item.type === "deposit" ? (
                                        <Wallet size={20} color="#22C55E" />
                                    ) : (
                                        <Wallet size={20} color="#EF4444" />
                                    )}
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>
                                        {item.type === "trade" 
                                            ? `${item.symbol} ${item.action} @ $${item.price}`
                                            : `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${item.amount}`
                                        }
                                    </Text>
                                    <Text style={styles.activityTime}>{item.time}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* News Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleContainer}>
                            <Newspaper size={20} color="#3B82F6" />
                            <Text style={styles.sectionTitle}>Latest News</Text>
                        </View>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <Text style={styles.seeAllText}>See All</Text>
                            <ChevronRight size={16} color="#3B82F6" />
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
                </View>

                {/* Active Alerts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Alerts</Text>
                        <TouchableOpacity style={styles.seeAllButton}>
                            <Text style={styles.seeAllText}>See All</Text>
                            <ChevronRight size={16} color="#3B82F6" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.alertsList}>
                        {alerts.map((alert) => (
                            <TouchableOpacity key={alert.id} style={styles.alertItem}>
                                <View style={styles.alertIcon}>
                                    <AlertCircle size={20} color="#F59E0B" />
                                </View>
                                <View style={styles.alertContent}>
                                    <Text style={styles.alertTitle}>
                                        {alert.symbol} Price Alert
                                    </Text>
                                    <Text style={styles.alertCondition}>
                                        {alert.condition}
                                    </Text>
                                </View>
                                <View style={styles.alertStatus}>
                                    <Text style={styles.alertStatusText}>Active</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#0D1B2A",
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#748CAB",
        marginTop: 4,
    },
    headerActions: {
        flexDirection: "row",
        gap: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
    },
    statsContainer: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    statHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    statTitle: {
        fontSize: 14,
        color: "#748CAB",
        fontWeight: "500",
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginBottom: 4,
    },
    statChange: {
        fontSize: 12,
        color: "#748CAB",
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
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        color: "#3B82F6",
        fontSize: 14,
        marginRight: 4,
    },
    marketList: {
        gap: 8,
    },
    marketItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    marketInfo: {
        flex: 1,
    },
    marketSymbol: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        marginBottom: 4,
    },
    marketPrice: {
        fontSize: 14,
        color: "#748CAB",
    },
    marketChange: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    positiveChange: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    negativeChange: {
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    changeText: {
        fontSize: 14,
        fontWeight: "600",
    },
    positiveText: {
        color: "#22C55E",
    },
    negativeText: {
        color: "#EF4444",
    },
    activityList: {
        gap: 8,
    },
    activityItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        color: "white",
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 12,
        color: "#748CAB",
    },
    alertsList: {
        gap: 8,
    },
    alertItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    alertIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 16,
        color: "white",
        marginBottom: 4,
    },
    alertCondition: {
        fontSize: 14,
        color: "#748CAB",
    },
    alertStatus: {
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    alertStatusText: {
        fontSize: 12,
        color: "#22C55E",
        fontWeight: "500",
    },
    newsList: {
        gap: 8,
    },
});
