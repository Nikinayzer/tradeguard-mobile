import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";

const accountSummary = {
    balance: "$12,540.32",
    assets: [
        { id: "1", name: "BTC", amount: "0.054 BTC", value: "$2,700", change: "+3.2%" },
        { id: "2", name: "ETH", amount: "1.2 ETH", value: "$3,800", change: "-1.5%" },
    ],
};

const watchlist = [
    { id: "1", name: "BTC/USD", price: "$1,000,000", change: "+2.5%" },
    { id: "2", name: "ETH/USD", price: "$3,500", change: "-1.2%" },
    { id: "3", name: "SOL/USD", price: "$120", change: "+4.3%" },
];

const newsUpdates = [
    { id: "1", title: "Bitcoin Surges 10% After ETF Approval", source: "CoinDesk" },
    { id: "2", title: "Ethereum 2.0 Upgrade Date Confirmed", source: "CryptoNews" },
];

export default function HomeScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Account Balance */}
            <View style={styles.card}>
                <Text style={styles.heading}>Account Balance</Text>
                <Text style={styles.balance}>{accountSummary.balance}</Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Deposit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Withdraw</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionText}>Trade</Text>
                </TouchableOpacity>
            </View>

            {/* Watchlist */}
            <View style={styles.card}>
                <Text style={styles.heading}>Watchlist</Text>
                <FlatList
                    data={watchlist}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.text}>{item.name}</Text>
                            <Text style={styles.text}>{item.price}</Text>
                            <Text style={item.change.includes("+") ? styles.greenText : styles.redText}>
                                {item.change}
                            </Text>
                        </View>
                    )}
                />
            </View>

            {/* Market Trends (Mini Chart Placeholder) */}
            <View style={styles.card}>
                <Text style={styles.heading}>Market Trends</Text>
                <Image source={{ uri: "https://via.placeholder.com/300x150" }} style={styles.chart} />
            </View>

            {/* News & Updates */}
            <View style={styles.card}>
                <Text style={styles.heading}>News & Updates</Text>
                {newsUpdates.map((news) => (
                    <View key={news.id} style={styles.newsItem}>
                        <Text style={styles.newsTitle}>{news.title}</Text>
                        <Text style={styles.newsSource}>{news.source}</Text>
                    </View>
                ))}
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
    balance: {
        fontSize: 28,
        fontWeight: "600",
        color: "white",
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    actionButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    actionText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
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
    chart: {
        width: "100%",
        height: 150,
        borderRadius: 10,
    },
    newsItem: {
        borderBottomWidth: 1,
        borderBottomColor: "#748CAB",
        paddingBottom: 10,
        marginBottom: 10,
    },
    newsTitle: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    newsSource: {
        color: "#748CAB",
        fontSize: 14,
    },
});
