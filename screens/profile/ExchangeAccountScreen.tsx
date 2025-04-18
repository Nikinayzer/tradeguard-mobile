import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {Key, Eye, EyeOff} from 'lucide-react-native';
import {ProfileStackParamList} from '@/navigation/navigation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';
import {SafeAreaView} from 'react-native-safe-area-context';
import {profileService} from '@/services/api/profile';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedView} from '@/components/ui/ThemedView';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedButton} from '@/components/ui/ThemedButton';
import {ThemedHeader} from '@/components/ui/ThemedHeader';

type ExchangeAccountScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ExchangeAccount'>;

export default function ExchangeAccountScreen() {
    const navigation = useNavigation<ExchangeAccountScreenNavigationProp>();
    const route = useRoute();
    const {accountId} = route.params as { accountId: string };
    const [account, setAccount] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showKeys, setShowKeys] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();
    const {colors} = useTheme();

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
            <SafeAreaView style={styles.container} edges={['top']}>
                <ThemedView variant="screen" style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary}/>
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (!account) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <ThemedView variant="screen" style={styles.errorContainer}>
                    <ThemedText variant="bodyBold" color={colors.error}>Failed to load account details</ThemedText>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ThemedHeader
                title={account.name}
                subtitle={account.provider}
                canGoBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView variant="transparent" style={styles.section}>
                    <ThemedText variant="heading3" style={styles.sectionTitle}>Account Details</ThemedText>
                    <ThemedView variant="transparent" style={styles.infoField}>
                        <ThemedText variant="label" secondary style={styles.infoLabel}>Name</ThemedText>
                        <ThemedText variant="body">{account.name}</ThemedText>
                    </ThemedView>
                    <ThemedView variant="transparent" style={styles.infoField}>
                        <ThemedText variant="label" secondary style={styles.infoLabel}>Provider</ThemedText>
                        <ThemedText variant="body">{account.provider}</ThemedText>
                    </ThemedView>
                    <ThemedView variant="transparent" style={styles.infoField}>
                        <ThemedText variant="label" secondary style={styles.infoLabel}>Type</ThemedText>
                        <ThemedText variant="body">{account.demo ? 'Demo' : 'Live'}</ThemedText>
                    </ThemedView>
                </ThemedView>

                <ThemedView variant="transparent" style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText variant="heading3" style={styles.sectionTitle}>API Keys</ThemedText>
                        <ThemedButton
                            variant="ghost"
                            style={styles.toggleButton}
                            onPress={() => setShowKeys(!showKeys)}
                            leftIcon={showKeys ? <EyeOff size={20} color={colors.primary}/> :
                                <Eye size={20} color={colors.primary}/>}
                        >
                            {''}
                        </ThemedButton>
                    </View>

                    <ThemedView variant="transparent" style={styles.formField}>
                        <ThemedText variant="label" secondary style={styles.label}>Read-Only API Key</ThemedText>
                        <ThemedView variant="input" style={styles.inputContainer} rounded="medium">
                            <View style={styles.inputRow}>
                                <Key size={18} color={colors.textTertiary}/>
                                <TextInput
                                    style={{
                                        ...styles.input,
                                        color: colors.text
                                    }}
                                    value={account.readOnlyApiKey}
                                    secureTextEntry={!showKeys}
                                    editable={false}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView variant="transparent" style={styles.formField}>
                        <ThemedText variant="label" secondary style={styles.label}>Read-Only API Secret</ThemedText>
                        <ThemedView variant="input" style={styles.inputContainer} rounded="medium">
                            <View style={styles.inputRow}>
                                <Key size={18} color={colors.textTertiary}/>
                                <TextInput
                                    style={{
                                        ...styles.input,
                                        color: colors.text
                                    }}
                                    value={account.readOnlyApiSecret}
                                    secureTextEntry={!showKeys}
                                    editable={false}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView variant="transparent" style={styles.formField}>
                        <ThemedText variant="label" secondary style={styles.label}>Read-Write API Key</ThemedText>
                        <ThemedView variant="input" style={styles.inputContainer} rounded="medium">
                            <View style={styles.inputRow}>
                                <Key size={18} color={colors.textTertiary}/>
                                <TextInput
                                    style={{
                                        ...styles.input,
                                        color: colors.text
                                    }}
                                    value={account.readWriteApiKey}
                                    secureTextEntry={!showKeys}
                                    editable={false}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView variant="transparent" style={styles.formField}>
                        <ThemedText variant="label" secondary style={styles.label}>Read-Write API Secret</ThemedText>
                        <ThemedView variant="input" style={styles.inputContainer} rounded="medium">
                            <View style={styles.inputRow}>
                                <Key size={18} color={colors.textTertiary}/>
                                <TextInput
                                    style={{
                                        ...styles.input,
                                        color: colors.text
                                    }}
                                    value={account.readWriteApiSecret}
                                    secureTextEntry={!showKeys}
                                    editable={false}
                                    placeholderTextColor={colors.textTertiary}
                                />
                            </View>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>

                <ThemedView variant="transparent" style={styles.section}>
                    <ThemedText variant="heading3" style={styles.sectionTitle}>Warning Zone</ThemedText>
                    <ThemedButton
                        variant="secondary"
                        style={{
                            backgroundColor: '#DC2626',
                            ...(isDeleting ? {opacity: 0.7} : {})
                        }}
                        onPress={confirmDelete}
                        disabled={isDeleting}
                        loading={isDeleting}
                        leftIcon={<Ionicons name="trash-outline" size={20} color="#FFFFFF"/>}
                        textColor="white"
                    >
                        Delete Account
                    </ThemedButton>
                </ThemedView>
            </ScrollView>

            {alert && (
                <CustomAlert
                    {...alert}
                    onClose={hideAlert}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 20,
    },
    formField: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
    },
    inputContainer: {
        borderWidth: 1,
        overflow: 'hidden',
        height: 50,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        paddingHorizontal: 12,
        gap: 12,
    },
    input: {
        flex: 1,
        height: '100%',
        padding: 0,
    },
    infoField: {
        marginBottom: 16,
        paddingVertical: 8,
    },
    infoLabel: {
        marginBottom: 4,
    },
    toggleButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 40,
        height: 40,
    },
    deleteButton: {
        backgroundColor: '#DC2626',
    },
    deleteButtonDisabled: {
        opacity: 0.7,
    }
}); 