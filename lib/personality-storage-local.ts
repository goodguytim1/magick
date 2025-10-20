// Temporary workaround - save personality data to localStorage instead of Supabase
// This will let you test the personality test while we fix the database issue

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalityTestData } from '../types/user';

const PERSONALITY_STORAGE_KEY = 'magick_personality_data';

export async function savePersonalityDataLocal(userId: string, personalityData: PersonalityTestData): Promise<void> {
  try {
    const dataToStore = {
      userId,
      personalityData,
      timestamp: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(PERSONALITY_STORAGE_KEY, JSON.stringify(dataToStore));
    console.log('Personality data saved locally:', personalityData);
  } catch (error) {
    console.error('Error saving personality data locally:', error);
    throw error;
  }
}

export async function getPersonalityDataLocal(userId: string): Promise<PersonalityTestData | null> {
  try {
    const stored = await AsyncStorage.getItem(PERSONALITY_STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    if (data.userId === userId) {
      return data.personalityData;
    }
    return null;
  } catch (error) {
    console.error('Error getting personality data locally:', error);
    return null;
  }
}

export async function hasCompletedPersonalityTestLocal(userId: string): Promise<boolean> {
  try {
    const personalityData = await getPersonalityDataLocal(userId);
    return personalityData !== null && 
           personalityData.loveLanguage !== undefined &&
           personalityData.personalityType !== undefined &&
           personalityData.zodiacSign !== undefined;
  } catch (error) {
    console.error('Error checking personality test completion locally:', error);
    return false;
  }
}
