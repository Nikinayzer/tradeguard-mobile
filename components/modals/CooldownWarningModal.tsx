import React, { useState } from 'react';
import CooldownModal from './CooldownModal';
import { useTheme } from '@/contexts/ThemeContext';

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
    const { colors } = useTheme();

    const handleClose = () => {
        setIsButtonEnabled(false);
        onClose();
    };

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        handleClose();
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
            onButtonPress={handleConfirm}
            isButtonEnabled={isButtonEnabled}
        />
    );
};

export default CooldownWarningModal; 