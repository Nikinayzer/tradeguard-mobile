import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useRisk } from '@/services/redux/hooks';
import { RiskPattern } from '@/types/risk';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { HealthStackParamList } from '@/navigation/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft,ShieldAlert, BarChart2,Info, ChevronRight } from 'lucide-react-native';
import { PageIndicator } from 'react-native-page-indicator';
import { getRiskColor, getRiskColorWithAlpha } from '@/utils/colorsUtil';
import { formatSnakeCase } from '@/utils/normalizeData';

type PatternDetailRouteProp = RouteProp<HealthStackParamList, 'PatternDetail'>;
type PatternDetailNavigationProp = NativeStackNavigationProp<HealthStackParamList, 'PatternDetail'>;

export default function PatternDetailScreen() {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const route = useRoute<PatternDetailRouteProp>();
    const navigation = useNavigation<PatternDetailNavigationProp>();
    const riskData = useRisk();

    const [patternData, setPatternData] = useState<RiskPattern | null>(null);
    const [componentPatterns, setComponentPatterns] = useState<Record<string, RiskPattern>>({});
    const [similarPatterns, setSimilarPatterns] = useState<RiskPattern[]>([]);
    const [currentPatternIndex, setCurrentPatternIndex] = useState(0);

    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    // Use the snapshot from route params if available, otherwise use live Redux state
    const riskStateSnapshot = route.params.riskStateSnapshot || riskData;

    useEffect(() => {
        const patterns = route.params.isComposite ? riskStateSnapshot.compositePatterns : riskStateSnapshot.patterns;
        const pattern = patterns.find((p: RiskPattern) => p.internal_id === route.params.patternId);
        if (pattern) {
            const isConsumed = riskStateSnapshot.compositePatterns.some((cp: RiskPattern) => 
                cp.details.components?.some((c: { internal_id: string }) => c.internal_id === pattern.internal_id)
            );
            const patternWithConsumedStatus = {
                ...pattern,
                consumed: isConsumed
            };
            setPatternData(patternWithConsumedStatus);

            if (!pattern.is_composite) {
                const similar = riskStateSnapshot.patterns.filter((p: RiskPattern) => 
                    p.pattern_id === pattern.pattern_id && 
                    !p.is_composite &&
                    p.internal_id !== pattern.internal_id
                );
                const similarWithConsumedStatus = similar.map((similarPattern: RiskPattern) => {
                    const isConsumed = riskStateSnapshot.compositePatterns.some((cp: RiskPattern) => 
                        cp.details.components?.some((c: { internal_id: string }) => c.internal_id === similarPattern.internal_id)
                    );
                    return {
                        ...similarPattern,
                        consumed: isConsumed
                    };
                });
                setSimilarPatterns([patternWithConsumedStatus, ...similarWithConsumedStatus]);
                setCurrentPatternIndex(0);
            }

            if (pattern.is_composite && pattern.details.components) {
                const components: Record<string, RiskPattern> = {};
                pattern.details.components.forEach((component: { internal_id: string }) => {
                    const componentPattern = [...riskStateSnapshot.patterns, ...riskStateSnapshot.compositePatterns]
                        .find(p => p.internal_id === component.internal_id);
                    if (componentPattern) {
                        const isComponentConsumed = riskStateSnapshot.compositePatterns.some((cp: RiskPattern) => 
                            cp.internal_id !== pattern.internal_id && // Don't count the current composite pattern
                            cp.details.components?.some((c: { internal_id: string }) => c.internal_id === componentPattern.internal_id)
                        );
                        components[component.internal_id] = {
                            ...componentPattern,
                            consumed: isComponentConsumed
                        };
                    }
                });
                setComponentPatterns(components);
            }
        }
    }, [riskStateSnapshot]);

    const handlePatternChange = (index: number) => {
        setCurrentPatternIndex(index);
        setPatternData(similarPatterns[index]);
        scrollViewRef.current?.scrollTo({ x: index * width, animated: true });
    };

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
        return getRiskColor(severity);
    };

    const getConfidenceColorWithAlpha = (severity: number): string => {
        return getRiskColorWithAlpha(severity);
    };

    const confidenceValue = patternData.is_composite ? (patternData.confidence ?? patternData.severity) : patternData.severity;
    const confidenceColor = getConfidenceColor(confidenceValue);
    const confidenceColorAlpha = getConfidenceColorWithAlpha(confidenceValue);
    const confidencePercent = Math.round(confidenceValue * 100);

    const formatCategoryName = (name: string) => {
        return formatSnakeCase(name, { capitalize: true });
    };

    const categoryEntries = Object.entries(patternData.category_weights || {});
    const sortedCategories = categoryEntries
        .sort((a, b) => (b[1] || 0) - (a[1] || 0))
        .filter(([_, weight]) => weight > 0);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ThemedView style={styles.safeAreaContainer} variant="transparent">
                <ThemedHeader
                    title={patternData?.is_composite ? "Complex Pattern Details" : "Pattern Details"}
                    canGoBack
                    onBack={() => navigation.goBack()}
                />

                {/* Pattern Navigation with Page Indicator */}
                {!patternData?.is_composite && similarPatterns.length > 1 && (
                    <ThemedView style={styles.patternNavigation} variant="transparent">
                        <TouchableOpacity 
                            onPress={() => handlePatternChange(currentPatternIndex - 1)}
                            disabled={currentPatternIndex === 0}
                            style={[
                                styles.navButton,
                                currentPatternIndex === 0 && styles.navButtonDisabled
                            ]}
                        >
                            <ChevronLeft 
                                size={20} 
                                color={currentPatternIndex === 0 ? colors.textTertiary : colors.primary} 
                            />
                        </TouchableOpacity>

                        <View style={styles.pageIndicatorContainer}>
                            <PageIndicator 
                                count={similarPatterns.length} 
                                current={currentPatternIndex}
                                color={colors.primary}
                                activeColor={colors.primary}
                            />
                        </View>

                        <TouchableOpacity 
                            onPress={() => handlePatternChange(currentPatternIndex + 1)}
                            disabled={currentPatternIndex === similarPatterns.length - 1}
                            style={[
                                styles.navButton,
                                currentPatternIndex === similarPatterns.length - 1 && styles.navButtonDisabled
                            ]}
                        >
                            <ChevronRight 
                                size={20} 
                                color={currentPatternIndex === similarPatterns.length - 1 ? colors.textTertiary : colors.primary} 
                            />
                        </TouchableOpacity>
                    </ThemedView>
                )}

                {!patternData?.is_composite && similarPatterns.length > 1 ? (
                    <Animated.ScrollView
                        ref={scrollViewRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(event) => {
                            const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
                            if (newIndex !== currentPatternIndex) {
                                handlePatternChange(newIndex);
                            }
                        }}
                        scrollEventThrottle={16}
                        style={styles.horizontalScroll}
                    >
                        {similarPatterns.map((pattern, index) => (
                            <ScrollView 
                                key={pattern.internal_id}
                                style={[styles.scrollContainer, { width }]}
                            >
                                {/* Main Pattern Message */}
                                <ThemedView style={styles.section} variant="card">
                                    <View style={styles.patternHeader}>
                                        <View style={{
                                            ...styles.confidenceDot,
                                            backgroundColor: confidenceColor
                                        }}/>
                                        <ThemedText style={styles.patternMessage}>
                                            {pattern.message}
                                        </ThemedText>
                                    </View>

                                    <ThemedView style={styles.badgeGroup} variant="transparent">
                                        <ThemedView 
                                            style={{
                                                ...styles.badgeBase,
                                                ...styles.confidencePill,
                                                backgroundColor: confidenceColorAlpha
                                            }}
                                            variant="transparent"
                                        >
                                            <ThemedText style={styles.badgeText} color={confidenceColor}>
                                                {confidencePercent}% {pattern.is_composite ? 'confidence' : 'severity'}
                                            </ThemedText>
                                        </ThemedView>

                                        {pattern.is_composite && (
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

                                {/* Description Section - Only if description exists */}
                                {pattern.description && (
                                    <ThemedView style={styles.section} variant="card">
                                        <ThemedView style={styles.sectionHeader} variant="transparent">
                                            <Info size={20} color={colors.primary} />
                                            <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                                        </ThemedView>

                                        <ThemedView style={styles.descriptionContainer} variant="transparent">
                                            <ThemedText style={styles.descriptionText}>
                                                {pattern.description}
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                )}

                                {/* Metrics Section - Only for Atomic Patterns */}
                                {!pattern.is_composite && pattern.details && (
                                    <ThemedView style={styles.section} variant="card">
                                        <ThemedView style={styles.sectionHeader} variant="transparent">
                                            <BarChart2 size={20} color={colors.primary} />
                                            <ThemedText style={styles.sectionTitle}>Metrics</ThemedText>
                                        </ThemedView>

                                        {pattern.details.actual !== undefined && pattern.details.limit !== undefined && (
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
                                                                width: `${Math.min(100, (pattern.details.actual / pattern.details.limit) * 100)}%`,
                                                                backgroundColor: confidenceColor
                                                            }}
                                                        />
                                                    </View>
                                                    <ThemedView style={styles.progressLabels} variant="transparent">
                                                        <ThemedText style={styles.progressLabel} tertiary>
                                                            <ThemedText style={styles.progressEmphasis}>
                                                                {pattern.details.actual}
                                                            </ThemedText> / {pattern.details.limit}
                                                        </ThemedText>
                                                        {pattern.details.ratio !== undefined && (
                                                            <ThemedText 
                                                                style={styles.ratioIndicator} 
                                                                color={pattern.details.ratio > 1 ? confidenceColor : colors.textTertiary}
                                                            >
                                                                {(pattern.details.ratio).toFixed(1)}x
                                                            </ThemedText>
                                                        )}
                                                    </ThemedView>
                                                </ThemedView>
                                            </ThemedView>
                                        )}

                                        {/* Pattern Details Section */}
                                        <ThemedView style={styles.detailsContainer} variant="transparent">
                                            {pattern.details && Object.entries(pattern.details).map(([key, value]) => {
                                                // Skip already rendered metrics
                                                if (['actual', 'limit', 'ratio', 'components'].includes(key)) {
                                                    return null;
                                                }
                                                return (
                                                    <ThemedView key={key} style={styles.detailItem} variant="transparent">
                                                        <ThemedText style={styles.detailLabel} tertiary>
                                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                                        </ThemedText>
                                                        <ThemedText style={styles.detailValue}>
                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                        </ThemedText>
                                                    </ThemedView>
                                                );
                                            })}
                                        </ThemedView>
                                    </ThemedView>
                                )}

                                {/* Parent Composite Pattern Section - Only for Consumed Atomic Patterns */}
                                {!pattern.is_composite && pattern.consumed && (
                                    (() => {
                                        const parentPattern = riskStateSnapshot.compositePatterns.find((cp: RiskPattern) => 
                                            cp.details.components?.some((c: { internal_id: string }) => c.internal_id === patternData.internal_id)
                                        );
                                        return parentPattern ? (
                                            <ThemedView style={styles.section} variant="card">
                                                <ThemedView style={styles.sectionHeader} variant="transparent">
                                                    <Info size={20} color={colors.primary} />
                                                    <ThemedText style={styles.sectionTitle}>Part of Complex Pattern</ThemedText>
                                                </ThemedView>

                                                <TouchableOpacity
                                                    onPress={() => {
                                                        navigation.push('PatternDetail', {
                                                            patternId: parentPattern.internal_id,
                                                            isComposite: true,
                                                            riskStateSnapshot: riskStateSnapshot
                                                        });
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <ThemedView style={styles.parentPatternContainer} variant="transparent">
                                                        <ThemedText style={styles.parentPatternMessage}>
                                                            {parentPattern.message}
                                                        </ThemedText>
                                                        <ThemedView style={styles.parentPatternMetadata} variant="transparent">
                                                            <ThemedView 
                                                                style={{
                                                                    ...styles.parentPatternConfidence,
                                                                    backgroundColor: `${getConfidenceColor(parentPattern.confidence || parentPattern.severity)}20`
                                                                }}
                                                                variant="transparent"
                                                            >
                                                                <ThemedText 
                                                                    style={styles.parentPatternConfidenceText}
                                                                    color={getConfidenceColor(parentPattern.confidence || parentPattern.severity)}
                                                                >
                                                                    {Math.round((parentPattern.confidence || parentPattern.severity) * 100)}% confidence
                                                                </ThemedText>
                                                            </ThemedView>
                                                            <ChevronRight size={16} color={colors.primary} />
                                                        </ThemedView>
                                                    </ThemedView>
                                                </TouchableOpacity>
                                            </ThemedView>
                                        ) : null;
                                    })()
                                )}

                                {/* Risk Categories Section */}
                                <ThemedView style={styles.section} variant="card">
                                    <ThemedView style={styles.sectionHeader} variant="transparent">
                                        <ShieldAlert size={20} color={colors.primary} />
                                        <ThemedText style={styles.sectionTitle}>Risk Categories</ThemedText>
                                    </ThemedView>

                                    <ThemedView style={styles.categoriesContainer} variant="transparent">
                                        {sortedCategories.map(([category, weight]) => (
                                            <ThemedView 
                                                key={`category-${category}`}
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
                        ))}
                    </Animated.ScrollView>
                ) : (
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
                                        backgroundColor: confidenceColorAlpha
                                    }}
                                    variant="transparent"
                                >
                                    <ThemedText style={styles.badgeText} color={confidenceColor}>
                                        {confidencePercent}% {patternData.is_composite ? 'confidence' : 'severity'}
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

                        {/* Description Section - Only if description exists */}
                        {patternData.description && (
                            <ThemedView style={styles.section} variant="card">
                                <ThemedView style={styles.sectionHeader} variant="transparent">
                                    <Info size={20} color={colors.primary} />
                                    <ThemedText style={styles.sectionTitle}>Description</ThemedText>
                                </ThemedView>

                                <ThemedView style={styles.descriptionContainer} variant="transparent">
                                    <ThemedText style={styles.descriptionText}>
                                        {patternData.description}
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>
                        )}

                        {/* Pattern Components Section - Only for Composite Patterns */}
                        {patternData?.is_composite && patternData.details.components && (
                            <ThemedView style={styles.section} variant="card">
                                <ThemedView style={styles.sectionHeader} variant="transparent">
                                    <Info size={20} color={colors.primary} />
                                    <ThemedText style={styles.sectionTitle}>Pattern Components</ThemedText>
                                </ThemedView>

                                <ThemedView style={styles.componentsContainer} variant="transparent">
                                    {patternData.details.components.map((component, index) => {
                                        const componentPattern = findPatternById(component.internal_id);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                    if (componentPattern) {
                                                        navigation.push('PatternDetail', {
                                                            patternId: componentPattern.internal_id,
                                                            isComposite: componentPattern.is_composite,
                                                            riskStateSnapshot: riskStateSnapshot
                                                        });
                                                    }
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <ThemedView 
                                                    style={{
                                                        ...styles.componentItem,
                                                        ...(index < (patternData.details.components?.length ?? 0) - 1 ? styles.componentItemWithBorder : {})
                                                    }}
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
                                                                {component.pattern_id}
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
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ThemedView>
                            </ThemedView>
                        )}

                        {/* Metrics Section - Only for Atomic Patterns */}
                        {!patternData.is_composite && patternData.details && (
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

                                {/* Pattern Details Section */}
                                <ThemedView style={styles.detailsContainer} variant="transparent">
                                    {patternData.details && Object.entries(patternData.details).map(([key, value]) => {
                                        // Skip already rendered metrics
                                        if (['actual', 'limit', 'ratio', 'components'].includes(key)) {
                                            return null;
                                        }
                                        return (
                                            <ThemedView key={key} style={styles.detailItem} variant="transparent">
                                                <ThemedText style={styles.detailLabel} tertiary>
                                                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                                                </ThemedText>
                                                <ThemedText style={styles.detailValue}>
                                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                </ThemedText>
                                            </ThemedView>
                                        );
                                    })}
                                </ThemedView>
                            </ThemedView>
                        )}

                        {/* Parent Composite Pattern Section - Only for Consumed Atomic Patterns */}
                        {!patternData.is_composite && patternData.consumed && (
                            (() => {
                                const parentPattern = riskStateSnapshot.compositePatterns.find((cp: RiskPattern) => 
                                    cp.details.components?.some((c: { internal_id: string }) => c.internal_id === patternData.internal_id)
                                );
                                return parentPattern ? (
                                    <ThemedView style={styles.section} variant="card">
                                        <ThemedView style={styles.sectionHeader} variant="transparent">
                                            <Info size={20} color={colors.primary} />
                                            <ThemedText style={styles.sectionTitle}>Part of Complex Pattern</ThemedText>
                                        </ThemedView>

                                        <TouchableOpacity
                                            onPress={() => {
                                                navigation.push('PatternDetail', {
                                                    patternId: parentPattern.internal_id,
                                                    isComposite: true,
                                                    riskStateSnapshot: riskStateSnapshot
                                                });
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <ThemedView style={styles.parentPatternContainer} variant="transparent">
                                                <ThemedText style={styles.parentPatternMessage}>
                                                    {parentPattern.message}
                                                </ThemedText>
                                                <ThemedView style={styles.parentPatternMetadata} variant="transparent">
                                                    <ThemedView 
                                                        style={{
                                                            ...styles.parentPatternConfidence,
                                                            backgroundColor: `${getConfidenceColor(parentPattern.confidence || parentPattern.severity)}20`
                                                        }}
                                                        variant="transparent"
                                                    >
                                                        <ThemedText 
                                                            style={styles.parentPatternConfidenceText}
                                                            color={getConfidenceColor(parentPattern.confidence || parentPattern.severity)}
                                                        >
                                                            {Math.round((parentPattern.confidence || parentPattern.severity) * 100)}% confidence
                                                        </ThemedText>
                                                    </ThemedView>
                                                    <ChevronRight size={16} color={colors.primary} />
                                                </ThemedView>
                                            </ThemedView>
                                        </TouchableOpacity>
                                    </ThemedView>
                                ) : null;
                            })()
                        )}

                        {/* Risk Categories Section */}
                        <ThemedView style={styles.section} variant="card">
                            <ThemedView style={styles.sectionHeader} variant="transparent">
                                <ShieldAlert size={20} color={colors.primary} />
                                <ThemedText style={styles.sectionTitle}>Risk Categories</ThemedText>
                            </ThemedView>

                            <ThemedView style={styles.categoriesContainer} variant="transparent">
                                {sortedCategories.map(([category, weight]) => (
                                    <ThemedView 
                                        key={`category-${category}`}
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
                )}
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
    },
    componentItemWithBorder: {
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
    descriptionContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 22,
    },
    detailsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    detailItem: {
        marginTop: 12,
    },
    detailLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        lineHeight: 22,
    },
    patternNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 16,
    },
    navButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    pageIndicatorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    horizontalScroll: {
        flex: 1,
    },
    parentPatternContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    parentPatternMessage: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
        marginBottom: 12,
    },
    parentPatternMetadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    parentPatternConfidence: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    parentPatternConfidenceText: {
        fontSize: 12,
        fontWeight: '500',
    },
}); 