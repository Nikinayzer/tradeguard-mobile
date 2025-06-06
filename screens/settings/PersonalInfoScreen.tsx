import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import {Calendar, User, AlertCircle} from 'lucide-react-native';
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {SettingsStackParamList} from "@/navigation/navigation";
import {profileService, User as UserType, UserUpdateRequest} from '@/services/api/profile';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';
import {useFormValidation, ValidationRules} from '@/hooks/useFormValidation';
import {format} from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import {ThemedButton} from '@/components/ui/ThemedButton';
import tinycolor from 'tinycolor2';
import {Ionicons} from '@expo/vector-icons';

type PersonalInfoScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

type ValidationErrors = {
    email?: string;
    firstName?: string;
    lastName?: string;
};

export default function PersonalInfoScreen() {
    const [user, setUser] = useState<UserType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();
    const navigation = useNavigation<PersonalInfoScreenNavigationProp>();
    const { colors } = useTheme();

    const validationRules: ValidationRules<UserUpdateRequest> = {
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        firstName: {
            required: true,
            minLength: 3,
            maxLength: 50,
            message: 'First name must be between 3 and 50 characters'
        },
        lastName: {
            required: true,
            minLength: 3,
            maxLength: 50,
            message: 'Last name must be between 3 and 50 characters'
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
    } = useFormValidation<UserUpdateRequest>(
        {
            email: '',
            firstName: '',
            lastName: '',
        },
        validationRules
    );

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
        }
    }, [user, setFormData]);

    const fetchProfile = async () => {
        try {
            const profile = await profileService.getMe();
            setUser(profile);
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load profile. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            showAlert({
                type: 'error',
                title: 'Validation Error',
                message: 'Please fill in all required fields correctly',
            });
            return;
        }

        try {
            setIsSaving(true);
            await profileService.updateMe({
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
            });
            const updatedProfile = await profileService.getMe();
            setUser(updatedProfile);
            showAlert({
                type: 'success',
                title: 'Success',
                message: 'Profile updated successfully',
            });
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to update profile',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <ThemedView variant="screen" style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary}/>
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <ThemedView variant="screen" style={styles.errorContainer}>
                    <AlertCircle size={50} color={colors.error} />
                    <ThemedText variant="bodyBold" color={colors.error} mt={16} mb={16}>
                        Failed to load profile
                    </ThemedText>
                    <TouchableOpacity 
                        style={{
                            ...styles.retryButton,
                            backgroundColor: colors.primary
                        }}
                        onPress={fetchProfile}
                    >
                        <ThemedText variant="button" color={colors.buttonPrimaryText}>
                            Retry
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
            <ThemedView variant="screen" style={styles.container}>
                <ThemedHeader
                    title="Personal Information"
                    canGoBack
                    onBack={() => navigation.goBack()}
                />

                <ScrollView 
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContentContainer}
                >
                    <ThemedView variant="transparent" style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle} mb={12}>
                            PROFILE DETAILS
                        </ThemedText>
                        <ThemedView variant="transparent" style={styles.form}>
                            <ThemedView variant="transparent" style={styles.inputContainer}>
                                <ThemedText variant="label" secondary style={styles.inputLabel}>First Name</ThemedText>
                                <View style={[
                                    styles.input,
                                    {
                                        backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString()
                                    },
                                    errors.firstName ? {borderColor: colors.error} : {}
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
                                        value={formData.firstName}
                                        onChangeText={(text) => handleChange('firstName', text)}
                                        onBlur={() => handleBlur('firstName')}
                                        placeholder="Enter your first name"
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                                {errors.firstName && (
                                    <ThemedText variant="caption" color={colors.error}
                                                style={styles.errorText}>{errors.firstName}</ThemedText>
                                )}
                            </ThemedView>

                            <ThemedView variant="transparent" style={styles.inputContainer}>
                                <ThemedText variant="label" secondary style={styles.inputLabel}>Last Name</ThemedText>
                                <View style={[
                                    styles.input,
                                    {
                                        backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString()
                                    },
                                    errors.lastName ? {borderColor: colors.error} : {}
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
                                        value={formData.lastName}
                                        onChangeText={(text) => handleChange('lastName', text)}
                                        onBlur={() => handleBlur('lastName')}
                                        placeholder="Enter your last name"
                                        placeholderTextColor="#748CAB"
                                    />
                                </View>
                                {errors.lastName && (
                                    <ThemedText variant="caption" color={colors.error}
                                                style={styles.errorText}>{errors.lastName}</ThemedText>
                                )}
                            </ThemedView>

                            <ThemedView variant="transparent" style={styles.inputContainer}>
                                <ThemedText variant="label" secondary style={styles.inputLabel}>Email</ThemedText>
                                <View style={[
                                    styles.input,
                                    {
                                        backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString()
                                    },
                                    errors.email ? {borderColor: colors.error} : {}
                                ]}>
                                    <Ionicons
                                        name="mail-outline"
                                        size={20}
                                        color="#748CAB"
                                        style={styles.inputIcon}
                                    />
                                    <TextInput
                                        style={{
                                            ...styles.inputText,
                                            color: colors.text
                                        }}
                                        value={formData.email}
                                        onChangeText={(text) => handleChange('email', text)}
                                        onBlur={() => handleBlur('email')}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#748CAB"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>
                                {errors.email && (
                                    <ThemedText variant="caption" color={colors.error}
                                                style={styles.errorText}>{errors.email}</ThemedText>
                                )}
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView variant="transparent" style={styles.section}>
                        <ThemedText variant="label" secondary style={styles.sectionTitle} mb={12}>
                            ACCOUNT INFORMATION
                        </ThemedText>
                        <View style={styles.infoList}>
                            <View style={styles.infoRow}>
                                <User size={26} color={colors.textSecondary} strokeWidth={1.5} style={styles.infoIcon}/>
                                <View style={styles.infoContent}>
                                    <ThemedText variant="caption" secondary>
                                        Username
                                    </ThemedText>
                                    <ThemedText variant="bodyBold">
                                        @{user.username}
                                    </ThemedText>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Calendar size={26} color={colors.textSecondary} strokeWidth={1.5} style={styles.infoIcon}/>
                                <View style={styles.infoContent}>
                                    <ThemedText variant="caption" secondary>
                                        Member Since
                                    </ThemedText>
                                    <ThemedText variant="bodyBold">
                                        {format(new Date(user.registeredAt), 'MMMM d, yyyy')}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    </ThemedView>

                    <TouchableOpacity 
                        style={{
                            ...styles.saveButton, 
                            backgroundColor: colors.primary,
                            ...(isSaving && styles.saveButtonDisabled)
                        }}
                        onPress={handleSave}
                        disabled={isSaving}
                        activeOpacity={0.7}
                    >
                        {isSaving ? (
                            <ActivityIndicator color={colors.buttonPrimaryText} size="small"/>
                        ) : (
                            <ThemedText variant="button" color={colors.buttonPrimaryText}>
                                Save Changes
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </ThemedView>
            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
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
    scrollContentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        letterSpacing: 1,
    },
    form: {
        gap: 16,
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
    errorText: {
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
    infoIcon: {
        marginRight: 16,
        marginTop: 4,
    },
    infoContent: {
        flex: 1,
    },
    retryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
}); 