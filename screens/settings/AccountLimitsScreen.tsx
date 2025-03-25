import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
    Alert,
    TextInput
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
    ArrowLeft,
    AlertCircle,
    Clock,
    DollarSign,
    Percent,
    Lock,
    Users,
    TrendingDown,
    Wallet,
    Repeat,
    Trash2
} from 'lucide-react-native';
import {profileService, UserAccountLimits} from '@/services/api/profile';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';

interface LimitSetting {
    id: keyof typeof limitMappings;
    title: string;
    description: string;
    icon: React.ReactNode;
    value: number | string;
    originalValue: number;
    unit: string;
    enabled: boolean;
    min?: number;
    max?: number;
    isEditing?: boolean;
    step?: number;
    keyboardType?: 'numeric' | 'decimal-pad';
    formatValue?: (value: number) => string;
    parseValue?: (value: string) => number;
    stepButtons?: number[];
    presets?: number[];
}

interface BooleanSetting {
    id: 'allowDcaForce' | 'allowLiqForce';
    title: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
}

const limitMappings = {
    maxSingleJobLimit: {
        title: 'Single Job Limit',
        description: 'Maximum amount for a single trading job',
        icon: <Wallet size={24} color="#748CAB"/>,
        unit: 'USDT',
        min: 0,
        max: 1000000,
        presets: [1000, 10000, 100000, 500000, 1000000],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toLocaleString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    },
    maxDailyTradingLimit: {
        title: 'Daily Trading Limit',
        description: 'Maximum amount you can trade in 24 hours',
        icon: <Clock size={24} color="#748CAB"/>,
        unit: 'USDT',
        min: 0,
        max: 10000000,
        presets: [10000, 100000, 1000000, 5000000, 10000000],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toLocaleString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    },
    maxPortfolioRisk: {
        title: 'Portfolio Risk',
        description: 'Maximum percentage of portfolio at risk',
        icon: <Percent size={24} color="#748CAB"/>,
        unit: '%',
        min: 0,
        max: 100,
        presets: [1, 2, 5, 10, 15],
        keyboardType: 'decimal-pad' as const,
        formatValue: (value: number) => value.toString(),
        parseValue: (value: string) => parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    },
    maxConcurrentOrders: {
        title: 'Concurrent Orders',
        description: 'Maximum number of active orders',
        icon: <Users size={24} color="#748CAB"/>,
        unit: 'orders',
        min: 0,
        max: 100,
        presets: [5, 10, 25, 50, 100],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    },
    maxDailyTrades: {
        title: 'Daily Trades',
        description: 'Maximum number of trades per day',
        icon: <Clock size={24} color="#748CAB"/>,
        unit: 'trades',
        min: 0,
        max: 1000,
        presets: [50, 100, 250, 500, 1000],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    },
    tradingCooldown: {
        title: 'Trading Cooldown',
        description: 'Minimum time between trades',
        icon: <Lock size={24} color="#748CAB"/>,
        unit: 'minutes',
        min: 0,
        max: 1440,
        presets: [5, 15, 30, 60, 120],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    },
    dailyLossLimit: {
        title: 'Daily Loss Limit',
        description: 'Maximum amount you can lose in 24 hours',
        icon: <DollarSign size={24} color="#748CAB"/>,
        unit: 'USDT',
        min: 0,
        max: 1000000,
        presets: [1000, 10000, 100000, 500000, 1000000],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toLocaleString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    },
    maxConsecutiveLosses: {
        title: 'Consecutive Losses',
        description: 'Maximum number of consecutive losing trades',
        icon: <TrendingDown size={24} color="#748CAB"/>,
        unit: 'trades',
        min: 0,
        max: 100,
        presets: [3, 5, 10, 25, 50],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    },
    maxDailyBalanceChange: {
        title: 'Daily Balance Change',
        description: 'Maximum percentage change in balance per day',
        icon: <Percent size={24} color="#748CAB"/>,
        unit: '%',
        min: 0,
        max: 100,
        presets: [1, 2, 5, 10, 15],
        keyboardType: 'decimal-pad' as const,
        formatValue: (value: number) => value.toString(),
        parseValue: (value: string) => parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    },
    volatilityLimit: {
        title: 'Volatility Limit',
        description: 'Maximum market volatility for trading',
        icon: <Percent size={24} color="#748CAB"/>,
        unit: '%',
        min: 0,
        max: 100,
        presets: [1, 2, 5, 10, 15],
        keyboardType: 'decimal-pad' as const,
        formatValue: (value: number) => value.toString(),
        parseValue: (value: string) => parseFloat(value.replace(/[^0-9.]/g, '')) || 0
    },
    liquidityThreshold: {
        title: 'Liquidity Threshold',
        description: 'Minimum market liquidity required',
        icon: <DollarSign size={24} color="#748CAB"/>,
        unit: 'USDT',
        min: 0,
        max: 1000000,
        presets: [10000, 100000, 500000, 1000000],
        keyboardType: 'numeric' as const,
        formatValue: (value: number) => value.toLocaleString(),
        parseValue: (value: string) => parseInt(value.replace(/[^0-9]/g, ''), 10) || 0
    }
};

const booleanSettings = [
    {
        id: 'allowDcaForce' as const,
        title: 'Allow DCA Force',
        description: 'Enable forced Dollar Cost Averaging in unfavorable conditions',
        icon: <Repeat size={24} color="#748CAB"/>
    },
    {
        id: 'allowLiqForce' as const,
        title: 'Allow Liquidation Force',
        description: 'Enable forced liquidation in emergency situations',
        icon: <Trash2 size={24} color="#748CAB"/>
    }
];

export default function AccountLimitsScreen({navigation}: any) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [limits, setLimits] = useState<LimitSetting[]>([]);
    const [booleans, setBooleans] = useState<BooleanSetting[]>([]);
    const {alert, showAlert, hideAlert} = useAlert();

    const fetchLimits = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await profileService.getLimits();

            const transformedLimits = Object.entries(response)
                .filter(([key]) => key in limitMappings)
                .map(([key, value]) => ({
                    id: key as keyof typeof limitMappings,
                    ...limitMappings[key as keyof typeof limitMappings],
                    value: parseInt(value as string, 10) || 0,
                    originalValue: parseInt(value as string, 10) || 0,
                    enabled: parseInt(value as string, 10) > 0,
                    isEditing: false
                }));

            const transformedBooleans = booleanSettings.map(setting => ({
                ...setting,
                enabled: response[setting.id]
            }));


            setLimits(transformedLimits);
            setBooleans(transformedBooleans);
        } catch (error) {
            console.error('Error fetching limits:', error);
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load account limits',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLimits();
    }, []);

    const toggleLimit = (id: string) => {
        const limit = limits.find(l => l.id === id);
        if (!limit) return;

        if (!limit.enabled) {
            setLimits(prevLimits =>
                prevLimits.map(l =>
                    l.id === id
                        ? {
                            ...l,
                            enabled: true,
                            isEditing: false
                        }
                        : l
                )
            );
        } else if (!limit.isEditing) {
            setLimits(prevLimits =>
                prevLimits.map(l =>
                    l.id === id
                        ? {
                            ...l,
                            enabled: false,
                            isEditing: false
                        }
                        : l
                )
            );
        }
    };

    const toggleBoolean = (id: string) => {
        setBooleans(prevBooleans =>
            prevBooleans.map(bool =>
                bool.id === id ? {...bool, enabled: !bool.enabled} : bool
            )
        );
    };

    const handleInputBlur = (id: string) => {
        const limit = limits.find(l => l.id === id);
        if (!limit) return;

        const parsedValue = limit.parseValue?.(limit.value as string) || 0;
        const clampedValue = Math.min(
            Math.max(parsedValue, limit.min || 0),
            limit.max || Infinity
        );

        setLimits(prevLimits =>
            prevLimits.map(l =>
                l.id === id
                    ? {
                        ...l,
                        value: clampedValue,
                        originalValue: clampedValue,
                        isEditing: false,
                        enabled: clampedValue > 0
                    }
                    : l
            )
        );
    };

    const handleInputFocus = (id: string) => {
        const limit = limits.find(l => l.id === id);
        if (!limit) return;

        const rawValue = typeof limit.value === 'number'
            ? limit.value.toString()
            : limit.parseValue?.(limit.value as string)?.toString() || '';

        setLimits(prevLimits =>
            prevLimits.map(l =>
                l.id === id
                    ? {
                        ...l,
                        value: rawValue,
                        isEditing: true
                    }
                    : l
            )
        );
    };

    const updateLimitValue = (id: string, value: string) => {
        const limit = limits.find(l => l.id === id);
        if (!limit) return;

        const cleanValue = value.replace(/[^0-9.]/g, '');

        setLimits(prevLimits =>
            prevLimits.map(l =>
                l.id === id
                    ? {
                        ...l,
                        value: cleanValue,
                        originalValue: limit.parseValue?.(cleanValue) || 0,
                        isEditing: true
                    }
                    : l
            )
        );
    };

    const adjustValue = (id: string, step: number) => {
        const limit = limits.find(l => l.id === id);
        if (!limit) return;

        const currentValue = typeof limit.value === 'string'
            ? limit.parseValue?.(limit.value) || 0
            : limit.value;

        const newValue = currentValue + step;
        const clampedValue = Math.min(
            Math.max(newValue, limit.min || 0),
            limit.max || Infinity
        );

        setLimits(prevLimits =>
            prevLimits.map(l =>
                l.id === id
                    ? {
                        ...l,
                        value: clampedValue,
                        originalValue: clampedValue,
                        enabled: clampedValue > 0
                    }
                    : l
            )
        );
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);

            const updatedLimits: UserAccountLimits = {
                maxSingleJobLimit: "0",
                maxDailyTradingLimit: "0",
                maxPortfolioRisk: "0",
                maxConcurrentOrders: "0",
                maxDailyTrades: "0",
                tradingCooldown: "0",
                dailyLossLimit: "0",
                maxConsecutiveLosses: "0",
                maxDailyBalanceChange: "0",
                volatilityLimit: "0",
                liquidityThreshold: "0",
                allowDcaForce: false,
                allowLiqForce: false,
                ...limits.reduce((acc, limit) => ({
                    ...acc,
                    [limit.id]: limit.enabled ? limit.value.toString() : "0"
                }), {}),
                ...booleans.reduce((acc, bool) => ({
                    ...acc,
                    [bool.id]: bool.enabled
                }), {})
            };

            await profileService.updateLimits(updatedLimits);

            showAlert({
                type: 'success',
                title: 'Success',
                message: 'Account limits updated successfully',
            });
        } catch (error: any) {
            console.error('Error saving limits:', error);
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to update account limits',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6"/>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="white"/>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Limits</Text>
                <View style={{width: 40}}/>
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
                                    trackColor={{false: '#22314A', true: '#3B82F6'}}
                                    thumbColor={limit.enabled ? '#60A5FA' : '#748CAB'}
                                    disabled={limit.isEditing}
                                />
                            </View>

                            <View style={styles.valueContainer}>
                                <Text style={styles.valueLabel}>Current Limit:</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            !limit.enabled && styles.inputDisabled
                                        ]}
                                        value={limit.isEditing
                                            ? limit.value.toString()
                                            : (typeof limit.value === 'number'
                                                ? limit.formatValue?.(limit.value) || limit.value.toString()
                                                : limit.formatValue?.(limit.parseValue?.(limit.value) || 0) || limit.value)}
                                        onChangeText={(value) => updateLimitValue(limit.id, value)}
                                        onBlur={() => handleInputBlur(limit.id)}
                                        onFocus={() => handleInputFocus(limit.id)}
                                        keyboardType={limit.keyboardType || 'numeric'}
                                        placeholder={`Enter value`}
                                        placeholderTextColor="#748CAB"
                                        maxLength={10}
                                        editable={limit.enabled}
                                    />
                                    <Text style={[
                                        styles.unitText,
                                        !limit.enabled && styles.textDisabled
                                    ]}>
                                        {limit.unit}
                                    </Text>
                                </View>
                            </View>

                            {limit.presets && (
                                <View style={styles.presetsContainer}>
                                    <Text style={styles.presetsLabel}>Quick Select:</Text>
                                    <View style={styles.presetsRow}>
                                        {limit.presets.map((preset, index) => {
                                            const currentValue = typeof limit.value === 'string'
                                                ? limit.parseValue?.(limit.value) || 0
                                                : limit.value;
                                            const isSelected = currentValue === preset;

                                            return (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.presetButton,
                                                        isSelected && styles.presetButtonSelected,
                                                        !limit.enabled && styles.presetButtonDisabled
                                                    ]}
                                                    onPress={() => {
                                                        if (limit.enabled) {
                                                            setLimits(prevLimits =>
                                                                prevLimits.map(l =>
                                                                    l.id === limit.id
                                                                        ? {
                                                                            ...l,
                                                                            value: preset.toString(),
                                                                            originalValue: preset,
                                                                            isEditing: false
                                                                        }
                                                                        : l
                                                                )
                                                            );
                                                        }
                                                    }}
                                                    disabled={!limit.enabled}
                                                >
                                                    <Text style={[
                                                        styles.presetButtonText,
                                                        isSelected && styles.presetButtonTextSelected,
                                                        !limit.enabled && styles.presetButtonTextDisabled
                                                    ]}>
                                                        {limit.formatValue?.(preset)} {limit.unit}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}

                    <View style={styles.sectionTitle}>
                        <Text style={styles.sectionTitleText}>Advanced Settings</Text>
                    </View>

                    {booleans.map((bool) => (
                        <View key={bool.id} style={styles.limitCard}>
                            <View style={styles.limitHeader}>
                                <View style={styles.limitIcon}>
                                    {bool.icon}
                                </View>
                                <View style={styles.limitTitleContainer}>
                                    <Text style={styles.limitTitle}>{bool.title}</Text>
                                    <Text style={styles.limitDescription}>{bool.description}</Text>
                                </View>
                                <Switch
                                    value={bool.enabled}
                                    onValueChange={() => toggleBoolean(bool.id)}
                                    trackColor={{false: '#22314A', true: '#3B82F6'}}
                                    thumbColor={bool.enabled ? '#60A5FA' : '#748CAB'}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" size="small"/>
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        marginBottom: 24,
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
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#22314A',
    },
    valueLabel: {
        fontSize: 14,
        color: '#748CAB',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    input: {
        backgroundColor: '#22314A',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        width: 120,
        textAlign: 'right',
    },
    inputDisabled: {
        backgroundColor: '#1B263B',
        color: '#748CAB',
        opacity: 0.5,
    },
    textDisabled: {
        opacity: 0.5,
    },
    unitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#748CAB',
        minWidth: 40,
    },
    saveButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionTitle: {
        marginTop: 8,
        marginBottom: 8,
    },
    sectionTitleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#748CAB',
        textTransform: 'uppercase',
    },
    presetsContainer: {
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#22314A',
        paddingTop: 12,
    },
    presetsLabel: {
        fontSize: 14,
        color: '#748CAB',
        marginBottom: 8,
    },
    presetsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    presetButton: {
        backgroundColor: '#22314A',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        minWidth: 100,
        alignItems: 'center',
    },
    presetButtonSelected: {
        backgroundColor: '#3B82F6',
    },
    presetButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#748CAB',
        textAlign: 'center',
    },
    presetButtonTextSelected: {
        color: 'white',
    },
    presetButtonDisabled: {
        backgroundColor: '#1B263B',
        opacity: 0.5,
    },
    presetButtonTextDisabled: {
        color: '#748CAB',
        opacity: 0.5,
    },
}); 