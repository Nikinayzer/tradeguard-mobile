import React, {useState, useEffect, useMemo, createContext} from 'react';
import {
    StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated, RefreshControl, View
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {JobCreator} from '@/components/screens/auto/JobCreator';
import {JobCard} from '@/components/screens/auto/JobCard';
import {autoService, DCAJobParams, LIQJobParams} from '@/services/api/auto';
import {usePullToRefresh} from '@/hooks/usePullToRefresh';
import {Bot, History, Plus, ArrowRight, ChevronRight} from 'lucide-react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "@/services/redux/store";
import {setSelectedCoins} from "@/services/redux/slices/jobStateSlice";
import CustomAlert, {useAlert} from '@/components/common/CustomAlert';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedText} from '@/components/ui/ThemedText';
import {ThemedTitle} from '@/components/ui/ThemedTitle';
import {ThemedHeader} from '@/components/ui/ThemedHeader';
import {ThemedView} from '@/components/ui/ThemedView';
import SwipeButton from "rn-swipe-button/src/components/SwipeButton";
import {useActiveJobs, useJob} from '@/services/redux/hooks';
import {updateActiveJobs} from '@/services/redux/slices/activeJobsSlice';

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
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitButtonScale] = useState(new Animated.Value(1));
    const {colors} = useTheme();

    const dispatch = useDispatch();
    const {jobType, jobParams, selectedCoins} = useSelector((state: RootState) => state.job);
    const {jobs, lastUpdated} = useActiveJobs();

    const {alert, showAlert, hideAlert} = useAlert();

    const activeJobs = jobs;

    const {isRefreshing, handleRefresh} = usePullToRefresh({
        onRefresh: () => {
            // maybe reset params
            return Promise.resolve();
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

    const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

    const handleButtonPressIn = () => {
        Animated.spring(submitButtonScale, {
            toValue: 0.97,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    };

    const handleButtonPressOut = () => {
        Animated.spring(submitButtonScale, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

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
                    coins: selectedCoins,
                });
            } else {
                await autoService.createLIQJob({
                    ...jobParams as LIQJobParams,
                    coins: selectedCoins,
                });
            }

            showAlert({
                type: 'success',
                title: 'Job Created',
                message: `Your ${jobType} job was successfully created`
            });
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
            <ThemedView style={styles.safeArea} variant="screen">
                <SafeAreaView style={{flex: 1}}>
                    <ThemedHeader
                        title="Create Strategy"
                        subtitle="Choose a strategy below to get started"
                        onRefresh={handleRefresh}
                        canRefresh={true}
                        lastUpdated={lastUpdated ? new Date(lastUpdated) : undefined}
                    />

                    <ScrollView
                        style={styles.container}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                colors={[colors.primary]}
                                tintColor={colors.primary}
                            />
                        }
                        onStartShouldSetResponder={() => {
                            setActiveTooltipId(null);
                            return false;
                        }}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <ThemedView style={styles.contentContainer} variant="transparent">
                            <JobCreator/>

                            <View style={styles.createButtonContainer}>
                                <SwipeButton
                                    title={selectedCoins.length > 0 ? `Create ${jobType} with ${selectedCoins.length} coin${selectedCoins.length > 1 ? 's' : ''}` : `Choose coins to continue`}
                                    disabled={isSubmitting || selectedCoins.length === 0}
                                    disabledRailBackgroundColor={`${colors.primary}30`}
                                    disabledThumbIconBackgroundColor={"white"}
                                    disabledThumbIconBorderColor={"white"}
                                    height={70}
                                    shouldResetAfterSuccess={true}
                                    resetAfterSuccessAnimDelay={1000}
                                    onSwipeSuccess={handleJobComplete}
                                    swipeSuccessThreshold={90}
                                    railBackgroundColor={`${colors.primary}95`}
                                    railFillBackgroundColor={`${colors.primary}99`}
                                    thumbIconBackgroundColor={colors.buttonPrimaryText}
                                    thumbIconBorderColor={colors.primary}
                                    titleColor={colors.buttonPrimaryText}
                                    titleFontSize={16}
                                    titleStyles={{
                                        fontWeight: '600',
                                    }}
                                    containerStyles={{
                                        borderRadius: 50,
                                        borderWidth: 0,
                                    }}
                                    railBorderColor="transparent"
                                    railFillBorderColor="transparent"
                                    thumbIconComponent={() =>
                                        isSubmitting ?
                                            <ActivityIndicator size="small" color={colors.primary}/> :
                                            <ArrowRight size={20} color={colors.primary}/>
                                    }
                                />
                            </View>
                            {activeJobs.length > 0 ? (
                                <ThemedView style={styles.recentJobsSection} variant="transparent">
                                    <TouchableOpacity
                                        style={styles.sectionHeader}
                                        onPress={() => navigateToJobList('active')}
                                    >
                                        <ThemedView variant="transparent">
                                            <ThemedTitle variant="medium" mb={2}>Active Jobs</ThemedTitle>
                                            <ThemedText variant="bodySmall" secondary>
                                                Your running automated strategies
                                            </ThemedText>
                                        </ThemedView>
                                        <ThemedView style={styles.viewAllContainer} variant="transparent">
                                            <ThemedText variant="label" color={colors.primary} weight="600">
                                                View All
                                            </ThemedText>
                                            <ChevronRight size={16} color={colors.primary}/>
                                        </ThemedView>
                                    </TouchableOpacity>

                                    {activeJobs.map(job => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            onViewDetails={() => handleViewJobDetails(job.id)}
                                        />
                                    ))}
                                </ThemedView>
                            ) : (
                                <ThemedView
                                    variant="card"
                                    style={styles.emptyStateContainer}
                                    border
                                    rounded="large"
                                >
                                    <ThemedView
                                        style={{
                                            ...styles.emptyStateIconContainer,
                                            backgroundColor: `${colors.primary}19`
                                        }}
                                        rounded="full"
                                    >
                                        <Plus size={32} color={colors.primary}/>
                                    </ThemedView>
                                    <ThemedTitle variant="small" mb={8} centered>No Active Jobs</ThemedTitle>
                                    <ThemedText variant="bodySmall" secondary centered>
                                        Create a job to start automated trading
                                    </ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </ScrollView>

                    {alert && <CustomAlert {...alert} onClose={hideAlert}/>}
                </SafeAreaView>
            </ThemedView>
        </TooltipContext.Provider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    contentContainer: {
        marginTop: 8,
    },
    createButton: {
        marginHorizontal: 16,
        marginBottom: 40,
        borderRadius: 14,
        elevation: 8,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    gradientButton: {
        borderRadius: 14,
    },
    createButtonContainer: {
        marginHorizontal: 16,
        marginBottom: 40,
        borderRadius: 50,
        overflow: 'hidden',
        elevation: 8,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowColor: '#00000040',
    },
    slideButton: {
        shadowColor: 'transparent'
    },
    createButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
    },
    createButtonTextContainer: {
        flexDirection: 'column',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        borderRadius: 14,
        padding: 4,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 12,
    },
    recentJobsSection: {
        marginHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emptyStateContainer: {
        padding: 28,
        marginHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    emptyStateIconContainer: {
        marginBottom: 16,
        padding: 20,
    },
    loadingOverlay: {
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobsCaption: {
        marginBottom: 16,
        marginTop: 8,
        paddingHorizontal: 16,
    },
});