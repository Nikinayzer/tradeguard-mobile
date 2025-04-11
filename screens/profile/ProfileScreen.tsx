import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl,
    Image,
} from 'react-native';

import {format} from 'date-fns';
import {profileService, User} from '@/services/api/profile';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import {
    Mail,
    AlertCircle,
    Calendar,
    Settings,
    User as UserIcon,
} from 'lucide-react-native';
import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from "@react-navigation/native";
import {ProfileStackParamList} from "@/navigation/navigation";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import Constants from "expo-constants";
import {useAuth} from '@/contexts/AuthContext';
import {ExchangeAccount as APIExchangeAccount} from '@/services/api/profile';

type LoginScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface ConnectionCardProps {
    title?: string;
    provider?: string;
    status: string;
    onPress: () => void;
    children?: React.ReactNode;
    isDemo?: boolean;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
                                                           title,
                                                           provider,
                                                           status,
                                                           onPress,
                                                           children,
                                                           isDemo,
                                                       }) => {
    const getProviderIcon = (provider?: string): { name: keyof typeof Ionicons.glyphMap; color: string } | null => {
        if (!provider) return null;
        switch (provider.toUpperCase()) {
            case 'DISCORD':
                return {name: 'logo-discord', color: '#5865F2'};
            case 'BYBIT':
            case 'BINANCE':
            default:
                return {name: 'wallet-outline', color: '#748CAB'};
        }
    };

    const providerIcon = provider ? getProviderIcon(provider) : null;

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.connectionCard}>
                <View style={styles.connectionTitleContainer}>
                    {providerIcon && (
                        <View style={styles.providerHeader}>
                            <Ionicons
                                name={providerIcon.name}
                                size={16}
                                color={providerIcon.color}
                            />
                            <Text style={styles.providerText}>{provider}</Text>
                        </View>
                    )}
                    {title && (
                        <View style={styles.connectionTitleLeft}>
                            <Text style={styles.connectionTitle}>{title}</Text>
                            {isDemo && (
                                <View style={styles.demoBadge}>
                                    <Text style={styles.demoBadgeText}>DEMO</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
                {status === "connected" && children && (
                    <View style={styles.connectionContent}>
                        {children}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const DiscordConnection: React.FC<{ discordAccount: User['discordAccount'] }> = ({discordAccount}) => {
    const avatarUrl = discordAccount?.discordId
        ? `https://cdn.discordapp.com/avatars/${discordAccount.discordId}/${discordAccount.avatar}.png`
        : null;

    return (
        <View style={styles.discordContent}>
            <View style={styles.discordUser}>
                {avatarUrl ? (
                    <Image
                        source={{uri: avatarUrl}}
                        style={styles.discordAvatar}
                    />
                ) : (
                    <View style={styles.discordAvatar}>
                        <UserIcon size={24} color="#748CAB"/>
                    </View>
                )}
                <View style={styles.discordUserInfo}>
                    <Text style={styles.discordUsername}>
                        {discordAccount?.username || 'Unknown'}
                    </Text>
                    <View style={styles.discordId}>
                        <Text style={styles.discordIdText}>ID: {discordAccount?.discordId || 'Unknown'}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

interface ExchangeAccount {
    id: number;
    name: string;
    provider: string;
    demo: boolean;
}

interface ExchangeCardProps {
    exchangeAccount: ExchangeAccount;
}

const ExchangeCard: React.FC<ExchangeCardProps> = ({exchangeAccount}) => {
    const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

    return (
        <TouchableOpacity
            style={styles.exchangeCard}
            onPress={() => navigation.navigate('ExchangeAccount', {accountId: exchangeAccount.id.toString()})}
        >
            <View style={styles.exchangeHeader}>
                <View style={styles.exchangeTitleContainer}>
                    <Text style={styles.providerText}>{exchangeAccount.provider}</Text>
                    <View style={[styles.accountTypeBadge, exchangeAccount.demo && styles.demoBadge]}>
                        <Text style={[styles.accountTypeText, exchangeAccount.demo && styles.demoBadgeText]}>
                            {exchangeAccount.demo ? 'Demo' : 'Live'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.accountName}>{exchangeAccount.name}</Text>
            </View>
        </TouchableOpacity>
    );
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

interface AddExchangeButtonProps {
    showAlert: (params: { title: string; message: string; type: 'info' }) => void;
    hasAccount: boolean;
}

const AddExchangeButton: React.FC<AddExchangeButtonProps> = ({showAlert, hasAccount}) => {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    
    const handleAddExchange = () => {
        if (hasAccount) {
            showAlert({
                title: 'Account Limit',
                message: 'Currently we can\'t add you another account, but we are working on it',
                type: 'info',
            });
            return;
        }
        navigation.navigate('AddExchange');
    };
    
    return (
        <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddExchange}
        >
            <View style={styles.addButtonContent}>
                <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
                <Text style={styles.addButtonText}>Add Exchange</Text>
            </View>
        </TouchableOpacity>
    );
};

const ConnectDiscordButton = () => {
    return (
        <TouchableOpacity
            style={styles.connectButton}
            onPress={() => {
                // TODO: Implement Discord connection logic
            }}
        >
            <View style={styles.connectButtonContent}>
                <Ionicons name="logo-discord" size={20} color="#5865F2"/>
                <Text style={styles.connectButtonText}>Connect Discord</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const {alert, showAlert, hideAlert} = useAlert();
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const {user: authUser} = useAuth();

    const fetchProfile = useCallback(async () => {
        try {
            const profile = await profileService.getMe();
            setUser(profile);
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load profile. Login in again.',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: fetchProfile,
        refreshDelay: 1000
    });

    useEffect(() => {
        if (!user) {
            fetchProfile();
        }
    }, []);

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';
    };

    const handleSettingsPress = () => {
        navigation.navigate('SettingsStack', {
            screen: 'Settings'
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0D1B2A"/>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <AlertCircle size={48} color="#DC2626"/>
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {getInitials(user.firstName, user.lastName)}
                            </Text>
                        </View>
                        <View style={styles.headerInfo}>
                            <Text style={styles.name}>
                                {user.firstName && user.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user.username}
                            </Text>
                            <View style={styles.userMetaContainer}>
                                <Text style={styles.username}>@{user.username}</Text>
                                <View style={styles.roleChip}>
                                    <Text style={styles.roleText}>{user.roles[0]}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusDot,
                                        {backgroundColor: user.enabled ? '#22C55E' : '#DC2626'}
                                    ]}
                                />
                            </View>
                        </View>
                        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
                            <Settings size={24} color="#3B82F6"/>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            tintColor="#3B82F6"
                            colors={["#3B82F6"]}
                        />
                    }
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <View style={styles.infoList}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Mail size={18} color="#748CAB" strokeWidth={1.5}/>
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{user.email || 'Not set'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Calendar size={18} color="#748CAB" strokeWidth={1.5}/>
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Member Since</Text>
                                    <Text style={styles.infoValue}>
                                        {format(new Date(user.registeredAt), 'MMMM d, yyyy')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>My Connections</Text>
                        <View style={styles.connectionsList}>
                            {user.discordAccount?.discordId ? (
                                <ConnectionCard
                                    provider="Discord"
                                    status="connected"
                                    onPress={() => {
                                    }}
                                >
                                    <DiscordConnection discordAccount={user.discordAccount}/>
                                </ConnectionCard>
                            ) : (
                                <ConnectDiscordButton/>
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Exchange Accounts</Text>
                        <View style={styles.connectionsList}>
                            {user.exchangeAccounts?.map((account: APIExchangeAccount, index: number) => {
                                if (!account.id || !account.name || !account.provider || account.demo === undefined) {
                                    return null;
                                }
                                return (
                                    <ExchangeCard
                                        key={`${account.name}-${index}`}
                                        exchangeAccount={{
                                            id: account.id,
                                            name: account.name,
                                            provider: account.provider,
                                            demo: account.demo
                                        }}
                                    />
                                );
                            })}
                            <AddExchangeButton 
                                showAlert={showAlert}
                                hasAccount={(user.exchangeAccounts?.length ?? 0) > 0}
                            />
                        </View>
                    </View>
                </ScrollView>
            </View>
            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        marginTop: Constants.statusBarHeight, //todo why? Refactor whole page later
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D1B2A',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D1B2A',
        padding: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#DC2626',
        marginVertical: 16,
        fontWeight: '500',
    },
    header: {
        marginBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingsButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#22314A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#22314A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    userMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    username: {
        fontSize: 14,
        color: '#748CAB',
        marginRight: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#748CAB',
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    infoIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#22314A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoList: {
        paddingVertical: 8,
        gap: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#748CAB',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    roleChip: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: '#22314A',
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    retryButton: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    connectionsList: {
        gap: 16,
    },
    connectionCard: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
    },
    connectionContent: {
        marginTop: 16,
    },
    connectionTitleContainer: {
        gap: 8,
    },
    connectionTitleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    connectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    providerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#748CAB',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    accountTypeBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    demoBadge: {
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
    },
    accountTypeText: {
        color: '#F59E0B',
        fontSize: 12,
        fontWeight: '600',
    },
    demoBadgeText: {
        color: '#14B8A6',
    },
    exchangeCard: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
    },
    exchangeHeader: {
        gap: 8,
    },
    exchangeTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    accountName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    discordContent: {
        gap: 8,
    },
    discordUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    discordAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#22314A',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    discordUserInfo: {
        flex: 1,
        gap: 4,
    },
    discordUsername: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    discordId: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    discordIdText: {
        fontSize: 12,
        color: '#748CAB',
    },
    providerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addButton: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
    },
    addButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    connectButton: {
        backgroundColor: '#1B263B',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#5865F2',
    },
    connectButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    connectButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});