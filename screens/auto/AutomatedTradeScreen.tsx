import React, {useState, useEffect, useMemo, createContext} from 'react';
import {View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, ScrollView,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {JobCreator} from '@/components/screens/auto/JobCreator';
import {JobCard} from '@/components/screens/auto/JobCard';
import {autoService, Job, JobStrategy, JobParams, DCAJobParams, LIQJobParams,} from '@/services/api/auto';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import {RefreshControl} from 'react-native';
import {Bot, History} from 'lucide-react-native';
import {ScreenHeader} from "@/components/screens/portfolio/ScreenHeader";
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/services/redux/store";
import {setSelectedCoins} from "@/services/redux/slices/jobStateSlice";
import CustomAlert, {useAlert} from '@/components/common/CustomAlert';

type NavigationProp = NativeStackNavigationProp<any>;

export const TooltipContext = createContext<{
    activeTooltipId: string | null;
    setActiveTooltipId: React.Dispatch<React.SetStateAction<string | null>>;
}>({
    activeTooltipId: null,
    setActiveTooltipId: () => null,
});

export default function AutomatedTradeScreen() {
    const navigation = useNavigation<NavigationProp>();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState("Now");

    const dispatch = useDispatch();
    const {jobType, jobParams, selectedCoins} = useSelector((state: RootState) => state.job);

    const {alert, showAlert, hideAlert} = useAlert();

    const activeJobs = useMemo(() =>
            jobs.filter(job => job.status === 'IN_PROGRESS' || job.status === 'PAUSED'),
        [jobs]
    );
    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: fetchJobs,
        onError: (error) => {
            showAlert({
                type: 'error',
                title: 'Refresh Failed',
                message: 'Failed to refresh jobs'
            });
            console.error('Error refreshing jobs:', error);
        }
    });

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

    const handleJobComplete = async () => {
        if (!jobParams || selectedCoins.length === 0) {
            showAlert({
                type: 'warning',
                title: 'Missing Information',
                message: 'Please select at least one coin to continue.'
            });
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

            showAlert({
                type: 'success',
                title: 'Job Created',
                message: `Your ${jobType} job was successfully created`
            });
            dispatch(setSelectedCoins([])); //resetting only coins, assuming user doesn't want to open multiple jobs atm with same coins

            await fetchJobs();
        } catch (err) {
            console.error('Error creating job:', err);
            showAlert({
                type: 'error',
                title: 'Job Creation Failed',
                message: 'Failed to create job. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewJobDetails = (id: string) => {
        navigation.navigate('JobDetail', {id});
    };

    const navigateToJobList = (initialTab: 'active' | 'finished' = 'active') => {
        navigation.navigate('JobList', {initialTab});
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
                    {alert && <CustomAlert {...alert} onClose={hideAlert} />}

                    <JobCreator/>

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
                                History
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
                                    key={job.id}
                                    job={job}
                                    onViewDetails={() => handleViewJobDetails(job.id)}
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