import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Clock, DollarSign, Coins, ChevronRight} from 'lucide-react-native';
import {Job} from '@/services/api/auto';
import {formatDate, formatTimeAgo, getStatusColor, getStatusText, calculateRemainingTime} from '../../../utils/formatUtils';
import {useTheme} from '@/contexts/ThemeContext';


interface JobCardProps {
    job: Job;
    onViewDetails?: (id: string) => void;
}

export function JobCard({ job, onViewDetails = undefined}: JobCardProps) {
    const { colors } = useTheme();
    
    // todo handle with dto, ids are not numbers
    if (!job || (typeof job.id !== 'string' && typeof job.id !== 'number')) {
        console.warn('Invalid job object passed to JobCard:', job);
        return null;
    }
    
    const handleCardPress = () => {
        if (onViewDetails) {
            onViewDetails(job.id);
        }
    };

    const progressPercentage = (job.stepsDone / job.stepsTotal) * 100;
    const formattedCreatedAt = formatDate(job.createdAt);
    const timeAgo = formatTimeAgo(job.updatedAt);
    const isPaused = job.status === 'PAUSED';
    const statusColor = getStatusColor(job.status);
    const strategyColor = job.strategy === 'DCA' ? colors.primary : colors.secondary;
    const sideColor = job.side === 'BUY' ? colors.success : 
                     job.side === 'SELL' ? colors.error : 
                     job.side === 'BOTH' ? colors.warning : 
                     colors.primary;

    return (
        <TouchableOpacity 
            style={styles.container} 
            onPress={handleCardPress}
            activeOpacity={0.7}
        >
            <View
                style={[styles.cardGradient, {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder
                }]}
            >
                <View style={styles.header}>
                    <View style={styles.strategyContainer}>
                        <View
                            style={[styles.strategyBadge, { backgroundColor: strategyColor }]}>
                            <Text style={[styles.strategyText, { color: colors.buttonPrimaryText }]}>{job.strategy}</Text>
                        </View>
                        <Text style={[styles.jobIdText, { color: colors.textTertiary }]}>#{String(job.id).substring(0, 8)}</Text>

                        <View
                            style={[styles.sideBadge, { backgroundColor: `${sideColor}20` }]}>
                            <Text style={[styles.sideText, { color: sideColor }]}>
                                {job.side.toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={[styles.statusText, { color: colors.buttonPrimaryText }]}>{getStatusText(job.status)}</Text>
                    </View>
                </View>

                <View style={styles.progressSection}>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBackground, { backgroundColor: colors.backgroundTertiary }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${progressPercentage}%`,
                                        backgroundColor: isPaused ? colors.inactive : statusColor,
                                    }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                            {job.stepsDone} of {job.stepsTotal} steps completed
                        </Text>
                    </View>
                </View>

                <View style={styles.infoColumns}>
                    {/* Left column */}
                    <View style={styles.infoColumn}>
                        <View style={styles.infoRow}>
                            <Coins size={16} color={colors.textTertiary} style={styles.infoIcon} />
                            <View>
                                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Coins</Text>
                                <Text style={[styles.infoValueHighlight, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
                                    {job.coins.join(', ')}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Clock size={16} color={colors.textTertiary} style={styles.infoIcon} />
                            <View>
                                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Created</Text>
                                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{formattedCreatedAt}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Right column */}
                    <View style={styles.infoColumn}>
                        <View style={styles.infoRow}>
                            <DollarSign size={16} color={colors.textTertiary} style={styles.infoIcon} />
                            <View>
                                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Amount</Text>
                                <Text style={[styles.infoValueHighlight, { color: colors.text }]}>
                                    {job.amount}{job.strategy === 'DCA' ? ' USDT' : '%'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Clock size={16} color={colors.textTertiary} style={styles.infoIcon} />
                            <View>
                                <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>Updated</Text>
                                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{timeAgo}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {job.status === 'IN_PROGRESS' && (
                    <View style={[styles.footerSection, { borderTopColor: colors.divider }]}>
                        <View style={styles.estimateContainer}>
                            <Clock size={14} color={statusColor} />
                            <Text style={[styles.estimateText, {color: statusColor}]}>
                                {calculateRemainingTime(job)}
                            </Text>
                        </View>
                        <ChevronRight size={20} color={colors.textTertiary} />
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    cardGradient: {
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    strategyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    strategyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginRight: 10,
    },
    strategyText: {
        fontWeight: '600',
        fontSize: 13,
    },
    jobIdText: {
        fontSize: 13,
    },
    sideBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    sideText: {
        fontSize: 11,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    statusText: {
        fontWeight: '600',
        fontSize: 13,
    },
    progressSection: {
        marginBottom: 16,
    },
    progressContainer: {
        marginBottom: 4,
    },
    progressBackground: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        marginTop: 4,
    },
    infoColumns: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    infoColumn: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
    },
    infoIcon: {
        marginRight: 10,
    },
    infoLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
    },
    infoValueHighlight: {
        fontSize: 14,
        fontWeight: '600',
    },
    footerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 16,
    },
    estimateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    estimateText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: '600',
    },
});
