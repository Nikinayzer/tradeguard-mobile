import React, {useState, useMemo} from "react";
import {View,StyleSheet, ScrollView, TouchableOpacity, Animated, TextStyle, ViewStyle} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {ChevronDown, AlertCircle, ShieldAlert} from "lucide-react-native";
import CircularProgress from 'react-native-circular-progress-indicator';
import tinycolor from "tinycolor2";
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedHeader } from '@/components/ui/ThemedHeader';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useRisk } from '@/services/redux/hooks';
import { RiskPattern, RiskCategory, RiskPatternDetails, CategoryWeights } from '@/types/risk';

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

    const formattedLabel = (
        label === "overtrading" ? "Overtrading" :
        label === "sunk_cost" ? "Sunk Cost" :
        label === "fomo" ? "FOMO" :
        label.charAt(0).toUpperCase() + label.slice(1)
    );

    let containerStyle: ViewStyle = styles.scoreContainer;
    if (isHighlighted) {
        containerStyle = {
            ...styles.scoreContainer,
            ...styles.highlightedScoreContainer
        };
    }

    const labelStyle: TextStyle = styles.categoryLabel;
    
    return (
        <ThemedView style={containerStyle} variant="transparent">
            <View style={styles.scoreRow}>
                <CircularProgress
                    value={roundedScore}
                    valueSuffix={'%'}
                    radius={40}
                    duration={500}
                    maxValue={100}
                    progressValueColor={colors.text}
                    activeStrokeColor={color}
                    activeStrokeSecondaryColor={tinycolor(color).spin(-25).saturate(40).toString()}
                    inActiveStrokeColor={color}
                    inActiveStrokeOpacity={0.1}
                    inActiveStrokeWidth={8}
                    activeStrokeWidth={10}
                    progressValueStyle={{
                        fontWeight: '800',
                        fontSize: 20,
                    }}
                    clockwise={false}
                />

                <ThemedText 
                    style={isHighlighted ? {...labelStyle, ...styles.highlightedCategoryLabel} : labelStyle}
                    secondary={!isHighlighted}
                >
                    {formattedLabel}
                </ThemedText>
            </View>
        </ThemedView>
    );
};

interface PatternItemProps {
    pattern: RiskPattern;
    isComposite?: boolean;
    findPatternById?: (id: string) => RiskPattern | undefined;
}

const PatternItem: React.FC<PatternItemProps> = ({
    pattern,
    isComposite = false,
    findPatternById
}) => {
    const { colors } = useTheme();
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

    const getConfidenceColor = (severity: number): string => {
        if (severity >= 0.8) return colors.error;
        if (severity >= 0.5) return colors.warning;
        return colors.success;
    };

    const confidenceColor = getConfidenceColor(pattern.severity);
    const confidencePercent = Math.round(pattern.severity * 100);

    const hasRatio = pattern.details.ratio !== undefined;
    const ratio = pattern.details.ratio || 0;
    const isExceeded = hasRatio && (pattern.details.ratio || 0) > 1;

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

    const cardStyle = {
        backgroundColor: isComposite 
            ? 'rgba(239,68,68,0.12)'
            : useTheme().colors.card,
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
            variant={isComposite ? "transparent" : "card"}
            border={false}
            rounded="large"
        >
            {/* Card header with confidence pill and expand trigger */}
            <TouchableOpacity
                style={styles.patternHeader}
                onPress={toggleExpand}
                activeOpacity={isComposite ? 0.7 : 1}
            >
                <View style={{
                    ...styles.confidenceDot,
                    backgroundColor: confidenceColor
                }}/>

                <ThemedView style={styles.patternHeaderContent} variant="transparent">
                    <ThemedView style={styles.titleRow} variant="transparent">
                        <ThemedText style={styles.patternTitle}>
                            {pattern.message}
                        </ThemedText>
                        
                        <ThemedView style={styles.primaryBadges} variant="transparent">
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
                                        Combined
                                    </ThemedText>
                                </ThemedView>
                            )}

                            <ThemedView 
                                style={{
                                    ...styles.badgeBase,
                                    ...styles.confidencePill,
                                    backgroundColor: `${confidenceColor}20`
                                }}
                                variant="transparent"
                            >
                                <ThemedText style={styles.badgeText} color={confidenceColor}>
                                    {confidencePercent}%
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>

                    {/* Category badges in a separate row */}
                    {topCategory && (
                        <ThemedView style={styles.categoryRow} variant="transparent">
                            <ThemedView 
                                style={{
                                    ...styles.badgeBase,
                                    ...styles.categoryTag,
                                    backgroundColor: colors.backgroundSecondary
                                }}
                                variant="transparent"
                            >
                                <ThemedText style={styles.badgeText} tertiary>
                                    {formatCategoryName(topCategory[0])}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    )}
                </ThemedView>
            </TouchableOpacity>

            {/* Progress visualization */}
            {pattern.details.actual !== undefined && pattern.details.limit !== undefined && (
                <ThemedView style={styles.progressContainer} variant="transparent">
                    <ThemedView style={styles.progressBarContainer} variant="transparent">
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

                        {isExceeded && (
                            <View 
                                style={{
                                    ...styles.limitMarker,
                                    backgroundColor: confidenceColor
                                }}
                            />
                        )}
                    </ThemedView>

                    <ThemedView style={styles.progressLabels} variant="transparent">
                        <ThemedText style={styles.progressLabel} tertiary>
                            <ThemedText
                                style={styles.progressEmphasis}>{pattern.details.actual}</ThemedText> / {pattern.details.limit}
                        </ThemedText>

                        {hasRatio && (
                            <ThemedText style={styles.ratioIndicator} color={isExceeded ? confidenceColor : colors.textTertiary}>
                                {(pattern.details.ratio || 0).toFixed(1)}x {isExceeded ? 'Exceeded' : 'Within Limit'}
                            </ThemedText>
                        )}
                    </ThemedView>
                </ThemedView>
            )}

            {/* Job information with Details toggle for composite patterns */}
            <ThemedView style={styles.bottomRow} variant="transparent">
                {pattern.job_id && pattern.job_id.length > 0 && (
                    <ThemedText style={styles.jobInfoText} tertiary>
                        Affected job{pattern.job_id.length > 1 ? 's' : ''}: {pattern.job_id.join(', ')}
                    </ThemedText>
                )}
                
                {isComposite && (
                    <TouchableOpacity onPress={toggleExpand} activeOpacity={0.7}>
                        <ThemedView style={styles.detailsTextContainer} variant="transparent">
                            <ThemedText style={styles.detailsText} color={colors.primary}>
                                {isExpanded ? 'Hide Details' : 'Show Details'}
                            </ThemedText>
                            <ChevronDown
                                size={12}
                                color={colors.primary}
                                style={{
                                    transform: [{rotate: isExpanded ? '180deg' : '0deg'}],
                                    marginLeft: 4
                                }}
                            />
                        </ThemedView>
                    </TouchableOpacity>
                )}
            </ThemedView>

            {/* Composite patterns will have collapsible children */}
            {isComposite && pattern.details.components && findPatternById && (
                <Animated.View style={[styles.compositeChildren, {maxHeight}]}>
                    <View 
                        style={{
                            ...styles.divider,
                            backgroundColor: colors.backgroundTertiary
                        }}
                    />

                    <ThemedView style={styles.relatedPatternsHeader} variant="transparent">
                        <ThemedText style={styles.relatedPatternsTitle}>Related Patterns</ThemedText>
                        <ThemedText style={styles.relatedPatternsSubtitle} tertiary>
                            These patterns were detected and analyzed together
                        </ThemedText>
                    </ThemedView>

                    {pattern.details.components.map((component) => {
                        const childPattern = findPatternById(component.id);
                        if (!childPattern) return null;

                        const childConfidenceColor = getConfidenceColor(childPattern.severity);
                        const childConfidencePercent = Math.round(childPattern.severity * 100);

                        return (
                            <ThemedView key={childPattern.internal_id} style={styles.relatedPattern} variant="transparent">
                                <View 
                                    style={{
                                        ...styles.relatedPatternDot,
                                        backgroundColor: childConfidenceColor
                                    }}
                                />

                                <ThemedView style={styles.relatedPatternContent} variant="transparent">
                                    <ThemedView style={styles.relatedPatternHeader} variant="transparent">
                                        <ThemedText style={styles.relatedPatternTitle}>
                                            {childPattern.message}
                                        </ThemedText>

                                        <ThemedView 
                                            style={{
                                                ...styles.badgeBase,
                                                ...styles.confidencePill,
                                                backgroundColor: `${childConfidenceColor}20`
                                            }}
                                            variant="transparent"
                                        >
                                            <ThemedText style={styles.badgeText} color={childConfidenceColor}>
                                                {childConfidencePercent}%
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>

                                    {childPattern.details.actual !== undefined &&
                                        childPattern.details.limit !== undefined && (
                                            <ThemedView style={styles.relatedPatternMetrics} variant="transparent">
                                                <ThemedView style={styles.relatedPatternProgress} variant="transparent">
                                                    <View 
                                                        style={{
                                                            ...styles.miniProgressBar,
                                                            backgroundColor: colors.backgroundTertiary
                                                        }}
                                                    >
                                                        <View
                                                            style={{
                                                                ...styles.miniProgressFill,
                                                                width: `${Math.min(100, (childPattern.details.actual / childPattern.details.limit) * 100)}%`,
                                                                backgroundColor: childConfidenceColor
                                                            }}
                                                        />
                                                    </View>
                                                </ThemedView>

                                                <ThemedText style={styles.relatedPatternDetail} tertiary>
                                                    {childPattern.details.actual} / {childPattern.details.limit}
                                                </ThemedText>
                                            </ThemedView>
                                        )}
                                </ThemedView>
                            </ThemedView>
                        );
                    })}
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
    
    const risingAwarenessPatterns = useMemo(() =>
        riskData.patterns.filter(pattern => !pattern.consumed),
        [riskData.patterns]
    );

    const getScoreColor = (score: number): string => {
        if (score >= 0.7) return colors.error;
        if (score >= 0.4) return colors.warning;
        return colors.success;
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

    return (
        <SafeAreaView style={{ ...styles.container, backgroundColor: colors.background }}>
            <ThemedView style={styles.safeAreaContainer} variant="transparent">
                <ThemedHeader
                    title="Health Monitor"
                    subtitle="Analysis of your trading patterns and risk profile"
                    titleVariant="heading1"
                />
                <ScrollView style={styles.scrollContainer}>
                    <ThemedView style={styles.scoreGrid} variant="transparent">
                        {Object.entries(riskData.categoryScores).map(([category, score]) => (
                            <CircularScore
                                key={category}
                                score={score}
                                label={category}
                                color={getScoreColor(score)}
                                isHighlighted={category === highestRiskCategory.category}
                            />
                        ))}
                    </ThemedView>

                    {/* Composite Patterns Section */}
                    <ThemedView style={styles.patternsSection} variant="transparent">
                        <SectionHeader
                            title="Critical Patterns"
                            icon={<ShieldAlert size={22} color={colors.error}/>}
                        />

                        {riskData.patterns.filter(p => p.is_composite).length > 0 ? (
                            riskData.patterns.filter(p => p.is_composite).map((compositePattern) => (
                                <PatternItem
                                    key={compositePattern.internal_id}
                                    pattern={compositePattern}
                                    isComposite={true}
                                    findPatternById={findPatternById}
                                />
                            ))
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

                        {risingAwarenessPatterns.length > 0 ? (
                            risingAwarenessPatterns.map((pattern) => (
                                <PatternItem
                                    key={pattern.internal_id}
                                    pattern={pattern}
                                />
                            ))
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
    },
    scoreGrid: {
        marginBottom: 32,
    },
    scoreContainer: {
        marginBottom: 16,
        position: "relative",
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    categoryLabel: {
        fontSize: 16,
        fontWeight: "400",
        marginLeft: 16,
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
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        marginRight: 8,
        lineHeight: 22,
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    primaryBadges: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
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
        backgroundColor: 'transparent', // Will be set inline
    },
    compositeBadge: {
        borderRadius: 4,
    },
    confidencePill: {
        borderRadius: 10,
    },
    collapsibleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 2,
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
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
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
});