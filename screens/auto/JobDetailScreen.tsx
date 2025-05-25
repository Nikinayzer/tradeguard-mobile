import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Animated,
    LayoutAnimation,
    SafeAreaView
} from 'react-native';
import {
    ChevronLeft,
    Play,
    Pause,
    StopCircle,
    X,
    Clock,
    DollarSign,
    Coins,
    ListOrdered
} from 'lucide-react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Job, JobEvent} from '@/services/api/auto';
import {autoService} from '@/services/api/auto';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {formatDateTime, calculateRemainingTime} from '@/utils/formatUtils';
import CustomAlert, {useAlert} from '@/components/common/CustomAlert';
import {ThemedView} from '@/components/ui/ThemedView';
import {ThemedText} from '@/components/ui/ThemedText';
import {useTheme} from '@/contexts/ThemeContext';
import {CryptoIcon} from '@/components/common/CryptoIcon';

type JobDetailScreenRouteProp = RouteProp<{
    JobDetail: { id: number }
}, 'JobDetail'>;

type NavigationProp = NativeStackNavigationProp<any>;

export default function JobDetailScreen() {
    const {colors} = useTheme();
    const insets = useSafeAreaInsets();
    const route = useRoute<JobDetailScreenRouteProp>();
    const navigation = useNavigation<NavigationProp>();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [jobEvents, setJobEvents] = useState<JobEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {alert, showAlert, hideAlert} = useAlert();

    const progressPercentage = job ? (job.stepsDone / job.stepsTotal) * 100 : 0;
    const isActive = job?.status === 'IN_PROGRESS';
    const isPaused = job?.status === 'PAUSED';
    const isFinished = job?.status === 'FINISHED' || job?.status === 'CANCELED';

    const [isEventsExpanded, setIsEventsExpanded] = useState(true);
    const [animation] = useState(new Animated.Value(1));

    const toggleEvents = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsEventsExpanded(!isEventsExpanded);
        Animated.timing(animation, {
            toValue: isEventsExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                const job = await autoService.getJob(route.params.id.toString());
                if (job) {
                    setJob(job);
                    fetchJobEvents(job.id.toString());
                } else {
                    showAlert({
                        type: 'error',
                        title: 'Job Not Found',
                        message: 'The requested job could not be found.',
                        buttons: [
                            {
                                text: 'OK',
                                onPress: () => navigation.goBack(),
                                style: 'default'
                            }
                        ]
                    });
                }
            } catch (error) {
                console.error('Error fetching job:', error);
                showAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to load job details.'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [route.params.id]);

    const fetchJobEvents = async (id: string) => {
        try {
            setIsLoadingEvents(true);
            setError(null);

            const events = await autoService.getJobEvents(id);
            setJobEvents(events);
        } catch (err) {
            console.error('Error fetching job events:', err);
            setError('Failed to load job events');
        } finally {
            setIsLoadingEvents(false);
        }
    };

    //todo in header
    const handleGoBack = () => {
        navigation.goBack();
    };

    const handlePauseJob = async () => {
        if (!job) return;
        try {
            await autoService.pauseJob(job.id);
            showAlert({
                type: 'info',
                title: 'Job Paused',
                message: 'Your job has been paused'
            });
        } catch (err) {
            console.error('Error pausing job:', err);
            showAlert({
                type: 'error',
                title: 'Action Failed',
                message: 'Failed to pause job'
            });
        }
    }
    const handleResumeJob = async () => {
        if (!job) return;
        try {
            await autoService.resumeJob(job.id);
            showAlert({
                type: 'info',
                title: 'Job Resumed',
                message: 'Your job has been resumed'
            });
        } catch (err) {
            console.error('Error resuming job:', err);
            showAlert({
                type: 'error',
                title: 'Action Failed',
                message: 'Failed to resume job'
            });
        }
    };
    const handleCancelJob = async () => {
        if (!job) return;
        try {
            await autoService.cancelJob(job.id);
            showAlert({
                type: 'info',
                title: 'Job Cancelled',
                message: 'Your job has been cancelled'
            });
        } catch (err) {
            console.error('Error canceling job:', err);
            showAlert({
                type: 'error',
                title: 'Action Failed',
                message: 'Failed to cancel job'
            });
        }
    };

    const handleStopJob = async () => {
        if (!job) return;
        try {
            await autoService.stopJob(job.id);
            showAlert({
                type: 'success',
                title: 'Job Stopped',
                message: 'Your job has been stopped and marked as completed'
            });
        } catch (err) {
            console.error('Error stopping job:', err);
            showAlert({
                type: 'error',
                title: 'Action Failed',
                message: 'Failed to stop job'
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS':
                return '#3B82F6';
            case 'PAUSED':
                return '#F59E0B';
            case 'FINISHED':
                return '#10B981';
            case 'CANCELED':
                return '#EF4444';
            default:
                return '#748CAB';
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <ThemedView style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary}/>
                    <ThemedText style={styles.loadingText}>Loading job details...</ThemedText>
                </ThemedView>
            );
        }

        if (!job) {
            return (
                <ThemedView style={styles.errorContainer}>
                    <ThemedText style={styles.errorText}>Could not load job details</ThemedText>
                </ThemedView>
            );
        }

        return (
            <ThemedView style={styles.detailsContainer}>
                <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
                    <ThemedView style={styles.mainContent}>
                        {/* Progress Section */}
                        <ThemedView variant="card" style={styles.section}>
                            <ThemedView style={styles.progressContainer}>
                                <ThemedView style={styles.progressHeader}>
                                    <ThemedText variant="heading3">Progress</ThemedText>
                                    <ThemedText variant="bodyBold" style={styles.progressText}>
                                        {job.stepsDone} of {job.stepsTotal} steps
                                    </ThemedText>
                                </ThemedView>
                                <ThemedView style={styles.progressBackground}>
                                    <View
                                        style={{
                                            ...styles.progressFill,
                                            width: `${progressPercentage}%`,
                                            backgroundColor: getStatusColor(job.status)
                                        }}
                                    />
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>

                        {/* Job Details Section */}
                        <ThemedView variant="card" style={styles.section}>
                            <ThemedText variant="heading3" style={styles.sectionTitle}>Job Details</ThemedText>
                            <ThemedView style={styles.detailGrid}>
                                <ThemedView style={styles.detailRow}>
                                    <ThemedView style={styles.iconLabelContainer}>
                                        <ListOrdered size={16} color={colors.textSecondary}/>
                                        <ThemedText style={styles.detailLabel}>Strategy:</ThemedText>
                                    </ThemedView>
                                    <ThemedView style={styles.valueContainer}>
                                        <ThemedText style={styles.detailValue}>{job.strategy}</ThemedText>
                                    </ThemedView>
                                </ThemedView>

                                <ThemedView style={styles.detailRow}>
                                    <ThemedView style={styles.iconLabelContainer}>
                                        <Coins size={16} color={colors.textSecondary}/>
                                        <ThemedText style={styles.detailLabel}>Coins:</ThemedText>
                                    </ThemedView>
                                    <ThemedView style={styles.valueContainer}>
                                        <ThemedView style={styles.coinsContainer}>
                                            {job.coins?.map((coin) => (
                                                <ThemedView key={coin.toString()} style={styles.coinItem}>
                                                    <CryptoIcon symbol={coin.toString()} size={16}/>
                                                    <ThemedText style={styles.coinText}>{coin.toString()}</ThemedText>
                                                </ThemedView>
                                            ))}
                                        </ThemedView>
                                    </ThemedView>
                                </ThemedView>

                                <ThemedView style={styles.detailRow}>
                                    <ThemedView style={styles.iconLabelContainer}>
                                        <DollarSign size={16} color={colors.textSecondary}/>
                                        <ThemedText style={styles.detailLabel}>Amount:</ThemedText>
                                    </ThemedView>
                                    <ThemedView style={styles.valueContainer}>
                                        <ThemedText style={styles.detailValue}>{job.amount}$</ThemedText>
                                    </ThemedView>
                                </ThemedView>

                                <ThemedView style={styles.detailRow}>
                                    <ThemedView style={styles.iconLabelContainer}>
                                        <Clock size={16} color={colors.textSecondary}/>
                                        <ThemedText style={styles.detailLabel}>Duration:</ThemedText>
                                    </ThemedView>
                                    <ThemedView style={styles.valueContainer}>
                                        <ThemedText style={styles.detailValue}>
                                            {job.durationMinutes} minutes
                                        </ThemedText>
                                    </ThemedView>
                                </ThemedView>

                                {job.status === 'IN_PROGRESS' && (
                                    <ThemedView style={styles.detailRow}>
                                        <ThemedView style={styles.iconLabelContainer}>
                                            <Clock size={16} color={colors.textSecondary}/>
                                            <ThemedText style={styles.detailLabel}>Estimate:</ThemedText>
                                        </ThemedView>
                                        <ThemedView style={styles.valueContainer}>
                                            <ThemedText style={styles.detailValue}>
                                                {calculateRemainingTime(job)}
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                )}

                                <ThemedView style={styles.detailRow}>
                                    <ThemedView style={styles.iconLabelContainer}>
                                        <Clock size={16} color={colors.textSecondary}/>
                                        <ThemedText style={styles.detailLabel}>Created:</ThemedText>
                                    </ThemedView>
                                    <ThemedView style={styles.valueContainer}>
                                        <ThemedText
                                            style={styles.detailValue}>{formatDateTime(job.createdAt)}</ThemedText>
                                    </ThemedView>
                                </ThemedView>

                                <ThemedView style={styles.detailRow}>
                                    <ThemedView style={styles.iconLabelContainer}>
                                        <Clock size={16} color={colors.textSecondary}/>
                                        <ThemedText style={styles.detailLabel}>Last Updated:</ThemedText>
                                    </ThemedView>
                                    <ThemedView style={styles.valueContainer}>
                                        <ThemedText
                                            style={styles.detailValue}>{formatDateTime(job.updatedAt)}</ThemedText>
                                    </ThemedView>
                                </ThemedView>
                            </ThemedView>
                        </ThemedView>

                        {/* Action Buttons Section */}
                        {!isFinished && (
                            <ThemedView variant="card" style={styles.section}>
                                <ThemedView style={styles.actionButtonsWrapper}>
                                    {isActive && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.stopButton]}
                                            onPress={handleStopJob}
                                        >
                                            <StopCircle size={18} color="white"/>
                                            <ThemedText style={styles.actionButtonText}>Stop</ThemedText>
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity
                                        style={[
                                            styles.actionButton,
                                            isActive ? styles.pauseButton : styles.resumeButton
                                        ]}
                                        onPress={isActive ? handlePauseJob : handleResumeJob}
                                    >
                                        {isActive ? (
                                            <>
                                                <Pause size={18} color="white"/>
                                                <ThemedText style={styles.actionButtonText}>Pause</ThemedText>
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} color="white"/>
                                                <ThemedText style={styles.actionButtonText}>Resume</ThemedText>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={handleCancelJob}
                                    >
                                        <X size={18} color="white"/>
                                        <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
                                    </TouchableOpacity>
                                </ThemedView>
                            </ThemedView>
                        )}
                    </ThemedView>
                </ScrollView>
            </ThemedView>
        );
    };

    return (
        <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background}]}>
            <ThemedView variant="transparent" style={{
                ...styles.header,
                paddingTop: insets.top
            }}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <ChevronLeft size={24} color={colors.text}/>
                </TouchableOpacity>

                <ThemedView style={styles.headerTitleContainer}>
                    <ThemedView style={styles.headerContent}>
                        <ThemedView style={styles.headerLeft}>
                            <ThemedText variant="heading2" size={24} style={styles.headerTitle}>
                                Job #{job?.id || route.params.id}
                            </ThemedText>
                            {job && (
                                <ThemedView
                                    variant="transparent"
                                    style={{
                                        ...styles.strategyBadge,
                                        backgroundColor: job.strategy === 'DCA' ? '#3B82F6' : '#8B5CF6'
                                    }}
                                >
                                    <ThemedText style={styles.strategyText}>{job.strategy}</ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
                        {job && (
                            <ThemedView
                                variant="transparent"
                                style={{
                                    ...styles.statusBadge,
                                    backgroundColor: getStatusColor(job.status)
                                }}
                            >
                                <ThemedText style={styles.statusText}>
                                    {job.status.replace('_', ' ')}
                                </ThemedText>
                            </ThemedView>
                        )}
                    </ThemedView>
                </ThemedView>
            </ThemedView>

            {alert && <CustomAlert {...alert} onClose={hideAlert}/>}

            {renderContent()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(116, 140, 171, 0.2)',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontWeight: '700',
    },
    strategyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    strategyText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
    },
    detailsContainer: {
        flex: 1,
    },
    detailsScroll: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        padding: 16,
        gap: 16,
    },
    section: {
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        marginBottom: 16,
    },
    progressContainer: {
        gap: 12,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressBackground: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: 'rgba(116, 140, 171, 0.1)',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
    },
    detailGrid: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 140,
    },
    valueContainer: {
        flex: 1,
        paddingLeft: 2,
    },
    detailLabel: {
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        lineHeight: 20,
    },
    actionButtonsWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
    },
    pauseButton: {
        backgroundColor: '#F59E0B',
    },
    resumeButton: {
        backgroundColor: '#3B82F6',
    },
    stopButton: {
        backgroundColor: '#F87171',
    },
    cancelButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    coinsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    coinItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    coinText: {
        fontSize: 14,
        lineHeight: 20,
    },
}); 