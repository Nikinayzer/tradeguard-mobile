import React from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";

const openTrades = [
    { id: "1", symbol: "SOL", direction: "long", amount: "2667", entry: "141.48", mark: "140.39", bust: "130.97", upl: "-21", cumPL: "0", change24h: "0.00%", lev: "0.00", vol: "0.00", fund: "0.0000" },
    { id: "2", symbol: "XLM", direction: "short", amount: "-169", entry: "0.29", mark: "0.30", bust: "0.38", upl: "-8", cumPL: "0", change24h: "0.00%", lev: "0.00", vol: "0.00", fund: "0.0000" },
    { id: "3", symbol: "HBAR", direction: "short", amount: "-117", entry: "0.22", mark: "0.23", bust: "0.29", upl: "-5", cumPL: "0", change24h: "0.00%", lev: "0.00", vol: "0.00", fund: "0.0000" },
];

const summary = {
    longValue: "$2667.42",
    shortValue: "$285.90",
    combinedValue: "$2953.32",
    netValue: "$2381.52",
    avgLeverage: "0.00",
    usdtEquity: "$278.51",
    availableMargin: "$9.34",
};

export default function PortfolioScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Open Trades Section */}
            <View style={styles.card}>
                <Text style={styles.heading}>Open Positions</Text>
                <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>Symbol</Text>
                    <Text style={styles.headerText}>Amount</Text>
                    <Text style={styles.headerText}>Entry</Text>
                    <Text style={styles.headerText}>Mark</Text>
                    <Text style={styles.headerText}>UP/L</Text>
                    <Text style={styles.headerText}>Lev</Text>
                </View>
                <FlatList
                    data={openTrades}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={[styles.text, item.direction === "long" ? styles.greenText : styles.redText]}>
                                {item.symbol} {item.direction === "long" ? "⬆️" : "⬇️"}
                            </Text>
                            <Text style={styles.text}>{item.amount}</Text>
                            <Text style={styles.text}>{item.entry}</Text>
                            <Text style={styles.text}>{item.mark}</Text>
                            <Text style={[styles.text, item.upl.includes("-") ? styles.redText : styles.greenText]}>
                                {item.upl}
                            </Text>
                            <Text style={styles.text}>{item.lev}</Text>
                        </View>
                    )}
                />
            </View>

            {/* Account Summary */}
            <View style={styles.card}>
                <Text style={styles.heading}>Account Summary</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Long Positions' USDT Value:</Text>
                    <Text style={styles.value}>{summary.longValue}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Short Positions' USDT Value:</Text>
                    <Text style={styles.value}>{summary.shortValue}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Combined Positions' USDT Value:</Text>
                    <Text style={styles.value}>{summary.combinedValue}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Net Positions' USDT Value:</Text>
                    <Text style={styles.value}>{summary.netValue}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Weighted Average Lev:</Text>
                    <Text style={styles.value}>{summary.avgLeverage}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>USDT Equity:</Text>
                    <Text style={styles.value}>{summary.usdtEquity}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.label}>Available Margin:</Text>
                    <Text style={styles.value}>{summary.availableMargin}</Text>
                </View>
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
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#748CAB",
        marginBottom: 5,
    },
    headerText: {
        fontSize: 14,
        fontWeight: "bold",
        color: "white",
        flex: 1,
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    text: {
        color: "white",
        fontSize: 14,
        flex: 1,
        textAlign: "center",
    },
    greenText: {
        color: "green",
    },
    redText: {
        color: "red",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 5,
    },
    label: {
        color: "#748CAB",
        fontSize: 14,
    },
    value: {
        color: "white",
        fontSize: 14,
    },
});
