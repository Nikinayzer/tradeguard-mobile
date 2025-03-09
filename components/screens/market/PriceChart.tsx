import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface PriceChartProps {
    data: Array<{ x: number; y: number }>;
    color?: string;
    height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
    data,
    color = '#3B82F6',
    height = 200,
}) => {
    const chartData = {
        labels: data.map(d => `${d.x}h`),
        datasets: [{
            data: data.map(d => d.y),
        }],
    };

    return (
        <View style={[styles.container, { height }]}>
            <LineChart
                data={chartData}
                width={Dimensions.get('window').width - 32}
                height={height}
                chartConfig={{
                    backgroundColor: '#1B263B',
                    backgroundGradientFrom: '#1B263B',
                    backgroundGradientTo: '#1B263B',
                    decimalPlaces: 2,
                    color: (opacity = 1) => color,
                    labelColor: (opacity = 1) => '#748CAB',
                    style: {
                        borderRadius: 16,
                    },
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1B263B',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
}); 