import React, {useEffect, useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, StatusBar, Platform, ScrollView, FlatList, Animated, LayoutAnimation, Pressable
} from 'react-native';
import {ChevronLeft, Play, Pause, StopCircle, X, Clock, DollarSign, Coins, AlertTriangle, ChevronDown, ChevronUp, ListOrdered
} from 'lucide-react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Job, JobEvent} from '@/services/api/auto';
import {autoService} from '@/services/api/auto';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {formatDate, formatDateTime, getEventColor, getEventText, getEventDescription, getStatusColor, getStatusText, calculateRemainingTime
} from '@/components/screens/auto/jobUtils';
import CustomAlert, {useAlert} from '@/components/common/CustomAlert';

type JobDetailScreenRouteProp = RouteProp<{
    JobDetail: { id: number }
}, 'JobDetail'>;

type NavigationProp = NativeStackNavigationProp<any>;

export default function JobDetailScreen() {
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
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3B82F6"/>
                    <Text style={styles.loadingText}>Loading job details...</Text>
                </View>
            );
        }

        if (!job) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Could not load job details</Text>
                </View>
            );
        }

        return (
            <View style={styles.detailsContainer}>
                <ScrollView style={styles.detailsScroll}>
                    <View style={styles.mainContent}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Job Details</Text>

                            <View style={styles.progressContainer}>
                                <View style={styles.progressBackground}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${progressPercentage}%`,
                                                backgroundColor: getStatusColor(job.status)
                                            }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {job.stepsDone} of {job.stepsTotal} steps completed
                                </Text>
                            </View>

                            <View style={styles.detailGrid}>
                                <View style={styles.detailRow}>
                                    <View style={styles.iconLabelContainer}>
                                        <Coins size={16} color="#748CAB"/>
                                        <Text style={styles.detailLabel}>Coins:</Text>
                                    </View>
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.detailValue}>{job.coins.join(', ')}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.iconLabelContainer}>
                                        <DollarSign size={16} color="#748CAB"/>
                                        <Text style={styles.detailLabel}>Amount:</Text>
                                    </View>
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.detailValue}>{job.amount}$</Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.iconLabelContainer}>
                                        <Clock size={16} color="#748CAB"/>
                                        <Text style={styles.detailLabel}>Duration:</Text>
                                    </View>
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.detailValue}>
                                            {job.durationMinutes} minutes
                                        </Text>
                                    </View>
                                </View>

                                {job.status === 'IN_PROGRESS' && (
                                    <View style={styles.detailRow}>
                                        <View style={styles.iconLabelContainer}>
                                            <Clock size={16} color="#748CAB"/>
                                            <Text style={styles.detailLabel}>Estimate:</Text>
                                        </View>
                                        <View style={styles.valueContainer}>
                                            <Text style={styles.detailValue}>
                                                {calculateRemainingTime(job)}
                                            </Text>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.detailRow}>
                                    <View style={styles.iconLabelContainer}>
                                        <Clock size={16} color="#748CAB"/>
                                        <Text style={styles.detailLabel}>Created:</Text>
                                    </View>
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.detailValue}>{formatDateTime(job.createdAt)}</Text>
                                    </View>
                                </View>

                                <View style={styles.detailRow}>
                                    <View style={styles.iconLabelContainer}>
                                        <Clock size={16} color="#748CAB"/>
                                        <Text style={styles.detailLabel}>Last Updated:</Text>
                                    </View>
                                    <View style={styles.valueContainer}>
                                        <Text style={styles.detailValue}>{formatDateTime(job.updatedAt)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {!isFinished && (
                            <View style={styles.section}>
                                <View style={styles.actionButtonsContainer}>
                                    {isActive && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.stopButton]}
                                            onPress={handleStopJob}
                                        >
                                            <StopCircle size={18} color="white"/>
                                            <Text style={styles.actionButtonText}>Stop</Text>
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
                                                <Text style={styles.actionButtonText}>Pause</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Play size={18} color="white"/>
                                                <Text style={styles.actionButtonText}>Resume</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.cancelButton]}
                                        onPress={handleCancelJob}
                                    >
                                        <X size={18} color="white"/>
                                        <Text style={styles.actionButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.section}>
                            <Pressable
                                style={styles.eventsSectionHeader}
                                onPress={toggleEvents}
                            >
                                <View style={styles.collapsibleTitleContainer}>
                                    <ListOrdered size={20} color="#748CAB"/>
                                    <Text style={styles.collapsibleTitle}>Events History</Text>
                                </View>
                                {isEventsExpanded ? (
                                    <ChevronUp size={20} color="#E2E8F0"/>
                                ) : (
                                    <ChevronDown size={20} color="#E2E8F0"/>
                                )}
                            </Pressable>

                            <Animated.View style={[
                                styles.eventsContent,
                                {
                                    opacity: animation,
                                    maxHeight: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1000]
                                    })
                                }
                            ]}>
                                {isLoadingEvents ? (
                                    <View style={styles.loadingEventsContainer}>
                                        <ActivityIndicator size="small" color="#3B82F6"/>
                                        <Text style={styles.loadingText}>Loading events...</Text>
                                    </View>
                                ) : error ? (
                                    <View style={styles.eventsErrorContainer}>
                                        <AlertTriangle size={16} color="#F87171"/>
                                        <Text style={styles.errorText}>{error}</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        data={jobEvents}
                                        keyExtractor={(item) => item.id.toString()}
                                        contentContainerStyle={styles.eventsList}
                                        scrollEnabled={false}
                                        ListEmptyComponent={
                                            <Text style={styles.emptyEventsText}>No events available</Text>
                                        }
                                        renderItem={({item}) => (
                                            <View style={styles.eventItem}>
                                                <View style={styles.eventHeader}>
                                                    <View style={styles.eventTitleContainer}>
                                                        <View
                                                            style={[styles.eventStatusDot, {backgroundColor: getEventColor(item.eventType)}]}/>
                                                        <Text
                                                            style={styles.eventTitle}>{getEventText(item.eventType)}</Text>
                                                    </View>
                                                    <Text style={styles.eventTimestamp}>
                                                        {formatDateTime(item.timestamp)}
                                                    </Text>
                                                </View>
                                                <Text style={styles.eventDescription}>{getEventDescription(item)}</Text>
                                            </View>
                                        )}
                                    />
                                )}
                            </Animated.View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={[styles.container, {paddingTop: insets.top}]}>
            <StatusBar barStyle="light-content" backgroundColor="#0D1B2A"/>

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleGoBack}
                >
                    <ChevronLeft size={24} color="white"/>
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerTitle}>
                                Job #{job?.id|| route.params.id}
                            </Text>
                            {job && (
                                <View
                                    style={[styles.strategyBadge, {backgroundColor: job.strategy === 'DCA' ? '#3B82F6' : '#8B5CF6'}]}>
                                    <Text style={styles.strategyText}>{job.strategy}</Text>
                                </View>
                            )}
                        </View>
                        {job && (
                            <View style={[styles.statusBadge, {backgroundColor: getStatusColor(job.status)}]}>
                                <Text style={styles.statusText}>
                                    {job.status.replace('_', ' ')}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            {alert && <CustomAlert {...alert} onClose={hideAlert} />}

            <View style={styles.contentContainer}>
                {renderContent()}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(116, 140, 171, 0.2)',
        backgroundColor: '#0D1B2A',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 3,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
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
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
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

    // Main content styles
    detailsContainer: {
        flex: 1,
    },
    detailsScroll: {
        flex: 1,
        backgroundColor: '#1B263B',
    },
    mainContent: {
        flex: 1,
        paddingTop: 8,
    },
    section: {
        paddingVertical: 16,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    progressContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
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
    detailGrid: {
        paddingHorizontal: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 140,
    },
    valueContainer: {
        flex: 1,
        paddingLeft: 8,
    },
    detailLabel: {
        color: '#748CAB',
        fontSize: 14,
        marginLeft: 8,
        fontWeight: '500',
    },
    detailValue: {
        color: '#E2E8F0',
        fontSize: 14,
        lineHeight: 20,
    },

    // Actions section
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 4,
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

    eventsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        marginHorizontal: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    collapsibleTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    collapsibleTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    eventsContent: {
        overflow: 'hidden',
    },
    eventsList: {
        paddingHorizontal: 16,
    },
    eventItem: {
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    eventTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventStatusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    eventTitle: {
        color: 'white',
        fontWeight: '600',
    },
    eventTimestamp: {
        color: '#748CAB',
        fontSize: 12,
    },
    eventDescription: {
        color: '#E2E8F0',
        fontSize: 14,
    },

    // Loading states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingEventsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    loadingText: {
        color: '#748CAB',
        marginLeft: 8,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    eventsErrorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 16,
        padding: 16,
        backgroundColor: 'rgba(248, 113, 113, 0.1)',
        borderRadius: 8,
    },
    errorText: {
        color: '#F87171',
        fontSize: 16,
        textAlign: 'center',
        marginLeft: 8,
    },
    emptyEventsText: {
        color: '#748CAB',
        textAlign: 'center',
        padding: 16,
    },
}); 