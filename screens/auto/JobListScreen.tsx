import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Bot, ChevronLeft, Filter, History, SortAsc, SortDesc, Calendar, Clock, Tag, AlertCircle} from 'lucide-react-native';
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
import { useActiveJobs } from '@/services/redux/hooks';
import { useDispatch } from 'react-redux';
import { updateActiveJobs } from '@/services/redux/slices/activeJobsSlice';
import { CategorySelector } from '@/components/screens/market/CategorySelector';
import { SortSelector, SortField } from '@/components/common/SortSelector';

type JobListScreenRouteProp = RouteProp<{
    JobList: { initialTab: 'active' | 'finished' };
}, 'JobList'>;

type JobSortField = 'createdAt' | 'updatedAt' | 'id' | 'strategy' | 'status';
type SortOrder = 'asc' | 'desc';

interface SortConfig {
    field: JobSortField;
    order: SortOrder;
}

const CATEGORIES = [
    { name: 'Active', icon: Bot },
    { name: 'History', icon: History }
];

const SORT_FIELDS: SortField[] = [
    { key: 'strategy', label: 'Strategy', icon: Tag },
    { key: 'status', label: 'Status', icon: AlertCircle },
    { key: 'createdAt', label: 'Created', icon: Calendar },
    { key: 'updatedAt', label: 'Updated', icon: Clock }
];

export default function JobListScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<JobListScreenRouteProp>();
    const {colors} = useTheme();
    const dispatch = useDispatch();
    const {alert, showAlert, hideAlert} = useAlert();

    const fetchFinishedJobs = async () => {
        try {
            const response = await autoService.getCompletedjobs();
            setFinishedJobs(response);
        } catch (error) {
            console.error('Error fetching finished jobs:', error);
            showAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to fetch finished jobs'
            });
        }
    };

    const { jobs: activeJobs, lastUpdated } = useActiveJobs();
    const [finishedJobs, setFinishedJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedCategory, setSelectedCategory] = useState<'Active' | 'History'>(
        route.params?.initialTab === 'active' ? 'Active' : 'History'
    );
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', order: 'desc' });

    // Fetch completed jobs on mount
    useEffect(() => {
        fetchFinishedJobs();
    }, []);

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: async () => {
            if (selectedCategory === 'History') {
                await fetchFinishedJobs();
            }
        },
        onError: (error) => {
            showAlert({
                type: 'error',
                title: 'Refresh Failed',
                message: 'Failed to refresh jobs'
            });
            console.error('Error refreshing jobs:', error);
        }
    });

    const handleViewJobDetails = (id: string) => {
        navigation.navigate('JobDetail', { id: id });
    };

    const handleSort = (field: string) => {
        setSortConfig(prev => ({
            field: field as JobSortField,
            order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
        }));
    };

    const jobs = selectedCategory === 'Active' ? activeJobs : finishedJobs;

    const filteredAndSortedJobs = useMemo(() => {
        let filtered = jobs.filter(job => {
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                return job.coins.some(coin =>
                    coin.toLowerCase().includes(searchLower)
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
    }, [jobs, searchQuery, sortConfig]);

    const renderJob = ({item}: { item: Job }) => (
        <JobCard
            key={item.id}
            job={item}
            onViewDetails={() => handleViewJobDetails(item.id.toString())}
        />
    );

    const jobCount = selectedCategory === 'Active' ? activeJobs.length : finishedJobs.length;

    return (
        <SafeAreaView style={{...styles.safeArea, backgroundColor: colors.background}}>
            <ThemedHeader
                title="All Jobs"
                subtitle={`${jobCount} ${selectedCategory.toLowerCase()} jobs`}
                canGoBack={true}
                onBack={() => navigation.goBack()}
                canRefresh={true}
                onRefresh={handleRefresh}
                showLastUpdated={false}
            />

            <ThemedView style={styles.categoryContainer}>
                <CategorySelector
                    categories={CATEGORIES.map(category => ({
                        ...category,
                        count: category.name === 'Active' ? activeJobs.length : finishedJobs.length
                    }))}
                    selectedCategory={selectedCategory}
                    onSelectCategory={(category) => setSelectedCategory(category as 'Active' | 'History')}
                />
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

                <SortSelector
                    fields={SORT_FIELDS}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
            </ThemedView>

            <FlatList
                data={filteredAndSortedJobs}
                renderItem={renderJob}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <ThemedView variant="transparent" style={styles.emptyState} rounded="large">
                        <ThemedText variant="bodyBold" style={styles.emptyStateText}>
                            {searchQuery
                                ? 'No jobs match your search'
                                : selectedCategory === 'Active' ? 'No Active Jobs' : 'No Finished Jobs'}
                        </ThemedText>
                        <ThemedText variant="caption" secondary style={styles.emptyStateSubtext}>
                            {searchQuery
                                ? 'Try adjusting your search terms'
                                : selectedCategory === 'Active' 
                                    ? 'When you create jobs, they will appear here while running'
                                    : 'Finished jobs will appear here'}
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
    categoryContainer: {
        marginTop: 4,
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    toolbarContainer: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 12,
    },
    searchContainer: {
        width: '100%',
    },
    searchBar: {
        marginVertical: 0,
    },
    listContent: {
        padding: 16,
        paddingTop: 8,
        gap: 12,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 24,
    },
    emptyStateText: {
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyStateSubtext: {
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
}); 