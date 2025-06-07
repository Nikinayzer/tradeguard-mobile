import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { Bot, DollarSign, Clock, ArrowUpDown, Target, AlertCircle, ArrowDown, ArrowUp, ArrowLeftRight, Percent, AlertOctagon } from 'lucide-react-native';

type AutoFAQScreenNavigationProp = NativeStackNavigationProp<any>;

const jobParameters = {
    DCA: {
        title: "DCA Parameters",
        description: "Learn how to set up your dollar cost averaging strategy with these parameters:",
        parameters: [
            {
                name: "Total Amount",
                description: "The total amount in USDT you want to invest across all steps.",
                icon: DollarSign
            },
            {
                name: "Trade Direction",
                description: "Choose between BUY (accumulate) or SELL (take profit) orders.",
                icon: ArrowLeftRight
            },
            {
                name: "Total Steps",
                description: "Number of trades to execute, distributing your investment over time.",
                icon: ArrowDown
            },
            {
                name: "Duration",
                description: "Total time to complete all steps, from first to last trade.",
                icon: Clock
            },
            {
                name: "Discount Percentage",
                description: "Minimum price drop required before executing each trade.",
                icon: Percent
            },
            {
                name: "Force Entry",
                description: "Execute trades immediately without waiting for price conditions.",
                icon: AlertOctagon
            }
        ]
    },
    LIQ: {
        title: "LIQ Parameters",
        description: "Learn how to set up your liquidation strategy with these parameters:",
        parameters: [
            {
                name: "Proportion",
                description: "Percentage of your position to sell across all steps.",
                icon: Percent
            },
            {
                name: "Total Steps",
                description: "Number of trades to execute, distributing your sales over time.",
                icon: ArrowDown
            },
            {
                name: "Duration",
                description: "Total time to complete all steps, from first to last trade.",
                icon: Clock
            },
            {
                name: "Discount Percentage",
                description: "Minimum price increase required before executing each trade.",
                icon: Percent
            },
            {
                name: "Force Entry",
                description: "Execute trades immediately without waiting for price conditions.",
                icon: AlertOctagon
            }
        ]
    }
};

export default function AutoFAQScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation<AutoFAQScreenNavigationProp>();
    const [selectedJobType, setSelectedJobType] = useState<'DCA' | 'LIQ'>('DCA');

    const faqSections = [
        {
            title: "Job Types",
            icon: <Bot size={24} color={colors.primary} />,
            items: [
                {
                    question: "What is DCA (Dollar Cost Averaging)?",
                    answer: "DCA is a strategy where you invest a fixed amount at regular intervals, regardless of the asset's price. This helps reduce the impact of volatility and potentially lower your average entry price over time. It's particularly useful for long-term investors who want to build positions gradually."
                },
                {
                    question: "What is LIQ (Liquidation)?",
                    answer: "LIQ is a strategy that gradually sells your assets over time. Instead of selling everything at once, you sell in smaller portions at regular intervals. This approach helps you exit positions more smoothly, potentially getting better average prices and reducing market impact."
                }
            ]
        },
        {
            title: "Best Practices",
            icon: <Target size={24} color={colors.primary} />,
            items: [
                {
                    question: "How do I choose between DCA and LIQ?",
                    answer: "Use DCA when you want to accumulate an asset over time, especially in volatile markets. Use LIQ when you want to exit a position gradually, which can help you get better average prices than selling all at once."
                },
                {
                    question: "What's a good number of steps for my strategy?",
                    answer: "The ideal number of steps depends on your goals and market conditions. More steps mean smaller individual trades but longer execution time. Fewer steps mean larger trades but faster execution. Consider market volatility and your position size when deciding."
                }
            ]
        },
        {
            title: "Risk Management",
            icon: <AlertCircle size={24} color={colors.primary} />,
            items: [
                {
                    question: "When should I use Force Entry?",
                    answer: "Force Entry bypasses price conditions and executes trades immediately. Use it when you're confident about the market direction and want to enter or exit quickly. However, be cautious as it may result in less favorable prices."
                },
                {
                    question: "How does the Discount Percentage work?",
                    answer: "For DCA, the bot waits for the price to drop by this percentage before buying. For LIQ, it waits for the price to rise by this percentage before selling. This helps ensure you're getting better prices, but trades may take longer to execute."
                }
            ]
        }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedHeader
                title="Auto Trading FAQ"
                canGoBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView style={styles.content}>
                {/* Job Type Switch */}
                <ThemedView style={styles.switchContainer} variant="transparent">
                    <ThemedView 
                        style={{
                            ...styles.switchBackground,
                            backgroundColor: colors.backgroundTertiary,
                            width: 120
                        }}
                        variant="transparent"
                    >
                        <TouchableOpacity
                            style={{
                                ...styles.switchOption,
                                backgroundColor: selectedJobType === 'DCA' ? colors.primary : 'transparent'
                            }}
                            onPress={() => setSelectedJobType('DCA')}
                        >
                            <ThemedText 
                                style={{
                                    ...styles.switchText,
                                    ...(selectedJobType === 'DCA' ? styles.switchTextActive : {})
                                }}
                                color={selectedJobType === 'DCA' ? colors.buttonPrimaryText : colors.textTertiary}
                            >
                                DCA
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                ...styles.switchOption,
                                backgroundColor: selectedJobType === 'LIQ' ? colors.primary : 'transparent'
                            }}
                            onPress={() => setSelectedJobType('LIQ')}
                        >
                            <ThemedText 
                                style={{
                                    ...styles.switchText,
                                    ...(selectedJobType === 'LIQ' ? styles.switchTextActive : {})
                                }}
                                color={selectedJobType === 'LIQ' ? colors.buttonPrimaryText : colors.textTertiary}
                            >
                                LIQ
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>

                {/* Job Parameters Section */}
                <ThemedView style={styles.section} variant="transparent">
                    <ThemedText variant="body" secondary style={styles.sectionDescription}>
                        {jobParameters[selectedJobType].description}
                    </ThemedText>
                    
                    {jobParameters[selectedJobType].parameters.map((param, index) => (
                        <ThemedView 
                            key={index}
                            style={styles.parameterCard}
                            variant="card"
                            border
                            rounded="medium"
                            padding="medium"
                        >
                            <View style={styles.parameterHeader}>
                                {React.createElement(param.icon, {
                                    size: 20,
                                    color: colors.primary,
                                    style: styles.parameterIcon
                                })}
                                <ThemedText variant="bodyBold" style={styles.parameterName}>
                                    {param.name}
                                </ThemedText>
                            </View>
                            <ThemedText variant="body" secondary style={styles.parameterDescription}>
                                {param.description}
                            </ThemedText>
                        </ThemedView>
                    ))}
                </ThemedView>

                {/* FAQ Sections */}
                {faqSections.map((section, index) => (
                    <ThemedView key={index} style={styles.section} variant="transparent">
                        <ThemedView style={styles.sectionHeader} variant="transparent">
                            {section.icon}
                            <ThemedText variant="heading2" style={styles.sectionTitle}>
                                {section.title}
                            </ThemedText>
                        </ThemedView>
                        
                        {section.items.map((item, itemIndex) => (
                            <ThemedView 
                                key={itemIndex}
                                style={styles.faqCard}
                                variant="card"
                                border
                                rounded="medium"
                                padding="medium"
                            >
                                <ThemedText variant="bodyBold" style={styles.question}>
                                    {item.question}
                                </ThemedText>
                                <ThemedText variant="body" secondary style={styles.answer}>
                                    {item.answer}
                                </ThemedText>
                            </ThemedView>
                        ))}
                    </ThemedView>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    switchContainer: {
        marginBottom: 16,
    },
    switchBackground: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 2,
    },
    switchOption: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        borderRadius: 18,
    },
    switchText: {
        fontSize: 14,
        fontWeight: '500',
    },
    switchTextActive: {
        fontWeight: '600',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        marginLeft: 12,
        marginBottom: 8,
    },
    sectionDescription: {
        marginBottom: 16,
        lineHeight: 22,
    },
    parameterCard: {
        marginBottom: 12,
    },
    parameterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    parameterIcon: {
        marginRight: 12,
    },
    parameterName: {
        marginBottom: 4,
    },
    parameterDescription: {
        lineHeight: 20,
    },
    faqCard: {
        marginBottom: 12,
    },
    question: {
        marginBottom: 8,
    },
    answer: {
        lineHeight: 22,
    },
}); 