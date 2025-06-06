import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { SettingsStackParamList } from "@/navigation/navigation";
import { ThemedView } from "@/components/ui/ThemedView";
import { ThemedText } from "@/components/ui/ThemedText";
import { ThemedHeader } from "@/components/ui/ThemedHeader";
import { useTheme } from "@/contexts/ThemeContext";
import { Shield, Mail, MessageSquare, Lock, Key, Fingerprint, ChevronRight } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import CustomAlert, { useAlert } from "@/components/common/CustomAlert";
import { profileService } from "@/services/api/profile";
import PasswordChangeModal from "@/components/modals/PasswordChangeModal";
import TwoFactorModal from "@/components/modals/TwoFactorModal";
import { authApiService } from "@/services/api/auth";
import { useBiometricAuthContext } from '@/contexts/BiometricAuthContext';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

type SecurityScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

interface ToggleProps {
    value: boolean;
    onChange: (value: boolean) => void;
}

function Toggle({value, onChange}: ToggleProps) {
    const { colors } = useTheme();
    
    return (
        <TouchableOpacity
            onPress={() => onChange(!value)}
            activeOpacity={0.8}
            style={styles.toggleButtonContainer}
        >
            <View
                style={[
                    styles.toggleButton, 
                    { 
                        backgroundColor: value ? 
                            colors.primary : 
                            colors.backgroundTertiary 
                    }
                ]}
            >
                <View style={[
                    styles.toggleHandle, 
                    { backgroundColor: colors.buttonPrimaryText },
                    value ? styles.toggleHandleActive : styles.toggleHandleInactive
                ]}/>
            </View>
        </TouchableOpacity>
    );
}

export default function SecuritySettingsScreen() {
    const navigation = useNavigation<SecurityScreenNavigationProp>();
    const { colors } = useTheme();
    const { user, login } = useAuth();
    const { alert, showAlert, hideAlert } = useAlert();
    const { isBiometricEnabled, enableBiometric, disableBiometric } = useBiometricAuthContext();
    const { isBiometricAvailable, isBiometricEnrolled } = useBiometricAuth();
    
    const [isLoading, setIsLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [pendingPasswordChange, setPendingPasswordChange] = useState<{
        email?: string;
        newPassword: string;
    } | null>(null);
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: false,
        emailNotifications: true,
        smsNotifications: false,
        biometricAuth: false,
    });

    useEffect(() => {
        fetchSecuritySettings();
    }, []);

    const fetchSecuritySettings = async () => {
        try {
            setIsLoading(true);
            const settings = await profileService.getSecuritySettings();
            setSecuritySettings(prev => ({
                ...prev,
                twoFactorAuth: settings.twoFactorEnabled
            }));
        } catch (error) {
            showAlert({
                title: "Error",
                message: "Failed to load security settings. Please try again.",
                type: "error",
                buttons: [{ text: "OK", onPress: () => {} }]
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSetting = (key: keyof typeof securitySettings) => {
        setSecuritySettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleTwoFactorToggle = () => {
        const newValue = !securitySettings.twoFactorAuth;
        showAlert({
            title: newValue ? "Enable Two-Factor Authentication" : "Disable Two-Factor Authentication",
            message: newValue 
                ? "Are you sure you want to enable two-factor authentication? You will need to enter a verification code sent to your email each time you log in."
                : "Are you sure you want to disable two-factor authentication? This will make your account less secure.",
            type: "warning",
            buttons: [
                {
                    text: "Cancel",
                    onPress: () => {},
                    style: "cancel"
                },
                {
                    text: newValue ? "Enable" : "Disable",
                    onPress: async () => {
                        try {
                            await profileService.updateSecuritySettings({
                                twoFactorEnabled: newValue
                            });
                            setSecuritySettings(prev => ({
                                ...prev,
                                twoFactorAuth: newValue
                            }));
                            showAlert({
                                title: "Success",
                                message: `Two-factor authentication has been ${newValue ? 'enabled' : 'disabled'}.`,
                                type: "success",
                                buttons: [{ text: "OK", onPress: () => {} }]
                            });
                        } catch (error) {
                            showAlert({
                                title: "Error",
                                message: "Failed to update security settings. Please try again.",
                                type: "error",
                                buttons: [{ text: "OK", onPress: () => {} }]
                            });
                        }
                    },
                    style: newValue ? "default" : "destructive"
                }
            ]
        });
    };

    const handlePasswordChange = async (data: {
        email?: string;
        password: string;
        confirmPassword: string;
    }) => {
        try {
            // First, request password change
            await authApiService.requestPasswordChange({
                email: data.email || user?.email || ''
            });
            
            // Store the data for later use after 2FA
            setPendingPasswordChange({
                email: data.email || user?.email,
                newPassword: data.password
            });
            
            // Close password modal and show 2FA modal
            setShowPasswordModal(false);
            setShowTwoFactorModal(true);
        } catch (error) {
            showAlert({
                title: "Error",
                message: "Failed to initiate password change. Please try again.",
                type: "error",
                buttons: [{ text: "OK", onPress: () => {} }]
            });
        }
    };

    const handleTwoFactorVerify = async (code: string) => {
        if (!pendingPasswordChange) return;
        
        try {
            const response = await authApiService.verifyPasswordChange({
                code,
                email: pendingPasswordChange.email || '',
                newPassword: pendingPasswordChange.newPassword
            });
            
            // Update the token with the new one
            if (response.token) {
                await login(response.token, response.user);
            }
            
            showAlert({
                title: "Success",
                message: "Your password has been changed successfully.",
                type: "success",
                buttons: [{ text: "OK", onPress: () => {} }]
            });
            
            // Reset state
            setShowTwoFactorModal(false);
            setPendingPasswordChange(null);
        } catch (error) {
            showAlert({
                title: "Error",
                message: "Failed to change password. Please try again.",
                type: "error",
                buttons: [{ text: "OK", onPress: () => {} }]
            });
        }
    };

    const handleBiometricToggle = async () => {
        try {
            if (isBiometricEnabled) {
                disableBiometric();
                showAlert({
                    title: "Success",
                    message: "Biometric authentication has been disabled.",
                    type: "success",
                    buttons: [{ text: "OK", onPress: () => {} }]
                });
            } else {
                await enableBiometric();
                showAlert({
                    title: "Success",
                    message: "Biometric authentication has been enabled.",
                    type: "success",
                    buttons: [{ text: "OK", onPress: () => {} }]
                });
            }
        } catch (error: any) {
            showAlert({
                title: "Error",
                message: error.message || "Failed to update biometric settings.",
                type: "error",
                buttons: [{ text: "OK", onPress: () => {} }]
            });
        }
    };

    const renderMenuItem = (
        title: string,
        description: string | React.ReactNode,
        icon: React.ReactNode,
        value: boolean,
        onChange: () => void,
        isDisabled?: boolean
    ) => (
        <ThemedView
            variant="card"
            style={[
                styles.menuItem,
                isDisabled ? { opacity: 0.6 } : null
            ] as any}
            border
            rounded="medium"
            padding="medium"
        >
            {/* Icon Column */}
            <View style={styles.iconColumn}>
                {React.cloneElement(icon as React.ReactElement, {
                    size: 20,
                    color: colors.primary,
                    strokeWidth: 2
                })}
            </View>

            {/* Content Column */}
            <View style={styles.contentColumn}>
                <ThemedText variant="bodyBold">{title}</ThemedText>
                {typeof description === 'string' ? (
                    <ThemedText variant="caption" secondary>{description}</ThemedText>
                ) : description}
            </View>

            {/* Action Column */}
            <View style={styles.actionColumn}>
                {isDisabled ? (
                    <Lock size={18} color={colors.textTertiary} />
                ) : (
                    <Toggle value={value} onChange={onChange} />
                )}
            </View>
        </ThemedView>
    );

    const renderActionItem = (
        title: string,
        description: string,
        icon: React.ReactNode,
        onPress: () => void
    ) => (
                    <TouchableOpacity 
            onPress={onPress}
            activeOpacity={0.7}
        >
            <ThemedView
                variant="card"
                style={styles.menuItem}
                border
                rounded="medium"
                padding="medium"
            >
                {/* Icon Column */}
                <View style={styles.iconColumn}>
                    {React.cloneElement(icon as React.ReactElement, {
                        size: 20,
                        color: colors.primary,
                        strokeWidth: 2
                    })}
                </View>

                {/* Content Column */}
                <View style={styles.contentColumn}>
                    <ThemedText variant="bodyBold">{title}</ThemedText>
                    <ThemedText variant="caption" secondary>{description}</ThemedText>
                    </View>

                {/* Action Column */}
                <View style={styles.actionColumn}>
                    <ChevronRight size={20} color={colors.textTertiary} />
                </View>
            </ThemedView>
                        </TouchableOpacity>
    );

    return (
        <ThemedView variant="screen" style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <ThemedHeader
                    title="Security"
                    canGoBack={true}
                    onBack={() => navigation.goBack()}
                />

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <ScrollView 
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Authentication Section */}
                        <View style={styles.section}>
                            <ThemedText variant="label" secondary style={styles.sectionTitle}>
                                AUTHENTICATION
                            </ThemedText>
                            
                            {renderActionItem(
                                "Change Password",
                                "Update your account password",
                                <Key />,
                                () => setShowPasswordModal(true)
                            )}
                            
                            {renderMenuItem(
                                "Two-Factor Authentication",
                                "Receive verification codes via email for login",
                                <Shield />,
                                securitySettings.twoFactorAuth,
                                handleTwoFactorToggle
                            )}

                            {renderMenuItem(
                                "Biometric Authentication",
                                isBiometricAvailable && isBiometricEnrolled 
                                    ? "Use fingerprint or face ID to unlock the app"
                                    : "Biometric authentication is not available on this device",
                                <Fingerprint />,
                                isBiometricEnabled,
                                handleBiometricToggle,
                                !isBiometricAvailable || !isBiometricEnrolled
                            )}
                        </View>

                        {/* Notifications Section */}
                    <View style={styles.section}>
                            <ThemedText variant="label" secondary style={styles.sectionTitle}>
                                SECURITY NOTIFICATIONS
                            </ThemedText>
                            
                            {renderMenuItem(
                                "Email Notifications",
                                `Receive security alerts via email${user?.email ? ` (${user.email})` : ''}`,
                                <Mail />,
                                securitySettings.emailNotifications,
                                () => toggleSetting('emailNotifications'),
                                true
                            )}
                            
                            {renderMenuItem(
                                "SMS Notifications",
                                "Receive security alerts via SMS",
                                <MessageSquare />,
                                securitySettings.smsNotifications,
                                () => toggleSetting('smsNotifications'),
                                true
                            )}
                    </View>
                </ScrollView>
                )}
        </SafeAreaView>

            {alert && <CustomAlert {...alert} onClose={hideAlert} />}

            <PasswordChangeModal
                visible={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={handlePasswordChange}
                showEmail={false}
                isLoading={false}
            />

            <TwoFactorModal
                visible={showTwoFactorModal}
                onClose={() => {
                    setShowTwoFactorModal(false);
                    setPendingPasswordChange(null);
                }}
                onVerify={handleTwoFactorVerify}
                email={pendingPasswordChange?.email || user?.email || ''}
                name={user?.firstName || ''}
                isLoading={false}
            />
        </ThemedView>
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
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 12,
        textTransform: "uppercase",
        paddingLeft: 4,
        letterSpacing: 1,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    iconColumn: {
        width: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    contentColumn: {
        flex: 1,
        marginHorizontal: 12,
    },
    actionColumn: {
        width: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    toggleButtonContainer: {
        padding: 4,
    },
    toggleButton: {
        width: 44,
        height: 26,
        borderRadius: 13,
        padding: 2,
    },
    toggleHandle: {
        width: 22,
        height: 22,
        borderRadius: 11,
    },
    toggleHandleActive: {
        transform: [{translateX: 18}],
    },
    toggleHandleInactive: {
        transform: [{translateX: 0}],
    },
    descriptionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 