import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import CooldownModal from './CooldownModal';

interface CooldownWarningModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message: string;
    cooldownSeconds: number;
    onConfirm?: () => void;
}

const CooldownWarningModal: React.FC<CooldownWarningModalProps> = ({
    visible,
    onClose,
    title,
    message,
    cooldownSeconds,
    onConfirm,
}) => {
    const [isButtonEnabled, setIsButtonEnabled] = useState(false);

    const handleClose = () => {
        setIsButtonEnabled(false);
        onClose();
    };

    return (
        <CooldownModal
            visible={visible}
            onClose={handleClose}
            title={title}
            message={message}
            cooldownSeconds={cooldownSeconds}
            onComplete={() => setIsButtonEnabled(true)}
            buttonText={isButtonEnabled ? 'Close' : 'Please wait'}
            onButtonPress={handleClose}
            isButtonEnabled={isButtonEnabled}
            showCloseButton={true}
        />
    );
};

export default CooldownWarningModal; 