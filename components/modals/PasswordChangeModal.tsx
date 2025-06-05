import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BaseModal from './BaseModal';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import tinycolor from 'tinycolor2';

interface PasswordChangeModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        email?: string;
        password: string;
        confirmPassword: string;
    }) => void;
    showEmail?: boolean;
    isLoading?: boolean;
}

export default function PasswordChangeModal({
    visible,
    onClose,
    onSubmit,
    showEmail = false,
    isLoading = false,
}: PasswordChangeModalProps) {
    const { colors } = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (showEmail && !formData.email) {
            newErrors.email = 'Email is required';
        } else if (showEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const renderInput = (
        field: keyof typeof formData,
        placeholder: string,
        icon: string,
        isPassword: boolean = false,
        showPasswordState?: boolean,
        setShowPasswordState?: (show: boolean) => void
    ) => (
        <View style={styles.inputContainer}>
            <View style={[
                styles.input,
                errors[field] && styles.inputError,
                { backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString() }
            ]}>
                <Ionicons
                    name={icon as any}
                    size={20}
                    color="#748CAB"
                    style={styles.inputIcon}
                />
                <TextInput
                    placeholder={placeholder}
                    placeholderTextColor="#748CAB"
                    value={formData[field]}
                    onChangeText={(text) =>
                        setFormData({
                            ...formData,
                            [field]: text
                        })
                    }
                    style={[styles.inputText, { color: colors.text, flex: 1 }]}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType={field === 'email' ? 'email-address' : 'default'}
                    secureTextEntry={isPassword && !showPasswordState}
                />
                {isPassword && setShowPasswordState && (
                    <TouchableOpacity
                        onPress={() => setShowPasswordState(!showPasswordState)}
                        style={styles.passwordToggle}
                    >
                        <Ionicons
                            name={showPasswordState ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#748CAB"
                        />
                    </TouchableOpacity>
                )}
            </View>
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            type="info"
            showCloseButton={true}
            isLoading={isLoading}
        >
            <View style={styles.content}>
                <ThemedText variant="heading2" style={styles.title}>
                    Change Password
                </ThemedText>
                <ThemedText variant="body" secondary style={styles.subtitle}>
                    Please enter your details to change your password
                </ThemedText>

                <View style={styles.form}>
                    {showEmail && renderInput(
                        'email',
                        'Email',
                        'mail-outline'
                    )}
                    {renderInput(
                        'password',
                        'New Password',
                        'lock-closed-outline',
                        true,
                        showPassword,
                        setShowPassword
                    )}
                    {renderInput(
                        'confirmPassword',
                        'Confirm New Password',
                        'lock-closed-outline',
                        true,
                        showConfirmPassword,
                        setShowConfirmPassword
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    <ThemedText variant="button" style={styles.submitButtonText}>
                        Change Password
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        gap: 8,
    },
    input: {
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    inputIcon: {
        paddingLeft: 16,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        padding: 16,
        paddingLeft: 12,
    },
    passwordToggle: {
        padding: 16,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginLeft: 4,
    },
    submitButton: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 