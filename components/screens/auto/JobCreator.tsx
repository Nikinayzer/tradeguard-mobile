import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated,} from 'react-native';
import {DollarSign, Percent, ArrowDown, ArrowUp, ArrowLeftRight, Clock} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setJobType, setJobParams} from '@/services/redux/slices/jobStateSlice'; // Redux actions
import {RootState} from '@/services/redux/store';
import {JobStrategy, DCAJobParams, LIQJobParams, JobParams, JobSide} from '@/services/api/auto';
import {CoinSelector} from '@/components';
import {SliderInput} from '@/components/common/SliderInput';
import {Tooltip} from '@/components/common/Tooltip';
import {TimerPickerModal} from "react-native-timer-picker";

interface SliderLabelProps {
    label: string;
    icon?: React.ReactNode;
    tooltip?: string;
}

function SliderLabel({label, icon, tooltip}: SliderLabelProps) {
    return (
        <View style={styles.inputLabelRow}>
            <View style={styles.labelContainer}>
                {icon &&
                    <View style={styles.inputIcon}>{React.cloneElement(icon as React.ReactElement, {size: 20})}</View>}
                <Text style={styles.inputLabel}>{label}</Text>
            </View>
            {tooltip && <Tooltip content={tooltip} position="right" size={36}/>}
        </View>
    );
}

interface SideSwitchProps {
    jobType: JobStrategy;
    currentSide: JobSide;
    onSideChange: (side: JobSide) => void;
}

function SideSwitch({jobType, currentSide, onSideChange}: SideSwitchProps) {
    const isDCA = jobType === 'DCA';

    const getSideTip = (side: JobSide) => {
        switch (side) {
            case 'BUY':
                return "Purchase assets when conditions are met";
            case 'SELL':
                return "Sell assets when conditions are met";
            case 'BOTH':
                return "Both buy and sell assets based on conditions";
        }
    };

    if (!isDCA) return null;

    return (
        <View style={styles.sideContainer}>
            <SliderLabel
                label="Trade Direction"
                tooltip="Direction of trades to execute"
                icon={<DollarSign size={16} color="#3B82F6"/>}
            />
            <View style={styles.sideSelector}>
                <TouchableOpacity
                    style={[
                        styles.sideOption,
                        currentSide === 'BUY' && styles.sideOptionActive,
                    ]}
                    onPress={() => onSideChange('BUY')}
                >
                    <View style={styles.sideIconContainer}>
                        <ArrowDown
                            size={16}
                            color={currentSide === 'BUY' ? '#FFFFFF' : '#748CAB'}
                        />
                    </View>
                    <Text style={[
                        styles.sideText,
                        currentSide === 'BUY' && styles.sideTextActive,
                    ]}>
                        BUY
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.sideOption,
                        currentSide === 'SELL' && styles.sideOptionActive,
                    ]}
                    onPress={() => onSideChange('SELL')}
                >
                    <View style={styles.sideIconContainer}>
                        <ArrowUp
                            size={16}
                            color={currentSide === 'SELL' ? '#FFFFFF' : '#748CAB'}
                        />
                    </View>
                    <Text style={[
                        styles.sideText,
                        currentSide === 'SELL' && styles.sideTextActive,
                    ]}>
                        SELL
                    </Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.sideTip}>
                {getSideTip(currentSide)}
            </Text>
        </View>
    );
}

export function JobCreator() {
    const dispatch = useDispatch();
    const {jobType, jobParams} = useSelector((state: RootState) => state.job);

    const isDCA = jobType === 'DCA';
    const [isForce, setForce] = useState(false);

    const dcaParams = jobParams as DCAJobParams;
    const liqParams = jobParams as LIQJobParams;

    const [tabPosition] = useState(new Animated.Value(isDCA ? 0 : 1));

    const [showTimePicker, setShowTimePicker] = useState(false);

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

    const formatTimeFromMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
    const handleJobTypeChange = (type: JobStrategy) => {
        dispatch(setJobType(type));
    };

    const handleUpdateParams = (key: keyof JobParams, value: any) => {
        const updatedJobParams = {...jobParams, [key]: value};
        dispatch(setJobParams(updatedJobParams));
    };

    const handleSideChange = (side: JobSide) => {
        handleUpdateParams('side', side);
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
                    onPress={() => handleJobTypeChange('DCA')}
                >
                    <Animated.Text style={[styles.tabText, {color: leftTextColor}]}>
                        Dollar Cost Average
                    </Animated.Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabButton}
                    onPress={() => handleJobTypeChange('LIQ')}
                >
                    <Animated.Text style={[styles.tabText, {color: rightTextColor}]}>
                        Liquidation Protection
                    </Animated.Text>
                </TouchableOpacity>
            </View>

            <View style={styles.contentContainer}>
                {/* Strategy Description */}
                <View style={styles.strategyDescription}>
                    <DollarSign size={18} color="#3B82F6" style={{marginRight: 8}}/>
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
                                onChange={(value) => handleUpdateParams('amount', value)}
                                min={10}
                                max={10000}
                                step={10}
                                unit=" USDT"
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
                                value={liqParams.amount}
                                onChange={(value) => handleUpdateParams('amount', value)}
                                min={1}
                                max={100}
                                step={1}
                                unit="%"
                            />
                        </>
                    )}
                    <SideSwitch
                        jobType={jobType}
                        currentSide={jobParams.side}
                        onSideChange={handleSideChange}
                    />
                    <SliderLabel
                        label="Total Steps"
                        icon={<ArrowDown size={16} color="#3B82F6"/>}
                        tooltip="Number of separate sell operations"
                    />
                    <SliderInput
                        value={liqParams.totalSteps}
                        onChange={(value) => handleUpdateParams('totalSteps', value)}
                        min={2}
                        max={50}
                        step={1}
                    />
                    {/* Time Display Field */}
                    <View style={styles.timeDisplayContainer}>
                        <SliderLabel
                            label="Duration"
                            icon={<Clock size={16} color="#3B82F6"/>}
                            tooltip="How long this job will run"
                        />
                        <TouchableOpacity style={styles.timeDisplay} onPress={() => {
                            setShowTimePicker(true)
                        }}>
                            <Text style={styles.timeDisplayText}>
                                {formatTimeFromMinutes(jobParams.durationMinutes)}
                            </Text>
                        </TouchableOpacity>
                        <TimerPickerModal
                            visible={showTimePicker}
                            setIsVisible={setShowTimePicker}
                            onConfirm={(pickedDuration) => {
                                const value = pickedDuration.hours * 60 + pickedDuration.minutes;
                                handleUpdateParams('durationMinutes', value);
                                setShowTimePicker(false);
                            }}
                            modalTitle="Strategy Duration"
                            onCancel={() => setShowTimePicker(false)}
                            closeOnOverlayPress
                            hourLabel="h"
                            minuteLabel="m"
                            hideSeconds={true}
                            maximumHours={24}
                            styles={{
                                theme: "dark",
                                backgroundColor: '#1B263B',
                                pickerItem: {
                                    color: '#E2E8F0',
                                    fontSize: 24,
                                },
                                pickerLabel: {
                                    color: '#748CAB',
                                    fontSize: 16,
                                },
                            }}
                        />
                    </View>


                    <Toggle
                        label="Force Entry"
                        value={isForce}
                        onChange={(value: boolean) => {
                            setForce(value);
                            handleUpdateParams('discountPct', value ? 0 : jobParams.discountPct);
                        }}
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
                        value={jobParams.discountPct}
                        onChange={(value) => handleUpdateParams('discountPct', value)}
                        min={0}
                        max={10}
                        step={0.1}
                        unit="%"
                        disabled={isForce}
                    />
                </View>

                <CoinSelector/>
            </View>
        </View>
    );
}

interface ToggleProps {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
    tooltip?: string;
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
                {tooltip && <Tooltip content={tooltip} position="left" size={32}/>}
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
    // Side selector styles
    sideContainer: {
        marginBottom: 16,
    },
    sideSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 8,
    },
    sideOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    sideOptionActive: {
        backgroundColor: '#3B82F6',
    },
    sideIconContainer: {
        marginRight: 4,
    },
    sideText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#748CAB',
    },
    sideTextActive: {
        color: 'white',
        fontWeight: '600',
    },
    sideTip: {
        fontSize: 12,
        color: '#748CAB',
        textAlign: 'center',
        marginTop: 4,
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
    timeDisplayContainer: {
        marginBottom: 16,
        marginTop: 8,
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 8,
        padding: 12,
        marginTop: 8,
    },
    timeDisplayText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    timeDisplayIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});