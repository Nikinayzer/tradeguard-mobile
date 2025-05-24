import React, {useState, useEffect} from 'react';
import {View, StyleSheet, TouchableOpacity,Animated } from 'react-native';
import {
    DollarSign, 
    Percent, 
    ArrowDown, 
    ArrowUp, 
    Clock, 
    Info, 
    ArrowLeftRight, 
    AlertOctagon
} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import {setJobType, setJobParams} from '@/services/redux/slices/jobStateSlice';
import {RootState} from '@/services/redux/store';
import {JobStrategy, DCAJobParams, LIQJobParams, JobParams, JobSide} from '@/services/api/auto';
import {CoinSelector} from '@/components';
import {SliderInput} from '@/components/common/SliderInput';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedView} from '@/components/ui/ThemedView';

interface InputLabelProps {
    label: string;
    icon?: React.ReactNode;
    tooltip?: string;
}

function InputLabel({label, icon, tooltip}: InputLabelProps) {
    const { colors } = useTheme();
    
    return (
        <View style={styles.labelContainer}>
            {icon &&
                <View style={styles.inputIcon}>
                    {React.cloneElement(icon as React.ReactElement, {size: 20})}
                </View>
            }
            <ThemedText style={styles.inputLabel}>{label}</ThemedText>
            {tooltip && (
                <TouchableOpacity style={styles.tooltipIcon}>
                    <Info size={14} color={colors.textTertiary} />
                </TouchableOpacity>
            )}
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
    const { colors } = useTheme();

    const isDisabled = (side: JobSide) => {
        return false;
    };
    
    return ( isDCA &&
        <View style={styles.sideContainer}>
            <View style={styles.inputLabelRow}>
                <InputLabel 
                    label="Trade Direction"
                    icon={<ArrowLeftRight size={20} color={isDCA ? colors.primary : colors.secondary} />}
                />
                <View style={styles.sideChipsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.sideChip,
                            { 
                                backgroundColor: currentSide === 'BUY' ? colors.primary : colors.backgroundSecondary,
                                borderColor: currentSide === 'BUY' ? colors.primary : colors.cardBorder 
                            },
                            isDisabled('BUY') && styles.sideChipDisabled,
                        ]}
                        onPress={() => !isDisabled('BUY') && onSideChange('BUY')}
                        disabled={isDisabled('BUY')}
                    >
                        <ArrowDown 
                            size={14} 
                            color={currentSide === 'BUY' ? colors.buttonPrimaryText : colors.textTertiary} 
                        />
                        <ThemedText 
                            style={{
                                ...styles.sideChipText,
                                color: currentSide === 'BUY' ? colors.buttonPrimaryText : colors.textTertiary
                            }}
                        >
                            BUY
                        </ThemedText>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[
                            styles.sideChip,
                            { 
                                backgroundColor: currentSide === 'SELL' ? colors.primary : colors.backgroundSecondary,
                                borderColor: currentSide === 'SELL' ? colors.primary : colors.cardBorder
                            },
                            isDisabled('SELL') && styles.sideChipDisabled,
                        ]}
                        onPress={() => !isDisabled('SELL') && onSideChange('SELL')}
                        disabled={isDisabled('SELL')}
                    >
                        <ArrowUp 
                            size={14} 
                            color={currentSide === 'SELL' ? colors.buttonPrimaryText : colors.textTertiary} 
                        />
                        <ThemedText 
                            style={{
                                ...styles.sideChipText,
                                color: currentSide === 'SELL' ? colors.buttonPrimaryText : colors.textTertiary
                            }}
                        >
                            SELL
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

interface DurationInputProps {
    value: number;
    onChange: (value: number) => void;
    primaryColor: string;
}

function DurationInput({value, onChange, primaryColor}: DurationInputProps) {
    const { colors } = useTheme();
    
    const formatTimeFromMinutes = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <View style={styles.durationContainer}>
            <View style={styles.inputLabelRow}>
                <InputLabel 
                    label="Duration" 
                    icon={<Clock size={20} color={primaryColor} />}
                    tooltip="Trading duration"
                />
                <TouchableOpacity
                    style={[
                        styles.valueDisplay, 
                        {
                            backgroundColor: colors.backgroundSecondary,
                            borderColor: colors.primary + '33'
                        }
                    ]}
                    onPress={() => {}}
                    activeOpacity={0.7}
                >
                    <ThemedText style={styles.valueText}>
                        {formatTimeFromMinutes(value)}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export function JobCreator() {
    const dispatch = useDispatch();
    const {jobType, jobParams} = useSelector((state: RootState) => state.job);
    const { colors } = useTheme();

    const isDCA = jobType === 'DCA';
    const [isForce, setForce] = useState(false);

    const dcaParams = jobParams as DCAJobParams;
    const liqParams = jobParams as LIQJobParams;

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
        outputRange: [colors.buttonPrimaryText, colors.textTertiary]
    });

    const rightTextColor = tabPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.textTertiary, colors.buttonPrimaryText]
    });

    const handleJobTypeChange = (type: JobStrategy) => {
        dispatch(setJobType(type));
    };
    
    const handleUpdateParams = (key: keyof JobParams, value: JobParams[keyof JobParams]) => {
        const updatedJobParams = {...jobParams, [key]: value};
        
        // Floor numeric values to 3 decimal places
        if (key === 'amount' || key === 'discountPct') {
            const numericValue = Number(value);
            if (!isNaN(numericValue)) {
                (updatedJobParams[key] as number) = Math.floor(numericValue * 1000) / 1000;
            }
        }
        
        if (key === 'discountPct' && isForce) {
            updatedJobParams.discountPct = 0;
        }
        dispatch(setJobParams(updatedJobParams));
    };

    const handleSideChange = (side: JobSide) => {
        handleUpdateParams('side', side);
    };

    const handleForceChange = (value: boolean) => {
        setForce(value);
        if (value) {
            handleUpdateParams('discountPct', 0);
        }
    };

    return (
        <ThemedView style={styles.container} variant="transparent" padding="medium">
            {/* Strategy Selector */}
            <View style={styles.headerSection}>
                <ThemedView 
                    variant="card" 
                    style={styles.tabContainer}
                    border
                    rounded="medium"
                >
                    <Animated.View 
                        style={[
                            styles.tabIndicator, 
                            { 
                                backgroundColor: colors.primary,
                                borderColor: `${colors.primary}40`,
                                borderWidth: 1,
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 5,
                                elevation: 4,
                            }, 
                            {
                                left: tabPosition.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '50%']
                                })
                            }
                        ]}
                    />
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleJobTypeChange('DCA')}
                    >
                        <Animated.View style={[styles.tabContent, {opacity: isDCA ? 1 : 0.7}]}>
                            <ArrowDown 
                                size={16} 
                                color={isDCA ? colors.buttonPrimaryText : colors.textTertiary}
                                style={styles.tabIcon}
                            />
                            <Animated.Text style={[
                                styles.tabText, 
                                {color: leftTextColor},
                                isDCA && styles.tabTextActive
                            ]}>
                                DCA
                            </Animated.Text>
                        </Animated.View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => handleJobTypeChange('LIQ')}
                    >
                        <Animated.View style={[styles.tabContent, {opacity: !isDCA ? 1 : 0.7}]}>
                            <ArrowUp 
                                size={16} 
                                color={!isDCA ? colors.buttonPrimaryText : colors.textTertiary}
                                style={styles.tabIcon}
                            />
                            <Animated.Text style={[
                                styles.tabText, 
                                {color: rightTextColor},
                                !isDCA && styles.tabTextActive
                            ]}>
                                LIQ
                            </Animated.Text>
                        </Animated.View>
                    </TouchableOpacity>
                </ThemedView>
            </View>

            {/* Parameters Section */}
            <ThemedView
                variant="card"
                style={styles.paramSection}
                border
                rounded="large"
                padding="large"
            >
                {/*<ThemedTitle variant="small" mb={20}>Parameters</ThemedTitle>*/}

                {/* Side Selector Component */}
                <SideSwitch 
                    jobType={jobType} 
                    currentSide={jobParams.side} 
                    onSideChange={handleSideChange} 
                />

                {isDCA ? (
                    <>
                        <SliderInput
                            label="Total Amount"
                            icon={<DollarSign size={20} color={colors.primary}/>}
                            value={dcaParams.amount}
                            onChange={(value) => handleUpdateParams('amount', value)}
                            min={10}
                            max={10000}
                            step={10}
                            unit=" USDT"
                        />

                        <SliderInput
                            label="Total Steps"
                            icon={<ArrowDown size={20} color={colors.primary}/>}
                            value={dcaParams.totalSteps}
                            onChange={(value) => handleUpdateParams('totalSteps', value)}
                            min={2}
                            max={50}
                            step={1}
                        />
                        
                        {/* Duration Input Field */}
                        <DurationInput
                            value={jobParams.durationMinutes}
                            onChange={(value) => handleUpdateParams('durationMinutes', value)}
                            primaryColor={colors.primary}
                        />
                    </>
                ) : (
                    <>
                        <SliderInput
                            label="Proportion"
                            icon={<Percent size={20} color={colors.secondary}/>}
                            value={liqParams.amount}
                            onChange={(value) => handleUpdateParams('amount', value)}
                            min={1}
                            max={100}
                            step={1}
                            unit="%"
                        />

                        <SliderInput
                            label="Total Steps"
                            icon={<ArrowDown size={20} color={colors.secondary}/>}
                            value={liqParams.totalSteps}
                            onChange={(value) => handleUpdateParams('totalSteps', value)}
                            min={2}
                            max={50}
                            step={1}
                        />
                        
                        {/* Duration Input Field */}
                        <DurationInput
                            value={jobParams.durationMinutes}
                            onChange={(value) => handleUpdateParams('durationMinutes', value)}
                            primaryColor={colors.secondary}
                        />
                    </>
                )}

                {/* Force Entry Toggle with proper label */}
                <View style={styles.toggleOuterContainer}>
                    <View style={styles.inputLabelRow}>
                        <InputLabel
                            label="Force Entry"
                            icon={<AlertOctagon size={20} color={isDCA ? colors.primary : colors.secondary}/>}
                            tooltip="Force immediate trading"
                        />
                        <Toggle
                            value={isForce}
                            onChange={handleForceChange}
                        />
                    </View>
                </View>

                <SliderInput
                    label="Discount Percentage"
                    icon={<Percent size={20} color={isDCA ? colors.primary : colors.secondary}/>}
                    value={isForce ? 0 : jobParams.discountPct}
                    onChange={(value) => handleUpdateParams('discountPct', value)}
                    min={0}
                    max={10}
                    step={0.1}
                    unit="%"
                    disabled={isForce}
                />
            </ThemedView>

            <CoinSelector/>
        </ThemedView>
    );
}

//todo custom toggle
interface ToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

function Toggle({value, onChange}: ToggleProps) {
    const { colors } = useTheme();
    
    return (
        <TouchableOpacity
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            style={styles.toggleButtonContainer}
        >
            <View
                style={[
                    styles.toggleButton, 
                    { 
                        backgroundColor: value ? 
                            colors.primary : 
                            colors.backgroundTertiary 
                    }
                ]}
            >
                <View style={[
                    styles.toggleHandle, 
                    { backgroundColor: colors.buttonPrimaryText },
                    value ? styles.toggleHandleActive : styles.toggleHandleInactive
                ]}/>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        marginBottom: 10,
    },
    tabContainer: {
        height: 46,
        flexDirection: 'row',
        position: 'relative',
    },
    tabIndicator: {
        position: 'absolute',
        width: '50%',
        height: '100%',
        borderRadius: 12,
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        paddingVertical: 10,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIcon: {
        marginRight: 6,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    tabTextActive: {
        fontWeight: '700',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    paramSection: {
    },
    sideContainer: {
        marginBottom: 20,
    },
    sideHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    sideChipsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    sideChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginLeft: 8,
        borderWidth: 1,
    },
    sideChipDisabled: {
        opacity: 0.5,
    },
    sideChipText: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 5,
    },
    inputLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    inputIcon: {
        marginRight: 12,
    },
    tooltipIcon: {
        marginLeft: 8,
    },
    durationContainer: {
        marginBottom: 20,
    },
    valueDisplay: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 16,
        fontWeight: '500',
    },
    toggleOuterContainer: {
        marginBottom: 20,
    },
    toggleButtonContainer: {
    },
    toggleButton: {
        width: 44,
        height: 26,
        borderRadius: 13,
        padding: 2,
    },
    toggleHandle: {
        width: 22,
        height: 22,
        borderRadius: 11,
    },
    toggleHandleActive: {
        transform: [{translateX: 18}],
    },
    toggleHandleInactive: {
        transform: [{translateX: 0}],
    },
}); 