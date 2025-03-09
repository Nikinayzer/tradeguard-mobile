import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ScrollView, Image } from "react-native";
import { Search, TrendingUp, TrendingDown, ChevronRight, Star, DollarSign, BarChart2, ArrowUpRight, ArrowDownRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PriceChart } from "@/components/screens/market/PriceChart";

interface MarketCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
}

interface MarketItem {
    id: string;
    symbol: string;
    name: string;
    price: string;
    change: string;
    direction: "up" | "down";
    chartData: Array<{ x: number; y: number }>;
}

interface TopMover {
    id: string;
    name: string;
    price: string;
    change: string;
    image: string;
}

interface MarketInsight {
    id: string;
    title: string;
    value: string;
    change: string;
}

const marketCategories = [
    { id: "spot", name: "Spot", icon: <DollarSign size={20} color="#748CAB" /> },
    { id: "futures", name: "Futures", icon: <BarChart2 size={20} color="#748CAB" /> },
    { id: "defi", name: "DeFi", icon: <TrendingUp size={20} color="#748CAB" /> },
    { id: "nft", name: "NFT", icon: <Star size={20} color="#748CAB" /> },
    { id: "metaverse", name: "Metaverse", icon: <TrendingUp size={20} color="#748CAB" /> },
];

// Sample data
const generateSampleData = (basePrice: number) => {
    return Array.from({ length: 24 }, (_, i) => ({
        x: i,
        y: basePrice + (Math.random() - 0.5) * 1000,
    }));
};

const marketData: MarketItem[] = [
    {
        id: "1",
        symbol: "BTC",
        name: "Bitcoin",
        price: "65432",
        change: "+2.45%",
        direction: "up",
        chartData: generateSampleData(65432),
    },
    {
        id: "2",
        symbol: "ETH",
        name: "Ethereum",
        price: "3456",
        change: "-1.23%",
        direction: "down",
        chartData: generateSampleData(3456),
    },
    {
        id: "3",
        symbol: "SOL",
        name: "Solana",
        price: "142.39",
        change: "+5.67%",
        direction: "up",
        chartData: generateSampleData(142.39),
    },
];

const topMovers = [
    { id: "1", name: "DOGE", price: "$0.15", change: "+12.5%", image: "https://cryptologos.cc/logos/dogecoin-doge-logo.png" },
    { id: "2", name: "ADA", price: "$1.35", change: "-8.1%", image: "https://cryptologos.cc/logos/cardano-ada-logo.png" },
    { id: "3", name: "AVAX", price: "$90", change: "+10.2%", image: "https://cryptologos.cc/logos/avalanche-avax-logo.png" },
];

const marketInsights = [
    { id: "1", title: "Bitcoin Dominance", value: "48.5%", change: "+2.1%" },
    { id: "2", title: "Total Market Cap", value: "$2.1T", change: "+3.2%" },
    { id: "3", title: "24h Volume", value: "$98B", change: "-1.5%" },
];

export default function MarketScreen() {
    const [selectedCategory, setSelectedCategory] = useState("spot");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCoin, setSelectedCoin] = useState<MarketItem>(marketData[0]);

    const renderMarketItem = ({ item }: { item: MarketItem }) => (
        <TouchableOpacity
            style={[
                styles.marketItem,
                selectedCoin?.id === item.id && styles.selectedMarketItem,
            ]}
            onPress={() => setSelectedCoin(item)}
        >
            <View style={styles.marketInfo}>
                <Text style={styles.marketSymbol}>{item.symbol}</Text>
                <Text style={styles.marketName}>{item.name}</Text>
            </View>
            <View style={styles.marketPriceContainer}>
                <Text style={styles.marketPrice}>${item.price}</Text>
                <View style={[
                    styles.marketChange,
                    item.direction === "up" ? styles.positiveChange : styles.negativeChange
                ]}>
                    {item.direction === "up" ? (
                        <ArrowUpRight size={16} color="#22C55E" />
                    ) : (
                        <ArrowDownRight size={16} color="#EF4444" />
                    )}
                    <Text style={[
                        styles.changeText,
                        item.direction === "up" ? styles.positiveText : styles.negativeText
                    ]}>
                        {item.change}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderTopMover = ({ item }: { item: TopMover }) => (
        <TouchableOpacity style={styles.moverCard}>
            <Image source={{ uri: item.image }} style={styles.moverImage} />
            <Text style={styles.moverName}>{item.name}</Text>
            <Text style={styles.moverPrice}>{item.price}</Text>
            <Text style={item.change.includes("+") ? styles.greenText : styles.redText}>
                {item.change}
            </Text>
        </TouchableOpacity>
    );

    const filteredCoins = marketData.filter((coin) =>
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Search size={20} color="#748CAB" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search coins..."
                        placeholderTextColor="#748CAB"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Market Categories */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryScroll}
                >
                    {marketCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.id && styles.activeCategory
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            {category.icon}
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category.id && styles.activeCategoryText
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Market Insights */}
                <View style={styles.insightsContainer}>
                    {marketInsights.map((insight) => (
                        <View key={insight.id} style={styles.insightItem}>
                            <Text style={styles.insightTitle}>{insight.title}</Text>
                            <Text style={styles.insightValue}>{insight.value}</Text>
                            <Text style={insight.change.includes("+") ? styles.greenText : styles.redText}>
                                {insight.change}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Top Movers */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Movers</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={topMovers}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={renderTopMover}
                    />
                </View>

                {/* Price Chart */}
                {selectedCoin && (
                    <PriceChart
                        data={selectedCoin.chartData}
                        color={selectedCoin.direction === "up" ? "#22C55E" : "#EF4444"}
                    />
                )}

                {/* Market Listings */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Market Overview</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={filteredCoins}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMarketItem}
                        scrollEnabled={false}
                    />
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
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1B263B",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        color: "white",
        fontSize: 16,
    },
    categoryScroll: {
        marginBottom: 16,
    },
    categoryButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: "#1B263B",
        marginRight: 8,
    },
    activeCategory: {
        backgroundColor: "#3B82F6",
    },
    categoryText: {
        color: "#748CAB",
        fontSize: 14,
        marginLeft: 6,
    },
    activeCategoryText: {
        color: "white",
    },
    insightsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    insightItem: {
        flex: 1,
        backgroundColor: "#1B263B",
        padding: 12,
        borderRadius: 12,
        marginHorizontal: 4,
    },
    insightTitle: {
        color: "#748CAB",
        fontSize: 12,
        marginBottom: 4,
    },
    insightValue: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    seeAll: {
        color: "#3B82F6",
        fontSize: 14,
    },
    moverCard: {
        backgroundColor: "#1B263B",
        padding: 12,
        borderRadius: 12,
        marginRight: 12,
        width: 120,
        alignItems: "center",
    },
    moverImage: {
        width: 32,
        height: 32,
        marginBottom: 8,
    },
    moverName: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 4,
    },
    moverPrice: {
        color: "#748CAB",
        fontSize: 12,
        marginBottom: 4,
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
    selectedMarketItem: {
        borderColor: "#3B82F6",
        backgroundColor: "#22314A",
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
    marketName: {
        fontSize: 14,
        color: "#748CAB",
    },
    marketPriceContainer: {
        alignItems: "flex-end",
    },
    marketPrice: {
        fontSize: 16,
        fontWeight: "600",
        color: "white",
        marginBottom: 4,
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
    greenText: {
        color: "#22C55E",
        fontSize: 14,
    },
    redText: {
        color: "#EF4444",
        fontSize: 14,
    },
});
