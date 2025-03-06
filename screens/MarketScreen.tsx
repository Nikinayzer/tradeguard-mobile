import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ScrollView } from "react-native";

const marketCategories = ["Spot", "Futures", "DeFi", "NFT", "Metaverse"];

const marketData = [
    { id: "1", name: "BTC/USDT", price: "$48,000", change: "+2.5%", volume: "$34B" },
    { id: "2", name: "ETH/USDT", price: "$3,500", change: "-1.2%", volume: "$20B" },
    { id: "3", name: "SOL/USDT", price: "$120", change: "+4.3%", volume: "$8B" },
    { id: "4", name: "BNB/USDT", price: "$600", change: "-2.1%", volume: "$5B" },
    { id: "5", name: "XRP/USDT", price: "$0.75", change: "+3.8%", volume: "$4B" },
];

const topMovers = [
    { id: "1", name: "DOGE", price: "$0.15", change: "+12.5%" },
    { id: "2", name: "ADA", price: "$1.35", change: "-8.1%" },
    { id: "3", name: "AVAX", price: "$90", change: "+10.2%" },
];

export default function MarketScreen() {
    const [selectedCategory, setSelectedCategory] = useState("Spot");
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search coins..."
                    placeholderTextColor="#748CAB"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Market Categories */}
            <View style={styles.categoryContainer}>
                {marketCategories.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[styles.categoryButton, selectedCategory === category && styles.activeCategory]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text style={styles.categoryText}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Top Market Movers */}
            <View style={styles.card}>
                <Text style={styles.heading}>Top Movers</Text>
                <FlatList
                    data={topMovers}
                    horizontal
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.moverCard}>
                            <Text style={styles.text}>{item.name}</Text>
                            <Text style={styles.text}>{item.price}</Text>
                            <Text style={item.change.includes("+") ? styles.greenText : styles.redText}>
                                {item.change}
                            </Text>
                        </View>
                    )}
                />
            </View>

            {/* Market Listings */}
            <View style={styles.card}>
                <Text style={styles.heading}>Market Overview</Text>
                <FlatList
                    data={marketData.filter((coin) => coin.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.text}>{item.name}</Text>
                            <Text style={styles.text}>{item.price}</Text>
                            <Text style={item.change.includes("+") ? styles.greenText : styles.redText}>
                                {item.change}
                            </Text>
                            <Text style={styles.text}>{item.volume}</Text>
                        </View>
                    )}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D1B2A",
        padding: 16,
    },
    searchContainer: {
        backgroundColor: "#1B263B",
        padding: 10,
        borderRadius: 10,
        marginBottom: 16,
    },
    searchInput: {
        color: "white",
        fontSize: 16,
    },
    categoryContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: "#1B263B",
    },
    activeCategory: {
        backgroundColor: "#3B82F6",
    },
    categoryText: {
        color: "white",
        fontSize: 14,
    },
    card: {
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    heading: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginBottom: 10,
    },
    moverCard: {
        backgroundColor: "#3B82F6",
        padding: 10,
        borderRadius: 12,
        marginRight: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    text: {
        color: "white",
        fontSize: 16,
    },
    greenText: {
        color: "green",
        fontSize: 16,
    },
    redText: {
        color: "red",
        fontSize: 16,
    },
});
