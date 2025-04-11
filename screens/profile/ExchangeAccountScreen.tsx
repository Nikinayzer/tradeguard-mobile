import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {Key, Eye, EyeOff, Save, Edit2, X} from 'lucide-react-native';
import {ProfileStackParamList} from '@/navigation/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFormValidation, ValidationRules} from '@/hooks/useFormValidation';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';
import {SafeAreaView as SafeAreaViewContext} from 'react-native-safe-area-context';
import {profileService, ExchangeAccount} from '@/services/api/profile';

type ExchangeAccountScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ExchangeAccount'>;

interface ExchangeAccountForm {
    name: string;
    readOnlyApiKey: string;
    readOnlyApiSecret: string;
    readWriteApiKey: string;
    readWriteApiSecret: string;
}

export default function ExchangeAccountScreen() {
    const navigation = useNavigation<ExchangeAccountScreenNavigationProp>();
    const route = useRoute();
    const {accountId} = route.params as { accountId: string };
    const [account, setAccount] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showKeys, setShowKeys] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();

    useEffect(() => {
        if (!accountId) {
            showAlert({
                title: 'Error',
                message: 'No account ID provided',
                type: 'error',
            });
            navigation.goBack();
            return;
        }

        const fetchAccount = async () => {
            try {
                const accountData = await profileService.getExchangeAccount(accountId);
                setAccount(accountData);
            } catch (error: any) {
                showAlert({
                    title: 'Error',
                    message: 'Failed to load exchange account details',
                    type: 'error',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAccount();
    }, [accountId]);

    const validationRules: ValidationRules<ExchangeAccountForm> = {
        name: {
            required: true,
            minLength: 3,
            maxLength: 50,
            message: 'Name must be between 3 and 50 characters'
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
        validateForm,
        resetForm
    } = useFormValidation<ExchangeAccountForm>(
        {
            name: account?.name || '',
            readOnlyApiKey: account?.readOnlyApiKey || '',
            readOnlyApiSecret: account?.readOnlyApiSecret || '',
            readWriteApiKey: account?.readWriteApiKey || '',
            readWriteApiSecret: account?.readWriteApiSecret || '',
        },
        validationRules
    );

    useEffect(() => {
        if (account) {
            setFormData({
                name: account.name,
                readOnlyApiKey: account.readOnlyApiKey,
                readOnlyApiSecret: account.readOnlyApiSecret,
                readWriteApiKey: account.readWriteApiKey,
                readWriteApiSecret: account.readWriteApiSecret,
            });
        }
    }, [account]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        resetForm();
    };

    const handleSave = async () => {
        console.log(formData)
        if (!validateForm()) {
            showAlert({
                type: 'error',
                title: 'Validation Error',
                message: 'Please fill in all required fields correctly',
            });
            return;
        }

        setIsSaving(true);
        try {
            const accountData = {
                name: formData.name,
                readOnlyApiKey: formData.readOnlyApiKey,
                readOnlyApiSecret: formData.readOnlyApiSecret,
                readWriteApiKey: formData.readWriteApiKey,
                readWriteApiSecret: formData.readWriteApiSecret,
            };

            await profileService.updateExchangeAccount(accountId, accountData);

            showAlert({
                type: 'success',
                title: 'Success',
                message: 'Exchange account updated successfully',
            });
            setIsEditing(false);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update exchange account';
            showAlert({
                type: 'error',
                title: 'Error',
                message: errorMessage,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            console.log('Starting delete process...');
            console.log('Account ID:', accountId);
            console.log('Account object:', account);
            
            if (!accountId) {
                console.error('No account ID available');
                showAlert({
                    title: 'Error',
                    message: 'No account ID available',
                    type: 'error',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: hideAlert,
                            style: 'default',
                        },
                    ],
                });
                return;
            }

            console.log('Calling deleteExchangeAccount API...');
            const response = await profileService.deleteExchangeAccount(accountId);
            console.log('Delete response:', response);
            
            showAlert({
                title: 'Success',
                message: 'Exchange account was deleted successfully',
                type: 'success',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {
                            hideAlert();
                            navigation.goBack();
                        },
                        style: 'default',
                    },
                ],
            });
        } catch (error: any) {
            console.error('Delete error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config,
            });
            showAlert({
                title: 'Error',
                message: error.response?.data?.message || 'Failed to delete exchange account',
                type: 'error',
                buttons: [
                    {
                        text: 'OK',
                        onPress: hideAlert,
                        style: 'default',
                    },
                ],
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmDelete = () => {
        console.log('Delete button pressed');
        showAlert({
            title: 'Delete Account',
            message: 'Are you sure you want to delete this exchange account? This action cannot be undone.',
            type: 'warning',
            buttons: [
                {
                    text: 'Cancel',
                    onPress: () => {
                        console.log('Delete cancelled');
                        hideAlert();
                    },
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: () => {
                        console.log('Delete confirmed, calling handleDelete');
                        hideAlert();
                        handleDelete();
                    },
                    style: 'destructive',
                },
            ],
        });
    };

    if (isLoading) {
        return (
            <SafeAreaViewContext style={styles.container} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6"/>
                </View>
            </SafeAreaViewContext>
        );
    }

    if (!account) {
        return (
            <SafeAreaViewContext style={styles.container} edges={['top']}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load account details</Text>
                </View>
            </SafeAreaViewContext>
        );
    }

    return (
        <SafeAreaViewContext style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF"/>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{account.name}</Text>
                    <Text style={styles.providerText}>{account.provider}</Text>
                </View>
                {!isEditing ? (
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={handleEdit}
                    >
                        <Edit2 size={24} color="#3B82F6"/>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.editActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleCancel}
                        >
                            <X size={24} color="#EF4444"/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="#3B82F6"/>
                            ) : (
                                <Save size={24} color="#3B82F6"/>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Details</Text>
                    {isEditing ? (
                        <View style={styles.formField}>
                            <Text style={styles.label}>Account Name</Text>
                            <TextInput
                                style={[styles.input, styles.apiKeyInput, touchedFields.name && errors.name && styles.inputError]}
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
                    ) : (
                        <View style={styles.infoField}>
                            <Text style={styles.infoLabel}>Name</Text>
                            <Text style={styles.infoValue}>{account.name}</Text>
                        </View>
                    )}
                    <View style={styles.infoField}>
                        <Text style={styles.infoLabel}>Provider</Text>
                        <Text style={styles.infoValue}>{account.provider}</Text>
                    </View>
                    <View style={styles.infoField}>
                        <Text style={styles.infoLabel}>Type</Text>
                        <Text style={styles.infoValue}>{account.demo ? 'Demo' : 'Live'}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>API Keys</Text>
                        <TouchableOpacity
                            style={styles.toggleButton}
                            onPress={() => setShowKeys(!showKeys)}
                        >
                            {showKeys ? (
                                <EyeOff size={20} color="#3B82F6"/>
                            ) : (
                                <Eye size={20} color="#3B82F6"/>
                            )}
                        </TouchableOpacity>
                    </View>

                    {isEditing ? (
                        <>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Only API Key</Text>
                                <View
                                    style={[styles.input, touchedFields.readOnlyApiKey && errors.readOnlyApiKey && styles.inputError]}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={formData.readOnlyApiKey}
                                        onChangeText={(text) => handleChange('readOnlyApiKey', text)}
                                        onBlur={() => handleBlur('readOnlyApiKey')}
                                        secureTextEntry={!showKeys}
                                        placeholder="Enter API key"
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                                {touchedFields.readOnlyApiKey && errors.readOnlyApiKey && (
                                    <Text style={styles.errorText}>{errors.readOnlyApiKey}</Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Only API Secret</Text>
                                <View
                                    style={[styles.input, touchedFields.readOnlyApiSecret && errors.readOnlyApiSecret && styles.inputError]}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={formData.readOnlyApiSecret}
                                        onChangeText={(text) => handleChange('readOnlyApiSecret', text)}
                                        onBlur={() => handleBlur('readOnlyApiSecret')}
                                        secureTextEntry={!showKeys}
                                        placeholder="Enter API secret"
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                                {touchedFields.readOnlyApiSecret && errors.readOnlyApiSecret && (
                                    <Text style={styles.errorText}>{errors.readOnlyApiSecret}</Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Write API Key</Text>
                                <View
                                    style={[styles.input, touchedFields.readWriteApiKey && errors.readWriteApiKey && styles.inputError]}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={formData.readWriteApiKey}
                                        onChangeText={(text) => handleChange('readWriteApiKey', text)}
                                        onBlur={() => handleBlur('readWriteApiKey')}
                                        secureTextEntry={!showKeys}
                                        placeholder="Enter API key"
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                                {touchedFields.readWriteApiKey && errors.readWriteApiKey && (
                                    <Text style={styles.errorText}>{errors.readWriteApiKey}</Text>
                                )}
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Write API Secret</Text>
                                <View
                                    style={[styles.input, touchedFields.readWriteApiSecret && errors.readWriteApiSecret && styles.inputError]}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={formData.readWriteApiSecret}
                                        onChangeText={(text) => handleChange('readWriteApiSecret', text)}
                                        onBlur={() => handleBlur('readWriteApiSecret')}
                                        secureTextEntry={!showKeys}
                                        placeholder="Enter API secret"
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                                {touchedFields.readWriteApiSecret && errors.readWriteApiSecret && (
                                    <Text style={styles.errorText}>{errors.readWriteApiSecret}</Text>
                                )}
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Only API Key</Text>
                                <View style={styles.input}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={account.readOnlyApiKey}
                                        secureTextEntry={!showKeys}
                                        editable={false}
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Only API Secret</Text>
                                <View style={styles.input}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={account.readOnlyApiSecret}
                                        secureTextEntry={!showKeys}
                                        editable={false}
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Write API Key</Text>
                                <View style={styles.input}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={account.readWriteApiKey}
                                        secureTextEntry={!showKeys}
                                        editable={false}
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                            </View>

                            <View style={styles.formField}>
                                <Text style={styles.label}>Read-Write API Secret</Text>
                                <View style={styles.input}>
                                    <Key size={16} color="#748CAB"/>
                                    <TextInput
                                        style={styles.apiKeyInput}
                                        value={account.readWriteApiSecret}
                                        secureTextEntry={!showKeys}
                                        editable={false}
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                            </View>
                        </>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Warning Zone</Text>
                    <TouchableOpacity 
                        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
                        onPress={confirmDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                                <Text style={styles.deleteButtonText}>Delete Account</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {alert && (
                <CustomAlert
                    {...alert}
                    onClose={hideAlert}
                />
            )}
        </SafeAreaViewContext>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
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
    editButton: {
        padding: 8,
    },
    editActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    cancelButton: {
        padding: 8,
    },
    saveButton: {
        padding: 8,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    providerText: {
        fontSize: 14,
        color: '#748CAB',
        textTransform: 'uppercase',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
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
    formField: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#748CAB',
        marginBottom: 8,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B263B',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    apiKeyInput: {
        flex: 1,
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'monospace',
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 4,
    },
    infoField: {
        marginBottom: 16,
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: '#748CAB',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
        fontFamily: 'monospace',
    },
    toggleButton: {
        padding: 8,
    },
    deleteButton: {
        backgroundColor: '#DC2626',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    deleteButtonDisabled: {
        opacity: 0.7,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 