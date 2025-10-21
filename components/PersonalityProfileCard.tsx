import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PersonalityTestData } from '../types/user';

interface PersonalityProfileCardProps {
  data: PersonalityTestData;
  onViewResults: () => void;
  onRetakeTest: () => void;
  theme: 'light' | 'dark';
}

const DARK = {
  bg: "#0c0a12",
  card: "#171427",
  text: "#f5f5f7",
  sub: "#c9c7d1",
  line: "#2a2740",
  accent: "#8b5cf6",
  accentDim: "#6d28d9",
  success: "#10b981",
  warning: "#f59e0b",
};

const LIGHT = {
  bg: "#f7f5ff",
  card: "#ffffff",
  text: "#1a1530",
  sub: "#4b4764",
  line: "#e6e2f3",
  accent: "#7c3aed",
  accentDim: "#a78bfa",
  success: "#059669",
  warning: "#d97706",
};

export default function PersonalityProfileCard({ 
  data, 
  onViewResults, 
  onRetakeTest, 
  theme 
}: PersonalityProfileCardProps) {
  const currentTheme = theme === 'dark' ? DARK : LIGHT;

  const getPersonalityIcon = (type: string) => {
    const icons = {
      extrovert: '🌟',
      introvert: '🌙',
      ambivert: '⚖️',
      analytical: '🧠',
      creative: '🎨',
      adventurous: '🏔️',
      caring: '💝',
      independent: '🦅',
    };
    return icons[type as keyof typeof icons] || '✨';
  };

  const getLoveLanguageIcon = (language: string) => {
    const icons = {
      words_of_affirmation: '💬',
      acts_of_service: '🤝',
      receiving_gifts: '🎁',
      quality_time: '⏰',
      physical_touch: '🤗',
    };
    return icons[language as keyof typeof icons] || '💕';
  };

  const getZodiacIcon = (sign: string) => {
    const icons = {
      aries: '♈',
      taurus: '♉',
      gemini: '♊',
      cancer: '♋',
      leo: '♌',
      virgo: '♍',
      libra: '♎',
      scorpio: '♏',
      sagittarius: '♐',
      capricorn: '♑',
      aquarius: '♒',
      pisces: '♓',
    };
    return icons[sign as keyof typeof icons] || '⭐';
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatArray = (arr: string[]) => {
    if (!arr || !Array.isArray(arr)) return '';
    return arr.map(item => formatText(item)).join(', ');
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: currentTheme.text }]}>
            Your Personality Profile
          </Text>
          <Text style={[styles.subtitle, { color: currentTheme.sub }]}>
            Complete and personalized
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: currentTheme.success }]}>
          <Text style={styles.statusText}>✓ Complete</Text>
        </View>
      </View>

      {/* Profile Summary */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>
            {getLoveLanguageIcon(data.loveLanguage)}
          </Text>
          <Text style={[styles.summaryLabel, { color: currentTheme.sub }]}>
            Love Language
          </Text>
          <Text style={[styles.summaryValue, { color: currentTheme.text }]}>
            {formatText(data.loveLanguage)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>
            {getPersonalityIcon(data.personalityType)}
          </Text>
          <Text style={[styles.summaryLabel, { color: currentTheme.sub }]}>
            Personality
          </Text>
          <Text style={[styles.summaryValue, { color: currentTheme.text }]}>
            {formatText(data.personalityType)}
          </Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.summaryIcon}>
            {getZodiacIcon(data.zodiacSign)}
          </Text>
          <Text style={[styles.summaryLabel, { color: currentTheme.sub }]}>
            Zodiac Sign
          </Text>
          <Text style={[styles.summaryValue, { color: currentTheme.text }]}>
            {formatText(data.zodiacSign)}
          </Text>
        </View>
      </View>

      {/* Additional Info */}
      {(data.dateInterests?.length > 0 || data.uniqueTraits?.length > 0) && (
        <View style={styles.additionalInfo}>
          {data.dateInterests?.length > 0 && (
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: currentTheme.sub }]}>
                🎯 Date Interests
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {formatArray(data.dateInterests)}
              </Text>
            </View>
          )}
          
          {data.uniqueTraits?.length > 0 && (
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: currentTheme.sub }]}>
                ✨ Unique Traits
              </Text>
              <Text style={[styles.infoValue, { color: currentTheme.text }]}>
                {formatArray(data.uniqueTraits)}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton, { backgroundColor: currentTheme.accent }]}
          onPress={onViewResults}
        >
          <Text style={styles.primaryButtonText}>View Full Results</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton, { borderColor: currentTheme.line }]}
          onPress={onRetakeTest}
        >
          <Text style={[styles.secondaryButtonText, { color: currentTheme.text }]}>
            Retake Test
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  additionalInfo: {
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
