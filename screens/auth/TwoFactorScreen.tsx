import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Keyboard, TouchableWithoutFeedback, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '@/navigation/navigation';
import {ThemedView} from '@/components/ui/ThemedView';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedButton} from '@/components/ui/ThemedButton';
import {useAuth} from '@/contexts/AuthContext';
import {authService} from '@/services/api/auth';
import {usePushToken} from '@/contexts/PushTokenContext';
import CustomAlert, {useAlert} from '@/components/common/CustomAlert';
import {Shield} from 'lucide-react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {useTheme} from "@/contexts/ThemeContext";
import tinycolor from "tinycolor2";

const CELL_COUNT = 6;
const CELL_SIZE = 52;
const CELL_BORDER_RADIUS = 8;


interface RenderCellProps {
    index: number;
    symbol: string;
    isFocused: boolean;
}

export default function TwoFactorScreen() {
    const [codeTemp, setCodeTemp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const {alert, showAlert, hideAlert} = useAlert();

    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, 'TwoFactor'>>();
    const route = useRoute<RouteProp<AuthStackParamList, 'TwoFactor'>>();
    const {code: codeFromParams, name, email} = route.params;

    const {login} = useAuth();
    const {pushToken} = usePushToken();


    useEffect(() => {
        const extracted = codeFromParams.replace(/[^0-9]/g, '').slice(0, 6);
        if (extracted.length === 6) {
            setCodeTemp(extracted);
        }
        console.log('Code from params:', extracted, 'Name:', name, 'Email:', email, 'Push Token:', pushToken)
    }, [route.params]);

    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: codeTemp,
        setValue: setCodeTemp,
    });
    const {colors} = useTheme();

    const renderCell = ({index, symbol, isFocused}: RenderCellProps) => {
        return (
            <View
                key={index}
                style={[
                    styles.cell,
                    {
                        backgroundColor: symbol
                            ? tinycolor(colors.primary).lighten(15).toHexString() // filled cell color
                            : isFocused
                                ? tinycolor(colors.backgroundTertiary).darken(5).toHexString() // focused but empty
                                : tinycolor(colors.backgroundTertiary).lighten(5).toHexString(),// default empty
                    },
                ]}
                onLayout={getCellOnLayoutHandler(index)}>
                <ThemedText variant="heading2" style={styles.cellText}>
                    {symbol || (isFocused ? <Cursor/> : null)}
                </ThemedText>
            </View>
        );
    };

    const handleVerification = async (verificationCode: string) => {
        setIsLoading(true);
        try {
            const response = await authService.verifyOTP({
                email,
                code: verificationCode
            }, pushToken);
            if (!response.token) {
                console.error("No token returned from server.");
                return;
            }
            await login(response.token, response.user);
        } catch (error: any) {
            showAlert({
                title: 'Verification Failed',
                message: 'Invalid verification code. Please try again.',
                type: 'error',
            });
            setCodeTemp('');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (codeTemp.length === CELL_COUNT) {
            handleVerification(codeTemp);
        }
    }, [codeTemp]);

    return (
        <SafeAreaView style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ThemedView variant="screen" style={styles.content}>
                    <View style={styles.header}>
                        <Shield size={64} color="#3B82F6"/>
                        <ThemedText variant="heading1" centered mt={12} style={styles.title}>
                            Two-Factor Authentication
                        </ThemedText>
                        <View style={styles.greetingContainer}>
                            <ThemedText
                                variant="heading1"
                                centered
                                style={styles.greeting}
                            >
                                Hi,{' '}
                            </ThemedText>
                            <ThemedText
                                variant="heading1"
                                centered
                                style={[styles.greeting, styles.username] as any}
                            >
                                {name}
                            </ThemedText>
                            <ThemedText
                                variant="heading1"
                                centered
                                style={styles.greeting}
                            >
                                {" "}👋
                            </ThemedText>
                        </View>
                        <View style={styles.messageContainer}>
                            <ThemedText
                                variant="heading3"
                                secondary
                                style={styles.message}
                            >
                                Let's verify it's you.
                            </ThemedText>
                            <ThemedText
                                variant="heading3"
                                secondary
                                style={styles.message}
                            >
                                We've sent a code to your email.
                            </ThemedText>
                            <ThemedText
                                variant="bodyBold"
                                tertiary
                                mt={12}
                                style={styles.email}
                            >
                                {email}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.codeContainer}>
                        <CodeField
                            value={codeTemp}
                            onChangeText={setCodeTemp}
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            textContentType="oneTimeCode"
                            renderCell={renderCell}
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <ThemedButton
                            variant="primary"
                            fullWidth
                            loading={isLoading}
                            onPress={() => handleVerification(codeTemp)}
                        >
                            Verify
                        </ThemedButton>

                        <ThemedButton
                            variant="ghost"
                            onPress={() => navigation.goBack()}
                        >
                            Back to Login
                        </ThemedButton>
                    </View>
                </ThemedView>
            </TouchableWithoutFeedback>

            <CustomAlert
                {...alert}
                onClose={hideAlert}
                buttons={[
                    {
                        text: 'Try Again',
                        onPress: hideAlert,
                        style: 'default',
                    },
                ]}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'flex-start',
        paddingTop: '15%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 80,
        width: '100%',
    },
    title: {
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    greetingContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 22,
        width: '100%',
        maxWidth: 400,
        paddingHorizontal: 24,
    },
    greeting: {
        fontSize: 36,
        lineHeight: 44,
        letterSpacing: -1.0,
        fontWeight: '700',
    },
    username: {
        color: '#3B82F6',
    },
    messageContainer: {
        width: '100%',
        maxWidth: 400,
        marginTop: 16,
        paddingHorizontal: 24,
        marginBottom: 14,
    },
    message: {
        fontSize: 20,
        lineHeight: 28,
        letterSpacing: -0.2,
        fontWeight: '600',
        textAlign: 'left',
    },
    email: {
        letterSpacing: 0.2,
        fontWeight: '600',
        textAlign: 'left',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        maxWidth: 400,
        paddingHorizontal: 24,
        marginTop: -20,
    },
    codeFieldRoot: {
        height: CELL_SIZE,
        marginTop: 30,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    cell: {
        marginHorizontal: 4,
        height: CELL_SIZE,
        width: CELL_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: CELL_BORDER_RADIUS,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
    },
    cellText: {
        fontSize: 24,
        color: '#FFFFFF',
    },
    buttonContainer: {
        marginTop: 34,
        gap: 12,
    }
}); 