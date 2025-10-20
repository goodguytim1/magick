export interface ConsentSettings {
  version: string;
  timestamp: string;
  analytics: boolean;
  personalization: boolean;
  marketing: boolean;
  data_sharing: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  consent: ConsentSettings;
  theme: 'light' | 'dark';
  favorite_categories: string[];
  personality_data?: PersonalityTestData;
}

export interface ConsentLog {
  id: string;
  user_id: string;
  timestamp: string;
  consent_version: string;
  analytics: boolean | null;
  personalization: boolean | null;
  marketing: boolean | null;
  data_sharing: boolean | null;
  action: 'granted' | 'updated' | 'withdrawn';
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
}

// Personality Test Types
export interface PersonalityTestData {
  loveLanguage: LoveLanguage;
  dateInterests: DateInterest[];
  personalityType: PersonalityType;
  zodiacSign: ZodiacSign;
  dislikes: Dislike[];
  uniqueTraits: UniqueTrait[];
}

export type LoveLanguage = 
  | 'words_of_affirmation'
  | 'acts_of_service'
  | 'receiving_gifts'
  | 'quality_time'
  | 'physical_touch';

export type DateInterest = 
  | 'outdoor_adventures'
  | 'cultural_events'
  | 'cozy_nights_in'
  | 'fine_dining'
  | 'travel_exploration'
  | 'creative_activities'
  | 'sports_fitness'
  | 'entertainment_shows';

export type PersonalityType = 
  | 'extrovert'
  | 'introvert'
  | 'ambivert'
  | 'analytical'
  | 'creative'
  | 'adventurous'
  | 'caring'
  | 'independent';

export type ZodiacSign = 
  | 'aries'
  | 'taurus'
  | 'gemini'
  | 'cancer'
  | 'leo'
  | 'virgo'
  | 'libra'
  | 'scorpio'
  | 'sagittarius'
  | 'capricorn'
  | 'aquarius'
  | 'pisces';

export type Dislike = 
  | 'loud_noises'
  | 'crowded_places'
  | 'small_talk'
  | 'being_rushed'
  | 'dishonesty'
  | 'negativity'
  | 'messy_spaces'
  | 'routine'
  | 'confrontation'
  | 'wasting_time'
  | 'unreliability'
  | 'judgmental_people';

export type UniqueTrait = 
  | 'collector'
  | 'polyglot'
  | 'musician'
  | 'artist'
  | 'writer'
  | 'traveler'
  | 'volunteer'
  | 'entrepreneur'
  | 'athlete'
  | 'chef'
  | 'photographer'
  | 'gardener'
  | 'tech_enthusiast'
  | 'bookworm'
  | 'dancer'
  | 'comedian';

export interface PersonalityTestQuestion {
  id: string;
  category: keyof PersonalityTestData;
  question: string;
  options: PersonalityTestOption[];
}

export interface PersonalityTestOption {
  id: string;
  text: string;
  value: any;
}
