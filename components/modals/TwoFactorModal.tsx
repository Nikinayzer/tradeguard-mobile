import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Shield } from 'lucide-react-native';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import { useTheme } from "@/contexts/ThemeContext";
import tinycolor from "tinycolor2";
import BaseModal from './BaseModal';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';
import CustomAlert, { useAlert } from '@/components/common/CustomAlert';

const CELL_COUNT = 6;
const CELL_SIZE = 40;
const CELL_BORDER_RADIUS = 8;

interface TwoFactorModalProps {
    visible: boolean;
    onClose: () => void;
    onVerify: (code: string) => Promise<void>;
    email: string;
    name: string;
    isLoading?: boolean;
}

interface RenderCellProps {
    index: number;
    symbol: string;
    isFocused: boolean;
}

export default function TwoFactorModal({
    visible,
    onClose,
    onVerify,
    email,
    name,
    isLoading = false,
}: TwoFactorModalProps) {
    const [codeTemp, setCodeTemp] = useState('');
    const { alert, showAlert, hideAlert } = useAlert();
    const { colors } = useTheme();

    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value: codeTemp,
        setValue: setCodeTemp,
    });

    const renderCell = ({ index, symbol, isFocused }: RenderCellProps) => {
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
                    {symbol || (isFocused ? <Cursor /> : null)}
                </ThemedText>
            </View>
        );
    };

    const handleVerification = async (verificationCode: string) => {
        try {
            await onVerify(verificationCode);
            setCodeTemp('');
        } catch (error: any) {
            showAlert({
                title: 'Verification Failed',
                message: 'Invalid verification code. Please try again.',
                type: 'error',
            });
            setCodeTemp('');
        }
    };

    useEffect(() => {
        if (codeTemp.length === CELL_COUNT) {
            handleVerification(codeTemp);
        }
    }, [codeTemp]);

    return (
        <BaseModal
            visible={visible}
            onClose={onClose}
            type="info"
            showCloseButton={true}
            isLoading={isLoading}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.messageContainer}>
                            <ThemedText
                                variant="heading3"
                                secondary
                                style={styles.message}
                            >
                                Please enter the code we sent to
                            </ThemedText>
                            <ThemedText
                                variant="bodyBold"
                                tertiary
                                mt={8}
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
                            onPress={onClose}
                        >
                            Cancel
                        </ThemedButton>
                    </View>
                </View>
            </TouchableWithoutFeedback>

            {alert && <CustomAlert {...alert} onClose={hideAlert} />}
        </BaseModal>
    );
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    messageContainer: {
        width: '100%',
        maxWidth: 400,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    message: {
        fontSize: 18,
        lineHeight: 26,
        letterSpacing: -0.2,
        fontWeight: '600',
        textAlign: 'center',
    },
    email: {
        letterSpacing: 0.2,
        fontWeight: '600',
        textAlign: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        width: '100%',
        maxWidth: 400,
        paddingHorizontal: 24,
        marginTop: 8,
    },
    codeFieldRoot: {
        height: CELL_SIZE,
        marginTop: 20,
        paddingHorizontal: 12,
        justifyContent: 'center',
    },
    cell: {
        marginHorizontal: 3,
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
        fontSize: 20,
        color: '#FFFFFF',
    },
    buttonContainer: {
        marginTop: 28,
        gap: 12,
    }
}); 