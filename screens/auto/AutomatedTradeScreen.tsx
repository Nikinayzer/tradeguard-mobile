import React, {useState, useEffect, useMemo, createContext} from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {JobCreator} from '@/components/screens/auto/JobCreator';
import {JobCard} from '@/components/screens/auto/JobCard';
import {
    autoService,
    Job,
    JobStrategy,
    JobParams,
    DCAJobParams,
    LIQJobParams,
} from '@/services/api/auto';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import NotificationModal from '@/components/modals/NotificationModal';
import {RefreshControl} from 'react-native';
import {Bot, History} from 'lucide-react-native';
import {ScreenHeader} from "@/components/screens/portfolio/ScreenHeader";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Coin {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

type NavigationProp = NativeStackNavigationProp<any>;

const defaultDCAJobParams: DCAJobParams = {
    coins: [],
    side: 'BUY',
    totalSteps: 10,
    discountPct: 0.5,
    durationMinutes: 60,
    amount: 100,
};

const defaultLIQJobParams: LIQJobParams = {
    amount: 10,
    coins: [],
    side: 'SELL',
    totalSteps: 10,
    durationMinutes: 60,
    discountPct: 0.5,
};

export const TooltipContext = createContext<{
    activeTooltipId: string | null;
    setActiveTooltipId: React.Dispatch<React.SetStateAction<string | null>>;
}>({
    activeTooltipId: null,
    setActiveTooltipId: () => null,
});

export default function AutomatedTradeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [jobType, setJobType] = useState<JobStrategy>('DCA');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedCoins, setSelectedCoins] = useState<Coin[]>([]);
    const [jobParams, setJobParams] = useState<JobParams>(defaultDCAJobParams);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("Now");

    // DUPLICATE, REFACTOR
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info' | 'warning'>('info');
    const [notificationTitle, setNotificationTitle] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');

    const activeJobs = useMemo(() =>
        jobs.filter(job => job.status === 'IN_PROGRESS' || job.status === 'PAUSED'),
        [jobs]
    );

    const finishedJobs = useMemo(() =>
        jobs.filter(job => job.status === 'FINISHED' || job.status === 'CANCELED'),
        [jobs]
    );

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: fetchJobs,
        onError: (error) => {
            showNotification('error', 'Refresh Failed', 'Failed to refresh jobs');
            console.error('Error refreshing jobs:', error);
        }
    });

    const showNotification = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
        setNotificationType(type);
        setNotificationTitle(title);
        setNotificationMessage(message);
        setNotificationVisible(true);
    };
    const closeNotification = () => {
        setNotificationVisible(false);
    };

    const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

    async function fetchJobs() {
        try {
            setIsLoading(true);
            const apiJobs = await autoService.getAllActiveJobs();
            setJobs(apiJobs || []);
            setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setJobs([]);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleJobTypeChange = (type: JobStrategy) => {
        setJobType(type);
        setJobParams(type === 'DCA' ? defaultDCAJobParams : defaultLIQJobParams);
        setSelectedCoins([]);
    };

    const handleCoinSelection = (coin: Coin) => {
        setSelectedCoins(prev => {
            const isSelected = prev.some(c => c.symbol === coin.symbol);
            if (isSelected) {
                return prev.filter(c => c.symbol !== coin.symbol);
            }
            return [...prev, coin];
        });
    };

    const handleJobComplete = async () => {
        if (!jobParams || selectedCoins.length === 0) {
            showNotification(
                'warning',
                'Missing Information',
                'Please select at least one coin to continue.'
            );
            return;
        }

        try {
            setIsSubmitting(true);

            if (jobType === 'DCA') {
                await autoService.createDCAJob({
                    ...jobParams as DCAJobParams,
                    coins: selectedCoins.map(coin => coin.symbol),
                });
            } else {
                await autoService.createLIQJob({
                    ...jobParams as LIQJobParams,
                    coins: selectedCoins.map(coin => coin.symbol),
                });
            }

            showNotification(
                'success',
                'Job Created',
                `Your ${jobType} job was successfully created`
            );

            setSelectedCoins([]);
            setJobParams(jobType === 'DCA' ? defaultDCAJobParams : defaultLIQJobParams);
            await fetchJobs();
        } catch (err) {
            console.error('Error creating job:', err);
            showNotification(
                'error',
                'Job Creation Failed',
                `Failed to create job. Please try again.`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleJob = async (jobId: number) => {
        try {
            const job = jobs.find(job => job.jobId === Number(jobId));
            if (!job) return;

            if (job.status === 'IN_PROGRESS') {
                await autoService.pauseJob(job.id);
                showNotification('info', 'Job Paused', 'Your job has been paused');
            } else if (job.status === 'PAUSED') {
                await autoService.resumeJob(job.id);
                showNotification('success', 'Job Resumed', 'Your job is now running');
            }

            await fetchJobs();
        } catch (err) {
            console.error('Error toggling job:', err);
            showNotification('error', 'Action Failed', 'Failed to update job status');
        }
    };

    const handleDeleteJob = async (jobId: number) => {
        try {
            const job = jobs.find(j => j.jobId === Number(jobId));
            if (!job) return;

            await autoService.cancelJob(job.id);
            showNotification('info', 'Job Cancelled', 'Your job has been cancelled');
            await fetchJobs();
        } catch (err) {
            console.error('Error canceling job:', err);
            showNotification('error', 'Action Failed', 'Failed to cancel job');
        }
    };

    const handleStopJob = async (jobId: number) => {
        try {
            const job = jobs.find(j => j.jobId === Number(jobId));
            if (!job) return;

            await autoService.cancelJob(job.id);
            showNotification('success', 'Job Stopped', 'Your job has been stopped and marked as completed');
            await fetchJobs();
        } catch (err) {
            console.error('Error stopping job:', err);
            showNotification('error', 'Action Failed', 'Failed to stop job');
        }
    };

    const handleViewJobDetails = (jobId: number) => {
        navigation.navigate('JobDetail', { jobId });
    };

    const navigateToJobList = (initialTab: 'active' | 'finished' = 'active') => {
        navigation.navigate('JobList', { initialTab });
    };

    return (
        <TooltipContext.Provider value={{activeTooltipId, setActiveTooltipId}}>
            <SafeAreaView style={styles.safeArea}>
                <ScreenHeader
                    title={"Automated Trading"}
                    lastUpdated={lastUpdated}
                    onRefresh={handleRefresh}
                />
                
                <ScrollView 
                    style={styles.container}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={["#3B82F6"]}
                            tintColor="#3B82F6"
                        />
                    }
                    onStartShouldSetResponder={() => {
                        setActiveTooltipId(null);
                        return false;
                    }}
                >
                    <NotificationModal
                        visible={notificationVisible}
                        onClose={closeNotification}
                        title={notificationTitle}
                        message={notificationMessage}
                        type={notificationType}
                        buttonText="OK"
                        onButtonPress={closeNotification}
                    />

                    <JobCreator
                        jobType={jobType}
                        onJobTypeChange={handleJobTypeChange}
                        params={jobParams}
                        onUpdateParams={setJobParams}
                        selectedCoins={selectedCoins}
                        onSelectCoin={handleCoinSelection}
                    />

                    {selectedCoins.length > 0 && (
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={handleJobComplete}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="white"/>
                            ) : (
                                <Text style={styles.createButtonText}>
                                    Create {jobType} Job
                                    with {selectedCoins.length} coin{selectedCoins.length > 1 ? 's' : ''}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}

                    <View style={styles.tabContainer}>
                        <View style={[styles.tab, styles.activeTab]}>
                            <Bot size={16} color="#3B82F6"/>
                            <Text style={[styles.tabText, styles.activeTabText]}>
                                Active ({activeJobs.length})
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.tab}
                            onPress={() => navigateToJobList('finished')}
                        >
                            <History size={16} color="#748CAB"/>
                            <Text style={styles.tabText}>
                                History ({finishedJobs.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {activeJobs.length > 0 ? (
                        <View style={styles.recentJobsSection}>
                            <TouchableOpacity 
                                style={styles.sectionHeader}
                                onPress={() => navigateToJobList('active')}
                            >
                                <View>
                                    <Text style={styles.jobsTitle}>
                                        Active Jobs
                                    </Text>
                                    <Text style={styles.jobsSubtitle}>
                                        Your running automated strategies
                                    </Text>
                                </View>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>

                            {activeJobs.map(job => (
                                <JobCard
                                    key={job.jobId}
                                    job={job}
                                    onToggle={() => handleToggleJob(job.jobId)}
                                    onDelete={() => handleDeleteJob(job.jobId)}
                                    onStop={() => handleStopJob(job.jobId)}
                                    onViewDetails={() => handleViewJobDetails(job.jobId)}
                                    compact={true}
                                />
                            ))}
                        </View>
                    ) : !isLoading && (
                        <View style={styles.emptyStateContainer}>
                            <Text style={styles.emptyStateTitle}>No Active Jobs</Text>
                            <Text style={styles.emptyStateMessage}>
                                It's time to create a job!
                            </Text>
                        </View>
                    )}

                    {isLoading && jobs.length === 0 && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#3B82F6"/>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </TooltipContext.Provider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(13, 27, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    createButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    tabContainer: {
        flexDirection: 'row',
        marginVertical: 16,
        backgroundColor: 'rgba(13, 27, 42, 0.7)',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    tabText: {
        fontSize: 14,
        color: '#748CAB',
        fontWeight: '500',
        marginLeft: 8,
    },
    activeTabText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    viewAllText: {
        fontSize: 12,
        color: '#3B82F6',
        fontWeight: '500',
    },
    recentJobsSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    jobsHeaderContainer: {
        marginBottom: 12,
    },
    jobsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    jobsSubtitle: {
        fontSize: 14,
        color: '#748CAB',
        marginTop: 4,
    },
    emptyStateContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyStateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 8,
    },
    emptyStateMessage: {
        fontSize: 14,
        color: '#748CAB',
        textAlign: 'center',
        lineHeight: 20,
    },
});