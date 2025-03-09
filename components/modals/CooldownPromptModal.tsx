import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import CooldownModal from './CooldownModal';

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

    const handleClose = () => {
        setIsButtonEnabled(false);
        setJustification('');
        onClose();
    };

    const handleSubmit = () => {
        if (justification.trim()) {
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
            onComplete={() => setIsButtonEnabled(true)}
            buttonText={isButtonEnabled ? 'Proceed' : 'Please wait'}
            onButtonPress={handleSubmit}
            isButtonEnabled={isButtonEnabled}
            isLoading={isSubmitting}
        >
            <View style={styles.promptContainer}>
                <Text style={styles.promptLabel}>{promptText}</Text>
                <TextInput
                    style={styles.input}
                    value={justification}
                    onChangeText={setJustification}
                    placeholder="Enter your justification..."
                    placeholderTextColor="#748CAB"
                    multiline
                    numberOfLines={3}
                    editable={isTextEnabled}
                />
            </View>
        </CooldownModal>
    );
};

const styles = StyleSheet.create({
    promptContainer: {
        width: '100%',
        marginVertical: 16,
    },
    promptLabel: {
        color: '#E2E8F0',
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#22314A',
        borderRadius: 8,
        padding: 12,
        color: '#E2E8F0',
        fontSize: 14,
        textAlignVertical: 'top',
        minHeight: 80,
    },
});

export default CooldownPromptModal; 