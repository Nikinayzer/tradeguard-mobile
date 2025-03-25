import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import {ChevronLeft, Mail, Calendar} from 'lucide-react-native';
import {useNavigation} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {SettingsStackParamList} from "@/navigation/navigation";
import {profileService, User, UserUpdateRequest} from '@/services/api/profile';
import {useAlert} from '@/components/common/CustomAlert';
import CustomAlert from '@/components/common/CustomAlert';
import {useFormValidation, ValidationRules} from '@/hooks/useFormValidation';
import {format} from 'date-fns';

type PersonalInfoScreenNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;

type ValidationErrors = {
    email?: string;
    firstName?: string;
    lastName?: string;
};

export default function PersonalInfoScreen() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();
    const navigation = useNavigation<PersonalInfoScreenNavigationProp>();

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
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0D1B2A"/>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.errorContainer}>
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
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <ChevronLeft size={24} color="#3B82F6"/>
                    </TouchableOpacity>
                    <Text style={styles.title}>Personal Information</Text>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Profile Details</Text>
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
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Account Information</Text>
                        <View style={styles.infoList}>
                            <View style={styles.infoRow}>
                                <View style={styles.infoIcon}>
                                    <Mail size={18} color="#748CAB" strokeWidth={1.5}/>
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Username</Text>
                                    <Text style={styles.infoValue}>@{user.username}</Text>
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

                    <TouchableOpacity 
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
                        onPress={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="white" size="small"/>
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
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
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#22314A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        flex: 1,
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
    inputError: {
        borderColor: '#DC2626',
    },
    infoList: {
        paddingVertical: 8,
        gap: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    saveButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
}); 