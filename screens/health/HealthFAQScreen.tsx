import React, { useState } from 'react';
import { ScrollView, StyleSheet, Linking, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/ThemedView';
import { ThemedText } from '@/components/ui/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { TextStyle } from 'react-native';
import { ThemedHeader } from '@/components/ui/ThemedHeader';

const FAQS = [
  {
    question: 'What does the Health Monitor do?',
    answer: 'The Health Monitor continuously analyzes your trading activity to detect both early trends (atomic patterns) and more serious critical patterns (composite patterns) that may indicate risky behaviors or behavioral biases. It provides you with feedback and insights to help you avoid common trading pitfalls, make more rational decisions, and build healthier trading habits over time.'
  },
  {
    question: 'How is my risk score calculated?',
    answer: 'Your risk score is calculated based on the patterns detected in your trading-both early trends and critical patterns. The score takes into account the severity and frequency of these patterns, with more weight given to critical (composite) patterns that signal stronger behavioral biases or risks. The score reflects both your recent and ongoing trading activity, helping you understand and manage your overall risk profile.'
  },
  {
    question: 'What are critical patterns?',
    answer: 'Critical patterns are combinations of trading behaviors that, with a high degree of confidence, indicate the presence of certain behavioral biases-such as overtrading, FOMO (fear of missing out), or the sunk cost fallacy. These patterns are built from multiple smaller warnings (atomic patterns) detected in your trading activity. When several of these atomic patterns appear together, it signals a stronger and more reliable indication of a specific bias or risky behavior.'
  },
  {
    question: 'What are early trends (atomic patterns)?',
    answer: 'Early trends, also known as atomic patterns, are simply deviations from the custom limits you set in your settings or from our system baselines. By themselves, these patterns don\'t necessarily indicate risk-without additional context, they may not mean much. However, when several early trends appear together or persist over time, they can combine to form critical (composite) patterns, which are much stronger indicators of behavioral biases or risky trading habits.'
  },
  {
    question: 'How can I improve my health score?',
    answer: 'To improve your health score, focus on making thoughtful and rational trading decisions. Avoid acting impulsively or making trades based on emotions or breaking news. Take a moment to think twice before any operation, and always consider the risks involved. Try to keep your trading out of the gambling zone-avoid taking big risks or chasing losses. Consistent, careful trading will help you build a healthier trading profile over time.'
  },
  {
    question: "Why can't I see my trade history or operations?",
    answer: 'Trade history and operations are only available after you add an exchange account (you can set this up in the Profile page). Our data is powered by an internal service that is currently in alpha testing, so bugs or missing data may occur. We are actively working to improve reliability and coverage.'
  },
  {
    question: "I've found a bug. Can you fix it?",
    answer: 'If you encounter a bug, please send details to korn03@vse.cz and we will contact you as soon as possible.'
  },
];

export default function HealthFAQScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [openIndexes, setOpenIndexes] = useState(FAQS.map((_, idx) => idx));

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={styles.container} variant="screen">
        <ThemedHeader
          title="Health FAQ"
          canGoBack
          onBack={() => navigation.goBack()}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {FAQS.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            return (
              <View key={idx}>
                <TouchableOpacity
                  style={styles.questionRow}
                  onPress={() => toggleIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Animated.Text
                    style={[
                      styles.arrow,
                      {
                        color: colors.primary,
                        transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
                      },
                    ]}
                  >
                    {'>'}
                  </Animated.Text>
                  <ThemedText
                    variant="heading3"
                    style={[
                      styles.question,
                      { color: colors.text, marginTop: 0, flex: 1 },
                    ] as unknown as TextStyle}
                  >
                    {faq.question}
                  </ThemedText>
                </TouchableOpacity>
                {isOpen && (
                  faq.question === "I've found a bug. Can you fix it?" ? (
                    <ThemedText style={[styles.answer, { color: colors.text }] as unknown as TextStyle}>
                      If you encounter a bug, please send details to{' '}
                      <ThemedText
                        style={{ color: colors.primary, textDecorationLine: 'underline' }}
                        onPress={() => Linking.openURL('mailto:korn03@vse.cz')}
                      >
                        korn03@vse.cz
                      </ThemedText>
                      {' '}and we will contact you as soon as possible.
                    </ThemedText>
                  ) : (
                    <ThemedText style={[styles.answer, { color: colors.text }] as unknown as TextStyle}>
                      {faq.answer}
                    </ThemedText>
                  )
                )}
              </View>
            );
          })}
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  arrow: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 10,
    width: 22,
    textAlign: 'center',
  },
  question: {
    fontWeight: '700',
    fontSize: 20,
    marginLeft: -12,
  },
  answer: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
    marginLeft: 32,
  },
}); 