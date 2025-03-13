import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    change?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon size={20} color="#748CAB" />
                <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.value}>{value}</Text>
            {change && <Text style={styles.change}>{change}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 14,
        color: "#748CAB",
        fontWeight: "500",
    },
    value: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginBottom: 4,
    },
    change: {
        fontSize: 12,
        color: "#748CAB",
    },
}); 