import React, {useState, useMemo} from "react";
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ChevronDown, ChevronUp, BarChart3, AlertCircle} from "lucide-react-native";
import CircularProgress from 'react-native-circular-progress-indicator';
import {Color} from "@shopify/react-native-skia/lib/module/skia/web/JsiSkColor";
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
            "message": "Trading volume burst detected (2 related patterns)",
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
    const percentage = Math.min(score * 100, 100);
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
                activeStrokeSecondaryColor={tinycolor(color).spin(-10).saturate(30).toString()}
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
}

const PatternItem: React.FC<PatternItemProps> = ({pattern, isComposite = false}) => {
    return (
        <View style={[
            styles.patternItem,
            isComposite && styles.compositePatternItem
        ]}>
            <View style={styles.patternHeader}>
                <Text style={styles.patternMessage}>{pattern.message}</Text>
                <View style={styles.confidenceContainer}>
                    <Text style={styles.confidenceValue}>
                        {Math.round(pattern.confidence * 100)}%
                    </Text>
                </View>
            </View>

            <View style={styles.patternDetails}>
                {pattern.details.actual !== undefined && (
                    <Text style={styles.detailText}>
                        Actual: <Text style={styles.detailValue}>{pattern.details.actual}</Text>
                    </Text>
                )}
                {pattern.details.limit !== undefined && (
                    <Text style={styles.detailText}>
                        Limit: <Text style={styles.detailValue}>{pattern.details.limit}</Text>
                    </Text>
                )}
                {pattern.details.ratio !== undefined && (
                    <Text style={styles.detailText}>
                        Ratio: <Text style={styles.detailValue}>{pattern.details.ratio.toFixed(2)}</Text>
                    </Text>
                )}
            </View>

            {pattern.job_id && pattern.job_id.length > 0 && (
                <Text style={styles.jobIdText}>
                    Job IDs: {pattern.job_id.join(', ')}
                </Text>
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
    const [isExpanded, setIsExpanded] = useState(false);
    const [animation] = useState(new Animated.Value(0));

    const toggleExpand = () => {
        Animated.timing(animation, {
            toValue: isExpanded ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        setIsExpanded(!isExpanded);
    };

    const maxHeight = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 500],
    });

    return (
        <View style={styles.collapsibleSection}>
            <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.collapsibleTitle}>{title}</Text>
                {isExpanded ? (
                    <ChevronUp size={20} color="#E2E8F0"/>
                ) : (
                    <ChevronDown size={20} color="#E2E8F0"/>
                )}
            </TouchableOpacity>

            {isComposite && (
                <View style={styles.compositeExplanation}>
                    <Text style={styles.compositeExplanationText}>
                        Multiple trading patterns detected and analyzed together to identify significant risk.
                    </Text>
                </View>
            )}

            <Animated.View style={[styles.collapsibleContent, {maxHeight}]}>
                {children}
            </Animated.View>
        </View>
    );
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
                        title="Significant Risks"
                        icon={<BarChart3 size={22} color="#EF4444"/>}
                    />

                    {exampleJSON.composite_patterns.map((compositePattern) => (
                        <CollapsibleSection
                            key={compositePattern.internal_id}
                            title={compositePattern.message}
                            isComposite={true}
                        >
                            <View style={styles.compositeDetails}>
                                <Text style={styles.compositeConfidence}>
                                    Confidence: {Math.round(compositePattern.confidence * 100)}%
                                </Text>

                                {compositePattern.details.components?.map((component) => {
                                    const pattern = findPatternById(component.id);
                                    if (pattern) {
                                        return <PatternItem
                                            key={pattern.internal_id}
                                            pattern={pattern}
                                        />;
                                    }
                                    return null;
                                })}
                            </View>
                        </CollapsibleSection>
                    ))}
                </View>

                {/* Rising Awareness Patterns Section */}
                {risingAwarenessPatterns.length > 0 && (
                    <View style={styles.patternsSection}>
                        <SectionHeader
                            title="Rising Awareness"
                            icon={<AlertCircle size={22} color="#F59E0B"/>}
                        />

                        <View style={styles.risingAwarenessSection}>
                            {risingAwarenessPatterns.map((pattern) => (
                                <PatternItem
                                    key={pattern.internal_id}
                                    pattern={pattern}
                                />
                            ))}
                        </View>
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
    collapsibleSection: {
        backgroundColor: "rgba(27, 38, 59, 0.5)",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.1)",
    },
    collapsibleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    collapsibleTitle: {
        color: "#E2E8F0",
        fontSize: 16,
        fontWeight: "500",
        flex: 1,
    },
    collapsibleContent: {
        overflow: "hidden",
    },
    compositeExplanation: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(59, 130, 246, 0.1)",
    },
    compositeExplanationText: {
        color: "#748CAB",
        fontSize: 14,
        fontStyle: "italic",
    },
    compositeDetails: {
        padding: 16,
        paddingTop: 12,
    },
    compositeConfidence: {
        color: "#748CAB",
        fontSize: 14,
        marginBottom: 12,
    },
    patternItem: {
        backgroundColor: "rgba(13, 27, 42, 0.6)",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.05)",
    },
    compositePatternItem: {
        borderLeftWidth: 3,
        borderLeftColor: "#3B82F6",
    },
    patternHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    patternMessage: {
        color: "#E2E8F0",
        fontSize: 15,
        fontWeight: "500",
        flex: 1,
    },
    confidenceContainer: {
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    confidenceValue: {
        color: "#3B82F6",
        fontSize: 13,
        fontWeight: "500",
    },
    patternDetails: {
        marginBottom: 10,
    },
    detailText: {
        color: "#748CAB",
        fontSize: 14,
        marginBottom: 4,
    },
    detailValue: {
        color: "#E2E8F0",
        fontWeight: "500",
    },
    jobIdText: {
        color: "#748CAB",
        fontSize: 12,
    },
    risingAwarenessSection: {
        backgroundColor: "rgba(249, 115, 22, 0.05)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "rgba(249, 115, 22, 0.2)",
    },
});