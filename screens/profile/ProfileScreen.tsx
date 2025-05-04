import React, {useState, useEffect, useCallback} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl,
    Image,
    View,
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
import {ExchangeAccount as APIExchangeAccount} from '@/services/api/profile';
import DiscordLoginButton from '@/components/auth/DiscordLoginButton';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

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
    const { colors } = useTheme();
    
    const getProviderIcon = (provider?: string): { name: keyof typeof Ionicons.glyphMap; color: string } | null => {
        if (!provider) return null;
        switch (provider.toUpperCase()) {
            case 'DISCORD':
                return {name: 'logo-discord', color: '#5865F2'};
            case 'BYBIT':
            case 'BINANCE':
            default:
                return {name: 'wallet-outline', color: colors.textSecondary};
        }
    };

    const providerIcon = provider ? getProviderIcon(provider) : null;

    return (
        <TouchableOpacity onPress={onPress}>
            <ThemedView variant="card" rounded padding="medium" style={styles.connectionCard}>
                <View style={styles.connectionTitleContainer}>
                    {providerIcon && (
                        <View style={styles.providerHeader}>
                            <Ionicons
                                name={providerIcon.name}
                                size={16}
                                color={providerIcon.color}
                            />
                            <ThemedText variant="label" secondary style={styles.providerText}>{provider}</ThemedText>
                        </View>
                    )}
                    {title && (
                        <View style={styles.connectionTitleLeft}>
                            <ThemedText variant="bodyBold">{title}</ThemedText>
                            {isDemo && (
                                <ThemedView style={styles.demoBadge} rounded="small">
                                    <ThemedText variant="caption" color={colors.success} weight="600">DEMO</ThemedText>
                                </ThemedView>
                            )}
                        </View>
                    )}
                </View>
                {status === "connected" && children && (
                    <View style={styles.connectionContent}>
                        {children}
                    </View>
                )}
            </ThemedView>
        </TouchableOpacity>
    );
};

const DiscordConnection: React.FC<{ discordAccount: User['discordAccount'] }> = ({discordAccount}) => {
    const { colors } = useTheme();
    
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
                    <ThemedView variant="section" style={styles.discordAvatar} rounded="full">
                        <UserIcon size={24} color={colors.textSecondary}/>
                    </ThemedView>
                )}
                <View style={styles.discordUserInfo}>
                    <ThemedText variant="bodyBold">{discordAccount?.username || 'Unknown'}</ThemedText>
                    <View style={styles.discordId}>
                        <ThemedText variant="caption" secondary>ID: {discordAccount?.discordId || 'Unknown'}</ThemedText>
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
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('ExchangeAccount', {accountId: exchangeAccount.id.toString()})}
        >
            <ThemedView variant="card" rounded padding="medium">
                <View style={styles.exchangeHeader}>
                    <View style={styles.exchangeTitleContainer}>
                        <ThemedText variant="label" secondary style={styles.providerText}>{exchangeAccount.provider}</ThemedText>
                        <ThemedView 
                            rounded="small" 
                            style={{
                                ...styles.accountTypeBadge,
                                backgroundColor: exchangeAccount.demo ? `${colors.success}15` : `${colors.warning}15`
                            }}
                        >
                            <ThemedText 
                                variant="caption" 
                                weight="600" 
                                color={exchangeAccount.demo ? colors.success : colors.warning}
                            >
                                {exchangeAccount.demo ? 'Demo' : 'Live'}
                            </ThemedText>
                        </ThemedView>
                    </View>
                    <ThemedText variant="bodyBold">{exchangeAccount.name}</ThemedText>
                </View>
            </ThemedView>
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
    const { colors } = useTheme();
    
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
        <TouchableOpacity onPress={handleAddExchange}>
            <ThemedView variant="card" rounded padding="medium">
                <View style={styles.addButtonContent}>
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                    <ThemedText variant="bodyBold">Add Exchange</ThemedText>
                </View>
            </ThemedView>
        </TouchableOpacity>
    );
};

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const {alert, showAlert, hideAlert} = useAlert();
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    const { colors } = useTheme();

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
        return (firstName?.charAt(0) || "") + (lastName?.charAt(0) || "");
    };

    const handleSettingsPress = () => {
        navigation.navigate('SettingsStack', {
            screen: 'Settings' 
        });
    };

    if (isLoading) {
        return (
            <ThemedView variant="screen" style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary}/>
            </ThemedView>
        );
    }

    if (!user) {
        return (
            <ThemedView variant="screen" style={styles.errorContainer}>
                <AlertCircle size={50} color={colors.error}/>
                <ThemedText variant="bodyBold" color={colors.error} mt={16} mb={16}>Failed to load profile</ThemedText>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: colors.primary }]}
                    onPress={fetchProfile}
                >
                    <ThemedText variant="button" color={colors.buttonPrimaryText}>Retry</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <SafeAreaView style={[styles.safeArea, { marginTop: Constants.statusBarHeight }]}>
            <ThemedView variant="screen" style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <ThemedView variant="section" style={styles.avatar} rounded="full">
                            <ThemedText variant="heading1" size={24} color={colors.primary}>{getInitials(user.firstName, user.lastName)}</ThemedText>
                        </ThemedView>
                        <View style={styles.headerInfo}>
                            <ThemedText variant="heading2" size={22}>{`${user.firstName} ${user.lastName}`}</ThemedText>
                            <View style={styles.userMetaContainer}>
                                <ThemedText variant="bodySmall" secondary>@{user.username}</ThemedText>
                                <ThemedView
                                    style={{
                                        ...styles.statusDot,
                                        backgroundColor: user.enabled ? colors.success : colors.error
                                    }}
                                    rounded="full"
                                >
                                    <View />
                                </ThemedView>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={[styles.settingsButton, { backgroundColor: colors.backgroundTertiary }]} 
                            onPress={handleSettingsPress}
                            activeOpacity={0.7}
                        >
                            <Settings size={22} color={colors.primary}/>
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
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                >
                    <ThemedView style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle} mb={12}>PERSONAL INFORMATION</ThemedText>
                        <View style={styles.infoList}>
                            <View style={styles.infoRow}>
                                <Mail size={26} color={colors.textSecondary} strokeWidth={1.5} style={styles.infoIcon}/>
                                <View style={styles.infoContent}>
                                    <ThemedText variant="caption" secondary>Email</ThemedText>
                                    <ThemedText variant="bodyBold">{user.email || 'Not set'}</ThemedText>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Calendar size={26} color={colors.textSecondary} strokeWidth={1.5} style={styles.infoIcon}/>
                                <View style={styles.infoContent}>
                                    <ThemedText variant="caption" secondary>Member Since</ThemedText>
                                    <ThemedText variant="bodyBold">
                                        {format(new Date(user.registeredAt), 'MMMM d, yyyy')}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle} mb={12}>MY CONNECTIONS</ThemedText>
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
                                <DiscordLoginButton
                                    login={false}
                                />
                            )}
                        </View>
                    </ThemedView>

                    <ThemedView style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle} mb={12}>EXCHANGE ACCOUNTS</ThemedText>
                        <View style={styles.connectionsList}>
                            {user.exchangeAccounts?.map((account: APIExchangeAccount, index: number) => {
                                if (!account.id || !account.name || !account.provider) {
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
                    </ThemedView>
                </ScrollView>
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
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    headerInfo: {
        flex: 1,
    },
    userMetaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        textTransform: 'uppercase',
    },
    infoIcon: {
        marginRight: 16,
        marginTop: 4,
    },
    infoList: {
        paddingVertical: 12,
        gap: 28,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    infoContent: {
        flex: 1,
    },
    roleChip: {
        paddingHorizontal: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    connectionsList: {
        gap: 16,
    },
    connectionCard: {
        // styles will be provided by ThemedView
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
    providerText: {
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    accountTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    demoBadge: {
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    exchangeHeader: {
        gap: 8,
    },
    exchangeTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    discordUserInfo: {
        flex: 1,
        gap: 4,
    },
    discordId: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    providerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    addButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    connectButton: {
        backgroundColor: '#1B263B',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
    },
    connectButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
});