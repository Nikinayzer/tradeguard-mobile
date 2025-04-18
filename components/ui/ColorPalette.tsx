import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type ColorSectionProps = {
  title: string;
  colors: {
    name: string;
    value: string;
  }[];
};

const ColorSection = ({ title, colors }: ColorSectionProps) => {
  return (
    <View style={styles.section}>
      <ThemedText variant="bodyBold" mb={12}>{title}</ThemedText>
      <View style={styles.colorGrid}>
        {colors.map((color, index) => (
          <ColorSwatch 
            key={index} 
            name={color.name} 
            color={color.value} 
          />
        ))}
      </View>
    </View>
  );
};

type ColorSwatchProps = {
  name: string;
  color: string;
};

const ColorSwatch = ({ name, color }: ColorSwatchProps) => {
  const { colors: themeColors } = useTheme();
  
  // Calculate if a color is light or dark to determine text color
  const isLight = (color: string) => {
    // Simple lightness estimation
    // For hex colors
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
    }
    // For rgba colors
    if (color.startsWith('rgba')) {
      return false; // Assume dark text for rgba colors
    }
    return true;
  };
  
  return (
    <View style={styles.swatchContainer}>
      <View style={[styles.swatch, { backgroundColor: color }]}>
        <ThemedText 
          variant="caption" 
          color={isLight(color) ? '#000000' : '#FFFFFF'}
          centered
        >
          {name}
        </ThemedText>
      </View>
      <ThemedText variant="caption" centered mt={4}>
        {color}
      </ThemedText>
    </View>
  );
};

export function ColorPalette() {
  const { colors, isDark } = useTheme();
  
  const featureColors = [
    { name: 'primary', value: colors.primary },
    { name: 'primaryLight', value: colors.primaryLight },
    { name: 'primaryDark', value: colors.primaryDark },
    { name: 'secondary', value: colors.secondary },
    { name: 'secondaryLight', value: colors.secondaryLight },
    { name: 'secondaryDark', value: colors.secondaryDark },
  ];
  
  const uiColors = [
    { name: 'text', value: colors.text },
    { name: 'textSecondary', value: colors.textSecondary },
    { name: 'textTertiary', value: colors.textTertiary },
    { name: 'background', value: colors.background },
    { name: 'backgroundSecondary', value: colors.backgroundSecondary },
    { name: 'backgroundTertiary', value: colors.backgroundTertiary },
  ];
  
  const statusColors = [
    { name: 'success', value: colors.success },
    { name: 'error', value: colors.error },
    { name: 'warning', value: colors.warning },
    { name: 'profit', value: colors.profit },
    { name: 'loss', value: colors.loss },
  ];
  
  return (
    <ThemedView variant="card" padding="medium" rounded>
      <ThemedText variant="heading3" mb={16}>Color Palette</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.paletteContainer}>
          <ColorSection title="Feature Colors" colors={featureColors} />
          <ColorSection title="UI Colors" colors={uiColors} />
          <ColorSection title="Status Colors" colors={statusColors} />
        </View>
      </ScrollView>
      <ThemedText variant="caption" secondary mt={12} centered>
        Current theme: {isDark ? 'Dark' : 'Light'} mode
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  paletteContainer: {
    paddingBottom: 8,
  },
  section: {
    marginBottom: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  swatchContainer: {
    width: 100,
    marginBottom: 12,
    marginHorizontal: 4,
  },
  swatch: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 