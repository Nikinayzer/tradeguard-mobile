import React, {useState, useEffect, useContext} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Pressable,
    ScrollView,
    Animated,
    Image
} from 'react-native';
import {DollarSign, Percent, Info, AlertCircle, ArrowDown, Plus, Minus, SlidersHorizontal, X, ChevronRight} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import {JobStrategy, DCAJobParams, LIQJobParams, JobParams} from '@/services/api/auto';
import {CoinSelector} from '@/components';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SliderInput } from '@/components/common/SliderInput';
import { TooltipContext } from '@/screens/auto/AutomatedTradeScreen';
import { Tooltip } from '@/components/common/Tooltip';

interface Coin {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

interface JobCreatorProps {
    jobType: JobStrategy;
    onJobTypeChange: (type: JobStrategy) => void;
    onUpdateParams: (params: JobParams) => void;
    params: JobParams;
    selectedCoins: Coin[];
    onSelectCoin: (coin: Coin) => void;
}

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    icon?: React.ReactNode;
    tooltip?: string;
    disabled?: boolean;
}

interface ToggleProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    tooltip?: string;
}

interface SliderLabelProps {
    label: string;
    icon?: React.ReactNode;
    tooltip?: string;
}

function SliderLabel({ label, icon, tooltip }: SliderLabelProps) {
    return (
            <View style={styles.inputLabelRow}>
                <View style={styles.labelContainer}>
                {icon && <View style={styles.inputIcon}>{React.cloneElement(icon as React.ReactElement, { size: 20 })}</View>}
                    <Text style={styles.inputLabel}>{label}</Text>
            </View>
            {tooltip && <Tooltip content={tooltip} position="right" size={36} />}
        </View>
    );
}

export function JobCreator({
                               jobType,
                               onJobTypeChange,
                               params,
                               onUpdateParams,
                               selectedCoins,
                               onSelectCoin
                           }: JobCreatorProps) {
    const {activeTooltipId, setActiveTooltipId} = useContext(TooltipContext);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();

    const handleUpdateParams = (newParams: Record<string, any>) => {
        onUpdateParams({...params, ...newParams} as JobParams);
    };

    const isDCA = jobType === 'DCA';
    const dcaParams = params as DCAJobParams;
    const liqParams = params as LIQJobParams;

    const [tabPosition] = useState(new Animated.Value(isDCA ? 0 : 1));

    useEffect(() => {
        Animated.timing(tabPosition, {
            toValue: isDCA ? 0 : 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isDCA, tabPosition]);

    const leftTextColor = tabPosition.interpolate({
        inputRange: [0, 1],
        outputRange: ['white', '#748CAB']
    });

    const rightTextColor = tabPosition.interpolate({
        inputRange: [0, 1],
        outputRange: ['#748CAB', 'white']
    });

    const handleOpenCoinSelector = () => {
        navigation.navigate('CoinSelector', {
            selectedCoins,
            mode: jobType,
            onCoinsSelected: (coins: Coin[]) => {
                // Update selected coins in the parent component
                coins.forEach(coin => onSelectCoin(coin));
            },
        });
    };

    const handleRemoveCoin = (coin: Coin) => {
        onSelectCoin(coin);
    };

    return (
        <View style={styles.container}>
                {/* Type Selector Header */}
                <View style={styles.typeSelector}>
                    <Animated.View style={[styles.tabSelector, {
                        left: tabPosition.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '50%']
                        }),
                    }]}/>

                    <TouchableOpacity
                        style={styles.tabButton}
                        onPress={() => onJobTypeChange('DCA')}
                    >
                        <Animated.Text style={[styles.tabText, {color: leftTextColor}]}>
                            Dollar Cost Average
                        </Animated.Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.tabButton}
                        onPress={() => onJobTypeChange('LIQ')}
                    >
                        <Animated.Text style={[styles.tabText, {color: rightTextColor}]}>
                            Liquidation Protection
                        </Animated.Text>
                    </TouchableOpacity>
                </View>

            <View
                    style={styles.contentContainer}
                    onStartShouldSetResponder={() => {
                        setActiveTooltipId(null);
                        return false;
                    }}
                >
                    {/* Strategy Description */}
                    <View style={styles.strategyDescription}>
                        <SlidersHorizontal size={18} color="#3B82F6" style={{marginRight: 8}}/>
                        <Text style={styles.descriptionText}>
                            {isDCA
                                ? "Split your investment into smaller portions over time to reduce the impact of volatility"
                                : "Protect your assets from market downturns by selling in smaller portions"
                            }
                        </Text>
                    </View>

                    {/* Core Parameters */}
                    <View style={styles.parameterSection}>
                        <Text style={styles.sectionTitle}>Parameters</Text>

                        {isDCA ? (
                            <>
                            <SliderLabel
                                    label="Total Amount"
                                icon={<DollarSign size={16} color="#3B82F6"/>}
                                tooltip="Total funds to use for this strategy"
                            />
                            <SliderInput
                                    value={dcaParams.amount}
                                onChange={(value) => handleUpdateParams({amount: value})}
                                    min={10}
                                    max={10000}
                                    step={10}
                                    unit=" USDT"
                                disabled={false}
                                />

                            <SliderLabel
                                    label="Total Steps"
                                icon={<ArrowDown size={16} color="#3B82F6"/>}
                                tooltip="Number of separate buy operations"
                            />
                            <SliderInput
                                    value={dcaParams.totalSteps}
                                onChange={(value) => handleUpdateParams({totalSteps: value})}
                                    min={2}
                                    max={50}
                                    step={1}
                                disabled={false}
                                />
                            </>
                        ) : (
                            <>
                            <SliderLabel
                                    label="Proportion"
                                icon={<Percent size={16} color="#3B82F6"/>}
                                tooltip="Percentage of your portfolio to include in this strategy"
                            />
                            <SliderInput
                                    value={liqParams.proportionPct}
                                onChange={(value) => handleUpdateParams({proportionPct: value})}
                                    min={1}
                                    max={100}
                                    step={1}
                                    unit="%"
                                disabled={false}
                                />

                            <SliderLabel
                                    label="Total Steps"
                                icon={<ArrowDown size={16} color="#3B82F6"/>}
                                tooltip="Number of separate sell operations"
                            />
                            <SliderInput
                                    value={liqParams.totalSteps}
                                onChange={(value) => handleUpdateParams({totalSteps: value})}
                                    min={2}
                                    max={50}
                                    step={1}
                                disabled={false}
                                />
                            </>
                        )}

                    <SliderLabel
                            label="Randomness"
                        icon={<AlertCircle size={16} color="#3B82F6"/>}
                        tooltip="Random variance applied to execution times to avoid pattern detection"
                    />
                    <SliderInput
                            value={params.randomnessPct}
                        onChange={(value) => handleUpdateParams({randomnessPct: value})}
                            min={0}
                            max={5}
                            step={0.1}
                            unit="%"
                        disabled={false}
                        />

                        <Toggle
                            label="Force Entry"
                            value={params.force}
                            onChange={(value) => handleUpdateParams({force: value})}
                            tooltip={isDCA
                                ? "Ensures trades execute even if price isn't discounted"
                                : "Execute trades immediately without waiting for market conditions"
                            }
                        />

                    <SliderLabel
                            label="Discount Percentage"
                        icon={<Percent size={16} color="#3B82F6"/>}
                        tooltip="Price discount target for each transaction"
                    />
                    <SliderInput
                            value={params.discountPct}
                        onChange={(value) => handleUpdateParams({discountPct: value})}
                            min={0}
                            max={10}
                            step={0.1}
                            unit="%"
                            disabled={params.force}
                        />
                    </View>

                {/* Selected Coins Section */}
                <View style={styles.selectedCoinsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Selected Coins</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={handleOpenCoinSelector}
                        >
                            <Plus size={20} color="#3B82F6" />
                            <Text style={styles.addButtonText}>Add Coins</Text>
                        </TouchableOpacity>
                    </View>

                    {selectedCoins.length > 0 ? (
                        <ScrollView 
                            style={styles.selectedCoinsList}
                            showsVerticalScrollIndicator={false}
                        >
                            {selectedCoins.map((coin) => (
                                <TouchableOpacity
                                    key={coin.symbol}
                                    style={styles.selectedCoinItem}
                                    onPress={() => handleRemoveCoin(coin)}
                                >
                                    <View style={styles.coinInfo}>
                                        <Image source={{ uri: coin.icon }} style={styles.coinIcon} />
                                        <View style={styles.coinTexts}>
                                            <Text style={styles.coinName}>{coin.name}</Text>
                                            <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                                        </View>
                                    </View>
                                    <X size={20} color="#748CAB" />
                                </TouchableOpacity>
                            ))}
                </ScrollView>
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>
                                Tap the button above to select coins
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

function Toggle({label, value, onChange, tooltip}: ToggleProps) {
    return (
        <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
        >
            <View style={styles.toggleLabelContainer}>
                <Text style={styles.toggleLabel}>{label}</Text>
                {tooltip && <Tooltip content={tooltip} position="left" size={32} />}
            </View>

            <View
                style={[styles.toggleButton, value ? styles.toggleActive : styles.toggleInactive]}
            >
                <View style={[styles.toggleHandle, value ? styles.toggleHandleActive : styles.toggleHandleInactive]}/>
            </View>
            </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B263B',
        borderRadius: 12,
        overflow: 'hidden',
    },
    typeSelector: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: '#0D1B2A',
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    tabSelector: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        backgroundColor: '#3B82F6',
        zIndex: 0,
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 15,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    strategyDescription: {
        flexDirection: 'row',
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    descriptionText: {
        color: '#E2E8F0',
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    parameterSection: {
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#E2E8F0',
        marginBottom: 24,
    },
    selectedCoinsSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    addButtonText: {
        color: '#3B82F6',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 6,
    },
    selectedCoinsList: {
        maxHeight: 200,
    },
    selectedCoinItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    coinInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    coinIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    coinTexts: {
        flex: 1,
    },
    coinName: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginBottom: 2,
    },
    coinSymbol: {
        fontSize: 12,
        color: '#748CAB',
    },
    emptyState: {
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        height: 100,
    },
    emptyStateText: {
        color: '#748CAB',
        fontSize: 14,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        marginRight: 12,
    },
    inputLabel: {
        fontSize: 18,
        color: '#E2E8F0',
        fontWeight: '600',
    },
    numberControlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    numberButton: {
        backgroundColor: 'rgba(27, 38, 59, 0.8)',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    numberButtonDisabled: {
        backgroundColor: 'rgba(27, 38, 59, 0.4)',
    },
    valueDisplay: {
        flex: 1,
        backgroundColor: 'rgba(27, 38, 59, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    valueDisplayDisabled: {
        backgroundColor: 'rgba(27, 38, 59, 0.3)',
    },
    valueText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    valueTextDisabled: {
        color: '#748CAB',
    },
    slider: {
        height: 40,
        width: '100%',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    toggleLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleLabel: {
        fontSize: 18,
        color: '#E2E8F0',
        fontWeight: '600',
        marginRight: 12,
    },
    toggleButton: {
        width: 50,
        height: 26,
        borderRadius: 13,
        padding: 3,
    },
    toggleActive: {
        backgroundColor: '#3B82F6',
    },
    toggleInactive: {
        backgroundColor: '#1B263B',
    },
    toggleHandle: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    toggleHandleActive: {
        backgroundColor: 'white',
        alignSelf: 'flex-end',
    },
    toggleHandleInactive: {
        backgroundColor: '#748CAB',
        alignSelf: 'flex-start',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 12,
    },
    modalInput: {
        backgroundColor: '#0D1B2A',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: 'white',
        fontSize: 18,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 8,
        backgroundColor: '#0D1B2A',
    },
    cancelButtonText: {
        color: '#748CAB',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        marginLeft: 8,
        backgroundColor: '#3B82F6',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 