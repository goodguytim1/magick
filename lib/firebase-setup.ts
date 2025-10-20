// Firebase setup for personality test app
// 1. Install: npm install firebase
// 2. Create Firebase project at https://console.firebase.google.com
// 3. Enable Authentication and Firestore Database

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

// Your Firebase config (get this from Firebase console)
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Personality test functions for Firebase
export async function savePersonalityDataFirebase(userId: string, personalityData: any) {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      personalityData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('Personality data saved to Firebase');
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    throw error;
  }
}

export async function getPersonalityDataFirebase(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().personalityData || null;
    }
    return null;
  } catch (error) {
    console.error('Error getting from Firebase:', error);
    return null;
  }
}

export async function hasCompletedPersonalityTestFirebase(userId: string) {
  try {
    const personalityData = await getPersonalityDataFirebase(userId);
    return personalityData !== null && 
           personalityData.loveLanguage !== undefined &&
           personalityData.personalityType !== undefined &&
           personalityData.zodiacSign !== undefined;
  } catch (error) {
    console.error('Error checking completion:', error);
    return false;
  }
}
