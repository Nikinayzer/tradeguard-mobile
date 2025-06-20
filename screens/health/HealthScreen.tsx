import React, {useState, useMemo, useEffect} from "react";
import {View,StyleSheet, ScrollView, TouchableOpacity, Animated, TextStyle, ViewStyle} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ChevronDown, AlertCircle, ShieldAlert, Info} from "lucide-react-native";
import CircularProgress from 'react-native-circular-progress-indicator';
import tinycolor from "tinycolor2";
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useRisk } from '@/services/redux/hooks';
import { RiskPattern, RiskCategory, RiskPatternDetails, CategoryWeights } from '@/types/risk';
import { selectGroupedPatterns, selectGroupedCompositePatterns } from '@/services/redux/slices/riskSlice';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HealthStackParamList } from '@/navigation/navigation';
import { getRiskColor, getRiskColorWithAlpha } from '@/utils/colorsUtil';
import { formatSnakeCase } from '@/utils/normalizeData';

type HealthScreenNavigationProp = NativeStackNavigationProp<HealthStackParamList>;

interface CircularScoreProps {
    score: number;
    label: string;
    color: string;
    size?: number;
    isHighlighted?: boolean;
}

const CircularScore: React.FC<CircularScoreProps> = ({
    score,
    label,
    color,
    size = 65,
    isHighlighted = false
}) => {
    const { colors } = useTheme();
    const percentage = Math.min(Math.floor(score * 100), 100);
    const roundedScore = Math.round(percentage);
    const [animation] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.spring(animation, {
            toValue: 1,
            useNativeDriver: true,
            tension: 20,
            friction: 7
        }).start();
    }, [score]);

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1]
    });

    let containerStyle: ViewStyle = styles.scoreContainer;
    if (isHighlighted) {
        containerStyle = {
            ...styles.scoreContainer,
            ...styles.highlightedScoreContainer
        };
    }
    
    return (
        <ThemedView style={containerStyle} variant="transparent">
            <Animated.View style={[styles.scoreColumn, { transform: [{ scale }] }]}>
                <CircularProgress
                    value={roundedScore}
                    valueSuffix={'%'}
                    radius={75}
                    duration={1000}
                    maxValue={100}
                    progressValueColor={colors.text}
                    activeStrokeColor={color}
                    activeStrokeSecondaryColor={tinycolor(color).spin(-25).saturate(40).toString()}
                    inActiveStrokeColor={color}
                    inActiveStrokeOpacity={0.1}
                    inActiveStrokeWidth={14}
                    activeStrokeWidth={16}
                    progressValueStyle={{
                        fontWeight: '800',
                        fontSize: 32,
                    }}
                    clockwise={false}
                />

                <ThemedText 
                    style={styles.riskScoreLabel}
                    secondary={!isHighlighted}
                >
                    Risk Score
                </ThemedText>
            </Animated.View>
        </ThemedView>
    );
};

interface PatternItemProps {
    pattern: RiskPattern;
    isComposite?: boolean;
    findPatternById?: (id: string) => RiskPattern | undefined;
    similarPatterns?: RiskPattern[];
    similarCount?: number;
    onPress?: (pattern: RiskPattern, isComposite: boolean) => void;
}

const PatternItem: React.FC<PatternItemProps> = ({
    pattern,
    isComposite = false,
    findPatternById,
    similarPatterns = [],
    similarCount = 0,
    onPress
}) => {
    const { colors } = useTheme();
    const navigation = useNavigation<HealthScreenNavigationProp>();
    const [isSimilarExpanded, setIsSimilarExpanded] = useState(false);
    const [similarAnimation] = useState(new Animated.Value(0));

    const handlePatternPress = () => {
        if (onPress) {
            onPress(pattern, isComposite);
        }
    };

    const toggleSimilarExpand = () => {
        Animated.timing(similarAnimation, {
            toValue: isSimilarExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setIsSimilarExpanded(!isSimilarExpanded);
    };

    const similarMaxHeight = similarAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 500],
    });

    const getConfidenceColor = (severity: number): string => {
        return getRiskColor(severity);
    };

    const getConfidenceColorWithAlpha = (severity: number): string => {
        return getRiskColorWithAlpha(severity);
    };

    const confidenceValue = isComposite ? (pattern.confidence ?? pattern.severity) : pattern.severity;
    const confidencePercent = Math.round(confidenceValue * 100);

    const hasRatio = pattern.details?.ratio !== undefined;
    const ratio = pattern.details?.ratio || 0;
    const isExceeded = hasRatio && (pattern.details?.ratio || 0) > 1;

    const categoryEntries = Object.entries(pattern.category_weights || {});
    const topCategory = categoryEntries.length > 0
        ? categoryEntries.sort((a, b) => (b[1] || 0) - (a[1] || 0))[0]
        : null;

    const formatCategoryName = (name: string) => {
        return formatSnakeCase(name, { capitalize: true });
    };

    const cardStyle = {
        backgroundColor: colors.card,
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden" as const,
        borderWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: {width: 0, height: 0}
    };

    return (
        <ThemedView
            style={cardStyle}
            variant="card"
            border={false}
            rounded="large"
        >
            {/* Main Pattern Content */}
            <TouchableOpacity 
                style={styles.patternMainContent}
                onPress={handlePatternPress}
                activeOpacity={isComposite ? 0.7 : 1}
            >
                <View style={styles.patternHeader}>
                    <View style={{
                        ...styles.confidenceDot,
                        backgroundColor: getConfidenceColor(confidenceValue),
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        {similarCount > 1 && (
                            <ThemedText style={styles.dotCount} color={colors.background}>
                                {similarCount}
                            </ThemedText>
                        )}
                    </View>
                    
                    <ThemedView style={styles.patternContent} variant="transparent">
                        <ThemedText style={styles.patternMessage} numberOfLines={2}>
                            {pattern.message}
                        </ThemedText>
                        
                        <ThemedView style={styles.patternMetadata} variant="transparent">
                            <ThemedView style={styles.badgeGroup} variant="transparent">
                                {isComposite && (
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

                                <ThemedView 
                                    style={{
                                        ...styles.badgeBase,
                                        ...styles.confidencePill,
                                        backgroundColor: `${getConfidenceColor(confidenceValue)}20`
                                    }}
                                    variant="transparent"
                                >
                                    <ThemedText style={styles.badgeText} color={getConfidenceColor(confidenceValue)}>
                                        {confidencePercent}% {isComposite ? 'confidence' : 'severity'}
                                    </ThemedText>
                                </ThemedView>
                            </ThemedView>

                            {/* Progress Bar */}
                            {pattern.details?.actual !== undefined && pattern.details?.limit !== undefined && (
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
                                                backgroundColor: getConfidenceColor(confidenceValue)
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
                                                color={pattern.details.ratio > 1 ? getConfidenceColor(confidenceValue) : colors.textTertiary}
                                            >
                                                {(pattern.details.ratio).toFixed(1)}x
                                            </ThemedText>
                                        )}
                                    </ThemedView>
                                </ThemedView>
                            )}
                        </ThemedView>
                    </ThemedView>
                </View>

                {/* Action Button */}
                {similarCount > 1 && (
                    <ThemedView style={styles.actionButtons} variant="transparent">
                        <TouchableOpacity 
                            onPress={toggleSimilarExpand}
                            style={styles.actionButton}
                        >
                            <ThemedText style={styles.actionButtonText} color={colors.primary}>
                                {isSimilarExpanded ? 'Hide Similar' : 'Show Similar'}
                            </ThemedText>
                            <ChevronDown
                                size={16}
                                color={colors.primary}
                                style={{
                                    transform: [{rotate: isSimilarExpanded ? '180deg' : '0deg'}],
                                    marginLeft: 4
                                }}
                            />
                        </TouchableOpacity>
                    </ThemedView>
                )}
            </TouchableOpacity>

            {/* Similar Patterns Section */}
            {similarCount > 1 && (
                <Animated.View style={[styles.similarPatternsContainer, {maxHeight: similarMaxHeight}]}>
                    <View style={styles.similarPatternsHeader}>
                        <ThemedText style={styles.similarPatternsTitle} tertiary>
                            Similar Patterns
                        </ThemedText>
                    </View>
                    {similarPatterns.map((similarPattern) => (
                        <TouchableOpacity
                            key={similarPattern.internal_id}
                            onPress={() => {
                                navigation.navigate('PatternDetail', {
                                    patternId: similarPattern.internal_id,
                                    isComposite: similarPattern.is_composite
                                });
                            }}
                            activeOpacity={0.7}
                        >
                            <ThemedView 
                                style={styles.similarPattern}
                                variant="transparent"
                            >
                                <View 
                                    style={{
                                        ...styles.similarPatternDot,
                                        backgroundColor: getConfidenceColor(similarPattern.is_composite ? (similarPattern.confidence ?? similarPattern.severity) : similarPattern.severity)
                                    }}
                                />
                                <ThemedView style={styles.similarPatternContent} variant="transparent">
                                    <ThemedText style={styles.similarPatternMessage} numberOfLines={2}>
                                        {similarPattern.message}
                                    </ThemedText>
                                    <ThemedView style={styles.similarPatternMetadata} variant="transparent">
                                        <ThemedText style={styles.similarPatternConfidence} tertiary>
                                            {Math.round((similarPattern.is_composite ? (similarPattern.confidence ?? similarPattern.severity) : similarPattern.severity) * 100)}% {similarPattern.is_composite ? 'confidence' : 'severity'}
                                        </ThemedText>
                                    </ThemedView>
                                </ThemedView>
                            </ThemedView>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}
        </ThemedView>
    );
};

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({title, subtitle, icon}) => {
    return (
        <ThemedView style={styles.sectionHeader} variant="transparent">
            {icon && (
                <ThemedView style={styles.sectionIcon} variant="transparent">
                    {icon}
                </ThemedView>
            )}
            <ThemedView style={styles.sectionHeaderText} variant="transparent">
                <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
                {subtitle && (
                    <ThemedText style={styles.sectionSubtitle} tertiary>
                        {subtitle}
                    </ThemedText>
                )}
            </ThemedView>
        </ThemedView>
    );
};

export default function HealthScreen() {
    const { colors } = useTheme();
    const riskData = useRisk();
    const groupedPatterns = useSelector(selectGroupedPatterns);
    const groupedCompositePatterns = useSelector(selectGroupedCompositePatterns);
    const [isRiskDetailsExpanded, setIsRiskDetailsExpanded] = useState(false);
    const [detailsAnimation] = useState(new Animated.Value(0));
    const [barAnimations] = useState(() => 
        Object.keys(riskData.categoryScores).reduce((acc, key) => {
            acc[key] = new Animated.Value(0);
            return acc;
        }, {} as Record<string, Animated.Value>)
    );
    const navigation = useNavigation<HealthScreenNavigationProp>();

    useEffect(() => {
        console.log("Risk Data Loaded:", riskData)
    }, []);
    
    useEffect(() => {
        if (isRiskDetailsExpanded) {
            Object.entries(barAnimations).forEach(([key, animation], index) => {
                Animated.spring(animation, {
                    toValue: 1,
                    useNativeDriver: false,
                    tension: 20,
                    friction: 7,
                    delay: index * 100
                }).start();
            });
        } else {
            Object.values(barAnimations).forEach(animation => {
                animation.setValue(0);
            });
        }
    }, [isRiskDetailsExpanded]);
    
    const risingAwarenessPatterns = useMemo(() =>
        riskData.patterns.filter(pattern => !pattern.consumed),
        [riskData.patterns]
    );

    const getScoreColor = (score: number): string => {
        return getRiskColor(score);
    };

    const getScoreColorWithAlpha = (score: number): string => {
        return getRiskColorWithAlpha(score);
    };

    const formatCategoryName = (name: string) => {
        return formatSnakeCase(name, { capitalize: true });
    };

    const findPatternById = (id: string): RiskPattern | undefined => {
        return riskData.patterns.find(pattern => pattern.internal_id === id);
    };

    const highestRiskCategory = useMemo(() => {
        let highest = {category: "", score: 0};
        Object.entries(riskData.categoryScores).forEach(([category, score]) => {
            if (score > highest.score) {
                highest = {category, score};
            }
        });
        return highest;
    }, [riskData.categoryScores]);

    const toggleRiskDetails = () => {
        Animated.spring(detailsAnimation, {
            toValue: isRiskDetailsExpanded ? 0 : 1,
            useNativeDriver: false,
            tension: 20,
            friction: 7
        }).start();
        setIsRiskDetailsExpanded(!isRiskDetailsExpanded);
    };

    const detailsHeight = detailsAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 300]
    });

    const handlePatternPress = (pattern: RiskPattern, isComposite: boolean) => {
        navigation.navigate('PatternDetail', {
            patternId: pattern.internal_id,
            isComposite: isComposite,
            riskStateSnapshot: {
                patterns: riskData.patterns,
                compositePatterns: riskData.compositePatterns,
                lastUpdated: riskData.lastUpdated,
                topRiskLevel: riskData.topRiskLevel,
                topRiskConfidence: riskData.topRiskConfidence,
                topRiskType: riskData.topRiskType,
                categoryScores: riskData.categoryScores,
                atomicPatternsCount: riskData.atomicPatternsCount,
                compositePatternsCount: riskData.compositePatternsCount,
                consumedPatternsCount: riskData.consumedPatternsCount
            }
        });
    };

    return (
        <SafeAreaView style={{ ...styles.container, backgroundColor: colors.background }}>
            <ThemedView style={styles.safeAreaContainer} variant="transparent">
                <ThemedHeader
                    title="Health Monitor"
                    subtitle="Analysis of your trading patterns and risk profile"
                    titleVariant="heading1"
                    actions={[{
                        icon: <Info size={22} color={colors.primary} />, 
                        onPress: () => navigation.navigate('HealthFAQ')
                    }]}
                />
                <ScrollView style={styles.scrollContainer}>
                    {/* Overall Risk Score */}
                    <ThemedView style={styles.scoreSection} variant="transparent">
                        <CircularScore
                            score={highestRiskCategory.score}
                            label="Risk Score"
                            color={getScoreColor(highestRiskCategory.score)}
                            size={120}
                            isHighlighted={true}
                        />

                        {/* Collapsible Risk Details */}
                        <TouchableOpacity 
                            onPress={toggleRiskDetails}
                            style={styles.riskDetailsToggle}
                        >
                            <ThemedText style={styles.riskDetailsToggleText} color={colors.primary}>
                                {isRiskDetailsExpanded ? 'Hide Categories' : 'Show Categories'}
                            </ThemedText>
                            <ChevronDown
                                size={16}
                                color={colors.primary}
                                style={{
                                    transform: [{rotate: isRiskDetailsExpanded ? '180deg' : '0deg'}],
                                    marginLeft: 4
                                }}
                            />
                        </TouchableOpacity>

                        <Animated.View style={[styles.riskBarsContainer, { maxHeight: detailsHeight }]}>
                            {Object.entries(riskData.categoryScores).map(([category, score], index) => {
                                const barWidth = barAnimations[category].interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', `${score * 100}%`]
                                });

                                return (
                                    <ThemedView 
                                        key={category}
                                        style={styles.riskBarItem}
                                        variant="transparent"
                                    >
                                        <View style={styles.riskBarHeader}>
                                            <ThemedText style={styles.riskBarLabel}>
                                                {formatCategoryName(category)}
                                            </ThemedText>
                                            <ThemedText style={styles.riskBarValue} tertiary>
                                                {Math.round(score * 100)}%
                                            </ThemedText>
                                        </View>
                                        <View 
                                            style={{
                                                ...styles.riskBar,
                                                backgroundColor: colors.backgroundTertiary
                                            }}
                                        >
                                            <Animated.View
                                                style={{
                                                    ...styles.riskBarFill,
                                                    width: barWidth,
                                                    backgroundColor: getScoreColor(score)
                                                }}
                                            />
                                        </View>
                                    </ThemedView>
                                );
                            })}
                        </Animated.View>
                    </ThemedView>

                    {/* Composite Patterns Section */}
                    <ThemedView style={styles.patternsSection} variant="transparent">
                        <SectionHeader
                            title="Critical Patterns"
                            icon={<ShieldAlert size={22} color={colors.error}/>}
                        />

                        {groupedCompositePatterns.length > 0 ? (
                            groupedCompositePatterns.map(({ patternId, patterns, count }) => {
                                const sortedPatterns = [...patterns].sort((a, b) => {
                                    const aValue = a.confidence ?? a.severity;
                                    const bValue = b.confidence ?? b.severity;
                                    return bValue - aValue;
                                });
                                return (
                                    <PatternItem
                                        key={patternId}
                                        pattern={sortedPatterns[0]}
                                        isComposite={true}
                                        findPatternById={findPatternById}
                                        similarPatterns={sortedPatterns.slice(1)}
                                        similarCount={count}
                                        onPress={handlePatternPress}
                                    />
                                );
                            })
                        ) : (
                            <ThemedView style={styles.emptyStateContainer} variant="transparent">
                                <ThemedText style={styles.emptyStateText} secondary>
                                    No critical patterns detected. Keep it up!
                                </ThemedText>
                            </ThemedView>
                        )}
                    </ThemedView>

                    {/* Rising Awareness Patterns Section */}
                    <ThemedView style={styles.patternsSection} variant="transparent">
                        <SectionHeader
                            title="Early Trends"
                            icon={<AlertCircle size={22} color={colors.warning}/>}
                        />

                        {groupedPatterns.length > 0 ? (
                            groupedPatterns.map(({ patternId, patterns, count }) => {
                                const sortedPatterns = [...patterns].sort((a, b) => {
                                    const aValue = a.is_composite ? (a.confidence ?? a.severity) : a.severity;
                                    const bValue = b.is_composite ? (b.confidence ?? b.severity) : b.severity;
                                    return bValue - aValue;
                                });
                                return (
                                    <PatternItem
                                        key={patternId}
                                        pattern={sortedPatterns[0]}
                                        similarPatterns={sortedPatterns.slice(1)}
                                        similarCount={count}
                                        onPress={handlePatternPress}
                                    />
                                );
                            })
                        ) : (
                            <ThemedView style={styles.emptyStateContainer} variant="transparent">
                                <ThemedText style={styles.emptyStateText} secondary>
                                    No early trends detected. You're doing great!
                                </ThemedText>
                            </ThemedView>
                        )}
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
        paddingTop: 24,
    },
    scoreSection: {
        marginBottom: 32,
        alignItems: 'center',
        paddingTop: 16,
    },
    riskBarsContainer: {
        width: '100%',
        marginTop: 16,
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    riskBarItem: {
        marginBottom: 20,
    },
    riskBarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    riskBarLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    riskBarValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    riskBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    riskBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    scoreGrid: {
        marginBottom: 32,
    },
    scoreContainer: {
        marginBottom: 16,
        position: "relative",
    },
    scoreColumn: {
        alignItems: 'center',
    },
    riskScoreLabel: {
        fontSize: 20,
        fontWeight: '500',
        marginTop: 16,
        textAlign: 'center',
    },
    highlightedScoreContainer: {
        marginBottom: 16,
    },
    highlightedCategoryLabel: {
        fontWeight: "800",
    },
    topRiskIndicator: {
        position: "absolute",
        bottom: -20,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    topRiskIndicatorText: {
        fontSize: 10,
        fontWeight: "600",
    },
    patternsSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionIcon: {
        marginRight: 8,
    },
    sectionHeaderText: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    sectionSubtitle: {
        fontSize: 12,
        fontStyle: "italic",
    },
    patternCard: {
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
    },
    compositePatternCard: {
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    patternMainContent: {
        padding: 16,
    },
    patternHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    patternContent: {
        flex: 1,
        marginLeft: 12,
    },
    patternMessage: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 22,
        marginBottom: 12,
    },
    patternMetadata: {
        gap: 12,
    },
    badgeGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 16,
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    similarPatternsContainer: {
        overflow: 'hidden',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    similarPatternsHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    similarPatternsTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    similarPattern: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    similarPatternDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 12,
    },
    similarPatternContent: {
        flex: 1,
    },
    similarPatternMessage: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 8,
    },
    similarPatternMetadata: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    similarPatternConfidence: {
        fontSize: 12,
    },
    componentsHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    componentsTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    progressBarContainer: {
        position: "relative",
        marginBottom: 8,
    },
    progressBar: {
        height: 6,
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    progressLabel: {
        fontSize: 13,
    },
    progressEmphasis: {
        fontWeight: "600",
    },
    ratioIndicator: {
        fontSize: 12,
        fontWeight: "500",
    },
    jobInfoText: {
        fontSize: 12,
        fontStyle: "italic",
        flex: 1,
        marginRight: 8,
    },
    detailsTextContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    detailsText: {
        fontSize: 12,
        fontWeight: "600",
    },
    compositeChildren: {
        overflow: "hidden",
    },
    divider: {
        height: 1,
    },
    relatedPatternsHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    relatedPatternsTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    relatedPatternsSubtitle: {
        fontSize: 12,
        fontStyle: "italic",
    },
    relatedPattern: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    relatedPatternDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 10,
    },
    relatedPatternContent: {
        flex: 1,
    },
    relatedPatternHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    relatedPatternTitle: {
        fontSize: 14,
        fontWeight: "500",
        flex: 1,
        marginRight: 8,
    },
    miniConfidencePill: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    miniConfidenceText: {
        fontSize: 10,
        fontWeight: "600",
    },
    relatedPatternMetrics: {
        flexDirection: "row",
        alignItems: "center",
    },
    relatedPatternProgress: {
        flex: 1,
        marginRight: 8,
    },
    miniProgressBar: {
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
    },
    miniProgressFill: {
        height: "100%",
        borderRadius: 2,
    },
    relatedPatternDetail: {
        fontSize: 12,
        fontWeight: "500",
        width: 70,
        textAlign: "right",
    },
    emptyStateContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    similarBadge: {
        borderRadius: 4,
    },
    compositeBadge: {
        borderRadius: 4,
    },
    confidenceDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginTop: 5,
        marginRight: 10,
    },
    dotCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    confidencePill: {
        borderRadius: 10,
    },
    badgeBase: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 6,
        marginBottom: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "500",
    },
    categoryTag: {
        backgroundColor: 'transparent',
    },
    componentsButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignSelf: 'flex-start',
    },
    componentsButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    riskDetailsToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        paddingVertical: 12,
        marginTop: 8,
        paddingRight: 16,
    },
    riskDetailsToggleText: {
        fontSize: 14,
        fontWeight: '500',
    },
});