import React, {useState} from 'react';
import {View, StyleSheet, ScrollView, Alert, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TradeTypeSwitch} from '@/components';
import {PositionForm} from '@/components';
import {TradingPairSelector} from '@/components/screens/trade/TradingPairSelector';
import {Card} from '@/components';

interface TradingPair {
    symbol: string;
    name: string;
    icon: string;
    price: string;
    change24h: string;
    isPositive: boolean;
}

const TradeScreen: React.FC = () => {
    const [isFutures, setIsFutures] = useState(true);
    const [selectedPair, setSelectedPair] = useState<TradingPair | null>(null);

    const handleOpenPosition = (
        type: 'long' | 'short',
        amount: number,
        leverage: number,
        orderType: 'market' | 'limit',
        stopLoss?: number,
        takeProfit?: number
    ) => {
        if (!selectedPair) {
            Alert.alert('Error', 'Please select a trade pair');
            return;
        }

        Alert.alert(
            'Position Opened',
            `Opened ${type} ${orderType} position for ${amount} USDT with ${leverage}x leverage\n` +
            `Stop Loss: ${stopLoss ? `${stopLoss}%` : 'None'}\n` +
            `Take Profit: ${takeProfit ? `${takeProfit}%` : 'None'}`
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={{paddingBottom: 20}}>
                <TradeTypeSwitch
                    isFutures={isFutures}
                    onToggle={setIsFutures}
                />

                {isFutures ? (
                    <>
                        <TradingPairSelector
                            selectedPair={selectedPair}
                            onSelect={setSelectedPair}
                        />
                        {selectedPair ? (
                            <PositionForm
                                symbol={selectedPair.symbol}
                                currentPrice={selectedPair.price}
                                onOpenPosition={handleOpenPosition}
                            />
                        ) : (
                            <Card>
                                <View style={styles.disabledContainer}>
                                    <Text style={styles.disabledText}>
                                        Please select a trading pair to start trading
                                    </Text>
                                </View>
                            </Card>
                        )}
                    </>
                ) : (
                    <Card>
                        <View style={styles.disabledContainer}>
                            <Text style={styles.disabledText}>
                                Spot trading is currently disabled
                            </Text>
                        </View>
                    </Card>
                )}
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
    disabledContainer: {
        padding: 24,
        alignItems: 'center',
    },
    disabledText: {
        color: '#748CAB',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default TradeScreen;
