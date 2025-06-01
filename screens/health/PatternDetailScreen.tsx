import React, { useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useRisk } from '@/services/redux/hooks';
import { RiskPattern } from '@/types/risk';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { HealthStackParamList } from '@/navigation/navigation';
import { ChevronLeft, AlertCircle, ShieldAlert, BarChart2, Clock, Info } from 'lucide-react-native';
import tinycolor from 'tinycolor2';

type PatternDetailRouteProp = RouteProp<HealthStackParamList, 'PatternDetail'>;

export default function PatternDetailScreen() {
    const { colors } = useTheme();
    const route = useRoute<PatternDetailRouteProp>();
    const navigation = useNavigation();
    const riskData = useRisk();

    const [patternData, setPatternData] = useState<RiskPattern | null>(null);
    const [componentPatterns, setComponentPatterns] = useState<Record<string, RiskPattern>>({});

    useEffect(() => {
        const patterns = route.params.isComposite ? riskData.compositePatterns : riskData.patterns;
        const pattern = patterns.find(p => p.internal_id === route.params.patternId);
        if (pattern) {
            setPatternData(pattern);

            if (pattern.is_composite && pattern.details.components) {
                const components: Record<string, RiskPattern> = {};
                pattern.details.components.forEach(component => {
                    const componentPattern = riskData.patterns.find(p => p.internal_id === component.id);
                    if (componentPattern) {
                        components[component.id] = componentPattern;
                    }
                });
                setComponentPatterns(components);
            }
        }
    }, []);

    const findPatternById = (id: string): RiskPattern | undefined => {
        return componentPatterns[id];
    };

    if (!patternData) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <ThemedView style={styles.safeAreaContainer} variant="transparent">
                    <ThemedHeader
                        title="Pattern Not Found"
                        subtitle="The requested pattern could not be found"
                        titleVariant="heading1"
                    />
                </ThemedView>
            </SafeAreaView>
        );
    }

    const getConfidenceColor = (severity: number): string => {
        if (severity >= 0.8) return colors.error;
        if (severity >= 0.5) return colors.warning;
        return colors.success;
    };

    const confidenceColor = getConfidenceColor(patternData.severity);
    const confidencePercent = Math.round(patternData.severity * 100);

    const formatCategoryName = (name: string) => {
        if (name === "overtrading") return "Overtrading";
        if (name === "sunk_cost") return "Sunk Cost";
        if (name === "fomo") return "FOMO";
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const categoryEntries = Object.entries(patternData.category_weights || {});
    const sortedCategories = categoryEntries
        .sort((a, b) => (b[1] || 0) - (a[1] || 0))
        .filter(([_, weight]) => weight > 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={styles.safeAreaContainer} variant="transparent">
                <ThemedHeader
                    title="Pattern Details"
                    canGoBack
                    onBack={() => navigation.goBack()}
                />

                <ScrollView style={styles.scrollContainer}>
                    {/* Main Pattern Message */}
                    <ThemedView style={styles.section} variant="card">
                        <View style={styles.patternHeader}>
                            <View style={{
                                ...styles.confidenceDot,
                                backgroundColor: confidenceColor
                            }}/>
                            <ThemedText style={styles.patternMessage}>
                                {patternData.message}
                            </ThemedText>
                        </View>

                        <ThemedView style={styles.badgeGroup} variant="transparent">
                            <ThemedView 
                                style={{
                                    ...styles.badgeBase,
                                    ...styles.confidencePill,
                                    backgroundColor: `${confidenceColor}20`
                                }}
                                variant="transparent"
                            >
                                <ThemedText style={styles.badgeText} color={confidenceColor}>
                                    {Math.round((patternData.is_composite ? patternData.confidence : patternData.severity) * 100)}% {patternData.is_composite ? 'confidence' : 'severity'}
                                </ThemedText>
                            </ThemedView>

                            {patternData.is_composite && (
                                <ThemedView 
                                    style={{
                                        ...styles.badgeBase,
                                        ...styles.compositeBadge,
                                        backgroundColor: `${colors.primary}20`
                                    }}
                                    variant="transparent"
                                >
                                    <ThemedText style={styles.badgeText} color={colors.primary}>
                                        Complex Pattern
                                    </ThemedText>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </ThemedView>

                    {patternData.is_composite && patternData.details.components && (
                        <ThemedView style={styles.section} variant="card">
                            <ThemedView style={styles.sectionHeader} variant="transparent">
                                <Info size={20} color={colors.primary} />
                                <ThemedText style={styles.sectionTitle}>Pattern Components</ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.componentsContainer} variant="transparent">
                                {patternData.details.components.map((component, index) => {
                                    const componentPattern = findPatternById(component.id);
                                    return (
                                        <ThemedView 
                                            key={component.id}
                                            style={styles.componentItem}
                                            variant="transparent"
                                        >
                                            <ThemedView style={styles.componentContent} variant="transparent">
                                                {componentPattern && (
                                                    <ThemedText style={styles.componentMessage}>
                                                        {componentPattern.message}
                                                    </ThemedText>
                                                )}
                                                <ThemedView style={styles.componentMetadata} variant="transparent">
                                                    <ThemedText style={styles.componentId} tertiary>
                                                        {componentPattern?.pattern_id || component.id}
                                                    </ThemedText>
                                                    <ThemedView 
                                                        style={{
                                                            ...styles.componentConfidence,
                                                            backgroundColor: `${getConfidenceColor(component.severity)}20`
                                                        }}
                                                        variant="transparent"
                                                    >
                                                        <ThemedText 
                                                            style={styles.componentConfidenceText}
                                                            color={getConfidenceColor(component.severity)}
                                                        >
                                                            {Math.round(component.severity * 100)}% severity
                                                        </ThemedText>
                                                    </ThemedView>
                                                </ThemedView>
                                            </ThemedView>
                                        </ThemedView>
                                    );
                                })}
                            </ThemedView>
                        </ThemedView>
                    )}

                    <ThemedView style={styles.section} variant="card">
                        <ThemedView style={styles.sectionHeader} variant="transparent">
                            <BarChart2 size={20} color={colors.primary} />
                            <ThemedText style={styles.sectionTitle}>Metrics</ThemedText>
                        </ThemedView>

                        {patternData.details.actual !== undefined && patternData.details.limit !== undefined && (
                            <ThemedView style={styles.metricContainer} variant="transparent">
                                <ThemedView style={styles.progressContainer} variant="transparent">
                                    <View 
                                        style={{
                                            ...styles.progressBar,
                                            backgroundColor: colors.backgroundTertiary
                                        }}
                                    >
                                        <View
                                            style={{
                                                ...styles.progressFill,
                                                width: `${Math.min(100, (patternData.details.actual / patternData.details.limit) * 100)}%`,
                                                backgroundColor: confidenceColor
                                            }}
                                        />
                                    </View>
                                    <ThemedView style={styles.progressLabels} variant="transparent">
                                        <ThemedText style={styles.progressLabel} tertiary>
                                            <ThemedText style={styles.progressEmphasis}>
                                                {patternData.details.actual}
                                            </ThemedText> / {patternData.details.limit}
                                        </ThemedText>
                                        {patternData.details.ratio !== undefined && (
                                            <ThemedText 
                                                style={styles.ratioIndicator} 
                                                color={patternData.details.ratio > 1 ? confidenceColor : colors.textTertiary}
                                            >
                                                {(patternData.details.ratio).toFixed(1)}x
                                            </ThemedText>
                                        )}
                                    </ThemedView>
                                </ThemedView>
                            </ThemedView>
                        )}
                    </ThemedView>

                    <ThemedView style={styles.section} variant="card">
                        <ThemedView style={styles.sectionHeader} variant="transparent">
                            <ShieldAlert size={20} color={colors.primary} />
                            <ThemedText style={styles.sectionTitle}>Risk Categories</ThemedText>
                        </ThemedView>

                        <ThemedView style={styles.categoriesContainer} variant="transparent">
                            {sortedCategories.map(([category, weight]) => (
                                <ThemedView 
                                    key={category}
                                    style={styles.categoryItem}
                                    variant="transparent"
                                >
                                    <ThemedText style={styles.categoryName}>
                                        {formatCategoryName(category)}
                                    </ThemedText>
                                    <View 
                                        style={{
                                            ...styles.categoryBar,
                                            backgroundColor: colors.backgroundTertiary
                                        }}
                                    >
                                        <View
                                            style={{
                                                ...styles.categoryBarFill,
                                                width: `${weight * 100}%`,
                                                backgroundColor: colors.primary
                                            }}
                                        />
                                    </View>
                                    <ThemedText style={styles.categoryWeight} tertiary>
                                        {Math.round(weight * 100)}%
                                    </ThemedText>
                                </ThemedView>
                            ))}
                        </ThemedView>
                    </ThemedView>
                </ScrollView>
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeAreaContainer: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    section: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    patternHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        paddingBottom: 12,
    },
    patternMessage: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        marginLeft: 12,
    },
    badgeGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    badgeBase: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    confidenceDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 6,
    },
    confidencePill: {
        borderRadius: 10,
    },
    compositeBadge: {
        borderRadius: 4,
    },
    metricContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    progressContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    progressLabel: {
        fontSize: 14,
    },
    progressEmphasis: {
        fontWeight: '600',
    },
    ratioIndicator: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    categoryItem: {
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    categoryBar: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    categoryBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    categoryWeight: {
        fontSize: 12,
        marginTop: 4,
    },
    componentsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    componentItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    componentContent: {
        flex: 1,
    },
    componentMessage: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        marginBottom: 8,
    },
    componentMetadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    componentId: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    componentConfidence: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    componentConfidenceText: {
        fontSize: 12,
        fontWeight: '500',
    },
}); 