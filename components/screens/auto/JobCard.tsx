import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated, FlatList, Pressable, ActivityIndicator, GestureResponderEvent} from 'react-native';
import {
    Clock,
    DollarSign,
    ChevronDown,
    Pause,
    Play,
    X,
    ArrowRight,
    Coins,
    StopCircle,
    ChevronUp,
    ListOrdered,
    AlertTriangle,
    ChevronRight
} from 'lucide-react-native';
import {autoService, Job, JobEvent, JobStatus} from '@/services/api/auto';
import { formatDate, formatTimeAgo, formatDateTime as dateTimeFormat, getStatusColor, getStatusText, getEventColor, getEventText, getEventDescription, calculateRemainingTime } from './jobUtils';

interface JobCardProps {
    job: Job;
    onToggle?: () => void;
    onDelete?: () => void;
    onStop?: () => void;
    onViewDetails?: (jobId: number) => void;
    isFinished?: boolean;
    compact?: boolean;
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
}

function BaseJobCard({job, children, compact = false, onPress}: { 
    job: Job, 
    children?: React.ReactNode, 
    compact?: boolean,
    onPress?: () => void 
}) {
    const [showSteps, setShowSteps] = useState(false);
    const [jobEvents, setJobEvents] = useState<JobEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const progressPercentage = (job.stepsDone / job.stepsTotal) * 100;

    const formattedCreatedAt = formatDate(job.createdAt);
    const timeAgo = formatTimeAgo(job.updatedAt);

    const [animation] = useState(new Animated.Value(0));

    const toggleSteps = async () => {
        if (!showSteps && jobEvents.length === 0) {
            await fetchJobEvents();
        }

        Animated.timing(animation, {
            toValue: showSteps ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();

        setShowSteps(!showSteps);
    };

    const fetchJobEvents = async () => {
        try {
            setIsLoadingEvents(true);
            setError(null);

            const events = await autoService.getJobEvents(job.jobId.toString());
            setJobEvents(events);
        } catch (err) {
            console.error('Error fetching job events:', err);
            setError('Failed to load job events');
        } finally {
            setIsLoadingEvents(false);
        }
    };

    const maxHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 400], //max height of collapsible
    });

    if (compact) {
        return (
            <TouchableOpacity 
                style={[styles.container, styles.compactContainer]} 
                activeOpacity={0.7}
                onPress={onPress}
            >
                <View style={styles.header}>
                    <View style={styles.strategyContainer}>
                        <View
                            style={[styles.strategyBadge, {backgroundColor: job.strategy === 'DCA' ? '#3B82F6' : '#8B5CF6'}]}>
                            <Text style={styles.strategyText}>{job.strategy}</Text>
                        </View>
                        <Text style={styles.jobIdText}>#{job.jobId}</Text>

                        <View style={[styles.sideBadge, {backgroundColor: job.side === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)'}]}>
                            <Text style={[styles.sideText, {color: job.side === 'BUY' ? '#10B981' : '#F87171'}]}>
                                {job.side}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.statusBadge, {backgroundColor: getStatusColor(job.status)}]}>
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
                                    backgroundColor: getStatusColor(job.status)
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
                            <Coins size={14} color="#748CAB"/>
                            <Text style={styles.infoLabelHighlight}>Coins:</Text>
                            <Text style={styles.infoValueHighlight} numberOfLines={1} ellipsizeMode="tail">
                                {job.coins.join(', ')}
                            </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Clock size={14} color="#748CAB"/>
                            <Text style={styles.infoLabel}>Created:</Text>
                            <Text style={styles.infoValue}>{formattedCreatedAt}</Text>
                        </View>
                    </View>
                    
                    {/* Right column */}
                    <View style={styles.infoColumn}>
                        <View style={styles.infoRow}>
                            <DollarSign size={14} color="#748CAB"/>
                            <Text style={styles.infoLabelHighlight}>Amount:</Text>
                            <Text style={styles.infoValueHighlight}>{job.amount}$</Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                            <Clock size={14} color="#748CAB"/>
                            <Text style={styles.infoLabel}>Updated:</Text>
                            <Text style={styles.infoValue}>{timeAgo}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.estimateContainer}>
                    {job.status === 'IN_PROGRESS' ? (
                        <View style={styles.estimateContent}>
                            <Clock size={14} color="#3B82F6"/>
                            <Text style={styles.estimateText}>
                                {calculateRemainingTime(job)}
                            </Text>
                        </View>
                    ) : null}
                </View>

                <Text style={styles.miniHint}>
                    Tap for {job.status === 'FINISHED' || job.status === 'CANCELED' ? 'details and history' : 'actions'}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.strategyContainer}>
                    <View
                        style={[styles.strategyBadge, {backgroundColor: job.strategy === 'DCA' ? '#3B82F6' : '#8B5CF6'}]}>
                        <Text style={styles.strategyText}>{job.strategy}</Text>
                    </View>
                    <Text style={styles.jobIdText}>#{job.jobId}</Text>

                    <View style={[styles.sideBadge, {backgroundColor: job.side === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(248, 113, 113, 0.2)'}]}>
                        <Text style={[styles.sideText, {color: job.side === 'BUY' ? '#10B981' : '#F87171'}]}>
                            {job.side}
                        </Text>
                    </View>
                </View>

                <View style={[styles.statusBadge, {backgroundColor: getStatusColor(job.status)}]}>
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
                                backgroundColor: getStatusColor(job.status)
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
                        <Coins size={14} color="#748CAB"/>
                        <Text style={styles.infoLabelHighlight}>Coins:</Text>
                        <Text style={styles.infoValueHighlight} numberOfLines={1} ellipsizeMode="tail">
                            {job.coins.join(', ')}
                        </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Clock size={14} color="#748CAB"/>
                        <Text style={styles.infoLabel}>Created:</Text>
                        <Text style={styles.infoValue}>{formattedCreatedAt}</Text>
                    </View>
                </View>
                
                {/* Right column */}
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <DollarSign size={14} color="#748CAB"/>
                        <Text style={styles.infoLabelHighlight}>Amount:</Text>
                        <Text style={styles.infoValueHighlight}>100</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Clock size={14} color="#748CAB"/>
                        <Text style={styles.infoLabel}>Updated:</Text>
                        <Text style={styles.infoValue}>{timeAgo}</Text>
                    </View>
                </View>
            </View>

            {job.status === 'IN_PROGRESS' && (
                <View style={styles.detailRow}>
                    <Clock size={14} color="#748CAB"/>
                    <Text style={styles.detailLabel}>Estimate:</Text>
                    <Text style={styles.detailValue}>
                        {calculateRemainingTime(job)}
                    </Text>
                </View>
            )}

            <Pressable
                style={styles.showStepsButton}
                onPress={toggleSteps}
            >
                <ListOrdered size={14} color="#748CAB"/>
                <Text style={styles.showStepsText}>View Steps History</Text>
                {showSteps ? (
                    <ChevronUp size={14} color="#748CAB"/>
                ) : (
                    <ChevronDown size={14} color="#748CAB"/>
                )}
            </Pressable>

            {/* Collapsible events section */}
            <Animated.View style={[styles.collapsibleContainer, {maxHeight}]}>
                {isLoadingEvents ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#3B82F6"/>
                        <Text style={styles.loadingText}>Loading steps...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <AlertTriangle size={14} color="#F87171"/>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : (
                        <FlatList
                            data={jobEvents}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.stepsList}
                            ListEmptyComponent={
                                <Text style={styles.emptyStepsText}>No events available</Text>
                            }
                            renderItem={({item}) => (
                                <View style={styles.stepItem}>
                                    <View style={styles.stepHeader}>
                                        <View style={styles.stepNumberContainer}>
                                            <View
                                                style={[styles.stepStatusDot, {backgroundColor: getEventColor(item.eventType)}]}/>
                                            <Text style={styles.stepNumber}>Event {item.id}</Text>
                                        </View>
                                        <Text style={[styles.stepStatus, {color: getEventColor(item.eventType)}]}>
                                            {getEventText(item.eventType)}
                                        </Text>
                                    </View>

                                    <Text style={styles.stepDetails}>{getEventDescription(item)}</Text>

                                    {item.timestamp && (
                                        <Text style={styles.stepTimestamp}>
                                            {formatDateTime(item.timestamp)}
                                        </Text>
                                    )}
                                </View>
                            )}
                        />
                )}
            </Animated.View>
            {children}
        </View>
    );
}

// Active Job Card Component
function ActiveJobCard({
                           job,
                           onToggle,
                           onDelete,
                           onStop,
                           onViewDetails = undefined,
                           compact = false
                       }: Required<Omit<JobCardProps, 'isFinished' | 'onViewDetails'>> & { 
                           compact?: boolean,
                           onViewDetails?: (jobId: number) => void 
                       }) {
    const isActive = job.status === 'IN_PROGRESS';
    const isPaused = job.status === 'PAUSED';

    const handleCardPress = () => {
        if (onViewDetails) {
            onViewDetails(job.jobId);
        }
    };

    return (
        <BaseJobCard job={job} compact={compact} onPress={handleCardPress} />
    );
}

function FinishedJobCard({job, onViewDetails, compact = false}: Required<Pick<JobCardProps, 'job' | 'onViewDetails'>> & {
    isFinished: true,
    compact?: boolean
}) {
    const handleCardPress = () => {
        onViewDetails(job.jobId);
    };

    return (
        <BaseJobCard job={job} compact={compact} onPress={handleCardPress} />
    );
}

// Main JobCard Component (decides which version to render)
export function JobCard(props: JobCardProps) {
    const {isFinished, compact = false, ...otherProps} = props;

    if (isFinished) {
        if (!props.onViewDetails) {
            console.warn('JobCard: onViewDetails prop is required for finished jobs');
            return null;
        }
        return <FinishedJobCard {...otherProps as any} onViewDetails={props.onViewDetails} isFinished={true} compact={compact}/>;
    } else {
        // For active jobs
        if (!props.onToggle || !props.onDelete || !props.onStop) {
            console.warn('JobCard: onToggle, onDelete, and onStop props are required for active jobs');
            return null;
        }
        return <ActiveJobCard
            job={props.job}
            onToggle={props.onToggle}
            onDelete={props.onDelete}
            onStop={props.onStop}
            onViewDetails={props.onViewDetails}
            compact={compact}
        />;
    }
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
