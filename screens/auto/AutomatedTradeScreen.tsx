import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Plus, ChevronRight } from 'lucide-react-native';
import { CoinSelector } from '@/components/screens/auto/CoinSelector';
import { JobCard } from '@/components/screens/auto/JobCard';
import { JobCreator } from '../../components/screens/auto/JobCreator';

interface Job {
    id: string;
    type: 'dca' | 'liq';
    status: 'active' | 'paused';
    currentStep: number;
    totalSteps: number;
    coins: any[];
}

export default function AutomatedTradeScreen() {
    const [jobType, setJobType] = useState<'dca' | 'liq'>('dca');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedCoins, setSelectedCoins] = useState<any[]>([]);
    const [jobParams, setJobParams] = useState<any>({});

    const handleJobComplete = () => {
        if (Object.keys(jobParams).length === 0 || selectedCoins.length === 0) return;

        const newJob: Job = {
            id: Date.now().toString(),
            type: jobType,
            status: 'active',
            currentStep: 1,
            totalSteps: jobType === 'dca' ? (jobParams.steps || 10) : 1,
            coins: selectedCoins,
        };

        setJobs([...jobs, newJob]);
        setSelectedCoins([]);
        setJobParams({});
    };

    const handleToggleJob = (id: string) => {
        setJobs(jobs.map(job =>
            job.id === id
                ? { ...job, status: job.status === 'active' ? 'paused' : 'active' }
                : job
        ));
    };

    const handleDeleteJob = (id: string) => {
        setJobs(jobs.filter(job => job.id !== id));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Bot size={24} color="white" />
                        <Text style={styles.title}>Automated Trading</Text>
                    </View>
                </View>

                {/* Job Type Switch */}
                <View style={styles.switchContainer}>
                    <View style={styles.jobTypeSwitch}>
                        <Text style={[styles.switchLabel, jobType === 'dca' && styles.activeSwitchLabel]}>DCA</Text>
                        <Switch
                            value={jobType === 'liq'}
                            onValueChange={(value) => setJobType(value ? 'liq' : 'dca')}
                            trackColor={{ false: '#3B82F6', true: '#3B82F6' }}
                            thumbColor="white"
                        />
                        <Text style={[styles.switchLabel, jobType === 'liq' && styles.activeSwitchLabel]}>LIQ</Text>
                    </View>
                </View>

                {/* Parameters */}
                <View style={styles.section}>
                    <JobCreator
                        jobType={jobType}
                        onJobTypeChange={setJobType}
                        params={jobParams}
                        onUpdateParams={setJobParams}
                    />
                </View>

                {/* Coin Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Coins</Text>
                    <CoinSelector
                        selectedCoins={selectedCoins}
                        onSelect={(coin) => {
                            setSelectedCoins(prev => {
                                const isSelected = prev.some(c => c.symbol === coin.symbol);
                                if (isSelected) {
                                    return prev.filter(c => c.symbol !== coin.symbol);
                                }
                                return [...prev, coin];
                            });
                        }}
                    />
                </View>

                {/* Create Button */}
                {selectedCoins.length > 0 && Object.keys(jobParams).length > 0 && (
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleJobComplete}
                    >
                        <Text style={styles.createButtonText}>
                            Create Job with {selectedCoins.length} coins
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Active Jobs */}
                {jobs.length > 0 ? (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={styles.sectionTitle}>Active Jobs</Text>
                                <Text style={styles.sectionSubtitle}>
                                    {jobs.length} running jobs
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.seeAllButton}>
                                <Text style={styles.seeAllText}>See All</Text>
                                <ChevronRight size={16} color="#3B82F6" />
                            </TouchableOpacity>
                        </View>

                        {jobs.map(job => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onToggle={() => handleToggleJob(job.id)}
                                onDelete={() => handleDeleteJob(job.id)}
                            />
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            No automated jobs created yet
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                            Create your first job to start automated trading
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
    },
    switchContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    jobTypeSwitch: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1B263B',
        padding: 4,
        borderRadius: 8,
    },
    switchLabel: {
        color: '#748CAB',
        fontSize: 14,
        fontWeight: '600',
        paddingHorizontal: 8,
    },
    activeSwitchLabel: {
        color: '#3B82F6',
    },
    section: {
        padding: 16,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 16,
    },
    createButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#748CAB',
    },
    seeAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    seeAllText: {
        color: '#3B82F6',
        fontSize: 14,
        marginRight: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#1B263B',
        borderRadius: 12,
        margin: 16,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#748CAB',
        textAlign: 'center',
    },
}); 