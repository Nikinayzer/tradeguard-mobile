import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Ionicons} from '@expo/vector-icons';
import {AuthStackParamList} from '@/navigation/navigation';
import {authApiService} from '@/services/api/auth';
import {useAuth} from '@/contexts/AuthContext';
import CustomAlert, {AlertButton, useAlert} from '@/components/common/CustomAlert';
import {ThemedView} from "@/components/ui/ThemedView";
import tinycolor from "tinycolor2";
import {useTheme} from "@/contexts/ThemeContext";
import {ThemedText} from "@/components/ui/ThemedText";
import DatePicker from "react-native-date-picker";

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
}

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    consent?: string;
}

const TOTAL_PAGES = 3;

export default function RegisterScreen() {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: ''
    });
    const [hasConsent, setHasConsent] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();
    const [currentPage, setCurrentPage] = useState(1);
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const {login} = useAuth();
    const {colors} = useTheme();

    const [showDatePicker, setShowDatePicker] = useState(false);
    const earliestRegisterDate = () => {
        const now = new Date();
        return new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    }
    const formatDateFromString = (date: string) => {
        const parts = date.split('-');
        if (parts.length !== 3) return '';
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    const formatDateToString = (date: Date): string => {
        return date.toISOString().split('T')[0];
    }
    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const validateCurrentPage = (): boolean => {
        const newErrors: FormErrors = {};

        switch (currentPage) {
            case 1:
                if (!formData.username.trim()) {
                    newErrors.username = 'Username is required';
                } else if (formData.username.length < 3) {
                    newErrors.username = 'Username must be at least 3 characters';
                }

                if (!formData.email) {
                    newErrors.email = 'Email is required';
                } else if (!validateEmail(formData.email)) {
                    newErrors.email = 'Please enter a valid email';
                }
                break;

            case 2:
                if (!formData.firstName.trim()) {
                    newErrors.firstName = 'First name is required';
                } else if (formData.firstName.length < 2) {
                    newErrors.firstName = 'First name must be at least 2 characters';
                }

                if (!formData.lastName.trim()) {
                    newErrors.lastName = 'Last name is required';
                } else if (formData.lastName.length < 2) {
                    newErrors.lastName = 'Last name must be at least 2 characters';
                }

                if (!formData.dateOfBirth) {
                    newErrors.dateOfBirth = 'Date of birth is required';
                }
                break;

            case 3:
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

                if (!hasConsent) {
                    newErrors.consent = 'You must agree to the terms to continue';
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateCurrentPage()) {
            if (currentPage < TOTAL_PAGES) {
                setCurrentPage(currentPage + 1);
            } else {
                handleRegister();
            }
        }
    };

    const handleBack = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleRegister = async () => {
        if (!validateCurrentPage()) return;

        setIsLoading(true);
        try {
            const response = await authApiService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth,
            });
            showAlert({
                title: 'Registration Successful',
                message: 'Your account has been created successfully.',
                type: 'success',
                buttons: [{
                    text: 'Log in',
                    onPress: () => {
                        hideAlert();
                        navigation.navigate('Login', {
                            autoLogin: {
                                username: formData.username,
                                password: formData.password
                            }
                        });
                    },
                    style: 'default',
                }],
            });
        } catch (error: any) {
            const code = error?.response?.data?.code;
            const message = error?.response?.data?.message || 'An error occurred during registration. Please try again.';
            const buttons: AlertButton[] = [];
            if (code === 'username_taken' || code === 'email_taken') {
                buttons.push({
                    text: 'Log In Instead',
                    onPress: () => {
                        hideAlert();
                    },
                    style: 'default',
                });
            }
            buttons.push({
                text: 'Try Again',
                onPress: hideAlert,
                style: 'cancel',
            });
            showAlert({
                title: code === 'username_taken' ? 'Username Unavailable'
                    : code === 'email_taken' ? 'Email Already Registered'
                        : 'Registration Failed',
                message: message,
                type: 'error',
                buttons: buttons,
            })
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateOfBirth = (text: string) => {
        const numbers = text.replace(/\D/g, '');

        let formatted = '';
        if (numbers.length > 0) {
            formatted = numbers.slice(0, 4);
            if (numbers.length > 4) {
                formatted += '-' + numbers.slice(4, 6);
                if (numbers.length > 6) {
                    formatted += '-' + numbers.slice(6, 8);
                }
            }
        }

        return formatted;
    };

    const renderInput = (
        field: keyof FormData,
        autoCapitalize: boolean = false,
        placeholder: string,
        icon: string,
        isPassword: boolean = false,
        showPasswordState?: boolean,
        setShowPasswordState?: (show: boolean) => void
    ) => (
        <View style={styles.inputContainer}>
            <View style={[styles.input, errors[field] && styles.inputError,
                {
                    backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString()
                }]}>
                <Ionicons
                    name={icon as any}
                    size={20}
                    color="#748CAB"
                    style={styles.inputIcon}
                />
                {field === 'dateOfBirth' ? (
                    <TouchableOpacity
                        onPress={() => {
                            console.log('Opening date picker at', Date.now());
                            setShowDatePicker(true)
                        }}
                        style={{flex: 1}}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.inputText,
                                {color: formData[field] ? colors.text : '#748CAB'}
                            ]}
                        >
                            {formData[field] || placeholder}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <>
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
                            autoCapitalize={autoCapitalize ? 'words' : 'none'}
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
                    </>
                )}
            </View>
            {errors[field] && (
                <Text style={styles.errorText}>{errors[field]}</Text>
            )}
        </View>
    );

    const renderPageContent = () => {
        switch (currentPage) {
            case 1:
                return (
                    <>
                        {renderInput(
                            'username',
                            false,
                            'Username',
                            'at-outline'
                        )}
                        {renderInput(
                            'email',
                            false,
                            'Email',
                            'mail-outline'
                        )}
                    </>
                );
            case 2:
                return (
                    <>
                        {renderInput(
                            'firstName',
                            true,
                            'First Name',
                            'person-outline',
                        )}
                        {renderInput(
                            'lastName',
                            true,
                            'Last Name',
                            'person-outline'
                        )}
                        {renderInput(
                            'dateOfBirth',
                            false,
                            'Date of Birth (YYYY-MM-DD)',
                            'calendar-outline'
                        )}
                    </>
                );
            case 3:
                return (
                    <>
                        {renderInput(
                            'password',
                            false,
                            'Password',
                            'lock-closed-outline',
                            true,
                            showPassword,
                            setShowPassword
                        )}
                        {renderInput(
                            'confirmPassword',
                            false,
                            'Confirm Password',
                            'lock-closed-outline',
                            true,
                            showConfirmPassword,
                            setShowConfirmPassword
                        )}
                        <View style={styles.consentContainer}>
                            <TouchableOpacity
                                style={styles.consentCheckbox}
                                onPress={() => setHasConsent(!hasConsent)}
                            >
                                <View style={[
                                    styles.checkbox,
                                    hasConsent && styles.checkboxChecked
                                ]}>
                                    {hasConsent && (
                                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                                    )}
                                </View>
                                <Text style={styles.consentText}>
                                    I agree to the processing of my personal data for the purpose of account management and service provision. I understand that my data will be handled in accordance with the privacy policy.
                                </Text>
                            </TouchableOpacity>
                            {errors.consent && (
                                <Text style={styles.errorText}>{errors.consent}</Text>
                            )}
                        </View>
                    </>
                );
        }
    };

    const getPageTitle = () => {
        switch (currentPage) {
            case 1:
                return "Create Account";
            case 2:
                return "Tell us about you";
            case 3:
                return "Lock it in with a password";
            default:
                return "Create Account";
        }
    };

    const getPageSubtitle = () => {
        switch (currentPage) {
            case 1:
                return "Let's get you started on your trading journey";
            case 2:
                return "Don't worry, we won't share your details with anyone";
            case 3:
                return "Make it strong, make it yours";
            default:
                return "Let's get you started";
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <ThemedView variant={"screen"} style={styles.content}>
                            <View style={styles.header}>
                                <ThemedText variant={"heading1"}
                                            style={StyleSheet.flatten([styles.title, {color: colors.text}])}>
                                    {getPageTitle()}
                                </ThemedText>
                                <Text style={styles.subtitle}>
                                    {getPageSubtitle()}
                                </Text>
                                <Text style={styles.stepIndicator}>
                                    Step {currentPage} of {TOTAL_PAGES}
                                </Text>
                            </View>

                            <View style={styles.form}>
                                {renderPageContent()}

                                <View style={styles.navigationButtons}>
                                    {currentPage > 1 && (
                                        <TouchableOpacity
                                            style={[styles.navButton, styles.backButton]}
                                            onPress={handleBack}
                                        >
                                            <Ionicons name="arrow-back" size={20} color="#FFFFFF"/>
                                            <Text style={styles.navButtonText}>Back</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={[styles.navButton, styles.nextButton, isLoading && styles.buttonDisabled]}
                                        onPress={handleNext}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFFFFF"/>
                                        ) : (
                                            <>
                                                <Text style={styles.navButtonText}>
                                                    {currentPage === TOTAL_PAGES ? 'Create Account' : 'Next'}
                                                </Text>
                                                <Ionicons
                                                    name="arrow-forward"
                                                    size={20}
                                                    color="#FFFFFF"
                                                />
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => navigation.navigate('Login', {})}
                                >
                                    <Text style={styles.linkText}>
                                        Already have an account?{' '}
                                        <Text style={styles.linkTextBold}>Sign in</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <DatePicker
                                modal
                                open={showDatePicker}
                                mode={"date"}
                                date={formatDateFromString(formData.dateOfBirth) || earliestRegisterDate()}
                                title={"Select Date of Birth"}
                                maximumDate={earliestRegisterDate()}
                                minimumDate={new Date('1900-01-01')}
                                onConfirm={(date) => {
                                    setShowDatePicker(false);
                                    // probably bug, datePicker returns value a day before selected date
                                    const fixedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
                                    setFormData({...formData, dateOfBirth: formatDateToString(fixedDate)});
                                    console.log('Selected date:', formatDateToString(fixedDate));
                                }
                                }
                                onCancel={() => setShowDatePicker(false)}
                            />
                            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
                        </ThemedView>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 50,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: '#748CAB',
        marginBottom: 12,
    },
    form: {
        gap: 20,
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
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    navButton: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    backButton: {
        backgroundColor: '#4B5563',
    },
    nextButton: {
        backgroundColor: '#3B82F6',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    navButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 8,
    },
    linkButton: {
        alignItems: 'center',
        marginTop: 16,
    },
    linkText: {
        color: '#748CAB',
        fontSize: 14,
    },
    linkTextBold: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    stepIndicator: {
        fontSize: 14,
        color: '#748CAB',
    },
    consentContainer: {
        marginTop: 16,
    },
    consentCheckbox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: '#3B82F6',
    },
    consentText: {
        flex: 1,
        fontSize: 14,
        color: '#748CAB',
        lineHeight: 20,
    },
}); 