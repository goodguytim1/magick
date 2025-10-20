import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PersonalityTestData } from '../types/user';

const DARK = {
  bg: "#0c0a12",
  card: "#171427",
  text: "#f5f5f7",
  sub: "#c9c7d1",
  line: "#2a2740",
  accent: "#8b5cf6",
  accentDim: "#6d28d9",
};

interface PersonalityTestResultsProps {
  data: PersonalityTestData;
  onContinue: () => void;
}

export default function PersonalityTestResults({ data, onContinue }: PersonalityTestResultsProps) {
  const getLoveLanguageDescription = (loveLanguage: string) => {
    const descriptions = {
      words_of_affirmation: "You feel most loved when someone expresses their feelings through words, compliments, and verbal encouragement.",
      acts_of_service: "You feel most loved when someone does things for you, like helping with tasks or going out of their way to make your life easier.",
      receiving_gifts: "You feel most loved when someone gives you thoughtful gifts that show they were thinking about you.",
      quality_time: "You feel most loved when someone gives you their undivided attention and spends meaningful time with you.",
      physical_touch: "You feel most loved through physical affection like hugs, holding hands, or other forms of touch.",
    };
    return descriptions[loveLanguage as keyof typeof descriptions] || "";
  };

  const getPersonalityDescription = (personalityType: string) => {
    const descriptions = {
      extrovert: "You're energized by social interaction and enjoy being around people.",
      introvert: "You prefer quiet, reflective time and recharge through solitude.",
      ambivert: "You have a balanced approach to social interaction and alone time.",
      analytical: "You love logic, problem-solving, and approaching things systematically.",
      creative: "You're artistic, imaginative, and enjoy expressing yourself creatively.",
      adventurous: "You're a thrill-seeker who loves spontaneity and new experiences.",
      caring: "You're empathetic, nurturing, and deeply care about others' wellbeing.",
      independent: "You're self-reliant, autonomous, and value your personal freedom.",
    };
    return descriptions[personalityType as keyof typeof descriptions] || "";
  };

  const getZodiacDescription = (zodiacSign: string) => {
    const descriptions = {
      aries: "Bold, ambitious, and natural leader with a pioneering spirit.",
      taurus: "Reliable, patient, and enjoys the finer things in life.",
      gemini: "Curious, adaptable, and excellent communicator.",
      cancer: "Intuitive, emotional, and deeply caring about family and home.",
      leo: "Confident, creative, and natural performer who loves to shine.",
      virgo: "Analytical, practical, and has a keen eye for detail.",
      libra: "Diplomatic, social, and seeks harmony and balance.",
      scorpio: "Intense, passionate, and has a mysterious, magnetic personality.",
      sagittarius: "Adventurous, philosophical, and loves to explore new horizons.",
      capricorn: "Ambitious, disciplined, and has a strong sense of responsibility.",
      aquarius: "Independent, innovative, and values freedom and originality.",
      pisces: "Compassionate, artistic, and deeply intuitive and empathetic.",
    };
    return descriptions[zodiacSign as keyof typeof descriptions] || "";
  };

  const formatDislikes = (dislikes: string[]) => {
    const formatted = dislikes.map(dislike => {
      return dislike.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    });
    return formatted.join(', ');
  };

  const formatUniqueTraits = (traits: string[]) => {
    const formatted = traits.map(trait => {
      return trait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    });
    return formatted.join(', ');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DARK.bg }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: DARK.text }]}>
            Your Personality Profile
          </Text>
          <Text style={[styles.subtitle, { color: DARK.sub }]}>
            Here's what we learned about you
          </Text>
        </View>

        <View style={styles.content}>
          {/* Love Language */}
          <View style={[styles.card, { backgroundColor: DARK.card }]}>
            <Text style={[styles.cardTitle, { color: DARK.text }]}>
              💕 Love Language
            </Text>
            <Text style={[styles.cardValue, { color: DARK.accent }]}>
              {data.loveLanguage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={[styles.cardDescription, { color: DARK.sub }]}>
              {getLoveLanguageDescription(data.loveLanguage)}
            </Text>
          </View>

          {/* Date Interests */}
          <View style={[styles.card, { backgroundColor: DARK.card }]}>
            <Text style={[styles.cardTitle, { color: DARK.text }]}>
              🎯 Date Interests
            </Text>
            <Text style={[styles.cardValue, { color: DARK.accent }]}>
              {formatDateInterests(data.dateInterests)}
            </Text>
          </View>

          {/* Personality Type */}
          <View style={[styles.card, { backgroundColor: DARK.card }]}>
            <Text style={[styles.cardTitle, { color: DARK.text }]}>
              🧠 Personality Type
            </Text>
            <Text style={[styles.cardValue, { color: DARK.accent }]}>
              {data.personalityType.charAt(0).toUpperCase() + data.personalityType.slice(1)}
            </Text>
            <Text style={[styles.cardDescription, { color: DARK.sub }]}>
              {getPersonalityDescription(data.personalityType)}
            </Text>
          </View>

          {/* Zodiac Sign */}
          <View style={[styles.card, { backgroundColor: DARK.card }]}>
            <Text style={[styles.cardTitle, { color: DARK.text }]}>
              ⭐ Zodiac Sign
            </Text>
            <Text style={[styles.cardValue, { color: DARK.accent }]}>
              {data.zodiacSign.charAt(0).toUpperCase() + data.zodiacSign.slice(1)}
            </Text>
            <Text style={[styles.cardDescription, { color: DARK.sub }]}>
              {getZodiacDescription(data.zodiacSign)}
            </Text>
          </View>

          {/* Dislikes */}
          {data.dislikes.length > 0 && (
            <View style={[styles.card, { backgroundColor: DARK.card }]}>
              <Text style={[styles.cardTitle, { color: DARK.text }]}>
                ❌ Dislikes
              </Text>
              <Text style={[styles.cardValue, { color: DARK.accent }]}>
                {formatDislikes(data.dislikes)}
              </Text>
            </View>
          )}

          {/* Unique Traits */}
          {data.uniqueTraits.length > 0 && (
            <View style={[styles.card, { backgroundColor: DARK.card }]}>
              <Text style={[styles.cardTitle, { color: DARK.text }]}>
                ✨ Unique Traits
              </Text>
              <Text style={[styles.cardValue, { color: DARK.accent }]}>
                {formatUniqueTraits(data.uniqueTraits)}
              </Text>
            </View>
          )}

          {/* Benefits Section */}
          <View style={[styles.benefitsCard, { backgroundColor: DARK.accentDim }]}>
            <Text style={[styles.benefitsTitle, { color: '#ffffff' }]}>
              🎉 What's Next?
            </Text>
            <Text style={[styles.benefitsText, { color: '#ffffff' }]}>
              We'll use this information to recommend personalized bonding questions and activities that match your personality and interests. This will help you and your partner connect on a deeper level!
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: DARK.accent }]}
          onPress={onContinue}
        >
          <Text style={styles.continueButtonText}>Continue to App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  benefitsCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
