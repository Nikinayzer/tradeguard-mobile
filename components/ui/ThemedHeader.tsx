import React, {useState, useEffect, useRef} from 'react';
import {View, TouchableOpacity, StyleSheet, StyleProp, ViewStyle} from 'react-native';
import {useTheme} from '@/contexts/ThemeContext';
import {ThemedText} from './ThemedText';
import {RefreshCw, ArrowLeft, Settings, Bell} from 'lucide-react-native';

export type HeaderAction = {
    icon: React.ReactNode;
    onPress: () => void;
};

export interface ThemedHeaderProps {
    title: string;
    subtitle?: string;

    canRefresh?: boolean;
    onRefresh?: () => void;
    lastUpdated?: Date;
    showLastUpdated?: boolean;

    canGoBack?: boolean;
    onBack?: () => void;

    actions?: HeaderAction[];
    style?: StyleProp<ViewStyle>;
    titleVariant?: 'heading1' | 'heading2' | 'heading3';
}

//TODO refactor to support both refresh and actions
export function ThemedHeader({
                                 title,
                                 subtitle,
                                 canRefresh = false,
                                 onRefresh,
                                 lastUpdated: externalLastUpdated,
                                 showLastUpdated = true,
                                 canGoBack = false,
                                 onBack,
                                 actions = [],
                                 style,
                                 titleVariant,
                             }: ThemedHeaderProps) {
    const {colors} = useTheme();

    const [lastRefreshDate, setLastRefreshDate] = useState<Date | null>(null);
    const [timeDisplay, setTimeDisplay] = useState("Now");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (externalLastUpdated) {
            setLastRefreshDate(externalLastUpdated);
        } else if (canRefresh) {
            setLastRefreshDate(new Date());
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [externalLastUpdated, canRefresh]);

    useEffect(() => {
        if (!canRefresh || !showLastUpdated) return;

        const updateTimeDisplay = () => {
            if (!lastRefreshDate) {
                setTimeDisplay("Now");
                return;
            }

            const now = new Date();
            const diffSeconds = Math.floor((now.getTime() - lastRefreshDate.getTime()) / 1000);

            if (diffSeconds < 10) {
                setTimeDisplay("now");
                return;
            }

            if (diffSeconds < 60) {
                setTimeDisplay(`${diffSeconds}s ago`);
            } else if (diffSeconds < 3600) {
                const minutes = Math.floor(diffSeconds / 60);
                setTimeDisplay(`${minutes}m ago`);
            } else if (diffSeconds < 86400) {
                const hours = Math.floor(diffSeconds / 3600);
                setTimeDisplay(`${hours}h ago`);
            } else {
                const days = Math.floor(diffSeconds / 86400);
                setTimeDisplay(`${days}d ago`);
            }
        };

        updateTimeDisplay();
        timerRef.current = setInterval(updateTimeDisplay, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [lastRefreshDate, canRefresh, showLastUpdated]);

    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();

            if (!externalLastUpdated) {
                setLastRefreshDate(new Date());
                setTimeDisplay("Now");
            }
        }
    };

    const getTitleVariant = () => {
        if (titleVariant) return titleVariant;

        if (canGoBack) return 'heading3';
        return 'heading2';
    };

    const renderBackButton = () => {
        if (!canGoBack || !onBack) return null;

        return (
            <TouchableOpacity
                style={[
                    styles.iconButton,
                ]}
                onPress={onBack}
            >
                <ArrowLeft size={25} color={colors.primary}/>
            </TouchableOpacity>
        );
    };

    const renderRefreshButton = () => {
        if (!canRefresh || !onRefresh) return null;

        return (
            <TouchableOpacity
                style={[
                    styles.iconButton,
                    {backgroundColor: colors.backgroundTertiary}
                ]}
                onPress={handleRefresh}
                activeOpacity={0.7}
            >
                <RefreshCw size={20} color={colors.primary}/>
            </TouchableOpacity>
        );
    };

    const renderActions = () => {
        if (!actions.length) return null;

        return (
            <View style={styles.actionsContainer}>
                {actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.iconButton,
                            {backgroundColor: colors.backgroundTertiary}
                        ]}
                        onPress={action.onPress}
                        activeOpacity={0.7}
                    >
                        {action.icon}
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // const renderContent = () => {
    //     if (canGoBack) {
    //         return (
    //             <View style={styles.headerContent}>
    //                 {renderBackButton()}
    //                 <View style={styles.titleContainer}>
    //                     <ThemedText variant={getTitleVariant()} size={28} numberOfLines={1}>{title}</ThemedText>
    //                     {subtitle && (
    //                         <ThemedText
    //                             variant="bodySmall"
    //                             color={colors.textTertiary}
    //                             mt={2}
    //                             numberOfLines={1}
    //                         >
    //                             {subtitle}
    //                         </ThemedText>
    //                     )}
    //                 </View>
    //                 {renderActions()}
    //             </View>
    //         );
    //     }
    //
    //     return (
    //         <View style={styles.headerContent}>
    //             {canGoBack && renderBackButton()}
    //             <View>
    //                 <ThemedText variant={getTitleVariant()} size={28} >{title}</ThemedText>
    //                 {(showLastUpdated && canRefresh) ? (
    //                     <ThemedText
    //                         variant="bodySmall"
    //                         color={colors.textTertiary}
    //                         mt={4}
    //                     >
    //                         Last updated {timeDisplay}
    //                     </ThemedText>
    //                 ): subtitle && (
    //                     <ThemedText
    //                         variant="bodySmall"
    //                         color={colors.textTertiary}
    //                         mt={4}
    //                     >
    //                         {subtitle}
    //                     </ThemedText>
    //                 )}
    //             </View>
    //             {canRefresh ? renderRefreshButton() : renderActions()}
    //         </View>
    //     );
    // };
    const renderContent = () => (
        <View style={styles.headerContent}>
            {canGoBack && renderBackButton()}

            <View style={styles.titleContainer}>
                <ThemedText variant={getTitleVariant()} size={26} numberOfLines={1}>{title}</ThemedText>

                {subtitle && (
                    <ThemedText
                        variant="bodySmall"
                        color={colors.textTertiary}
                        mt={0}
                        numberOfLines={1}
                    >
                        {subtitle}
                    </ThemedText>
                )}

                {showLastUpdated && canRefresh && subtitle && (
                    <ThemedText
                        variant="bodySmall"
                        color={colors.textTertiary}
                        mt={2}
                    >
                        Last updated {timeDisplay}
                    </ThemedText>
                )}
            </View>

            {canRefresh ? renderRefreshButton() : renderActions()}
        </View>
    );

    return (
        <View style={[
            styles.header,
            canGoBack && styles.backHeader,
            style
        ]}>
            {renderContent()}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginHorizontal: 0,
        padding: 10
    },
    backHeader: {
        marginBottom: 10,
        paddingVertical: 12,
        paddingLeft: 0,
    },
    screenHeader: {
        paddingLeft: 0,
        paddingVertical: 4,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 8,
    },
    screenHeaderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 8,
        minHeight: 60,
    },
    titleContainer: {
        flex: 1,
        marginLeft: 6,
        paddingRight: 8,
    },
    screenTitleContainer: {
        flex: 1,
        paddingRight: 16,
        justifyContent: 'center',
    },
    rightContainer: {
        flexDirection: 'row',
        marginLeft: 'auto',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});