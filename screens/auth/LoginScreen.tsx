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
    Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Ionicons} from '@expo/vector-icons';
import {AuthStackParamList} from '@/navigation/navigation';
import {authService} from '@/services/api/auth';
import {useAuth} from '@/contexts/AuthContext';
import CustomAlert, {useAlert} from '@/components/common/CustomAlert';
import {usePushToken} from "@/contexts/PushTokenContext";
import DiscordLoginButton from '@/components/auth/DiscordLoginButton';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

interface FormData {
    username: string;
    password: string;
}

interface FormErrors {
    username?: string;
    password?: string;
}

export default function LoginScreen() {
    const [formData, setFormData] = useState<FormData>({
        username: '',
        password: '',
    });
    const {pushToken} = usePushToken();
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const {login} = useAuth();

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await authService.login({
                    username: formData.username.trim(),
                    password: formData.password,
                },
                pushToken);
            await login(response.token, {
                id: formData.username,
                name: formData.username,
                email: '',
            });
        } catch (error: any) {
            showAlert({
                title: 'Login Failed',
                message: 'Please check your credentials and try again',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoidingView}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Welcome Back</Text>
                            <Text style={styles.subtitle}>
                                Sign in to continue trading
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputContainer}>
                                <View style={[styles.input, errors.username && styles.inputError]}>
                                    <Ionicons
                                        name="person-outline"
                                        size={20}
                                        color="#748CAB"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        placeholder="Username"
                                        placeholderTextColor="#748CAB"
                                        value={formData.username}
                                        onChangeText={(text) =>
                                            setFormData({...formData, username: text})
                                        }
                                        style={styles.inputText}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                                {errors.username && (
                                    <Text style={styles.errorText}>{errors.username}</Text>
                                )}
                            </View>

                            <View style={styles.inputContainer}>
                                <View style={[styles.input, errors.password && styles.inputError]}>
                                    <Ionicons
                                        name="lock-closed-outline"
                                        size={20}
                                        color="#748CAB"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        placeholder="Password"
                                        placeholderTextColor="#748CAB"
                                        value={formData.password}
                                        onChangeText={(text) =>
                                            setFormData({...formData, password: text})
                                        }
                                        style={styles.inputText}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.passwordToggle}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color="#748CAB"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && (
                                    <Text style={styles.errorText}>{errors.password}</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.button, isLoading && styles.buttonDisabled]}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF"/>
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Sign In</Text>
                                        <Ionicons
                                            name="arrow-forward"
                                            size={20}
                                            color="#FFFFFF"
                                            style={styles.buttonIcon}
                                        />
                                    </>
                                )}
                            </TouchableOpacity>

                            <View style={styles.orContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.orText}>OR</Text>
                                <View style={styles.divider} />
                            </View>

                            <DiscordLoginButton 
                                onLoginStarted={() => setIsLoading(true)}
                                onLoginFailed={(error) => {
                                    setIsLoading(false);
                                    showAlert({
                                        title: 'Discord Login Failed',
                                        message: error.message || 'Please try again',
                                        type: 'error',
                                    });
                                }}
                            />

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => navigation.navigate('Register')}
                            >
                                <Text style={styles.linkText}>
                                    Don't have an account?{' '}
                                    <Text style={styles.linkTextBold}>Sign up</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <CustomAlert
                {...alert}
                onClose={hideAlert}
                buttons={[
                    {
                        text: 'Try Again',
                        onPress: hideAlert,
                        style: 'default',
                    },
                ]}
            />
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
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(116, 140, 171, 0.2)',
    },
    orText: {
        color: '#748CAB',
        fontSize: 14,
        marginHorizontal: 10,
    },
}); 