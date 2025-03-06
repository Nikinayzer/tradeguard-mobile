import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ScrollView } from "react-native";

const orderBook = {
    bids: [
        { id: "1", price: "$48,200", amount: "0.5 BTC" },
        { id: "2", price: "$48,180", amount: "0.3 BTC" },
        { id: "3", price: "$48,150", amount: "0.2 BTC" },
    ],
    asks: [
        { id: "4", price: "$48,220", amount: "0.6 BTC" },
        { id: "5", price: "$48,250", amount: "0.4 BTC" },
        { id: "6", price: "$48,280", amount: "0.1 BTC" },
    ],
};

const openPositions = [
    { id: "1", symbol: "BTC/USDT", type: "Long", entry: "48,000", mark: "48,500", leverage: "10x", pnl: "+500 USDT" },
    { id: "2", symbol: "ETH/USDT", type: "Short", entry: "3,600", mark: "3,550", leverage: "5x", pnl: "+50 USDT" },
];

export default function TradeScreen() {
    const [orderType, setOrderType] = useState("Market");
    const [amount, setAmount] = useState("");
    const [leverage, setLeverage] = useState("10x");

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>

            {/* Order Placement */}
            <View style={styles.card}>
                <Text style={styles.heading}>Place Order</Text>
                <View style={styles.orderTypeRow}>
                    {["Market", "Limit", "Stop"].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.orderTypeButton, orderType === type && styles.activeButton]}
                            onPress={() => setOrderType(type)}
                        >
                            <Text style={styles.buttonText}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TextInput
                    style={styles.input}
                    placeholder="Enter amount"
                    placeholderTextColor="#748CAB"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Leverage (e.g., 10x)"
                    placeholderTextColor="#748CAB"
                    value={leverage}
                    onChangeText={setLeverage}
                    keyboardType="numeric"
                />
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.longButton}>
                        <Text style={styles.buttonText}>Long</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shortButton}>
                        <Text style={styles.buttonText}>Short</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Order Book */}
            <View style={styles.card}>
                <Text style={styles.heading}>Order Book</Text>
                <View style={styles.orderBookContainer}>
                    <FlatList
                        data={orderBook.asks}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={[styles.row]}>
                                <Text style={styles.redText}>{item.price}</Text>
                                <Text style={styles.text}>{item.amount}</Text>
                            </View>
                        )}
                    />
                    <FlatList
                        data={orderBook.bids}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={[styles.row]}>
                                <Text style={styles.greenText}>{item.price}</Text>
                                <Text style={styles.text}>{item.amount}</Text>
                            </View>
                        )}
                    />
                </View>
            </View>

            {/* Open Positions */}
            <View style={styles.card}>
                <Text style={styles.heading}>Open Positions</Text>
                <FlatList
                    data={openPositions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={[styles.text, item.type === "Long" ? styles.greenText : styles.redText]}>
                                {item.symbol} ({item.type})
                            </Text>
                            <Text style={styles.text}>Entry: {item.entry}</Text>
                            <Text style={styles.text}>Mark: {item.mark}</Text>
                            <Text style={styles.text}>Lev: {item.leverage}</Text>
                            <Text style={[styles.text, item.pnl.includes("+") ? styles.greenText : styles.redText]}>
                                {item.pnl}
                            </Text>
                            <TouchableOpacity style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0D1B2A", padding: 16 },
    card: { backgroundColor: "#1B263B", padding: 16, borderRadius: 16, marginBottom: 16 },
    heading: { fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 10 },
    orderTypeRow: { flexDirection: "row", justifyContent: "space-between" },
    orderTypeButton: { flex: 1, paddingVertical: 10, marginHorizontal: 5, borderRadius: 10, alignItems: "center", backgroundColor: "#22314A" },
    activeButton: { backgroundColor: "#3B82F6" },
    buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
    input: { backgroundColor: "#22314A", color: "white", padding: 10, borderRadius: 8, marginBottom: 12, textAlign: "center" },
    buttonContainer: { flexDirection: "row", justifyContent: "space-between" },
    longButton: { backgroundColor: "green", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, flex: 1, alignItems: "center", marginRight: 8 },
    shortButton: { backgroundColor: "red", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, flex: 1, alignItems: "center", marginLeft: 8 },
    orderBookContainer: { flexDirection: "row", justifyContent: "space-between" },
    row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
    text: { color: "white", fontSize: 14 },
    greenText: { color: "green" },
    redText: { color: "red" },
    closeButton: { backgroundColor: "#FF4D4D", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10 },
    closeButtonText: { color: "white", fontWeight: "bold" },
});
