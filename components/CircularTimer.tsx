import React, {useState, useEffect} from "react";
import {View, StyleSheet} from "react-native";
import Svg, {Circle} from "react-native-svg";
import Animated, {
    useAnimatedProps,
    withTiming,
    useSharedValue,
    Easing,
    interpolate,
    Extrapolate,
    runOnJS,
} from "react-native-reanimated";
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularTimerProps {
    size: number;
    strokeWidth: number;
    seconds: number;
    onComplete?: () => void;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
    size,
    strokeWidth,
    seconds,
    onComplete,
}) => {
    const { colors } = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = useSharedValue(0);
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (seconds <= 0) return;

        progress.value = 0;
        setTimeLeft(seconds);
        setIsRunning(true);

        progress.value = withTiming(1, {
            duration: seconds * 1000,
            easing: Easing.linear,
        });

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    runOnJS(() => {
                        setIsRunning(false);
                        onComplete?.();
                    })();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [seconds]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = interpolate(
            progress.value,
            [0, 1],
            [circumference, 0],
            Extrapolate.CLAMP
        );
        return {strokeDashoffset};
    });

    if (!isRunning) return null;

    return (
        <View style={styles.container}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.error}
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={0.2}
                />
                {/* Animated Progress Circle */}
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={colors.error}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                    fill="none"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            {/* Timer Display */}
            <View style={[styles.textContainer, {width: size, height: size}]}>
                <ThemedText 
                    variant="heading2" 
                    style={{
                        ...styles.timerText,
                        color: colors.error
                    }}
                >
                    {timeLeft}
                </ThemedText>
                <ThemedText 
                    variant="body" 
                    secondary 
                    style={{
                        ...styles.unitText,
                        color: colors.error
                    }}
                >
                    s
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        position: "absolute",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    timerText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    unitText: {
        fontSize: 16,
        marginLeft: 2,
    },
});

export default CircularTimer;
