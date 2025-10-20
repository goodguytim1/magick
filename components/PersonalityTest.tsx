import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { DateInterest, Dislike, LoveLanguage, PersonalityTestData, PersonalityType, UniqueTrait, ZodiacSign } from '../types/user';

const DARK = {
  bg: "#0c0a12",
  card: "#171427",
  text: "#f5f5f7",
  sub: "#c9c7d1",
  line: "#2a2740",
  accent: "#8b5cf6",
  accentDim: "#6d28d9",
};

interface PersonalityTestProps {
  onComplete: (data: PersonalityTestData) => void;
  onSkip?: () => void;
}

export default function PersonalityTest({ onComplete, onSkip }: PersonalityTestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [testData, setTestData] = useState<Partial<PersonalityTestData>>({});

  const steps = [
    {
      title: "Love Language",
      subtitle: "How do you prefer to receive love? Choose the one that resonates most with you.",
      type: "single" as const,
      options: [
        { 
          id: 'words_of_affirmation', 
          text: 'Words of Affirmation', 
          description: 'You feel most loved when someone expresses their feelings through words, compliments, and verbal encouragement.',
          value: 'words_of_affirmation' as LoveLanguage 
        },
        { 
          id: 'acts_of_service', 
          text: 'Acts of Service', 
          description: 'You feel most loved when someone does things for you, like helping with tasks or going out of their way to make your life easier.',
          value: 'acts_of_service' as LoveLanguage 
        },
        { 
          id: 'receiving_gifts', 
          text: 'Receiving Gifts', 
          description: 'You feel most loved when someone gives you thoughtful gifts that show they were thinking about you.',
          value: 'receiving_gifts' as LoveLanguage 
        },
        { 
          id: 'quality_time', 
          text: 'Quality Time', 
          description: 'You feel most loved when someone gives you their undivided attention and spends meaningful time with you.',
          value: 'quality_time' as LoveLanguage 
        },
        { 
          id: 'physical_touch', 
          text: 'Physical Touch', 
          description: 'You feel most loved through physical affection like hugs, holding hands, or other forms of touch.',
          value: 'physical_touch' as LoveLanguage 
        },
      ]
    },
    {
      title: "Date Interests",
      subtitle: "What activities do you enjoy on dates? Select all that sound appealing to you.",
      type: "multiple" as const,
      options: [
        { 
          id: 'outdoor_adventures', 
          text: 'Outdoor Adventures', 
          description: 'Hiking, camping, beach walks, nature exploration',
          value: 'outdoor_adventures' as DateInterest 
        },
        { 
          id: 'cultural_events', 
          text: 'Cultural Events', 
          description: 'Museums, art galleries, concerts, theater shows',
          value: 'cultural_events' as DateInterest 
        },
        { 
          id: 'cozy_nights_in', 
          text: 'Cozy Nights In', 
          description: 'Movie nights, cooking together, board games, reading',
          value: 'cozy_nights_in' as DateInterest 
        },
        { 
          id: 'fine_dining', 
          text: 'Fine Dining', 
          description: 'Upscale restaurants, wine tastings, culinary experiences',
          value: 'fine_dining' as DateInterest 
        },
        { 
          id: 'travel_exploration', 
          text: 'Travel & Exploration', 
          description: 'Weekend trips, city tours, discovering new places',
          value: 'travel_exploration' as DateInterest 
        },
        { 
          id: 'creative_activities', 
          text: 'Creative Activities', 
          description: 'Art classes, pottery, painting, DIY projects',
          value: 'creative_activities' as DateInterest 
        },
        { 
          id: 'sports_fitness', 
          text: 'Sports & Fitness', 
          description: 'Gym workouts, sports games, fitness classes, active adventures',
          value: 'sports_fitness' as DateInterest 
        },
        { 
          id: 'entertainment_shows', 
          text: 'Entertainment & Shows', 
          description: 'Comedy shows, live music, festivals, amusement parks',
          value: 'entertainment_shows' as DateInterest 
        },
      ]
    },
    {
      title: "Personality Type",
      subtitle: "Which personality type best describes you? Choose the one that feels most accurate.",
      type: "single" as const,
      options: [
        { 
          id: 'extrovert', 
          text: 'Extrovert', 
          description: 'Energized by social interaction and enjoy being around people. You think out loud and gain energy from group activities.',
          value: 'extrovert' as PersonalityType 
        },
        { 
          id: 'introvert', 
          text: 'Introvert', 
          description: 'Prefer quiet, reflective time and recharge through solitude. You think before speaking and enjoy deep one-on-one conversations.',
          value: 'introvert' as PersonalityType 
        },
        { 
          id: 'ambivert', 
          text: 'Ambivert', 
          description: 'Balance of both social and solitary time. You adapt well to different social situations and enjoy variety in your interactions.',
          value: 'ambivert' as PersonalityType 
        },
        { 
          id: 'analytical', 
          text: 'Analytical', 
          description: 'Love logic, problem-solving, and approaching things systematically. You enjoy deep thinking and evidence-based decisions.',
          value: 'analytical' as PersonalityType 
        },
        { 
          id: 'creative', 
          text: 'Creative', 
          description: 'Artistic, imaginative, and enjoy expressing yourself creatively. You see possibilities others miss and love artistic expression.',
          value: 'creative' as PersonalityType 
        },
        { 
          id: 'adventurous', 
          text: 'Adventurous', 
          description: 'Thrill-seeker who loves spontaneity and new experiences. You embrace change and love trying new things.',
          value: 'adventurous' as PersonalityType 
        },
        { 
          id: 'caring', 
          text: 'Caring', 
          description: 'Empathetic, nurturing, and deeply care about others\' wellbeing. You prioritize relationships and helping others.',
          value: 'caring' as PersonalityType 
        },
        { 
          id: 'independent', 
          text: 'Independent', 
          description: 'Self-reliant, autonomous, and value your personal freedom. You prefer to rely on yourself and make your own decisions.',
          value: 'independent' as PersonalityType 
        },
      ]
    },
    {
      title: "Zodiac Sign",
      subtitle: "What's your zodiac sign? Select the one that matches your birth date.",
      type: "single" as const,
      options: [
        { 
          id: 'aries', 
          text: 'Aries (Mar 21 - Apr 19)', 
          description: 'Bold, ambitious, and natural leader with a pioneering spirit.',
          value: 'aries' as ZodiacSign 
        },
        { 
          id: 'taurus', 
          text: 'Taurus (Apr 20 - May 20)', 
          description: 'Reliable, patient, and enjoys the finer things in life.',
          value: 'taurus' as ZodiacSign 
        },
        { 
          id: 'gemini', 
          text: 'Gemini (May 21 - Jun 20)', 
          description: 'Curious, adaptable, and excellent communicator.',
          value: 'gemini' as ZodiacSign 
        },
        { 
          id: 'cancer', 
          text: 'Cancer (Jun 21 - Jul 22)', 
          description: 'Intuitive, emotional, and deeply caring about family and home.',
          value: 'cancer' as ZodiacSign 
        },
        { 
          id: 'leo', 
          text: 'Leo (Jul 23 - Aug 22)', 
          description: 'Confident, creative, and natural performer who loves to shine.',
          value: 'leo' as ZodiacSign 
        },
        { 
          id: 'virgo', 
          text: 'Virgo (Aug 23 - Sep 22)', 
          description: 'Analytical, practical, and has a keen eye for detail.',
          value: 'virgo' as ZodiacSign 
        },
        { 
          id: 'libra', 
          text: 'Libra (Sep 23 - Oct 22)', 
          description: 'Diplomatic, social, and seeks harmony and balance.',
          value: 'libra' as ZodiacSign 
        },
        { 
          id: 'scorpio', 
          text: 'Scorpio (Oct 23 - Nov 21)', 
          description: 'Intense, passionate, and has a mysterious, magnetic personality.',
          value: 'scorpio' as ZodiacSign 
        },
        { 
          id: 'sagittarius', 
          text: 'Sagittarius (Nov 22 - Dec 21)', 
          description: 'Adventurous, philosophical, and loves to explore new horizons.',
          value: 'sagittarius' as ZodiacSign 
        },
        { 
          id: 'capricorn', 
          text: 'Capricorn (Dec 22 - Jan 19)', 
          description: 'Ambitious, disciplined, and has a strong sense of responsibility.',
          value: 'capricorn' as ZodiacSign 
        },
        { 
          id: 'aquarius', 
          text: 'Aquarius (Jan 20 - Feb 18)', 
          description: 'Independent, innovative, and values freedom and originality.',
          value: 'aquarius' as ZodiacSign 
        },
        { 
          id: 'pisces', 
          text: 'Pisces (Feb 19 - Mar 20)', 
          description: 'Compassionate, artistic, and deeply intuitive and empathetic.',
          value: 'pisces' as ZodiacSign 
        },
      ]
    },
    {
      title: "Dislikes",
      subtitle: "What are some things you dislike? Select all that apply to you.",
      type: "multiple" as const,
      options: [
        { 
          id: 'loud_noises', 
          text: 'Loud Noises', 
          description: 'Sudden loud sounds, noisy environments, or overwhelming audio',
          value: 'loud_noises' as Dislike 
        },
        { 
          id: 'crowded_places', 
          text: 'Crowded Places', 
          description: 'Busy malls, packed events, or overwhelming crowds',
          value: 'crowded_places' as Dislike 
        },
        { 
          id: 'small_talk', 
          text: 'Small Talk', 
          description: 'Superficial conversations, weather talk, or meaningless chatter',
          value: 'small_talk' as Dislike 
        },
        { 
          id: 'being_rushed', 
          text: 'Being Rushed', 
          description: 'Tight deadlines, hurried decisions, or pressure to act quickly',
          value: 'being_rushed' as Dislike 
        },
        { 
          id: 'dishonesty', 
          text: 'Dishonesty', 
          description: 'Lies, deception, or lack of transparency in relationships',
          value: 'dishonesty' as Dislike 
        },
        { 
          id: 'negativity', 
          text: 'Negativity', 
          description: 'Constant complaining, pessimism, or toxic attitudes',
          value: 'negativity' as Dislike 
        },
        { 
          id: 'messy_spaces', 
          text: 'Messy Spaces', 
          description: 'Cluttered environments, disorganization, or untidiness',
          value: 'messy_spaces' as Dislike 
        },
        { 
          id: 'routine', 
          text: 'Routine', 
          description: 'Repetitive schedules, predictable patterns, or monotony',
          value: 'routine' as Dislike 
        },
        { 
          id: 'confrontation', 
          text: 'Confrontation', 
          description: 'Arguments, conflicts, or uncomfortable confrontations',
          value: 'confrontation' as Dislike 
        },
        { 
          id: 'wasting_time', 
          text: 'Wasting Time', 
          description: 'Inefficient processes, delays, or unproductive activities',
          value: 'wasting_time' as Dislike 
        },
        { 
          id: 'unreliability', 
          text: 'Unreliability', 
          description: 'People who don\'t follow through, broken promises, or inconsistency',
          value: 'unreliability' as Dislike 
        },
        { 
          id: 'judgmental_people', 
          text: 'Judgmental People', 
          description: 'Critical attitudes, harsh judgments, or lack of acceptance',
          value: 'judgmental_people' as Dislike 
        },
      ]
    },
    {
      title: "Unique Traits",
      subtitle: "What makes you unique? Select all that describe you.",
      type: "multiple" as const,
      options: [
        { 
          id: 'collector', 
          text: 'Collector', 
          description: 'You love collecting items like books, art, memorabilia, or antiques',
          value: 'collector' as UniqueTrait 
        },
        { 
          id: 'polyglot', 
          text: 'Polyglot', 
          description: 'You speak multiple languages or are passionate about learning them',
          value: 'polyglot' as UniqueTrait 
        },
        { 
          id: 'musician', 
          text: 'Musician', 
          description: 'You play instruments, sing, compose, or have deep musical knowledge',
          value: 'musician' as UniqueTrait 
        },
        { 
          id: 'artist', 
          text: 'Artist', 
          description: 'You create visual art, paint, draw, sculpt, or design',
          value: 'artist' as UniqueTrait 
        },
        { 
          id: 'writer', 
          text: 'Writer', 
          description: 'You write stories, poetry, blogs, or enjoy creative writing',
          value: 'writer' as UniqueTrait 
        },
        { 
          id: 'traveler', 
          text: 'Traveler', 
          description: 'You\'ve visited many countries or have a passion for exploring new places',
          value: 'traveler' as UniqueTrait 
        },
        { 
          id: 'volunteer', 
          text: 'Volunteer', 
          description: 'You actively volunteer for causes or help your community',
          value: 'volunteer' as UniqueTrait 
        },
        { 
          id: 'entrepreneur', 
          text: 'Entrepreneur', 
          description: 'You\'ve started businesses or have innovative business ideas',
          value: 'entrepreneur' as UniqueTrait 
        },
        { 
          id: 'athlete', 
          text: 'Athlete', 
          description: 'You\'re passionate about sports, fitness, or athletic activities',
          value: 'athlete' as UniqueTrait 
        },
        { 
          id: 'chef', 
          text: 'Chef', 
          description: 'You love cooking, experimenting with recipes, or culinary arts',
          value: 'chef' as UniqueTrait 
        },
        { 
          id: 'photographer', 
          text: 'Photographer', 
          description: 'You\'re skilled with cameras, love capturing moments, or visual storytelling',
          value: 'photographer' as UniqueTrait 
        },
        { 
          id: 'gardener', 
          text: 'Gardener', 
          description: 'You have a green thumb, love plants, or enjoy gardening',
          value: 'gardener' as UniqueTrait 
        },
        { 
          id: 'tech_enthusiast', 
          text: 'Tech Enthusiast', 
          description: 'You\'re passionate about technology, coding, or digital innovation',
          value: 'tech_enthusiast' as UniqueTrait 
        },
        { 
          id: 'bookworm', 
          text: 'Bookworm', 
          description: 'You\'re an avid reader with extensive literary knowledge',
          value: 'bookworm' as UniqueTrait 
        },
        { 
          id: 'dancer', 
          text: 'Dancer', 
          description: 'You love dancing, have dance training, or enjoy movement arts',
          value: 'dancer' as UniqueTrait 
        },
        { 
          id: 'comedian', 
          text: 'Comedian', 
          description: 'You\'re naturally funny, do stand-up, or love making people laugh',
          value: 'comedian' as UniqueTrait 
        },
      ]
    }
  ];

  const handleOptionSelect = (option: any) => {
    const step = steps[currentStep];
    
    if (step.type === 'single') {
      setTestData(prev => ({
        ...prev,
        [step.title.toLowerCase().replace(' ', '')]: option.value
      }));
    } else if (step.type === 'multiple') {
      if (step.title === 'Date Interests') {
        const currentValues = testData.dateInterests || [];
        const newValues = currentValues.includes(option.value)
          ? currentValues.filter(v => v !== option.value)
          : [...currentValues, option.value];
        
        setTestData(prev => ({
          ...prev,
          dateInterests: newValues
        }));
      } else if (step.title === 'Dislikes') {
        const currentValues = testData.dislikes || [];
        const newValues = currentValues.includes(option.value)
          ? currentValues.filter(v => v !== option.value)
          : [...currentValues, option.value];
        
        setTestData(prev => ({
          ...prev,
          dislikes: newValues
        }));
      } else if (step.title === 'Unique Traits') {
        const currentValues = testData.uniqueTraits || [];
        const newValues = currentValues.includes(option.value)
          ? currentValues.filter(v => v !== option.value)
          : [...currentValues, option.value];
        
        setTestData(prev => ({
          ...prev,
          uniqueTraits: newValues
        }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the test
      const completedData: PersonalityTestData = {
        loveLanguage: testData.loveLanguage!,
        dateInterests: testData.dateInterests || [],
        personalityType: testData.personalityType!,
        zodiacSign: testData.zodiacSign!,
        dislikes: testData.dislikes || [],
        uniqueTraits: testData.uniqueTraits || [],
      };
      onComplete(completedData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    if (step.type === 'single') {
      const key = step.title.toLowerCase().replace(' ', '');
      return testData[key as keyof typeof testData];
    } else if (step.type === 'multiple') {
      if (step.title === 'Date Interests') {
        return testData.dateInterests && testData.dateInterests.length > 0;
      } else if (step.title === 'Dislikes') {
        return testData.dislikes && testData.dislikes.length > 0;
      } else if (step.title === 'Unique Traits') {
        return testData.uniqueTraits && testData.uniqueTraits.length > 0;
      }
    }
    return false;
  };

  const currentStepData = steps[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: DARK.bg }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: DARK.text }]}>
            Personality Test
          </Text>
          <Text style={[styles.subtitle, { color: DARK.sub }]}>
            Help us understand you better
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: DARK.accent,
                    width: `${((currentStep + 1) / steps.length) * 100}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: DARK.sub }]}>
              {currentStep + 1} of {steps.length}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.stepHeader}>
            <Text style={[styles.stepTitle, { color: DARK.text }]}>
              {currentStepData.title}
            </Text>
            <Text style={[styles.stepSubtitle, { color: DARK.sub }]}>
              {currentStepData.subtitle}
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            {currentStepData.options?.map((option) => {
              let isSelected = false;
              if (currentStepData.type === 'single') {
                const key = currentStepData.title.toLowerCase().replace(' ', '');
                isSelected = testData[key as keyof typeof testData] === option.value;
              } else if (currentStepData.type === 'multiple') {
                if (currentStepData.title === 'Date Interests') {
                  isSelected = testData.dateInterests?.includes(option.value);
                } else if (currentStepData.title === 'Dislikes') {
                  isSelected = testData.dislikes?.includes(option.value);
                } else if (currentStepData.title === 'Unique Traits') {
                  isSelected = testData.uniqueTraits?.includes(option.value);
                }
              }
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: isSelected ? DARK.accent : DARK.card,
                      borderColor: isSelected ? DARK.accent : DARK.line
                    }
                  ]}
                  onPress={() => handleOptionSelect(option)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: isSelected ? '#ffffff' : DARK.text }
                  ]}>
                    {option.text}
                  </Text>
                  {option.description && (
                    <Text style={[
                      styles.optionDescription,
                      { color: isSelected ? '#ffffff' : DARK.sub }
                    ]}>
                      {option.description}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: DARK.line }]}
              onPress={handlePrevious}
            >
              <Text style={[styles.buttonText, { color: DARK.text }]}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.button, 
              styles.primaryButton, 
              { 
                backgroundColor: isStepValid() ? DARK.accent : DARK.line,
                opacity: isStepValid() ? 1 : 0.5
              }
            ]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <Text style={styles.buttonText}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>

        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: DARK.sub }]}>Skip for now</Text>
          </TouchableOpacity>
        )}
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
    marginBottom: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#2a2740',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 24,
    flex: 1,
  },
  stepHeader: {
    marginBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  skipButton: {
    alignItems: 'center',
  },
  skipText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
