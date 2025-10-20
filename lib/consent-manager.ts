import { ConsentSettings, PersonalityTestData } from '../types/user';
import { supabase } from './supabase';

const CONSENT_VERSION = '1.0';

export async function getUserConsent(userId: string): Promise<ConsentSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('consent_version, consent_timestamp, analytics_consent, personalization_consent, marketing_consent, data_sharing_consent')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user consent:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      version: data.consent_version || CONSENT_VERSION,
      timestamp: data.consent_timestamp || new Date().toISOString(),
      analytics: data.analytics_consent || false,
      personalization: data.personalization_consent || false,
      marketing: data.marketing_consent || false,
      data_sharing: data.data_sharing_consent || false,
    };
  } catch (error) {
    console.error('Error in getUserConsent:', error);
    return null;
  }
}

export async function updateConsent(userId: string, consent: ConsentSettings): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        consent_version: consent.version,
        consent_timestamp: consent.timestamp,
        analytics_consent: consent.analytics,
        personalization_consent: consent.personalization,
        marketing_consent: consent.marketing,
        data_sharing_consent: consent.data_sharing,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    // Log the consent change
    await logConsentChange(userId, consent, 'updated');
  } catch (error) {
    console.error('Error updating consent:', error);
    throw error;
  }
}

export async function hasUserConsented(userId: string): Promise<boolean> {
  try {
    const consent = await getUserConsent(userId);
    return consent !== null && consent.timestamp !== '';
  } catch (error) {
    console.error('Error checking user consent:', error);
    return false;
  }
}

export async function logConsentChange(
  userId: string, 
  consent: ConsentSettings, 
  action: 'granted' | 'updated' | 'withdrawn'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('consent_logs')
      .insert({
        user_id: userId,
        consent_version: consent.version,
        analytics: consent.analytics,
        personalization: consent.personalization,
        marketing: consent.marketing,
        data_sharing: consent.data_sharing,
        action: action,
      });

    if (error) {
      console.error('Error logging consent change:', error);
    }
  } catch (error) {
    console.error('Error in logConsentChange:', error);
  }
}

export async function createUserProfile(userId: string, email: string): Promise<void> {
  try {
    // First check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      console.log('User profile already exists');
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        consent_version: CONSENT_VERSION,
        consent_timestamp: null, // Will be set when user consents
        analytics_consent: false,
        personalization_consent: false,
        marketing_consent: false,
        data_sharing_consent: false,
        theme: 'dark',
        favorite_categories: [],
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export function createDefaultConsent(): ConsentSettings {
  return {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    analytics: false,
    personalization: false,
    marketing: false,
    data_sharing: false,
  };
}

export function createAcceptedConsent(): ConsentSettings {
  return {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    analytics: true,
    personalization: true,
    marketing: true,
    data_sharing: true,
  };
}

export async function softDeleteUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    console.log('User account soft deleted successfully');
  } catch (error) {
    console.error('Error soft deleting user:', error);
    throw error;
  }
}

export async function restoreUser(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    console.log('User account restored successfully');
  } catch (error) {
    console.error('Error restoring user:', error);
    throw error;
  }
}

export async function isUserDeleted(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('deleted_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking if user is deleted:', error);
      return false;
    }

    return data?.deleted_at !== null;
  } catch (error) {
    console.error('Error in isUserDeleted:', error);
    return false;
  }
}

export async function getUserProfile(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .eq('deleted_at', null) // Only return non-deleted profiles
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// Personality Test Functions
export async function savePersonalityData(userId: string, personalityData: PersonalityTestData): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        personality_data: personalityData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving personality data:', error);
    throw error;
  }
}

export async function getPersonalityData(userId: string): Promise<PersonalityTestData | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('personality_data')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching personality data:', error);
      return null;
    }

    return data?.personality_data || null;
  } catch (error) {
    console.error('Error in getPersonalityData:', error);
    return null;
  }
}

export async function hasCompletedPersonalityTest(userId: string): Promise<boolean> {
  try {
    const personalityData = await getPersonalityData(userId);
    return personalityData !== null && 
           personalityData.loveLanguage !== undefined &&
           personalityData.personalityType !== undefined &&
           personalityData.zodiacSign !== undefined;
  } catch (error) {
    console.error('Error checking personality test completion:', error);
    return false;
  }
}
