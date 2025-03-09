import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

interface PortfolioHeaderProps {
    lastUpdated: string;
    onRefresh: () => void;
}

export function PortfolioHeader({ lastUpdated, onRefresh }: PortfolioHeaderProps) {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.headerTitle}>Portfolio</Text>
                <Text style={styles.headerSubtitle}>Last updated {lastUpdated}</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <RefreshCw size={20} color="#3B82F6" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
    },
}); 