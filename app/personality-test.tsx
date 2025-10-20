import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import PersonalityTest from '../components/PersonalityTest';
import PersonalityTestResults from '../components/PersonalityTestResults';
import { savePersonalityDataLocal } from '../lib/personality-storage-local';
import { PersonalityTestData } from '../types/user';

export default function PersonalityTestFlow() {
  const { userId, fromSettings, retake } = useLocalSearchParams<{ 
    userId: string; 
    fromSettings?: string; 
    retake?: string; 
  }>();
  const [showResults, setShowResults] = useState(false);
  const [testData, setTestData] = useState<PersonalityTestData | null>(null);

  const handleTestComplete = async (data: PersonalityTestData) => {
    try {
      setTestData(data);
      await savePersonalityDataLocal(userId!, data);
      setShowResults(true);
    } catch (error) {
      console.error('Error saving personality data:', error);
      Alert.alert(
        'Error',
        'Failed to save your personality data. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSkip = () => {
    if (fromSettings === 'true') {
      // If coming from settings, go back to settings
      router.back();
    } else {
      // If coming from sign-up/sign-in, go to main app
      Alert.alert(
        'Skip Personality Test',
        'You can complete this later in your profile settings. Are you sure you want to skip?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Skip', 
            onPress: () => {
              router.replace('/(tabs)');
            }
          }
        ]
      );
    }
  };

  const handleContinue = () => {
    if (fromSettings === 'true') {
      // If coming from settings, go back to settings
      router.back();
    } else {
      // If coming from sign-up/sign-in, go to main app
      router.replace('/(tabs)');
    }
  };

  if (showResults && testData) {
    return (
      <PersonalityTestResults 
        data={testData} 
        onContinue={handleContinue}
      />
    );
  }

  return (
    <PersonalityTest 
      onComplete={handleTestComplete}
      onSkip={fromSettings === 'true' ? undefined : handleSkip}
    />
  );
}
