import React, {useState, useMemo} from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ChevronDown, AlertCircle, ShieldAlert} from "lucide-react-native";
import CircularProgress from 'react-native-circular-progress-indicator';
import tinycolor from "tinycolor2";

const exampleJSON = {
    "event_type": "RiskReport",
    "user_id": 493077349684740097,
    "job_id": null,
    "top_risk_level": "high",
    "top_risk_confidence": 0.8049999999999999,
    "top_risk_type": "overtrading",
    "category_scores": {
        "overtrading": 0.8049999999999999,
        "sunk_cost": 0.15000000000000002,
        "fomo": 0.2775000000000001
    },
    "patterns": [
        {
            "pattern_id": "single_job_amount_limit",
            "job_id": [
                107
            ],
            "message": "Single job amount exceeded",
            "confidence": 0.78,
            "category_weights": {
                "fomo": 0.6,
                "sunk_cost": 0.2
            },
            "details": {
                "actual": 10.0,
                "limit": 5.0,
                "ratio": 2.0
            },
            "start_time": "2025-04-07T02:18:38.364173",
            "end_time": null,
            "consumed": true,
            "is_composite": false,
            "internal_id": "single:66a96d7a"
        },
        {
            "pattern_id": "daily_volume_exceeded",
            "job_id": [
                107
            ],
            "message": "Daily volume limit exceeded",
            "confidence": 1.0,
            "category_weights": {
                "overtrading": 0.6,
                "fomo": 0.2,
                "sunk_cost": 0.2
            },
            "details": {
                "actual": 80.0,
                "limit": 10.0,
                "ratio": 8.0
            },
            "start_time": "2025-04-07T02:18:38.364173",
            "end_time": null,
            "consumed": true,
            "is_composite": false,
            "internal_id": "daily:f3cb5274"
        },
        {
            "pattern_id": "concurrent_jobs_limit",
            "job_id": [
                100,
                101,
                104,
                102,
                103,
                105,
                106,
                107
            ],
            "message": "Concurrent jobs limit exceeded",
            "confidence": 1.0,
            "category_weights": {
                "overtrading": 0.7,
                "fomo": 0.3
            },
            "details": {
                "actual": 8,
                "limit": 3,
                "ratio": 2.6666666666666665
            },
            "start_time": "2025-04-07T02:18:38.364173",
            "end_time": null,
            "consumed": false,
            "is_composite": false,
            "internal_id": "concurrent:d23bffbc"
        }
    ],
    "composite_patterns": [
        {
            "pattern_id": "composite_volume_burst",
            "job_id": [
                107
            ],
            "message": "Trading volume burst",
            "confidence": 1.0,
            "category_weights": {
                "overtrading": 0.7,
                "sunk_cost": 0.15,
                "fomo": 0.15
            },
            "details": {
                "components": [
                    {
                        "id": "daily:f3cb5274",
                        "pattern_type": "daily_volume_exceeded",
                        "confidence": 1.0
                    },
                    {
                        "id": "single:66a96d7a",
                        "pattern_type": "single_job_amount_limit",
                        "confidence": 0.78
                    }
                ],
                "time_span": {
                    "duration_minutes": 0.0
                }
            },
            "start_time": "2025-04-07T02:18:38.364173",
            "end_time": "2025-04-07T02:18:38.364173",
            "consumed": false,
            "is_composite": true,
            "internal_id": "composite:e7ca676e"
        }
    ],
    "decay_params": {
        "initial_priority": 100,
        "half_life_minutes": 60,
        "min_priority": 10
    },
    "metadata": {
        "pattern_stats": {
            "total_patterns": 3,
            "composite_patterns": 1,
            "consumed_patterns": 2,
            "awareness_patterns": 1
        },
        "signal_source": "composite",
        "primary_categories": [
            "overtrading",
            "sunk_cost",
            "fomo"
        ],
        "awareness_signals": [
            {
                "type": "concurrent_jobs_limit",
                "id": "concurrent:d23bffbc",
                "confidence": 1.0,
                "category": "overtrading"
            }
        ]
    },
    "timestamp": "2025-04-07T02:18:38.365165"
}

interface PatternDetails {
    actual?: number;
    limit?: number;
    ratio?: number;
    components?: Array<{
        id: string;
        pattern_type: string;
        confidence: number;
    }>;
    time_span?: {
        duration_minutes: number;
    };
}

interface CategoryWeights {
    fomo?: number;
    sunk_cost?: number;
    overtrading?: number;

    [key: string]: number | undefined;
}

interface Pattern {
    pattern_id: string;
    job_id: number[];
    message: string;
    confidence: number;
    category_weights: CategoryWeights;
    details: PatternDetails;
    start_time: string;
    end_time: string | null;
    consumed: boolean;
    is_composite: boolean;
    internal_id: string;
}

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({title, subtitle}) => {
    return (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
    );
};

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
                                                         size = 85,
                                                         isHighlighted = false
                                                     }) => {
    const percentage = Math.min(Math.floor(score * 100), 100);
    const roundedScore = Math.round(percentage);

    const formattedLabel = (
        label === "overtrading" ? "Overtrading" :
            label === "sunk_cost" ? "Sunk Cost" :
                label === "fomo" ? "FOMO" :
                    label.charAt(0).toUpperCase() + label.slice(1)

    );


    const circleSize = 85;

    return (
        <View style={[
            styles.scoreContainer,
            isHighlighted && styles.highlightedScoreContainer
        ]}>
            <CircularProgress
                value={roundedScore}
                //value={50}
                valueSuffix={'%'}
                // radius={circleSize / 2}
                radius={50}
                duration={500}
                maxValue={100}
                progressValueColor={'#E2E8F0'}
                activeStrokeColor={color}
                activeStrokeSecondaryColor={tinycolor(color).spin(-25).saturate(40).toString()}
                inActiveStrokeColor={color}
                inActiveStrokeOpacity={0.1}
                inActiveStrokeWidth={8}
                activeStrokeWidth={10}
                progressValueStyle={{
                    fontWeight: '800',
                    fontSize: 26,
                }}
                clockwise={false}
            />

            <Text style={[
                styles.categoryLabel,
                isHighlighted && styles.highlightedCategoryLabel
            ]}>
                {formattedLabel}
            </Text>

            {isHighlighted && (
                <View style={styles.topRiskIndicator}>
                    <Text style={styles.topRiskIndicatorText}>Highest Risk</Text>
                </View>
            )}
        </View>
    );
};

interface PatternItemProps {
    pattern: Pattern;
    isComposite?: boolean;
    findPatternById?: (id: string) => Pattern | undefined;
}

const PatternItem: React.FC<PatternItemProps> = ({
                                                     pattern,
                                                     isComposite = false,
                                                     findPatternById
                                                 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        if (isComposite) {
            Animated.timing(animation, {
                toValue: isExpanded ? 0 : 1,
                duration: 300,
                useNativeDriver: false,
            }).start();
            setIsExpanded(!isExpanded);
        }
    };

    const maxHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 500],
    });

    const getConfidenceColor = (confidence: number): string => {
        if (confidence >= 0.8) return "#EF4444"; // High - red
        if (confidence >= 0.5) return "#F59E0B"; // Medium - amber
        return "#10B981"; // Low - green
    };

    const confidenceColor = getConfidenceColor(pattern.confidence);
    const confidencePercent = Math.round(pattern.confidence * 100);

    // Calculate ratio and create display message
    const hasRatio = pattern.details.ratio !== undefined;
    const ratio = pattern.details.ratio || 0;
    const isExceeded = hasRatio && (pattern.details.ratio || 0) > 1;

    // Determine top categories that contribute to this pattern
    const categoryEntries = Object.entries(pattern.category_weights || {});
    const topCategory = categoryEntries.length > 0
        ? categoryEntries.sort((a, b) => (b[1] || 0) - (a[1] || 0))[0]
        : null;

    const formatCategoryName = (name: string) => {
        if (name === "overtrading") return "Overtrading";
        if (name === "sunk_cost") return "Sunk Cost";
        if (name === "fomo") return "FOMO";
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
        <View style={[
            styles.patternCard,
            isComposite && styles.compositePatternCard
        ]}>
            {/* Card header with confidence pill and expand trigger */}
            <TouchableOpacity
                style={styles.patternHeader}
                onPress={toggleExpand}
                activeOpacity={isComposite ? 0.7 : 1}
            >
                {/* Confidence indicator dot */}
                <View style={[styles.confidenceDot, {backgroundColor: confidenceColor}]}/>

                <View style={styles.patternHeaderContent}>
                    <Text style={styles.patternTitle}>{pattern.message}</Text>

                    <View style={styles.headerMeta}>
                        {topCategory && (
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryTagText}>
                                    {formatCategoryName(topCategory[0])}
                                </Text>
                            </View>
                        )}

                        {isComposite && (
                            <View style={styles.compositeBadge}>
                                <Text style={styles.compositeBadgeText}>Combined</Text>
                            </View>
                        )}

                        <View style={[
                            styles.confidencePill,
                            {backgroundColor: `${confidenceColor}20`}
                        ]}>
                            <Text style={[styles.confidenceText, {color: confidenceColor}]}>
                                {confidencePercent}%
                            </Text>
                        </View>

                        {isComposite && (
                            <TouchableOpacity
                                onPress={toggleExpand}
                                style={styles.collapsibleButton}
                            >
                                <Text style={styles.collapsibleButtonText}>
                                    {isExpanded ? 'Hide Details' : 'Show Details'}
                                </Text>
                                <ChevronDown
                                    size={14}
                                    color="#94ACCA"
                                    style={{
                                        transform: [{rotate: isExpanded ? '180deg' : '0deg'}],
                                        marginLeft: 4
                                    }}
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {/* Progress visualization */}
            {pattern.details.actual !== undefined && pattern.details.limit !== undefined && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.min(100, (pattern.details.actual / pattern.details.limit) * 100)}%`,
                                        backgroundColor: confidenceColor
                                    }
                                ]}
                            />
                        </View>

                        {isExceeded && (
                            <View style={[styles.limitMarker, {backgroundColor: confidenceColor}]}/>
                        )}
                    </View>

                    <View style={styles.progressLabels}>
                        <Text style={styles.progressLabel}>
                            <Text
                                style={styles.progressEmphasis}>{pattern.details.actual}</Text> / {pattern.details.limit}
                        </Text>

                        {hasRatio && (
                            <Text style={[
                                styles.ratioIndicator,
                                {color: isExceeded ? confidenceColor : '#748CAB'}
                            ]}>
                                {(pattern.details.ratio || 0).toFixed(1)}x {isExceeded ? 'Exceeded' : 'Within Limit'}
                            </Text>
                        )}
                    </View>
                </View>
            )}

            {/* Job information */}
            {pattern.job_id && pattern.job_id.length > 0 && (
                <View style={styles.jobInfo}>
                    <Text style={styles.jobInfoText}>
                        Affected job{pattern.job_id.length > 1 ? 's' : ''}: {pattern.job_id.join(', ')}
                    </Text>
                </View>
            )}

            {/* Composite patterns will have collapsible children */}
            {isComposite && pattern.details.components && findPatternById && (
                <Animated.View style={[styles.compositeChildren, {maxHeight}]}>
                    <View style={styles.divider}/>

                    <View style={styles.relatedPatternsHeader}>
                        <Text style={styles.relatedPatternsTitle}>Related Patterns</Text>
                        <Text style={styles.relatedPatternsSubtitle}>
                            These patterns were detected and analyzed together
                        </Text>
                    </View>

                    {pattern.details.components.map((component) => {
                        const childPattern = findPatternById(component.id);
                        if (!childPattern) return null;

                        const childConfidenceColor = getConfidenceColor(component.confidence);
                        const childConfidencePercent = Math.round(component.confidence * 100);

                        return (
                            <View key={childPattern.internal_id} style={styles.relatedPattern}>
                                <View style={[styles.relatedPatternDot, {backgroundColor: childConfidenceColor}]}/>

                                <View style={styles.relatedPatternContent}>
                                    <View style={styles.relatedPatternHeader}>
                                        <Text style={styles.relatedPatternTitle}>
                                            {childPattern.message}
                                        </Text>

                                        <View style={[
                                            styles.miniConfidencePill,
                                            {backgroundColor: `${childConfidenceColor}20`}
                                        ]}>
                                            <Text style={[styles.miniConfidenceText, {color: childConfidenceColor}]}>
                                                {childConfidencePercent}%
                                            </Text>
                                        </View>
                                    </View>

                                    {childPattern.details.actual !== undefined &&
                                        childPattern.details.limit !== undefined && (
                                            <View style={styles.relatedPatternMetrics}>
                                                <View style={styles.relatedPatternProgress}>
                                                    <View style={styles.miniProgressBar}>
                                                        <View
                                                            style={[
                                                                styles.miniProgressFill,
                                                                {
                                                                    width: `${Math.min(100, (childPattern.details.actual / childPattern.details.limit) * 100)}%`,
                                                                    backgroundColor: childConfidenceColor
                                                                }
                                                            ]}
                                                        />
                                                    </View>
                                                </View>

                                                <Text style={styles.relatedPatternDetail}>
                                                    {childPattern.details.actual} / {childPattern.details.limit}
                                                </Text>
                                            </View>
                                        )}
                                </View>
                            </View>
                        );
                    })}
                </Animated.View>
            )}
        </View>
    );
};

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    isComposite?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
                                                                   title,
                                                                   children,
                                                                   isComposite = false
                                                               }) => {
    // We'll just render the children directly now, since PatternItem has its own collapsible logic
    return <>{children}</>;
};

interface SectionHeaderProps {
    title: string;
    icon: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({title, icon}) => {
    return (
        <View style={styles.sectionHeaderContainer}>
            {icon}
            <Text style={styles.sectionHeaderTitle}>{title}</Text>
        </View>
    );
};

export default function HealthScreen() {
    const risingAwarenessPatterns = useMemo(() =>
            exampleJSON.patterns.filter(pattern => !pattern.consumed),
        []);

    const getScoreColor = (score: number): string => {
        if (score >= 0.7) return "rgba(239,68,68,1.0)";
        if (score >= 0.4) return "#F59E0B";
        return "#10B981";
    };

    const findPatternById = (id: string): Pattern | undefined => {
        return exampleJSON.patterns.find(pattern => pattern.internal_id === id);
    };

    const highestRiskCategory = useMemo(() => {
        let highest = {category: "", score: 0};
        Object.entries(exampleJSON.category_scores).forEach(([category, score]) => {
            if (score > highest.score) {
                highest = {category, score};
            }
        });
        return highest;
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <ScreenHeader
                    title="Health Monitor"
                    subtitle="Analysis of your trading patterns and behavior"
                />

                <View style={styles.scoreGrid}>
                    {Object.entries(exampleJSON.category_scores).map(([category, score]) => (
                        <CircularScore
                            key={category}
                            score={score}
                            label={category}
                            color={getScoreColor(score)}
                            isHighlighted={category === highestRiskCategory.category}
                        />
                    ))}
                </View>

                {/* Composite Patterns Section */}
                <View style={styles.patternsSection}>
                    <SectionHeader
                        title={`We've found critical pattern${exampleJSON.composite_patterns.length > 1 ? 's' : ''}`}
                        icon={<ShieldAlert size={22} color="#EF4444"/>}
                    />

                    {exampleJSON.composite_patterns.map((compositePattern) => (
                        <PatternItem
                            key={compositePattern.internal_id}
                            pattern={compositePattern}
                            isComposite={true}
                            findPatternById={findPatternById}
                        />
                    ))}
                </View>

                {/* Rising Awareness Patterns Section */}
                {risingAwarenessPatterns.length > 0 && (
                    <View style={styles.patternsSection}>
                        <SectionHeader
                            title={`Keep an eye on early trend${exampleJSON.composite_patterns.length > 1 ? 's' : ''}`}
                            icon={<AlertCircle size={22} color="#F59E0B"/>}
                        />

                        {risingAwarenessPatterns.map((pattern) => (
                            <PatternItem
                                key={pattern.internal_id}
                                pattern={pattern}
                            />
                        ))}

        </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0D1B2A",
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: "#E2E8F0",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: "#748CAB",
    },
    scoreGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        marginBottom: 32,
    },
    scoreContainer: {
        alignItems: "center",
        width: "33%",
        marginBottom: 24,
        position: "relative",
        height: 140,
    },
    highlightedScoreContainer: {
        marginBottom: 30,
    },
    categoryLabel: {
        color: "#94acca",
        fontSize: 16,
        fontWeight: "400",
        marginTop: 8,
        textAlign: "center",
    },
    highlightedCategoryLabel: {
        fontWeight: "800",
    },
    topRiskIndicator: {
        position: "absolute",
        bottom: -20,
        backgroundColor: "#EF4444",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    topRiskIndicatorText: {
        color: "white",
        fontSize: 10,
        fontWeight: "600",
    },
    patternsSection: {
        marginBottom: 24,
    },
    sectionHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    sectionHeaderTitle: {
        color: "#E2E8F0",
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 8,
    },
    risingAwarenessSection: {
        backgroundColor: "rgba(249, 115, 22, 0.05)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(249, 115, 22, 0.2)",
    },
    patternCard: {
        backgroundColor: "rgba(27, 38, 59, 0.4)",
        borderRadius: 16,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "rgba(246,6,6,0)",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    compositePatternCard: {
        backgroundColor: "rgba(239,68,68,0.1)",
        borderLeftWidth: 0,
        borderLeftColor: "#3B82F6",
    },
    patternHeader: {
        padding: 16,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    confidenceDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 5,
        marginRight: 10,
    },
    patternHeaderContent: {
        flex: 1,
    },
    patternTitle: {
        color: "#E2E8F0",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        lineHeight: 22,
    },
    headerMeta: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    categoryTag: {
        backgroundColor: "rgba(116, 140, 171, 0.15)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    categoryTagText: {
        color: "#94ACCA",
        fontSize: 11,
        fontWeight: "500",
    },
    compositeBadge: {
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 4,
    },
    compositeBadgeText: {
        color: "#3B82F6",
        fontSize: 11,
        fontWeight: "500",
    },
    confidencePill: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginBottom: 4,
    },
    confidenceText: {
        fontSize: 12,
        fontWeight: "600",
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
        backgroundColor: "rgba(116, 140, 171, 0.15)",
        borderRadius: 3,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 3,
    },
    limitMarker: {
        position: "absolute",
        right: 0,
        top: -4,
        width: 2,
        height: 14,
        borderRadius: 1,
    },
    progressLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    progressLabel: {
        color: "#748CAB",
        fontSize: 13,
    },
    progressEmphasis: {
        color: "#E2E8F0",
        fontWeight: "600",
    },
    ratioIndicator: {
        fontSize: 12,
        fontWeight: "500",
    },
    jobInfo: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    jobInfoText: {
        color: "#748CAB",
        fontSize: 12,
        fontStyle: "italic",
    },
    compositeChildren: {
        overflow: "hidden",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(116, 140, 171, 0.1)",
    },
    relatedPatternsHeader: {
        padding: 16,
        paddingBottom: 8,
    },
    relatedPatternsTitle: {
        color: "#E2E8F0",
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 4,
    },
    relatedPatternsSubtitle: {
        color: "#748CAB",
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
        color: "#E2E8F0",
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
        backgroundColor: "rgba(116, 140, 171, 0.15)",
        borderRadius: 2,
        overflow: "hidden",
    },
    miniProgressFill: {
        height: "100%",
        borderRadius: 2,
    },
    relatedPatternDetail: {
        color: "#748CAB",
        fontSize: 12,
        fontWeight: "500",
        width: 70,
        textAlign: "right",
    },
    collapsibleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(116, 140, 171, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
        marginBottom: 4,
    },
    collapsibleButtonText: {
        color: '#94ACCA',
        fontSize: 11,
        fontWeight: '500',
    },
});