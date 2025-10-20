// Simple JSON file storage for development
// This saves personality data to a local JSON file

import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSONALITY_FILE_KEY = 'personality_data.json';

export async function savePersonalityDataJSON(userId: string, personalityData: any) {
  try {
    // Get existing data
    const existingData = await AsyncStorage.getItem(PERSONALITY_FILE_KEY);
    const allData = existingData ? JSON.parse(existingData) : {};
    
    // Add new data
    allData[userId] = {
      ...personalityData,
      timestamp: new Date().toISOString()
    };
    
    // Save back
    await AsyncStorage.setItem(PERSONALITY_FILE_KEY, JSON.stringify(allData, null, 2));
    console.log('Personality data saved to JSON file');
  } catch (error) {
    console.error('Error saving JSON:', error);
    throw error;
  }
}

export async function getPersonalityDataJSON(userId: string) {
  try {
    const data = await AsyncStorage.getItem(PERSONALITY_FILE_KEY);
    if (!data) return null;
    
    const allData = JSON.parse(data);
    return allData[userId] || null;
  } catch (error) {
    console.error('Error reading JSON:', error);
    return null;
  }
}

export async function hasCompletedPersonalityTestJSON(userId: string) {
  try {
    const personalityData = await getPersonalityDataJSON(userId);
    return personalityData !== null && 
           personalityData.loveLanguage !== undefined &&
           personalityData.personalityType !== undefined &&
           personalityData.zodiacSign !== undefined;
  } catch (error) {
    console.error('Error checking completion:', error);
    return false;
  }
}
