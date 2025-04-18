import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View
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
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedView} from '@/components/ui/ThemedView';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedHeader} from '@/components/ui/ThemedHeader';

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
    const {colors} = useTheme();

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
                    isActive && styles.sortButtonActive,
                    { 
                        backgroundColor: isActive 
                            ? `${colors.primary}15` 
                            : colors.backgroundTertiary,
                        borderColor: isActive ? colors.primary : 'transparent'
                    }
                ]}
                onPress={() => handleSort(field)}
            >
                <Icon size={14} color={isActive ? colors.primary : colors.textSecondary} />
                <ThemedText 
                    variant="caption" 
                    color={isActive ? colors.primary : colors.textSecondary}
                    style={{
                        ...styles.sortButtonText,
                        ...(isActive ? { fontWeight: '600' } : {})
                    }}
                >
                    {label}
                </ThemedText>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{...styles.safeArea, backgroundColor: colors.background}}>
            <ThemedHeader
                title="All Jobs"
                canGoBack={true}
                onBack={() => navigation.goBack()}
            />

            <ThemedView 
                variant="section" 
                style={styles.tabContainer}
                rounded="large"
            >
                <TouchableOpacity
                    style={[
                        styles.tab, 
                        activeTab === 'active' && {
                            backgroundColor: `${colors.primary}15`,
                        }
                    ]}
                    onPress={() => setActiveTab('active')}
                >
                    <Bot size={16} color={activeTab === 'active' ? colors.primary : colors.textSecondary}/>
                    <ThemedText 
                        variant="bodySmall" 
                        color={activeTab === 'active' ? colors.primary : colors.textSecondary}
                        style={{
                            ...styles.tabText, 
                            ...(activeTab === 'active' ? { fontWeight: '600' } : {})
                        }}
                    >
                        Active ({activeJobs.length})
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab, 
                        activeTab === 'finished' && {
                            backgroundColor: `${colors.primary}15`,
                        }
                    ]}
                    onPress={() => setActiveTab('finished')}
                >
                    <History size={16} color={activeTab === 'finished' ? colors.primary : colors.textSecondary}/>
                    <ThemedText 
                        variant="bodySmall" 
                        color={activeTab === 'finished' ? colors.primary : colors.textSecondary}
                        style={{
                            ...styles.tabText, 
                            ...(activeTab === 'finished' ? { fontWeight: '600' } : {})
                        }}
                    >
                        History ({finishedJobs.length})
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>

            <ThemedView variant="transparent" style={styles.toolbarContainer}>
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
                            <Filter size={16} color={colors.textSecondary} />
                            <ThemedText variant="caption" secondary style={styles.sortingTitle}>Sort by</ThemedText>
                        </View>
                    </View>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.sortButtonsContainer}
                    >
                        {renderSortButton('strategy', 'Strategy')}
                        {renderSortButton('status', 'Status')}
                        {renderSortButton('createdAt', 'Created')}
                        {renderSortButton('updatedAt', 'Updated')}
                    </ScrollView>
                </View>
            </ThemedView>

            <FlatList
                data={filteredAndSortedJobs}
                renderItem={renderJob}
                keyExtractor={item => item.jobId.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <ThemedView variant="transparent" style={styles.emptyState} rounded="large">
                        <ThemedText variant="bodyBold" style={styles.emptyStateText}>
                            {searchQuery
                                ? 'No jobs match your search'
                                : activeTab === 'active'
                                    ? 'No Active Jobs'
                                    : 'No Job History'}
                        </ThemedText>
                        <ThemedText variant="caption" secondary style={styles.emptyStateSubtext}>
                            {searchQuery
                                ? 'Try adjusting your search terms'
                                : activeTab === 'active'
                                    ? 'When you create jobs, they will appear here while running'
                                    : 'Completed and canceled jobs will appear here'}
                        </ThemedText>
                    </ThemedView>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            />

            {alert && <CustomAlert {...alert} onClose={hideAlert} />}

            {isLoading && (
                <ThemedView 
                    variant="section" 
                    style={styles.loadingOverlay}
                >
                    <ActivityIndicator size="large" color={colors.primary}/>
                </ThemedView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        margin: 16,
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
    tabText: {
        fontSize: 14,
        marginLeft: 8,
    },
    toolbarContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
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
        fontSize: 13,
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
        marginRight: 8,
        borderWidth: 1,
    },
    sortButtonText: {
        fontSize: 13,
        marginLeft: 6,
    },
    listContent: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    emptyStateText: {
        marginBottom: 8,
    },
    emptyStateSubtext: {
        textAlign: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortButtonActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
    },
}); 