import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
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
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedView} from '@/components/ui/ThemedView';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedHeader} from '@/components/ui/ThemedHeader';

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
    }
};

export default function AccountLimitsScreen({navigation}: any) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [limits, setLimits] = useState<LimitSetting[]>([]);
    const {alert, showAlert, hideAlert} = useAlert();
    const {colors} = useTheme();

    useEffect(() => {
        Object.keys(limitMappings).forEach(key => {
            const mappingKey = key as keyof typeof limitMappings;
            limitMappings[mappingKey].icon = React.cloneElement(
                limitMappings[mappingKey].icon as React.ReactElement,
                {color: colors.textSecondary}
            );
        });
    }, [colors]);

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

            setLimits(transformedLimits);
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
                maxDailyBalanceChange: "0",
                ...limits.reduce((acc, limit) => ({
                    ...acc,
                    [limit.id]: limit.enabled ? limit.value.toString() : "0"
                }), {})
            };

            await profileService.updateLimits(updatedLimits);
            await fetchLimits()
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
            <SafeAreaView style={{...styles.safeArea, backgroundColor: colors.background}}>
                <ThemedView variant="screen" style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary}/>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{...styles.safeArea, backgroundColor: colors.background}}>
            <ThemedHeader
                title="Account Limits"
                canGoBack={true}
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
            >
                <ThemedText variant="body" secondary style={styles.description}>
                    Set up trading limits to help prevent gambling patterns and protect your account.
                </ThemedText>

                <ThemedView variant="transparent" style={styles.limitsContainer}>
                    {limits.map((limit) => (
                        <ThemedView key={limit.id} variant="card" style={styles.limitCard} rounded border>
                            <View style={styles.limitHeader}>
                                <View style={styles.limitIcon}>
                                    {limit.icon}
                                </View>
                                <View style={styles.limitTitleContainer}>
                                    <ThemedText variant="bodyBold" style={styles.limitTitle}>{limit.title}</ThemedText>
                                    <ThemedText variant="caption" secondary
                                                style={styles.limitDescription}>{limit.description}</ThemedText>
                                </View>
                                <Switch
                                    value={limit.enabled}
                                    onValueChange={() => toggleLimit(limit.id)}
                                    trackColor={{false: colors.backgroundTertiary, true: colors.primary}}
                                    thumbColor={limit.enabled ? colors.buttonPrimaryText : colors.textSecondary}
                                    disabled={limit.isEditing}
                                />
                            </View>

                            <View style={styles.valueContainer}>
                                <ThemedText variant="label" secondary style={styles.valueLabel}>Current
                                    Limit:</ThemedText>
                                <ThemedView
                                    variant={limit.enabled ? "input" : "section"}
                                    style={styles.inputContainer}
                                    rounded="small"
                                >
                                    <TextInput
                                        style={[
                                            styles.input,
                                            {
                                                color: limit.enabled ? colors.text : colors.textTertiary,
                                                textAlign: 'right'
                                            }
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
                                        placeholderTextColor={colors.textTertiary}
                                        maxLength={10}
                                        editable={limit.enabled}
                                    />
                                    <ThemedText
                                        variant="body"
                                        color={limit.enabled ? colors.text : colors.textTertiary}
                                        style={styles.unitText}
                                    >
                                        {limit.unit}
                                    </ThemedText>
                                </ThemedView>
                            </View>

                            {limit.presets && (
                                <View style={styles.presetsContainer}>
                                    <ThemedText variant="label" secondary style={styles.presetsLabel}>Quick
                                        Select:</ThemedText>
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
                                                        {
                                                            backgroundColor: isSelected
                                                                ? colors.primary
                                                                : colors.backgroundSecondary,
                                                            opacity: limit.enabled ? 1 : 0.5
                                                        }
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
                                                    <ThemedText
                                                        variant="caption"
                                                        color={isSelected ? colors.buttonPrimaryText : colors.text}
                                                    >
                                                        {limit.formatValue?.(preset)} {limit.unit}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            )}
                        </ThemedView>
                    ))}
                </ThemedView>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        {backgroundColor: colors.primary},
                        isSaving && {opacity: 0.7}
                    ]}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color={colors.buttonPrimaryText} size="small"/>
                    ) : (
                        <ThemedText variant="button" color={colors.buttonPrimaryText}>Save Changes</ThemedText>
                    )}
                </TouchableOpacity>
            </View>

            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    description: {
        marginBottom: 24,
        lineHeight: 20,
    },
    limitsContainer: {
        gap: 16,
    },
    limitCard: {
        padding: 16,
        marginBottom: 16,
    },
    limitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    limitIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    limitTitleContainer: {
        flex: 1,
        marginRight: 16,
    },
    limitTitle: {
        marginBottom: 4,
    },
    limitDescription: {
        lineHeight: 18,
    },
    valueContainer: {
        marginBottom: 16,
    },
    valueLabel: {
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingHorizontal: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
    },
    unitText: {
        marginLeft: 8,
    },
    presetsContainer: {
        marginTop: 8,
    },
    presetsLabel: {
        marginBottom: 8,
    },
    presetsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    presetButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,

    },
    saveButton: {
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 