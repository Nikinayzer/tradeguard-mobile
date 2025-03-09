import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertCircle, Clock, DollarSign, Percent, Lock } from 'lucide-react-native';

interface LimitSetting {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
    value?: number;
    unit?: string;
}

export default function AccountLimitsScreen({ navigation }: any) {
    const [limits, setLimits] = useState<LimitSetting[]>([
        {
            id: 'daily',
            title: 'Daily Trading Limit',
            description: 'Maximum amount you can trade in a 24-hour period',
            icon: <Clock size={24} color="#748CAB" />,
            enabled: true,
            value: 1000,
            unit: 'USDT',
        },
        {
            id: 'loss',
            title: 'Daily Loss Limit',
            description: 'Maximum amount you can lose in a 24-hour period',
            icon: <DollarSign size={24} color="#748CAB" />,
            enabled: true,
            value: 500,
            unit: 'USDT',
        },
        {
            id: 'leverage',
            title: 'Maximum Leverage',
            description: 'Highest leverage allowed for futures trade',
            icon: <Percent size={24} color="#748CAB" />,
            enabled: true,
            value: 5,
            unit: 'x',
        },
        {
            id: 'cooldown',
            title: 'Trading Cooldown',
            description: 'Minimum time required between trades',
            icon: <Lock size={24} color="#748CAB" />,
            enabled: true,
            value: 30,
            unit: 'minutes',
        },
    ]);

    const toggleLimit = (id: string) => {
        setLimits(prevLimits =>
            prevLimits.map(limit =>
                limit.id === id ? { ...limit, enabled: !limit.enabled } : limit
            )
        );
    };

    const updateValue = (id: string, value: number) => {
        setLimits(prevLimits =>
            prevLimits.map(limit =>
                limit.id === id ? { ...limit, value } : limit
            )
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Limits</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container}>
                <Text style={styles.description}>
                    Set up trading limits to help prevent gambling patterns and protect your account.
                </Text>

                <View style={styles.limitsContainer}>
                    {limits.map((limit) => (
                        <View key={limit.id} style={styles.limitCard}>
                            <View style={styles.limitHeader}>
                                <View style={styles.limitIcon}>
                                    {limit.icon}
                                </View>
                                <View style={styles.limitTitleContainer}>
                                    <Text style={styles.limitTitle}>{limit.title}</Text>
                                    <Text style={styles.limitDescription}>{limit.description}</Text>
                                </View>
                                <Switch
                                    value={limit.enabled}
                                    onValueChange={() => toggleLimit(limit.id)}
                                    trackColor={{ false: '#22314A', true: '#3B82F6' }}
                                    thumbColor={limit.enabled ? '#60A5FA' : '#748CAB'}
                                />
                            </View>

                            {limit.enabled && limit.value !== undefined && (
                                <View style={styles.valueContainer}>
                                    <Text style={styles.valueLabel}>Limit Value:</Text>
                                    <Text style={styles.valueText}>
                                        {limit.value} {limit.unit}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1B263B',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1B263B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    description: {
        color: '#748CAB',
        fontSize: 14,
        marginBottom: 24,
        lineHeight: 20,
    },
    limitsContainer: {
        gap: 16,
    },
    limitCard: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
    },
    limitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    limitIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#22314A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    limitTitleContainer: {
        flex: 1,
    },
    limitTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    limitDescription: {
        fontSize: 12,
        color: '#748CAB',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#22314A',
        padding: 12,
        borderRadius: 8,
    },
    valueLabel: {
        fontSize: 14,
        color: '#748CAB',
        marginRight: 8,
    },
    valueText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 