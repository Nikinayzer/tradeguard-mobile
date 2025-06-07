import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Pressable,
    Animated,
} from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/contexts/ThemeContext';
import tinycolor from 'tinycolor2';

interface SliderInputProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    disabled?: boolean;
    label?: string;
    icon?: React.ReactNode;
}

export function SliderInput({
    value,
    onChange,
    min,
    max,
    step,
    unit = '',
    disabled = false,
    label,
    icon,
}: SliderInputProps) {
    const { colors } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [textInputValue, setTextInputValue] = useState(value.toString());
    const [slidingValue, setSlidingValue] = useState<number | null>(null);
    const [isSliding, setIsSliding] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    useEffect(() => {
        setTextInputValue(value.toString());
    }, [value]);


    const handleSlidingStart = useCallback((initialValue: number) => {
        setIsSliding(true);
        setSlidingValue(initialValue);
    }, []);

    const handleValueChange = useCallback((newValue: number) => {
        if (isSliding) {
            setSlidingValue(newValue);
        }
    }, [isSliding]);

    const handleSlidingComplete = useCallback((finalValue: number) => {
        setIsSliding(false);
        setSlidingValue(null);
        onChange(finalValue);
    }, [onChange]);

    const handleSubmit = useCallback(() => {
        if (disabled) return;
        const parsed = parseFloat(textInputValue);
        if (!isNaN(parsed) && parsed >= min && parsed <= max) {
            onChange(parsed);
        }
        setTextInputValue(value.toString());
        setIsEditing(false);
    }, [disabled, textInputValue, min, max, onChange, value]);

    const handleCancel = useCallback(() => {
        setTextInputValue(value.toString());
        setIsEditing(false);
    }, [value]);

    const displayValue = isSliding && slidingValue !== null ? slidingValue : value;

    const progressPercent = ((displayValue - min) / (max - min)) * 100;

    return (
        <View style={styles.container}>
            {/* Label and Value Row */}
            <View style={styles.labelValueRow}>
                {label && (
                    <View style={styles.labelContainer}>
                        {icon &&
                            <View style={styles.inputIcon}>{React.cloneElement(icon as React.ReactElement, {size: 20})}</View>}
                        <Text style={[styles.inputLabel, {color: colors.text}]}>{label}</Text>
                    </View>
                )}
                
                <TouchableOpacity
                    style={[
                        styles.valueDisplay, 
                        {
                            backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString(),
                        },
                        disabled && {
                            opacity: 0.7
                        }
                    ]}
                    onPress={() => !disabled && setIsEditing(true)}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.valueText, 
                        {color: disabled ? colors.buttonDisabledText : colors.text}
                    ]}>
                        {displayValue.toFixed(step < 1 ? 1 : 0)}{unit}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sliderContainer}>
                {/*todo migrate to awesome slider*/}
                <Slider
                    style={styles.slider}
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={value}
                    onSlidingStart={handleSlidingStart}
                    onValueChange={handleValueChange}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={`${colors.primary}80`}
                    thumbTintColor={disabled ? colors.buttonDisabled : colors.primary}
                    disabled={disabled}
                    tapToSeek={true}
                />
                <View style={styles.labelsContainer}>
                    <Text style={[
                        styles.rangeLabel, 
                        {color: disabled ? colors.buttonDisabledText : colors.textSecondary}
                    ]}>
                        {min}
                    </Text>
                    <Text style={[
                        styles.rangeLabel, 
                        {color: disabled ? colors.buttonDisabledText : colors.textSecondary}
                    ]}>
                        {max}
                    </Text>
                </View>
            </View>

            <Modal
                visible={isEditing}
                transparent
                animationType="fade"
                onRequestClose={handleCancel}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={handleCancel}
                >
                    <View style={[styles.modalContent, {
                        backgroundColor: colors.card,
                        borderColor: colors.cardBorder
                    }]}>
                        <Text style={[styles.modalTitle, {color: colors.text}]}>Enter Value</Text>
                        <TextInput
                            style={[styles.modalInput, {
                                backgroundColor: colors.backgroundSecondary,
                                borderColor: colors.inputBorder,
                                color: colors.text
                            }]}
                            keyboardType="numeric"
                            value={textInputValue}
                            onChangeText={setTextInputValue}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton, {
                                    backgroundColor: colors.buttonSecondary
                                }]}
                                onPress={handleCancel}
                            >
                                <Text style={[styles.cancelButtonText, {color: colors.buttonSecondaryText}]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton, {
                                    backgroundColor: colors.primary
                                }]}
                                onPress={handleSubmit}
                            >
                                <Text style={[styles.submitButtonText, {color: colors.buttonPrimaryText}]}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    labelValueRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    inputLabel: {
        fontSize: 18,
        fontWeight: '600',
    },
    valueDisplay: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        minWidth: 80,
    },
    valueText: {
        fontSize: 16,
        fontWeight: '600',
    },
    sliderContainer: {
        width: '100%',
        paddingVertical: 6,
    },
    sliderTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    sliderFill: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        borderRadius: 3,
    },
    slider: {
        width: '100%',
        height: 30,
        marginTop: -12,
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: -10,
    },
    rangeLabel: {
        fontSize: 12,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 16,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        marginRight: 8,
    },
    submitButton: {
        marginLeft: 8,
    },
    cancelButtonText: {
        fontWeight: '600',
    },
    submitButtonText: {
        fontWeight: '600',
    },
}); 