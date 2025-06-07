import React, {useState} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '@/navigation/navigation';
import {Ionicons} from '@expo/vector-icons';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';
import {useFormValidation, ValidationRules} from '@/hooks/useFormValidation';
import {profileService, ExchangeAccount} from '@/services/api/profile';
import {Eye, EyeOff} from 'lucide-react-native';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedView} from '@/components/ui/ThemedView';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedButton} from '@/components/ui/ThemedButton';
import {ThemedHeader} from '@/components/ui/ThemedHeader';
import tinycolor from 'tinycolor2';

type AddExchangeScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface ExchangeAccountForm {
    name: string;
    provider: string;
    readWriteApiKey: string;
    readWriteApiSecret: string;
    demo: boolean;
}

export default function AddExchangeScreen() {
    const navigation = useNavigation<AddExchangeScreenNavigationProp>();
    const {alert, showAlert, hideAlert} = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [showKeys, setShowKeys] = useState(false);
    const {colors} = useTheme();

    const validationRules: ValidationRules<ExchangeAccountForm> = {
        name: {
            required: true,
            minLength: 3,
            maxLength: 50,
            message: 'Account name must be between 3 and 50 characters'
        },
        provider: {
            skipValidation: true
        },
        demo: {
            skipValidation: true
        },
        readWriteApiKey: {
            required: true,
            minLength: 6,
            message: 'API key must be at least 10 characters'
        },
        readWriteApiSecret: {
            required: true,
            minLength: 6,
            message: 'API secret must be at least 10 characters'
        }
    };

    const {
        formData,
        errors,
        touchedFields,
        setFormData,
        handleChange,
        handleBlur,
        validateForm
    } = useFormValidation<ExchangeAccountForm>(
        {
            name: '',
            provider: 'BYBIT',
            readWriteApiKey: '',
            readWriteApiSecret: '',
            demo: false,
        },
        validationRules
    );

    const handleSave = async () => {
        if (!validateForm()) {
            showAlert({
                type: 'error',
                title: 'Validation Error',
                message: 'Please fill in all required fields correctly',
            });
            return;
        }
        console.log(formData);
        setIsLoading(true);
        try {
            const accountData: ExchangeAccount = {
                provider: formData.provider,
                name: formData.name,
                demo: formData.demo,
                readWriteApiKey: formData.readWriteApiKey,
                readWriteApiSecret: formData.readWriteApiSecret,
            };

            await profileService.addExchangeAccount(accountData);

            showAlert({
                type: 'success',
                title: 'Success',
                message: 'Exchange account added successfully',
            });
            navigation.goBack();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to add exchange account';
            showAlert({
                type: 'error',
                title: 'Error',
                message: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{...styles.safeArea, backgroundColor: colors.background}} edges={['top']}>
            <ThemedView variant="screen" style={styles.container}>
                <ThemedHeader
                    title="Add Exchange Account"
                    canGoBack
                    onBack={() => navigation.goBack()}
                />

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ThemedView variant="transparent" style={styles.section}>
                        <ThemedView variant="transparent" style={styles.inputContainer}>
                            <ThemedText variant="label" secondary style={styles.inputLabel}>Account Name</ThemedText>
                            <View style={[
                                styles.input,
                                {
                                    backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString()
                                },
                                touchedFields.name && errors.name ? {borderColor: colors.error} : {}
                            ]}>
                                <Ionicons
                                    name="person-outline"
                                    size={20}
                                    color="#748CAB"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={{
                                        ...styles.inputText,
                                        color: colors.text
                                    }}
                                    value={formData.name}
                                    onChangeText={(text) => handleChange('name', text)}
                                    onBlur={() => handleBlur('name')}
                                    placeholder="Enter account name"
                                    placeholderTextColor="#748CAB"
                                />
                            </View>
                            {touchedFields.name && errors.name && (
                                <ThemedText variant="caption" color={colors.error}
                                            style={styles.errorText}>{errors.name}</ThemedText>
                            )}
                        </ThemedView>
                        <ThemedView variant="transparent" style={styles.inputContainer}>
                            <ThemedText variant="label" secondary style={styles.inputLabel}>Provider</ThemedText>
                            <ThemedView variant="transparent" style={styles.providerButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        {backgroundColor: formData.provider === 'BYBIT' ? '#FCD535' : colors.backgroundSecondary}
                                    ]}
                                    onPress={() => setFormData({...formData, provider: 'BYBIT'})}
                                >
                                    <Ionicons
                                        name="logo-bitcoin"
                                        size={20}
                                        color={formData.provider === 'BYBIT' ? '#0D1B2A' : '#FCD535'}
                                    />
                                    <ThemedText
                                        variant="body"
                                        color={formData.provider === 'BYBIT' ? '#0D1B2A' : '#FCD535'}
                                        style={styles.providerButtonText}
                                    >
                                        Bybit
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        {backgroundColor: formData.provider === 'BINANCE' ? '#F0B90B' : colors.backgroundSecondary}
                                    ]}
                                    onPress={() => setFormData({...formData, provider: 'BINANCE'})}
                                >
                                    <Ionicons
                                        name="logo-bitcoin"
                                        size={20}
                                        color={formData.provider === 'BINANCE' ? '#0D1B2A' : '#F0B90B'}
                                    />
                                    <ThemedText
                                        variant="body"
                                        color={formData.provider === 'BINANCE' ? '#0D1B2A' : '#F0B90B'}
                                        style={styles.providerButtonText}
                                    >
                                        Binance
                                    </ThemedText>
                                </TouchableOpacity>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView variant="transparent" style={styles.inputContainer}>
                            <ThemedText variant="label" secondary style={styles.inputLabel}>Account Type</ThemedText>
                            <ThemedView variant="transparent" style={styles.providerButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        {backgroundColor: !formData.demo ? '#3B82F6' : colors.backgroundSecondary}
                                    ]}
                                    onPress={() => setFormData({...formData, demo: false})}
                                >
                                    <Ionicons
                                        name="flash"
                                        size={20}
                                        color={!formData.demo ? '#FFFFFF' : '#3B82F6'}
                                    />
                                    <ThemedText
                                        variant="body"
                                        color={!formData.demo ? '#FFFFFF' : '#3B82F6'}
                                        style={styles.providerButtonText}
                                    >
                                        Live
                                    </ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        {backgroundColor: formData.demo ? '#10B981' : colors.backgroundSecondary}
                                    ]}
                                    onPress={() => setFormData({...formData, demo: true})}
                                >
                                    <Ionicons
                                        name="shield-checkmark"
                                        size={20}
                                        color={formData.demo ? '#FFFFFF' : '#10B981'}
                                    />
                                    <ThemedText
                                        variant="body"
                                        color={formData.demo ? '#FFFFFF' : '#10B981'}
                                        style={styles.providerButtonText}
                                    >
                                        Demo
                                    </ThemedText>
                                </TouchableOpacity>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView variant="transparent" style={styles.section}>
                        <ThemedView variant="transparent" style={{
                            ...styles.securityNotice,
                            backgroundColor: tinycolor(colors.backgroundSecondary).setAlpha(0.8).toHexString()
                        }}>
                            <Ionicons name="shield-checkmark" size={24} color={colors.success} style={styles.securityIcon} />
                            <ThemedView variant="transparent" style={styles.securityTextContainer}>
                                <ThemedText variant="heading3" style={styles.securityTitle}>Your API Keys are Secure</ThemedText>
                                <ThemedText variant="body" secondary style={styles.securityText}>
                                    We encrypt and securely store your API keys in our database. Your keys are only used to execute trades you manually create and to fetch your account data. We never use your keys for any other purpose, and they are never shared with third parties.{'\n\n'}
                                    You can delete your exchange account at any time from the app, and we will permanently remove all associated API keys and account information from our systems.
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>

                        <ThemedView variant="transparent" style={styles.sectionHeader}>
                            <ThemedText variant="heading3" style={styles.sectionTitle}>API Keys</ThemedText>
                            <ThemedButton
                                variant="ghost"
                                style={styles.showKeysButton}
                                onPress={() => setShowKeys(!showKeys)}
                                leftIcon={showKeys ? <EyeOff size={20} color={colors.primary}/> :
                                    <Eye size={20} color={colors.primary}/>}
                            >
                                {''}
                            </ThemedButton>
                        </ThemedView>
                        <ThemedView variant="transparent" style={styles.inputContainer}>
                            <ThemedText variant="label" secondary style={styles.inputLabel}>Read-Write API
                                Key</ThemedText>
                            <View style={[
                                styles.input,
                                {
                                    backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString()
                                },
                                touchedFields.readWriteApiKey && errors.readWriteApiKey ? {borderColor: colors.error} : {}
                            ]}>
                                <Ionicons
                                    name="key-outline"
                                    size={20}
                                    color="#748CAB"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={{
                                        ...styles.inputText,
                                        color: colors.text
                                    }}
                                    value={formData.readWriteApiKey}
                                    onChangeText={(text) => handleChange('readWriteApiKey', text)}
                                    onBlur={() => handleBlur('readWriteApiKey')}
                                    placeholder="Enter read-write API key"
                                    placeholderTextColor="#748CAB"
                                    secureTextEntry={!showKeys}
                                />
                            </View>
                            {touchedFields.readWriteApiKey && errors.readWriteApiKey && (
                                <ThemedText variant="caption" color={colors.error}
                                            style={styles.errorText}>{errors.readWriteApiKey}</ThemedText>
                            )}
                        </ThemedView>
                        <ThemedView variant="transparent" style={styles.inputContainer}>
                            <ThemedText variant="label" secondary style={styles.inputLabel}>Read-Write API
                                Secret</ThemedText>
                            <View style={[
                                styles.input,
                                {
                                    backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString()
                                },
                                touchedFields.readWriteApiSecret && errors.readWriteApiSecret ? {borderColor: colors.error} : {}
                            ]}>
                                <Ionicons
                                    name="key-outline"
                                    size={20}
                                    color="#748CAB"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={{
                                        ...styles.inputText,
                                        color: colors.text
                                    }}
                                    value={formData.readWriteApiSecret}
                                    onChangeText={(text) => handleChange('readWriteApiSecret', text)}
                                    onBlur={() => handleBlur('readWriteApiSecret')}
                                    placeholder="Enter read-write API secret"
                                    placeholderTextColor="#748CAB"
                                    secureTextEntry={!showKeys}
                                />
                            </View>
                            {touchedFields.readWriteApiSecret && errors.readWriteApiSecret && (
                                <ThemedText variant="caption" color={colors.error}
                                            style={styles.errorText}>{errors.readWriteApiSecret}</ThemedText>
                            )}
                        </ThemedView>
                    </ThemedView>
                </ScrollView>

                <ThemedView variant="transparent" style={styles.footer}>
                    <ThemedButton
                        variant="primary"
                        style={isLoading ? styles.saveButtonDisabled : undefined}
                        onPress={handleSave}
                        disabled={isLoading}
                        loading={isLoading}
                        fullWidth
                    >
                        Save Account
                    </ThemedButton>
                </ThemedView>
            </ThemedView>

            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
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
    providerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    providerButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    providerButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    showKeysButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
        height: 40,
    },
    errorText: {
        marginTop: 4,
    },
    footer: {
        padding: 16,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    securityNotice: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    securityIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    securityTextContainer: {
        flex: 1,
    },
    securityTitle: {
        marginBottom: 6,
        fontWeight: '600',
    },
    securityText: {
        lineHeight: 20,
        opacity: 0.9,
    },
}); 