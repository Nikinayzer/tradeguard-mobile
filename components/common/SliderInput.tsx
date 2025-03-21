import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Modal,
    Pressable,
} from 'react-native';
import { Plus, Minus } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

interface SliderInputProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    disabled?: boolean;
}

export function SliderInput({
    value,
    onChange,
    min,
    max,
    step,
    unit = '',
    disabled = false,
}: SliderInputProps) {
    // Modal state
    const [isEditing, setIsEditing] = useState(false);
    const [textInputValue, setTextInputValue] = useState(value.toString());
    
    // Sliding state
    const [slidingValue, setSlidingValue] = useState<number | null>(null);
    const [isSliding, setIsSliding] = useState(false);

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

    const handleIncrement = useCallback(() => {
        if (disabled) return;
        const newValue = Math.min(value + step, max);
        onChange(newValue);
    }, [value, step, max, disabled, onChange]);

    const handleDecrement = useCallback(() => {
        if (disabled) return;
        const newValue = Math.max(value - step, min);
        onChange(newValue);
    }, [value, step, min, disabled, onChange]);

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

    return (
        <View style={styles.container}>
            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.decrementButton,
                        disabled && styles.buttonDisabled
                    ]}
                    onPress={handleDecrement}
                    disabled={disabled}
                >
                    <Minus size={16} color={disabled ? "#748CAB" : "#FFFFFF"} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.valueDisplay, disabled && styles.valueDisplayDisabled]}
                    onPress={() => !disabled && setIsEditing(true)}
                >
                    <Text style={[styles.valueText, disabled && styles.valueTextDisabled]}>
                        {displayValue.toFixed(step < 1 ? 1 : 0)}{unit}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.button,
                        styles.incrementButton,
                        disabled && styles.buttonDisabled
                    ]}
                    onPress={handleIncrement}
                    disabled={disabled}
                >
                    <Plus size={16} color={disabled ? "#748CAB" : "#FFFFFF"} />
                </TouchableOpacity>
            </View>

            <View style={styles.sliderContainer}>
                <Text style={[styles.rangeLabel, disabled && styles.rangeLabelDisabled]}>
                    {min}
                </Text>
                <Slider
                    style={styles.slider}
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={value}
                    onSlidingStart={handleSlidingStart}
                    onValueChange={handleValueChange}
                    onSlidingComplete={handleSlidingComplete}
                    minimumTrackTintColor={disabled ? "#1B263B" : "#3B82F6"}
                    maximumTrackTintColor="#1B263B"
                    thumbTintColor={disabled ? "#748CAB" : "#3B82F6"}
                    disabled={disabled}
                    tapToSeek={true}
                />
                <Text style={[styles.rangeLabel, disabled && styles.rangeLabelDisabled]}>
                    {max}
                </Text>
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
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Value</Text>
                        <TextInput
                            style={styles.modalInput}
                            keyboardType="numeric"
                            value={textInputValue}
                            onChangeText={setTextInputValue}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={handleCancel}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.submitButton]}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitButtonText}>Confirm</Text>
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
        marginBottom: 8,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    button: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
    },
    decrementButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    incrementButton: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    buttonDisabled: {
        backgroundColor: 'rgba(27, 38, 59, 0.4)',
    },
    valueDisplay: {
        flex: 0.8,
        backgroundColor: 'rgba(27, 38, 59, 0.5)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    valueDisplayDisabled: {
        backgroundColor: 'rgba(27, 38, 59, 0.3)',
    },
    valueText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    valueTextDisabled: {
        color: '#748CAB',
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 12,
    },
    slider: {
        flex: 1,
        height: 50,
        marginHorizontal: 12,
        transform: [
            { scaleX: 1.2 },
            { scaleY: 1.2 }
        ],
    },
    rangeLabel: {
        fontSize: 12,
        color: '#748CAB',
        minWidth: 32,
        textAlign: 'center',
    },
    rangeLabelDisabled: {
        color: '#4A5568',
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