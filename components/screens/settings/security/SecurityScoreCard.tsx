import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { ShieldCheck, Shield, Fingerprint, CheckCircle2, Circle, Key } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import tinycolor from 'tinycolor2';

interface SecurityScoreCardProps {
    twoFactorEnabled: boolean;
    biometricEnabled: boolean;
    lastPasswordChangeDate?: string;
}

export function SecurityScoreCard({ 
    twoFactorEnabled, 
    biometricEnabled,
    lastPasswordChangeDate 
}: SecurityScoreCardProps) {
    const { colors } = useTheme();
    
    const calculateSecurityScore = () => {
        let score = 50;

        if (twoFactorEnabled) score += 30;
        if (biometricEnabled) score += 20;

        if (lastPasswordChangeDate) {
            const lastChange = new Date(lastPasswordChangeDate);
            const now = new Date();
            const monthsSinceChange = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24 * 30);

            if (monthsSinceChange > 12) {
                score = Math.max(score - 20, 0);
            }
        }

        return Math.min(score, 100);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22C55E';
        if (score >= 50) return '#F59E0B';
        return '#EF4444';
    };

    const getScoreMessage = (score: number) => {
        if (score >= 80) return "Excellent Security";
        if (score >= 50) return "Needs Enhancement";
        return "Needs Improvement";
    };

    const getScoreDescription = (score: number) => {
        if (score >= 80) return "Your account is well protected with multiple security layers";
        if (score >= 50) return "Enable additional security features to better protect your account";
        return "Your account needs additional security measures";
    };

    const isPasswordFresh = () => {
        if (!lastPasswordChangeDate) return false;
        const lastChange = new Date(lastPasswordChangeDate);
        const now = new Date();
        const monthsSinceChange = (now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsSinceChange <= 12;
    };

    const formatLastPasswordChange = () => {
        if (!lastPasswordChangeDate) return "Never changed";
        const lastChange = new Date(lastPasswordChangeDate);
        return `Changed on ${lastChange.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    };

    const score = calculateSecurityScore();
    const scoreColor = getScoreColor(score);

    return (
        <ThemedView
            variant="card"
            style={styles.securityScoreCard}
            rounded="large"
            padding="large"
        >
            <View style={styles.scoreHeader}>
                <View style={styles.scoreHeaderLeft}>
                    <ShieldCheck size={24} color={scoreColor} />
                    <ThemedText variant="heading3" style={styles.scoreTitle}>Security Score</ThemedText>
                </View>
            </View>

            <View style={styles.scoreContent}>
                <View style={styles.scoreContainer}>
                    <View style={styles.scoreRow}>
                        <ThemedText 
                            variant="heading1" 
                            style={{
                                ...styles.scoreValue,
                                color: scoreColor
                            }}
                        >
                            {score}%
                        </ThemedText>
                        <ThemedText variant="body" secondary style={styles.scoreLabel}>
                            {getScoreMessage(score)}
                        </ThemedText>
                    </View>
                    <View style={[styles.progressBarContainer, { backgroundColor: tinycolor(scoreColor).setAlpha(0.1).toHexString() }]}>
                        <View 
                            style={[
                                styles.progressBar, 
                                { 
                                    width: `${score}%`,
                                    backgroundColor: scoreColor
                                }
                            ]} 
                        />
                    </View>
                </View>

                <ThemedText variant="body" secondary style={styles.scoreDescription}>
                    {getScoreDescription(score)}
                </ThemedText>
            </View>

            <View style={styles.securityFeatures}>
                <ThemedText variant="label" secondary style={styles.featuresTitle}>
                    SECURITY FEATURES
                </ThemedText>
                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <View style={styles.iconColumn}>
                            <Key size={20} color={colors.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureContent}>
                            <ThemedText variant="bodyBold">Password Status</ThemedText>
                            <ThemedText variant="caption" secondary>
                                {formatLastPasswordChange()}
                            </ThemedText>
                        </View>
                        <View style={styles.actionColumn}>
                            {isPasswordFresh() ? (
                                <CheckCircle2 size={20} color={colors.success} />
                            ) : (
                                <Circle size={20} color={colors.textTertiary} />
                            )}
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.iconColumn}>
                            <Shield size={20} color={colors.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureContent}>
                            <ThemedText variant="bodyBold">Two-Factor Authentication</ThemedText>
                            <ThemedText variant="caption" secondary>
                                {twoFactorEnabled ? "Enabled" : "Not enabled"}
                            </ThemedText>
                        </View>
                        <View style={styles.actionColumn}>
                            {twoFactorEnabled ? (
                                <CheckCircle2 size={20} color={colors.success} />
                            ) : (
                                <Circle size={20} color={colors.textTertiary} />
                            )}
                        </View>
                    </View>

                    <View style={styles.featureItem}>
                        <View style={styles.iconColumn}>
                            <Fingerprint size={20} color={colors.primary} strokeWidth={2} />
                        </View>
                        <View style={styles.featureContent}>
                            <ThemedText variant="bodyBold">Biometric Authentication</ThemedText>
                            <ThemedText variant="caption" secondary>
                                {biometricEnabled ? "Enabled" : "Not enabled"}
                            </ThemedText>
                        </View>
                        <View style={styles.actionColumn}>
                            {biometricEnabled ? (
                                <CheckCircle2 size={20} color={colors.success} />
                            ) : (
                                <Circle size={20} color={colors.textTertiary} />
                            )}
                        </View>
                    </View>
                </View>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    securityScoreCard: {
        marginBottom: 24,
    },
    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    scoreHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreTitle: {
        marginLeft: 8,
    },
    scoreContent: {
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 8,
    },
    scoreContainer: {
        width: '100%',
        marginBottom: 16,
        paddingVertical: 8,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        minHeight: 60,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: '700',
        marginRight: 8,
        lineHeight: 48,
    },
    scoreLabel: {
        fontSize: 16,
    },
    progressBarContainer: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    scoreDescription: {
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    securityFeatures: {
        width: '100%',
    },
    featuresTitle: {
        marginBottom: 12,
        letterSpacing: 1,
    },
    featuresList: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    featureContent: {
        flex: 1,
        marginHorizontal: 12,
    },
    iconColumn: {
        width: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    actionColumn: {
        width: 44,
        alignItems: "center",
        justifyContent: "center",
    },
}); 