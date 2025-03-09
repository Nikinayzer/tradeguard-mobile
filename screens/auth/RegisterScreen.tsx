import React, {useState} from 'react';
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
import {AuthStackParamList} from '@/types/navigation';
import {authService} from '@/services/api/auth';
import {useAuth} from '@/contexts/AuthContext';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface FormErrors {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

export default function RegisterScreen() {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const {login} = useAuth();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

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

    const handleRegister = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authService.register({
                name: formData.username,
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.confirmPassword,
            });
            await login(response.token, {
                id: formData.username,
                name: formData.username,
                email: formData.email,
            });
        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                error.message || 'Please check your information and try again'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderInput = (
        field: keyof FormData,
        placeholder: string,
        icon: string,
        isPassword: boolean = false,
        showPasswordState?: boolean,
        setShowPasswordState?: (show: boolean) => void
    ) => (
        <View style={styles.inputContainer}>
            <View style={[styles.input, errors[field] && styles.inputError]}>
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
                        setFormData({...formData, [field]: text})
                    }
                    style={styles.inputText}
                    autoCapitalize={field === 'email' ? 'none' : 'none'}
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
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Text style={styles.title}>Create Account</Text>
                                <Text style={styles.subtitle}>
                                    Join us and start trading
                                </Text>
                            </View>

                            <View style={styles.form}>
                                {renderInput(
                                    'username',
                                    'Username',
                                    'person-outline'
                                )}
                                {renderInput(
                                    'email',
                                    'Email',
                                    'mail-outline'
                                )}
                                {renderInput(
                                    'password',
                                    'Password',
                                    'lock-closed-outline',
                                    true,
                                    showPassword,
                                    setShowPassword
                                )}
                                {renderInput(
                                    'confirmPassword',
                                    'Confirm Password',
                                    'lock-closed-outline',
                                    true,
                                    showConfirmPassword,
                                    setShowConfirmPassword
                                )}

                                <TouchableOpacity
                                    style={[styles.button, isLoading && styles.buttonDisabled]}
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF"/>
                                    ) : (
                                        <>
                                            <Text style={styles.buttonText}>Create Account</Text>
                                            <Ionicons
                                                name="arrow-forward"
                                                size={20}
                                                color="#FFFFFF"
                                                style={styles.buttonIcon}
                                            />
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={styles.linkText}>
                                        Already have an account?{' '}
                                        <Text style={styles.linkTextBold}>Sign in</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
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
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#748CAB',
    },
    form: {
        gap: 20,
    },
    inputContainer: {
        gap: 8,
    },
    input: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1B263B',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    inputIcon: {
        paddingLeft: 16,
    },
    inputText: {
        flex: 1,
        color: '#FFFFFF',
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
    button: {
        backgroundColor: '#3B82F6',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonIcon: {
        marginLeft: 8,
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
}); 