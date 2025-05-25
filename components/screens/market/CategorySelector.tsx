import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Star, ChevronRight, LucideIcon } from 'lucide-react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface Category {
    name: string;
    icon?: LucideIcon;
    count?: number;
}

interface CategorySelectorProps {
    categories: (string | Category)[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export function CategorySelector({ categories, selectedCategory, onSelectCategory }: CategorySelectorProps) {
    const { colors } = useTheme();
    const scrollViewRef = useRef<ScrollView>(null);
    const [showScrollIndicator, setShowScrollIndicator] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [contentWidth, setContentWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const handleScroll = (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const isScrollable = contentSize.width > layoutMeasurement.width;
        const scrollPosition = contentOffset.x;
        const maxScroll = contentSize.width - layoutMeasurement.width;
        const isNearEnd = maxScroll - scrollPosition < 20;
        
        if (isScrollable && !isNearEnd) {
            setShowScrollIndicator(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setShowScrollIndicator(false);
            });
        }
    };

    const handleContentSizeChange = (width: number) => {
        setContentWidth(width);
    };

    const handleLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setContainerWidth(width);
    };

    const renderCategoryButton = (category: string | Category) => {
        const categoryName = typeof category === 'string' ? category : category.name;
        const Icon = typeof category === 'string' ? undefined : category.icon;
        const count = typeof category === 'string' ? undefined : category.count;
        const isSelected = categoryName === selectedCategory;

        return (
            <TouchableOpacity
                key={categoryName}
                style={[
                    styles.categoryButton,
                    isSelected && { borderColor: colors.primary }
                ]}
                onPress={() => onSelectCategory(categoryName)}
            >
                <View style={styles.categoryContent}>
                    {Icon && (
                        <Icon 
                            size={16} 
                            color={isSelected ? colors.primary : colors.textSecondary} 
                            style={styles.categoryIcon}
                        />
                    )}
                    <ThemedText 
                        variant="bodySmall" 
                        style={styles.categoryText}
                        color={isSelected ? colors.primary : colors.textSecondary}
                    >
                        {categoryName}
                        {count !== undefined && ` (${count})`}
                    </ThemedText>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.wrapper} onLayout={handleLayout}>
            <ScrollView 
                ref={scrollViewRef}
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.container}
                contentContainerStyle={[
                    styles.content,
                    contentWidth > containerWidth && showScrollIndicator && styles.contentWithIndicator
                ]}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onContentSizeChange={handleContentSizeChange}
            >
                {categories.map(renderCategoryButton)}
            </ScrollView>
            {showScrollIndicator && (
                <Animated.View 
                    style={[
                        styles.scrollIndicator,
                        { 
                            opacity: fadeAnim,
                            backgroundColor: colors.background,
                        }
                    ]}
                >
                    <View style={styles.scrollIndicatorInner}>
                        <ChevronRight size={16} color={colors.textSecondary} />
                    </View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'relative',
        maxHeight: 40,
        marginBottom: 8,
    },
    container: {
        maxHeight: 40,
    },
    content: {
        paddingHorizontal: 8,
        gap: 8,
    },
    contentWithIndicator: {
        marginRight: 40,
    },
    categoryButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIcon: {
        marginRight: 6,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
    },
    scrollIndicator: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollIndicatorInner: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
}); 