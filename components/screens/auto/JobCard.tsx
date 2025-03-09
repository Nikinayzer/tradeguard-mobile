import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Card} from '@/components/common/Card';
import {Pause, Play, Trash2} from 'lucide-react-native';

interface Coin {
    symbol: string;
}

export interface Job {
    id: string;
    type: 'dca' | 'liq';
    currentStep: number;
    totalSteps: number;
    status: 'active' | 'paused';
    coins: Coin[];
}

interface JobCardProps {
    job: Job;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

//todo fix how it looks like jeez
export const JobCard: React.FC<JobCardProps> = ({job, onToggle, onDelete}) => {
    return (
        <Card key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
                {/* Strategy Type & Coins */}
                <View style={styles.jobInfo}>
                    <Text style={styles.jobType}>{job.type.toUpperCase()}</Text>
                    <View style={styles.coinsList}>
                        {job.coins.map(coin => (
                            <View key={coin.symbol} style={styles.coinTag}>
                                <Text style={styles.coinTagText}>{coin.symbol}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.jobActions}>
                    <TouchableOpacity style={styles.jobButton} onPress={() => onToggle(job.id)}>
                        {job.status === 'active' ? (
                            <Pause size={20} color="#748CAB"/>
                        ) : (
                            <Play size={20} color="#748CAB"/>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.jobButton} onPress={() => onDelete(job.id)}>
                        <Trash2 size={20} color="#748CAB"/>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, {width: `${job.currentStep}%`}]}/>
            </View>

            <View style={styles.stepsContainer}>
                <Text style={styles.stepsText}>
                    Step {job.currentStep} / {job.totalSteps}
                </Text>
            </View>

            {/* Status Indicator */}
            <View style={styles.jobStatus}>
                <View
                    style={[
                        styles.statusIndicator,
                        {backgroundColor: job.status === 'active' ? '#4CAF50' : '#F44336'}
                    ]}
                />
                <Text style={styles.statusText}>
                    {job.status === 'active' ? 'Running' : 'Paused'}
                </Text>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    jobCard: {
        padding: 10,
        marginVertical: 8,
        borderRadius: 8,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    jobInfo: {
        flex: 1,
    },
    jobType: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    progressBar: {
        height: 4,
        backgroundColor: "#22314A",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#3B82F6",
        borderRadius: 2,
    },
    stepsContainer: {
        alignItems: "center",
    },
    stepsText: {
        fontSize: 12,
        color: "#748CAB",
    },
    coinsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    coinTag: {
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginRight: 5,
        marginBottom: 5,
    },
    coinTagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    jobActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobButton: {
        marginLeft: 10,
    },
    jobStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default JobCard;
