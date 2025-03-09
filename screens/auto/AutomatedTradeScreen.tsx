import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, FlatList} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Card} from '@/components';
import {CoinSelector} from '@/components/screens/trade/CoinSelector';
import {Bot, Play, Pause, Trash2, ChevronRight, Plus, Clock, Settings} from 'lucide-react-native';
import {Job, JobCard} from "@/components/screens/auto/JobCard";

interface Coin {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

const jobs: Job[] = [
    {
        id: "100",
        type: "dca",
        currentStep: 1,
        totalSteps: 10,
        status: "active",
        coins: []
    },
    {
        id: "101",
        type: "liq",
        currentStep: 3,
        totalSteps: 5,
        status: "paused",
        coins: []
    }
];

const AutomatedTradeScreen: React.FC = ({navigation}: any) => {
    const [selectedCoins, setSelectedCoins] = useState<Coin[]>([]);
    const [jobs, setJob] = useState<Job[]>([]);

    const handleSelectCoin = (coin: Coin) => {
        setSelectedCoins(prev => {
            const isSelected = prev.some(c => c.symbol === coin.symbol);
            if (isSelected) {
                return prev.filter(c => c.symbol !== coin.symbol);
            } else {
                return [...prev, coin];
            }
        });
    };

    const handleCreateJob = () => {
        if (selectedCoins.length === 0) {
            Alert.alert('Error', 'Please select at least one coin'); //todo replace with disabled button
            return;
        }

        const newJob: Job = {
            id: Date.now().toString(),
            coins: selectedCoins,
            status: 'active',
            currentStep: 1,
            totalSteps: 10,
            type: 'dca',
        };

        setJob([...jobs, newJob]);
        setSelectedCoins([]);
    };

    const handleToggleJob = (id: string) => {
        setJob(jobs.map(job =>
            job.id === id
                ? {...job, status: job.status === 'active' ? 'paused' : 'active'}
                : job
        ));
    };

    const handleDeleteJob = (id: string) => {
        setJob(jobs.filter(job => job.id !== id));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 20}}>
                <View style={styles.header}>
                    <Bot size={24} color="white"/>
                    <Text style={styles.title}>Automated Trading</Text>
                </View>

                <CoinSelector
                    selectedCoins={selectedCoins}
                    onSelect={handleSelectCoin}
                />

                {selectedCoins.length > 0 && (
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateJob}
                    >
                        <Text style={styles.createButtonText}>
                            Create new job ({selectedCoins.length} coins)
                        </Text>
                    </TouchableOpacity>
                )}

                {jobs.length === 0 && (
                    <Card>
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                No automated jobs created yet
                            </Text>
                        </View>
                    </Card>
                )}

                {/* Jobs List Header */}
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>Active Jobs</Text>
                        <Text style={styles.sectionSubtitle}>{jobs.length} running jobs</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.seeAllButton}
                        onPress={() => navigation.navigate('Jobs')}
                    >
                        <Text style={styles.seeAllText}>View All</Text>
                        <ChevronRight size={16} color="#3B82F6"/>
                    </TouchableOpacity>
                </View>

                {/* Jobs List */}
                <View>
                    {jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onToggle={handleToggleJob}
                            onDelete={handleDeleteJob}
                        />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
        marginLeft: 12,
    },
    createButton: {
        backgroundColor: '#3B82F6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
    },
    createButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    strategiesContainer: {
        gap: 16,
    },
    strategyCard: {
        padding: 16,
    },
    strategyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    strategyInfo: {
        flex: 1,
    },
    strategyType: {
        fontSize: 14,
        color: '#748CAB',
        marginBottom: 8,
    },
    coinsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    coinTag: {
        backgroundColor: '#22314A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    coinTagText: {
        fontSize: 12,
        color: 'white',
    },
    strategyActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        padding: 8,
    },
    strategyStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        color: '#748CAB',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
    },
    emptyText: {
        color: '#748CAB',
        fontSize: 16,
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
    },
    sectionSubtitle: {
        fontSize: 14,
        color: "#748CAB",
        marginTop: 4,
    },
    seeAllButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    seeAllText: {
        color: "#3B82F6",
        fontSize: 14,
        marginRight: 4,
    },
    jobsList: {
        gap: 12,
    },
    jobCard: {
        backgroundColor: "#1B263B",
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#22314A",
    },
    jobHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    jobIdContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    jobId: {
        fontSize: 16,
        fontWeight: "700",
        color: "white",
    },
    strategyBadge: {
        backgroundColor: "#22314A",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    strategyText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#748CAB",
    },
    statusContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#22314A",
        justifyContent: "center",
        alignItems: "center",
    },
    jobDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: "#748CAB",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "white",
    },
    buyText: {
        color: "#22C55E",
    },
    sellText: {
        color: "#EF4444",
    },
    progressBar: {
        height: 4,
        backgroundColor: "#22314A",
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#3B82F6",
        borderRadius: 2,
    },
    stepsContainer: {
        alignItems: "center",
    },
    stepsText: {
        fontSize: 12,
        color: "#748CAB",
    },
    coinsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    coinBadge: {
        backgroundColor: "#22314A",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    coinText: {
        fontSize: 12,
        color: "#748CAB",
    },
});

export default AutomatedTradeScreen; 