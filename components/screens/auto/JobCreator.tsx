import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Clock, DollarSign, Percent } from 'lucide-react-native';
import Slider from '@react-native-community/slider';

type JobType = 'dca' | 'liq';

interface JobCreatorProps {
    jobType: JobType;
    onJobTypeChange: (type: JobType) => void;
    onUpdateParams: (params: any) => void;
    params: any;
}

interface NumberInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    unit?: string;
    disabled?: boolean;
}

function NumberInput({ label, value, onChange, min, max, step, unit, disabled }: NumberInputProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [textValue, setTextValue] = useState(value.toString());

    const handleSliderChange = (newValue: number) => {
        if (!disabled) {
            setTextValue(newValue.toString());
            onChange(newValue);
        }
    };

    const handleSubmit = () => {
        if (!disabled) {
            const parsed = parseFloat(textValue);
            if (!isNaN(parsed) && parsed >= min && parsed <= max) {
                onChange(parsed);
            }
        }
        setIsEditing(false);
    };

    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.controlsContainer}>
                <Slider
                    style={styles.slider}
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={value}
                    onValueChange={handleSliderChange}
                    minimumTrackTintColor={disabled ? "#1B263B" : "#3B82F6"}
                    maximumTrackTintColor="#1B263B"
                    thumbTintColor={disabled ? "#748CAB" : "#3B82F6"}
                    disabled={disabled}
                    tapToSeek={true}
                />
                <TouchableOpacity 
                    style={[styles.valueButton, disabled && styles.valueButtonDisabled]}
                    onPress={() => !disabled && setIsEditing(true)}
                >
                    <Text style={[styles.valueText, disabled && styles.valueTextDisabled]}>
                        {value.toFixed(step < 1 ? 1 : 0)}{unit}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={isEditing}
                transparent
                animationType="fade"
                onRequestClose={() => setIsEditing(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setIsEditing(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <TextInput
                            style={styles.modalInput}
                            keyboardType="numeric"
                            value={textValue}
                            onChangeText={setTextValue}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsEditing(false)}
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

export function JobCreator({ jobType, onJobTypeChange, params, onUpdateParams }: JobCreatorProps) {
    const handleUpdateParams = (newParams: Record<string, any>) => {
        onUpdateParams({ ...params, ...newParams });
    };

    const renderDCAParams = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>DCA Parameters</Text>
            <View style={styles.paramsContainer}>
                <NumberInput
                    label="Steps"
                    value={params.steps || 10}
                    min={1}
                    max={20}
                    step={1}
                    onChange={(value) => handleUpdateParams({ steps: value })}
                />
                <NumberInput
                    label="Hours"
                    value={params.hours || 24}
                    min={1}
                    max={24}
                    step={1}
                    unit="h"
                    onChange={(value) => handleUpdateParams({ hours: value })}
                />
                <NumberInput
                    label="Amount"
                    value={params.amount || 100}
                    min={1}
                    max={10000}
                    step={10}
                    unit=" USDT"
                    onChange={(value) => handleUpdateParams({ amount: value })}
                />
                <View style={styles.forceContainer}>
                    <TouchableOpacity
                        style={[
                            styles.forceOption,
                            params.force && styles.selectedForce
                        ]}
                        onPress={() => handleUpdateParams({ force: !params.force })}
                    >
                        <Text style={[
                            styles.forceText,
                            params.force && styles.selectedForceText
                        ]}>Force Entry</Text>
                    </TouchableOpacity>
                    <NumberInput
                        label="Discount"
                        value={params.pctDiscount || 0}
                        min={0}
                        max={100}
                        step={0.5}
                        unit="%"
                        disabled={!params.force}
                        onChange={(value) => handleUpdateParams({ pctDiscount: value })}
                    />
                </View>
            </View>
        </View>
    );

    const renderLiqParams = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liquidation Protection Parameters</Text>
            <View style={styles.paramsContainer}>
                <View style={styles.forceContainer}>
                    <TouchableOpacity
                        style={[
                            styles.forceOption,
                            params.force && styles.selectedForce
                        ]}
                        onPress={() => handleUpdateParams({ force: !params.force })}
                    >
                        <Text style={[
                            styles.forceText,
                            params.force && styles.selectedForceText
                        ]}>Force Entry</Text>
                    </TouchableOpacity>
                    <NumberInput
                        label="Discount"
                        value={params.pctDiscount || 0}
                        min={0}
                        max={100}
                        step={0.1}
                        unit="%"
                        disabled={!params.force}
                        onChange={(value) => handleUpdateParams({ pctDiscount: value })}
                    />
                </View>

                <NumberInput
                    label="Time"
                    value={params.timeInMinutes || 60}
                    min={1}
                    max={1440}
                    step={1}
                    unit="min"
                    onChange={(value) => handleUpdateParams({ timeInMinutes: value })}
                />

                <NumberInput
                    label="Proportion"
                    value={params.proportion || 50}
                    min={1}
                    max={100}
                    step={1}
                    unit="%"
                    onChange={(value) => handleUpdateParams({ proportion: value })}
                />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {jobType === 'dca' ? renderDCAParams() : renderLiqParams()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
        marginBottom: 16,
    },
    paramsContainer: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        color: '#748CAB',
        marginLeft: 4,
    },
    controlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    valueButton: {
        backgroundColor: '#22314A',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    valueButtonDisabled: {
        backgroundColor: '#1B263B',
    },
    valueText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    valueTextDisabled: {
        color: '#748CAB',
    },
    forceContainer: {
        gap: 12,
    },
    forceOption: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#22314A',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    selectedForce: {
        backgroundColor: '#3B82F6',
    },
    forceText: {
        color: '#748CAB',
        fontSize: 14,
        fontWeight: '600',
    },
    selectedForceText: {
        color: 'white',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(13, 27, 42, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1B263B',
        padding: 24,
        borderRadius: 12,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        marginBottom: 16,
    },
    modalInput: {
        backgroundColor: '#22314A',
        borderRadius: 8,
        padding: 12,
        color: 'white',
        fontSize: 16,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#22314A',
    },
    submitButton: {
        backgroundColor: '#3B82F6',
    },
    cancelButtonText: {
        color: '#748CAB',
        fontSize: 14,
        fontWeight: '600',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
}); 