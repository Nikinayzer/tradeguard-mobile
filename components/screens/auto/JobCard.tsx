import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity,} from 'react-native';
import {Clock, DollarSign, Coins} from 'lucide-react-native';
import {Job} from '@/services/api/auto';
import {formatDate, formatTimeAgo, getStatusColor, getStatusText, calculateRemainingTime
} from './jobUtils';

interface JobCardProps {
    job: Job;
    onViewDetails?: (id: string) => void;
}

export function JobCard({ job, onViewDetails = undefined}: JobCardProps) {
    const handleCardPress = () => {
        if (onViewDetails) {
            onViewDetails(job.id);
        }
    };

    const progressPercentage = (job.stepsDone / job.stepsTotal) * 100;
    const formattedCreatedAt = formatDate(job.createdAt);
    const timeAgo = formatTimeAgo(job.updatedAt);

    return (
        <TouchableOpacity style={styles.container} onPress={handleCardPress}>
            <View style={styles.header}>
                <View style={styles.strategyContainer}>
                    <View
                        style={[styles.strategyBadge, { backgroundColor: job.strategy === 'DCA' ? '#3B82F6' : '#8B5CF6' }]}>
                        <Text style={styles.strategyText}>{job.strategy}</Text>
                    </View>
                    <Text style={styles.jobIdText}>#{job.id}</Text>

                    <View
                        style={[styles.sideBadge, { backgroundColor: job.side === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)' }]}>
                        <Text style={[styles.sideText, { color: job.side === 'BUY' ? '#10B981' : '#F87171' }]}>
                            {job.side}
                        </Text>
                    </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressBackground}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progressPercentage}%`,
                                backgroundColor: getStatusColor(job.status),
                            }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {job.stepsDone} of {job.stepsTotal} steps completed
                </Text>
            </View>

            <View style={styles.infoColumns}>
                {/* Left column */}
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Coins size={14} color="#748CAB" />
                        <Text style={styles.infoLabelHighlight}>Coins:</Text>
                        <Text style={styles.infoValueHighlight} numberOfLines={1} ellipsizeMode="tail">
                            {job.coins.join(', ')}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Clock size={14} color="#748CAB" />
                        <Text style={styles.infoLabel}>Created:</Text>
                        <Text style={styles.infoValue}>{formattedCreatedAt}</Text>
                    </View>
                </View>

                {/* Right column */}
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <DollarSign size={14} color="#748CAB" />
                        <Text style={styles.infoLabelHighlight}>Amount:</Text>
                        <Text style={styles.infoValueHighlight}>100</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Clock size={14} color="#748CAB" />
                        <Text style={styles.infoLabel}>Updated:</Text>
                        <Text style={styles.infoValue}>{timeAgo}</Text>
                    </View>
                </View>
            </View>

            {job.status === 'IN_PROGRESS' && (
                <View style={styles.detailRow}>
                    <Clock size={14} color="#748CAB" />
                    <Text style={styles.detailLabel}>Estimate:</Text>
                    <Text style={styles.detailValue}>
                        {calculateRemainingTime(job)}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    strategyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    strategyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 8,
    },
    strategyText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    jobIdText: {
        color: '#748CAB',
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    progressContainer: {
        marginBottom: 12,
    },
    progressBackground: {
        height: 8,
        backgroundColor: '#0D1B2A',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        color: '#748CAB',
        fontSize: 12,
        textAlign: 'right',
    },
    contentArea: {
        marginBottom: 12,
    },
    infoColumns: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    infoColumn: {
        flex: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoLabel: {
        color: '#748CAB',
        fontSize: 12,
        marginLeft: 4,
        marginRight: 4,
        width: 52,
    },
    infoLabelHighlight: {
        color: '#748CAB',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 4,
        marginRight: 4,
        width: 52,
    },
    infoValue: {
        color: '#E2E8F0',
        fontSize: 12,
        flex: 1,
    },
    infoValueHighlight: {
        color: '#E2E8F0',
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    detailLabel: {
        color: '#748CAB',
        fontSize: 13,
        marginLeft: 8,
        marginRight: 8,
        width: 60,
    },
    detailValue: {
        color: '#E2E8F0',
        fontSize: 13,
        flex: 1,
    },
    showStepsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 8,
        marginBottom: 8,
    },
    showStepsText: {
        color: '#748CAB',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 8,
        marginRight: 8,
        flex: 1,
    },
    collapsibleContainer: {
        overflow: 'hidden',
    },
    miniHint: {
        color: '#748CAB',
        fontSize: 12,
        textAlign: 'center',
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
    },
    stepsList: {
        paddingTop: 8,
        paddingBottom: 12,
    },
    stepItem: {
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    stepNumber: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    stepStatus: {
        fontWeight: '500',
        fontSize: 12,
    },
    stepDetails: {
        color: '#E2E8F0',
        fontSize: 13,
        marginBottom: 8,
    },
    stepTimestamp: {
        color: '#748CAB',
        fontSize: 12,
        marginBottom: 4,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    loadingText: {
        color: '#748CAB',
        marginLeft: 8,
        fontSize: 13,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderRadius: 8,
    },
    errorText: {
        color: '#F87171',
        marginLeft: 8,
        fontSize: 13,
    },
    emptyStepsText: {
        color: '#748CAB',
        textAlign: 'center',
        padding: 16,
        fontSize: 13,
    },
    sideBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    sideText: {
        fontWeight: '600',
        fontSize: 10,
    },
    estimateContainer: {
        height: 28, // Fixed height container for estimate
        marginBottom: 4,
    },
    estimateContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    estimateText: {
        color: '#3B82F6',
        fontSize: 12,
        fontWeight: '500',
        marginLeft: 6,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    timeItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLabel: {
        color: '#748CAB',
        fontSize: 12,
        marginLeft: 4,
        marginRight: 4,
    },
    timeValue: {
        color: '#E2E8F0',
        fontSize: 12,
    },
    compactContainer: {
        height: 220, // Fixed height for consistency
    },
});
