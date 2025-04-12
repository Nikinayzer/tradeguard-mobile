import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Bot, ChevronLeft, Filter, History, SortAsc, SortDesc} from 'lucide-react-native';
import {JobCard} from '@/components/screens/auto/JobCard';
import {autoService, Job} from '@/services/api/auto';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SearchBar} from '@/components/common/SearchBar';
import CustomAlert, {useAlert} from '@/components/common/CustomAlert';

type JobListScreenRouteProp = RouteProp<{
    JobList: { initialTab: 'active' | 'finished' };
}, 'JobList'>;

type SortField = 'createdAt' | 'updatedAt' | 'id' | 'strategy' | 'status';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    order: SortOrder;
}

export default function JobListScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<JobListScreenRouteProp>();
    const [activeTab, setActiveTab] = useState<'active' | 'finished'>(route.params?.initialTab || 'active');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', order: 'desc' });

    const {alert, showAlert, hideAlert} = useAlert();

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
            showAlert({
                type: 'error',
                title: 'Refresh Failed',
                message: 'Failed to refresh jobs'
            });
            console.error('Error refreshing jobs:', error);
        }
    });

    async function fetchJobs() {
        try {
            setIsLoading(true);
            const apiJobs = await autoService.getAllJobs();
            setJobs(apiJobs || []);
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

    const handleViewJobDetails = (id: string) => {
        navigation.navigate('JobDetail', { id: id });
    };

    const handleSort = (field: SortField) => {
        setSortConfig(prev => ({
            field,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
        }));
    };

    const filteredAndSortedJobs = useMemo(() => {
        let filtered = jobs.filter(job => {
            const isActiveTab = activeTab === 'active';
            const matchesTab = isActiveTab
                ? job.status === 'IN_PROGRESS' || job.status === 'PAUSED'
                : job.status === 'FINISHED' || job.status === 'CANCELED';

            if (!matchesTab) return false;

            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                return (
                    job.jobId.toString().includes(searchLower) ||
                    job.strategy.toLowerCase().includes(searchLower) ||
                    job.status.toLowerCase().includes(searchLower) ||
                    job.coins.some(coin => coin.toLowerCase().includes(searchLower))
                );
            }
            return true;
        });

        return filtered.sort((a, b) => {
            const { field, order } = sortConfig;
            let comparison: number;

            switch (field) {
                case 'id':
                    comparison = Number(a.id) - Number(b.id);
                    break;
                case 'strategy':
                    comparison = a.strategy.localeCompare(b.strategy);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                case 'createdAt':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'updatedAt':
                    comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    break;
                default:
                    comparison = 0;
            }

            return order === 'asc' ? comparison : -comparison;
        });
    }, [jobs, activeTab, searchQuery, sortConfig]);

    const renderJob = ({item}: { item: Job }) => (
        <JobCard
            key={item.id}
            job={item}
            onViewDetails={() => handleViewJobDetails(item.id)}
        />
    );

    const renderSortButton = (field: SortField, label: string) => {
        const isActive = sortConfig.field === field;
        const Icon = isActive && sortConfig.order === 'desc' ? SortDesc : SortAsc;
        
        return (
            <TouchableOpacity
                style={[
                    styles.sortButton,
                    isActive && styles.sortButtonActive
                ]}
                onPress={() => handleSort(field)}
            >
                <Icon size={14} color={isActive ? '#3B82F6' : '#748CAB'} />
                <Text style={[
                    styles.sortButtonText,
                    isActive && styles.sortButtonTextActive
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>All Jobs</Text>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Bot size={16} color={activeTab === 'active' ? "#3B82F6" : "#748CAB"}/>
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Active ({activeJobs.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'finished' && styles.activeTab]}
                    onPress={() => setActiveTab('finished')}
                >
                    <History size={16} color={activeTab === 'finished' ? "#3B82F6" : "#748CAB"}/>
                    <Text style={[styles.tabText, activeTab === 'finished' && styles.activeTabText]}>
                        History ({finishedJobs.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.toolbarContainer}>
                <View style={styles.searchContainer}>
                    <SearchBar
                        placeholder="Search by ID, strategy, status..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        containerStyle={styles.searchBar}
                    />
                </View>

                <View style={styles.sortingContainer}>
                    <View style={styles.sortingHeader}>
                        <View style={styles.sortingTitleContainer}>
                            <Filter size={16} color="#748CAB" />
                            <Text style={styles.sortingTitle}>Sort by</Text>
                        </View>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.sortButtonsContainer}
                    >
                        {renderSortButton('id', 'ID')}
                        {renderSortButton('strategy', 'Strategy')}
                        {renderSortButton('status', 'Status')}
                        {renderSortButton('createdAt', 'Created')}
                        {renderSortButton('updatedAt', 'Updated')}
                    </ScrollView>
                </View>
            </View>

            <FlatList
                data={filteredAndSortedJobs}
                renderItem={renderJob}
                keyExtractor={item => item.jobId.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            {searchQuery
                                ? 'No jobs match your search'
                                : activeTab === 'active'
                                    ? 'No Active Jobs'
                                    : 'No Job History'}
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                            {searchQuery
                                ? 'Try adjusting your search terms'
                                : activeTab === 'active'
                                    ? 'When you create jobs, they will appear here while running'
                                    : 'Completed and canceled jobs will appear here'}
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={["#3B82F6"]}
                        tintColor="#3B82F6"
                    />
                }
            />

            {alert && <CustomAlert {...alert} onClose={hideAlert} />}

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#3B82F6"/>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D1B2A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(116, 140, 171, 0.2)',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
    },
    headerTitle: {
        flex: 1,
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        margin: 16,
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
    toolbarContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(116, 140, 171, 0.1)',
    },
    searchContainer: {
        marginBottom: 12,
    },
    searchBar: {
        marginVertical: 0,
    },
    sortingContainer: {
        marginBottom: 4,
    },
    sortingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sortingTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sortingTitle: {
        color: '#748CAB',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 6,
    },
    sortButtonsContainer: {
        paddingRight: 16,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    sortButtonActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
    },
    sortButtonText: {
        color: '#748CAB',
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 6,
    },
    sortButtonTextActive: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    listContent: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: 'rgba(13, 27, 42, 0.5)',
        borderRadius: 12,
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
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(13, 27, 42, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 