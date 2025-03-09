import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    RefreshControl,
} from 'react-native';

import {format} from 'date-fns';
import {profileService, User, UserUpdateRequest} from '@/services/api/profile';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import {
    Mail,
    Edit,
    Check,
    X,
    AlertCircle,
    Calendar,
    Settings
} from 'lucide-react-native';
import {useNavigation} from "@react-navigation/native";
import {ProfileStackParamList} from "@/types/navigation";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {useFormValidation, ValidationRules} from '@/hooks/useFormValidation';

type LoginScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

type ValidationErrors = {
    email?: string;
    firstName?: string;
    lastName?: string;
};

export default function ProfileScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();
    const navigation = useNavigation<LoginScreenNavigationProp>();

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

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            });
        }
    }, [user, setFormData]);

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
            setIsEditing(false);
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
            <StatusBar barStyle="light-content"/>
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
                                {!isEditing && (
                                    <TouchableOpacity
                                        style={styles.editButton}
                                        onPress={() => setIsEditing(true)}
                                    >
                                        <Edit size={16} color="#3B82F6" strokeWidth={1.5}/>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
                            <Settings size={24} color="#3B82F6"/>
                        </TouchableOpacity>
                    </View>

                    {isEditing && (
                        <View style={styles.editActions}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        email: user.email,
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                    });
                                }}
                            >
                                <X size={18} color="#fff"/>
                                <Text style={styles.actionButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.saveButton]}
                                onPress={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" size="small"/>
                                ) : (
                                    <>
                                        <Check size={18} color="#fff"/>
                                        <Text style={styles.actionButtonText}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
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

                        {isEditing ? (
                            <View style={styles.form}>
                                <View style={styles.formField}>
                                    <Text style={styles.label}>First Name</Text>
                                    <TextInput
                                        style={[styles.input, touchedFields.firstName && errors.firstName && styles.inputError]}
                                        value={formData.firstName}
                                        onChangeText={(text) => handleChange('firstName', text)}
                                        onBlur={() => handleBlur('firstName')}
                                        placeholder="Enter first name"
                                        placeholderTextColor="#748CAB"
                                        maxLength={50}
                                    />
                                    {touchedFields.firstName && errors.firstName && (
                                        <Text style={styles.errorText}>{errors.firstName}</Text>
                                    )}
                                </View>
                                <View style={styles.formField}>
                                    <Text style={styles.label}>Last Name</Text>
                                    <TextInput
                                        style={[styles.input, touchedFields.lastName && errors.lastName && styles.inputError]}
                                        value={formData.lastName}
                                        onChangeText={(text) => handleChange('lastName', text)}
                                        onBlur={() => handleBlur('lastName')}
                                        placeholder="Enter last name"
                                        placeholderTextColor="#748CAB"
                                        maxLength={50}
                                    />
                                    {touchedFields.lastName && errors.lastName && (
                                        <Text style={styles.errorText}>{errors.lastName}</Text>
                                    )}
                                </View>
                                <View style={styles.formField}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={[styles.input, touchedFields.email && errors.email && styles.inputError]}
                                        value={formData.email}
                                        onChangeText={(text) => handleChange('email', text)}
                                        onBlur={() => handleBlur('email')}
                                        placeholder="Enter email"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholderTextColor="#748CAB"
                                    />
                                    {touchedFields.email && errors.email && (
                                        <Text style={styles.errorText}>{errors.email}</Text>
                                    )}
                                </View>
                            </View>
                        ) : (
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
                        )}
                    </View>
                </ScrollView>
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
    editButton: {
        padding: 4,
    },
    editActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 8,
    },
    saveButton: {
        backgroundColor: '#3B82F6',
    },
    cancelButton: {
        backgroundColor: '#22314A',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
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
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1B263B',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
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
    menuContent: {
        flex: 1,
    },
    menuText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 4,
    },
    menuDescription: {
        fontSize: 14,
        color: '#748CAB',
    },
    form: {
        gap: 16,
    },
    formField: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#748CAB',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#22314A',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: 'white',
        backgroundColor: '#1B263B',
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
    inputError: {
        borderColor: '#DC2626',
    }
});