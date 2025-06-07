import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import CooldownModal from './CooldownModal';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import tinycolor from 'tinycolor2';

interface CooldownPromptModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    cooldownSeconds: number;
    promptText: string;
    onConfirm: (justification: string) => void;
}

const CooldownPromptModal: React.FC<CooldownPromptModalProps> = ({
    visible,
    onClose,
    title,
    message,
    cooldownSeconds,
    promptText,
    onConfirm,
}) => {
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);
    const [isTextEnabled, setIsTextEnabled] = useState(true);
    const [justification, setJustification] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { colors } = useTheme();

    useEffect(() => {
        setIsButtonEnabled(justification.trim().length >= 10);
    }, [justification]);

    const handleClose = () => {
        setIsButtonEnabled(false);
        setJustification('');
        onClose();
    };

    const handleSubmit = () => {
        if (justification.trim().length >= 10) {
            setIsSubmitting(true);
            onConfirm(justification);
            handleClose();
        }
    };

    return (
        <CooldownModal
            visible={visible}
            onClose={handleClose}
            title={title}
            message={message}
            cooldownSeconds={cooldownSeconds}
            onComplete={() => setIsTextEnabled(true)}
            buttonText={isButtonEnabled ? 'Proceed' : justification.trim().length < 10 ? 'Please provide a detailed justification' : 'Please wait'}
            onButtonPress={handleSubmit}
            isButtonEnabled={isButtonEnabled}
            isLoading={isSubmitting}
        >
            <View style={styles.promptContainer}>
                <View style={[styles.inputContainer, { 
                    backgroundColor: tinycolor(colors.backgroundTertiary).lighten(5).toHexString(),
                }]}>
                    <TextInput
                        value={justification}
                        onChangeText={setJustification}
                        placeholder={promptText}
                        placeholderTextColor="#748CAB"
                        multiline
                        numberOfLines={3}
                        editable={isTextEnabled}
                        style={[styles.inputText, { color: colors.text }]}
                        textAlignVertical="top"
                    />
                </View>
            </View>
        </CooldownModal>
    );
};

const styles = StyleSheet.create({
    promptContainer: {
        width: '100%',
        marginVertical: 8,
    },
    inputContainer: {
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        padding: 16,
        minHeight: 120,
    },
});

export default CooldownPromptModal; 