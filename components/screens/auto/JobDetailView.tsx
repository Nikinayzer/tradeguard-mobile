import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ActivityIndicator, FlatList, 
    ScrollView, TouchableOpacity
} from 'react-native';
import {
    Clock, DollarSign, ChevronDown, X, ArrowRight, 
    Coins, ListOrdered, AlertTriangle, ChevronUp,
    Pause, Play, StopCircle
} from 'lucide-react-native';
import { autoService, Job, JobEvent } from '@/services/api/auto';
import { 
    formatDate, formatDateTime, formatTimeAgo, getEventColor, 
    getEventText, getEventDescription, getStatusColor, 
    getStatusText, calculateRemainingTime 
} from './jobUtils';

interface JobDetailViewProps {
    job: Job;
    onClose: () => void;
    onToggle?: () => void;
    onDelete?: () => void;
    onStop?: () => void;
}

export function JobDetailView({ job, onClose, onToggle, onDelete, onStop }: JobDetailViewProps) {
    const [jobEvents, setJobEvents] = useState<JobEvent[]>([]);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const progressPercentage = (job.stepsDone / job.stepsTotal) * 100;
    const isActive = job.status === 'IN_PROGRESS';
    const isPaused = job.status === 'PAUSED';
    const isFinished = job.status === 'FINISHED' || job.status === 'CANCELED';
    
    useEffect(() => {
        fetchJobEvents();
    }, [job.jobId]);
    
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
    
    return (
        <View style={styles.container}>
            <View style={styles.statusContainer}>
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
            
            <ScrollView style={styles.detailsScroll}>
                <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Job Details</Text>
                    
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
                                <Text style={styles.detailValue}>100</Text>
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
                                <Text style={styles.detailValue}>{formatDate(job.createdAt)}</Text>
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
                    <View style={styles.actionsSection}>
                        <View style={styles.actionButtonsContainer}>
                            {isActive && onStop && (
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.stopButton]} 
                                    onPress={onStop}
                                >
                                    <StopCircle size={18} color="white" />
                                    <Text style={styles.actionButtonText}>Stop</Text>
                                </TouchableOpacity>
                            )}
                            
                            {onToggle && (
                                <TouchableOpacity 
                                    style={[
                                        styles.actionButton, 
                                        isActive ? styles.pauseButton : styles.resumeButton
                                    ]} 
                                    onPress={onToggle}
                                >
                                    {isActive ? (
                                        <>
                                            <Pause size={18} color="white" />
                                            <Text style={styles.actionButtonText}>Pause</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Play size={18} color="white" />
                                            <Text style={styles.actionButtonText}>Resume</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                            
                            {onDelete && (
                                <TouchableOpacity 
                                    style={[styles.actionButton, styles.cancelButton]} 
                                    onPress={onDelete}
                                >
                                    <X size={18} color="white" />
                                    <Text style={styles.actionButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}
                
                <View style={styles.eventsSection}>
                    <Text style={styles.sectionTitle}>Events History</Text>
                    
                    {isLoadingEvents ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#3B82F6"/>
                            <Text style={styles.loadingText}>Loading events...</Text>
                        </View>
                    ) : error ? (
                        <View style={styles.errorContainer}>
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
                                            <Text style={styles.eventTitle}>{getEventText(item.eventType)}</Text>
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
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1B263B',
        borderRadius: 12,
    },
    statusContainer: {
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    statusText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 12,
    },
    progressContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
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
    detailsScroll: {
        flex: 1,
    },
    detailsSection: {
        padding: 16,
        borderBottomWidth: 0,
        borderBottomColor: 'rgba(116, 140, 171, 0.2)',
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    detailGrid: {
        marginBottom: 8,
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
    eventsSection: {
        padding: 16,
    },
    eventsList: {
        paddingBottom: 16,
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    loadingText: {
        color: '#748CAB',
        marginLeft: 8,
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
    },
    emptyEventsText: {
        color: '#748CAB',
        textAlign: 'center',
        padding: 16,
    },
    actionsSection: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
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
}); 