import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
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

type AddExchangeScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface ExchangeAccountForm {
    name: string;
    provider: string;
    readOnlyApiKey: string;
    readOnlyApiSecret: string;
    readWriteApiKey: string;
    readWriteApiSecret: string;
    demo: boolean;
}

export default function AddExchangeScreen() {
    const navigation = useNavigation<AddExchangeScreenNavigationProp>();
    const {alert, showAlert, hideAlert} = useAlert();
    const [isLoading, setIsLoading] = useState(false);
    const [showKeys, setShowKeys] = useState(false);

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
        readOnlyApiKey: {
            required: true,
            minLength: 6,
            message: 'API key must be at least 10 characters'
        },
        readOnlyApiSecret: {
            required: true,
            minLength: 6,
            message: 'API secret must be at least 10 characters'
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
            readOnlyApiKey: '',
            readOnlyApiSecret: '',
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
                readOnlyApiKey: formData.readOnlyApiKey,
                readOnlyApiSecret: formData.readOnlyApiSecret,
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
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Exchange Account</Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Details</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Account Name</Text>
                            <TextInput
                                style={[styles.input, touchedFields.name && errors.name && styles.inputError]}
                                value={formData.name}
                                onChangeText={(text) => handleChange('name', text)}
                                onBlur={() => handleBlur('name')}
                                placeholder="Enter account name"
                                placeholderTextColor="#748CAB"
                            />
                            {touchedFields.name && errors.name && (
                                <Text style={styles.errorText}>{errors.name}</Text>
                            )}
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Provider</Text>
                            <View style={styles.providerButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        styles.bybitButton,
                                        formData.provider === 'BYBIT' && styles.bybitButtonActive,
                                    ]}
                                    onPress={() => setFormData({...formData, provider: 'BYBIT'})}
                                >
                                    <Ionicons 
                                        name="logo-bitcoin" 
                                        size={20} 
                                        color={formData.provider === 'BYBIT' ? '#0D1B2A' : '#FCD535'} 
                                    />
                                    <Text style={[
                                        styles.providerButtonText,
                                        formData.provider === 'BYBIT' ? styles.bybitButtonTextActive : styles.bybitButtonText,
                                    ]}>Bybit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        styles.binanceButton,
                                        formData.provider === 'BINANCE' && styles.binanceButtonActive,
                                    ]}
                                    onPress={() => setFormData({...formData, provider: 'BINANCE'})}
                                >
                                    <Ionicons 
                                        name="logo-bitcoin" 
                                        size={20} 
                                        color={formData.provider === 'BINANCE' ? '#0D1B2A' : '#F0B90B'} 
                                    />
                                    <Text style={[
                                        styles.providerButtonText,
                                        formData.provider === 'BINANCE' ? styles.binanceButtonTextActive : styles.binanceButtonText,
                                    ]}>Binance</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Account Type</Text>
                            <View style={styles.providerButtons}>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        styles.liveButton,
                                        !formData.demo && styles.liveButtonActive,
                                    ]}
                                    onPress={() => setFormData({...formData, demo: false})}
                                >
                                    <Ionicons 
                                        name="flash" 
                                        size={20} 
                                        color={!formData.demo ? '#FFFFFF' : '#3B82F6'} 
                                    />
                                    <Text style={[
                                        styles.providerButtonText,
                                        !formData.demo ? styles.liveButtonTextActive : styles.liveButtonText,
                                    ]}>Live</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.providerButton,
                                        styles.demoButton,
                                        formData.demo && styles.demoButtonActive,
                                    ]}
                                    onPress={() => setFormData({...formData, demo: true})}
                                >
                                    <Ionicons 
                                        name="shield-checkmark" 
                                        size={20} 
                                        color={formData.demo ? '#FFFFFF' : '#10B981'} 
                                    />
                                    <Text style={[
                                        styles.providerButtonText,
                                        formData.demo ? styles.demoButtonTextActive : styles.demoButtonText,
                                    ]}>Demo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>API Keys</Text>
                            <TouchableOpacity
                                style={styles.showKeysButton}
                                onPress={() => setShowKeys(!showKeys)}
                            >
                                <Ionicons
                                    name={showKeys ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#748CAB"
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Read-Only API Key</Text>
                            <TextInput
                                style={[styles.input, touchedFields.readOnlyApiKey && errors.readOnlyApiKey && styles.inputError]}
                                value={formData.readOnlyApiKey}
                                onChangeText={(text) => handleChange('readOnlyApiKey', text)}
                                onBlur={() => handleBlur('readOnlyApiKey')}
                                placeholder="Enter read-only API key"
                                placeholderTextColor="#748CAB"
                                secureTextEntry={!showKeys}
                            />
                            {touchedFields.readOnlyApiKey && errors.readOnlyApiKey && (
                                <Text style={styles.errorText}>{errors.readOnlyApiKey}</Text>
                            )}
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Read-Only API Secret</Text>
                            <TextInput
                                style={[styles.input, touchedFields.readOnlyApiSecret && errors.readOnlyApiSecret && styles.inputError]}
                                value={formData.readOnlyApiSecret}
                                onChangeText={(text) => handleChange('readOnlyApiSecret', text)}
                                onBlur={() => handleBlur('readOnlyApiSecret')}
                                placeholder="Enter read-only API secret"
                                placeholderTextColor="#748CAB"
                                secureTextEntry={!showKeys}
                            />
                            {touchedFields.readOnlyApiSecret && errors.readOnlyApiSecret && (
                                <Text style={styles.errorText}>{errors.readOnlyApiSecret}</Text>
                            )}
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Read-Write API Key</Text>
                            <TextInput
                                style={[styles.input, touchedFields.readWriteApiKey && errors.readWriteApiKey && styles.inputError]}
                                value={formData.readWriteApiKey}
                                onChangeText={(text) => handleChange('readWriteApiKey', text)}
                                onBlur={() => handleBlur('readWriteApiKey')}
                                placeholder="Enter read-write API key"
                                placeholderTextColor="#748CAB"
                                secureTextEntry={!showKeys}
                            />
                            {touchedFields.readWriteApiKey && errors.readWriteApiKey && (
                                <Text style={styles.errorText}>{errors.readWriteApiKey}</Text>
                            )}
                        </View>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Read-Write API Secret</Text>
                            <TextInput
                                style={[styles.input, touchedFields.readWriteApiSecret && errors.readWriteApiSecret && styles.inputError]}
                                value={formData.readWriteApiSecret}
                                onChangeText={(text) => handleChange('readWriteApiSecret', text)}
                                onBlur={() => handleBlur('readWriteApiSecret')}
                                placeholder="Enter read-write API secret"
                                placeholderTextColor="#748CAB"
                                secureTextEntry={!showKeys}
                            />
                            {touchedFields.readWriteApiSecret && errors.readWriteApiSecret && (
                                <Text style={styles.errorText}>{errors.readWriteApiSecret}</Text>
                            )}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.saveButtonText}>Save Account</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1B263B',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    headerRight: {
        width: 40,
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
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
    },
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#748CAB',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#1B263B',
        borderRadius: 8,
        padding: 12,
        color: '#FFFFFF',
        fontSize: 16,
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
        backgroundColor: '#1B263B',
        gap: 8,
    },
    liveButton: {
        backgroundColor: '#1B263B',
    },
    liveButtonActive: {
        backgroundColor: '#3B82F6',
    },
    demoButton: {
        backgroundColor: '#1B263B',
    },
    demoButtonActive: {
        backgroundColor: '#10B981',
    },
    bybitButton: {
        backgroundColor: '#1B263B',
    },
    bybitButtonActive: {
        backgroundColor: '#FCD535',
    },
    binanceButton: {
        backgroundColor: '#1B263B',
    },
    binanceButtonActive: {
        backgroundColor: '#F0B90B',
    },
    providerButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    liveButtonText: {
        color: '#3B82F6',
    },
    demoButtonText: {
        color: '#10B981',
    },
    liveButtonTextActive: {
        color: '#FFFFFF',
    },
    demoButtonTextActive: {
        color: '#FFFFFF',
    },
    bybitButtonText: {
        color: '#FCD535',
    },
    binanceButtonText: {
        color: '#F0B90B',
    },
    bybitButtonTextActive: {
        color: '#0D1B2A',
    },
    binanceButtonTextActive: {
        color: '#0D1B2A',
    },
    showKeysButton: {
        padding: 8,
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#1B263B',
        backgroundColor: '#0D1B2A',
    },
    saveButton: {
        backgroundColor: '#3B82F6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 