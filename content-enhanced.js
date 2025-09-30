// Enhanced content structure with strict business pairing metadata
export const CARD_METADATA = {
  // Card types for recommendation system - STRICT RULES
  RECOMMENDATION_TYPES: {
    AT_HOME: 'at_home',           // Conversation cards - NO business needed, can be done anywhere
    OUTBOUND: 'outbound',         // Physical activities - MUST leave house, need business recommendations
    HYBRID: 'hybrid'              // Can work both ways - but should be rare, only when truly flexible
  },
  
  // Business categories for pairing
  BUSINESS_CATEGORIES: {
    RESTAURANTS: 'restaurants',
    ENTERTAINMENT: 'entertainment', 
    ARTS_CULTURE: 'arts_culture',
    OUTDOOR: 'outdoor',
    SHOPPING: 'shopping',
    WELLNESS: 'wellness',
    EDUCATION: 'education',
    TRANSPORTATION: 'transportation',
    ACCOMMODATION: 'accommodation'
  }
};

// STRICT RULES FOR CATEGORIZATION:
// AT_HOME: Questions that can be answered anywhere, no physical activity required
// OUTBOUND: Physical activities that require leaving the house and going somewhere specific
// HYBRID: Only when the activity can genuinely work both at home AND out (very rare)

export const ENHANCED_QUESTIONS = {
  "Spark Questions": [
    {
      text: "What's the most unusual food you've ever tried?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['food', 'conversation', 'bond']
    },
    {
      text: "If you could swap lives with a celebrity for one day, who would it be?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Pure conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'indoor',
      tags: ['conversation', 'fantasy', 'bond']
    },
    {
      text: "What's your guilty pleasure TV show or movie?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'indoor',
      tags: ['entertainment', 'conversation', 'bond']
    },
    {
      text: "What's the funniest thing you believed as a kid?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "If you had a theme song that played when you walked into a room, what would it be?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "What's the weirdest talent you have?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "If you had to eat one meal for the rest of your life, what would it be?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['food', 'conversation', 'bond']
    },
    {
      text: "What's the most spontaneous thing you've ever done?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "Which fictional character do you relate to the most?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "What's the worst haircut you've ever had?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "Would you rather explore space or the deep ocean?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "What's the strangest thing you've ever collected?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "What's your 'happy' food?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['food', 'conversation', 'bond']
    },
    {
      text: "If you had a time machine, what's the first year you'd visit?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "What's your dream vacation spot?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "What's your most used emoji?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'bond']
    },
    {
      text: "Coffee, tea, or neither?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['food', 'conversation', 'bond']
    }
  ],
  
  "Mirror Moments": [
    {
      text: "What's the best advice you've ever received?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'indoor',
      tags: ['conversation', 'reflection', 'bond']
    },
    {
      text: "When do you feel most at peace?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'reflection', 'bond']
    },
    {
      text: "What's one fear you'd like to conquer?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'reflection', 'bond']
    },
    {
      text: "What's something you're proud of that others might not know?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'reflection', 'bond']
    },
    {
      text: "What's a lesson you learned the hard way?",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME, // Just conversation
      businessCategories: [],
      intensity: 'low',
      setting: 'any',
      tags: ['conversation', 'reflection', 'bond']
    }
  ]
};

export const ENHANCED_MISSIONS = {
  "Adventure Sparks": [
    {
      text: "Go to the tallest building in your city and take a picture of the view.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go somewhere specific
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ENTERTAINMENT],
      intensity: 'medium',
      setting: 'outdoor',
      tags: ['adventure', 'outdoor', 'bond'],
      specificBusinesses: ['observation_decks', 'skyscrapers', 'city_tours']
    },
    {
      text: "Visit a local museum or gallery and find your favorite piece.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to museum
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ARTS_CULTURE],
      intensity: 'low',
      setting: 'indoor',
      tags: ['arts', 'culture', 'bond'],
      specificBusinesses: ['museums', 'art_galleries', 'cultural_centers']
    },
    {
      text: "Find a hidden gem restaurant with fewer than 20 reviews online.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to restaurant
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.RESTAURANTS],
      intensity: 'medium',
      setting: 'indoor',
      tags: ['food', 'adventure', 'bond'],
      specificBusinesses: ['restaurants', 'cafes', 'food_trucks']
    },
    {
      text: "Go to a park and build a mini fort out of natural materials.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to park
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.OUTDOOR],
      intensity: 'medium',
      setting: 'outdoor',
      tags: ['outdoor', 'creative', 'bond'],
      specificBusinesses: ['parks', 'nature_reserves', 'botanical_gardens']
    },
    {
      text: "Go to a farmer's market and pick one food neither of you has tried.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to market
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.RESTAURANTS, CARD_METADATA.BUSINESS_CATEGORIES.SHOPPING],
      intensity: 'low',
      setting: 'outdoor',
      tags: ['food', 'shopping', 'bond'],
      specificBusinesses: ['farmers_markets', 'food_markets', 'local_produce']
    },
    {
      text: "Go to a bookstore, pick a book for each other, and exchange.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to bookstore
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.SHOPPING, CARD_METADATA.BUSINESS_CATEGORIES.EDUCATION],
      intensity: 'low',
      setting: 'indoor',
      tags: ['shopping', 'education', 'bond'],
      specificBusinesses: ['bookstores', 'libraries', 'book_cafes']
    },
    {
      text: "Go to a local landmark you've never visited and take a selfie.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go somewhere specific
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ENTERTAINMENT],
      intensity: 'low',
      setting: 'outdoor',
      tags: ['adventure', 'outdoor', 'bond'],
      specificBusinesses: ['landmarks', 'tourist_attractions', 'historical_sites']
    }
  ],
  
  "Creative Charms": [
    {
      text: "Buy a disposable camera and document your day together.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go shopping
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.SHOPPING, CARD_METADATA.BUSINESS_CATEGORIES.ARTS_CULTURE],
      intensity: 'medium',
      setting: 'any',
      tags: ['creative', 'shopping', 'bond'],
      specificBusinesses: ['camera_stores', 'electronics', 'art_supplies']
    },
    {
      text: "Try karaoke, but only pick songs from before the year 2000.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to karaoke venue
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ENTERTAINMENT],
      intensity: 'high',
      setting: 'indoor',
      tags: ['music', 'entertainment', 'bond'],
      specificBusinesses: ['karaoke_bars', 'entertainment_venues', 'music_venues']
    },
    {
      text: "Go to a pottery studio and make matching mugs.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to studio
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ARTS_CULTURE, CARD_METADATA.BUSINESS_CATEGORIES.EDUCATION],
      intensity: 'medium',
      setting: 'indoor',
      tags: ['creative', 'arts', 'bond'],
      specificBusinesses: ['pottery_studios', 'art_classes', 'craft_workshops']
    },
    {
      text: "Go to a thrift store and find the weirdest item under $5.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go shopping
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.SHOPPING],
      intensity: 'low',
      setting: 'indoor',
      tags: ['shopping', 'creative', 'bond'],
      specificBusinesses: ['thrift_stores', 'vintage_shops', 'antique_stores']
    }
  ],
  
  "Mirror Quests": [
    {
      text: "Go to a quiet park and journal for 15 minutes, then share.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to park
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.OUTDOOR, CARD_METADATA.BUSINESS_CATEGORIES.WELLNESS],
      intensity: 'low',
      setting: 'outdoor',
      tags: ['wellness', 'outdoor', 'bond'],
      specificBusinesses: ['parks', 'nature_reserves', 'wellness_centers']
    },
    {
      text: "Visit a local church/temple/mosque and talk about spirituality.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to religious site
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ARTS_CULTURE],
      intensity: 'low',
      setting: 'indoor',
      tags: ['spiritual', 'culture', 'bond'],
      specificBusinesses: ['religious_sites', 'cultural_centers', 'meditation_spaces']
    },
    {
      text: "Go to a quiet library and each find a book that represents your current chapter in life.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to library
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.EDUCATION],
      intensity: 'low',
      setting: 'indoor',
      tags: ['education', 'reflection', 'bond'],
      specificBusinesses: ['libraries', 'bookstores', 'study_spaces']
    },
    {
      text: "Go to a cemetery and find the oldest grave marker.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to cemetery
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ARTS_CULTURE],
      intensity: 'low',
      setting: 'outdoor',
      tags: ['reflection', 'history', 'bond'],
      specificBusinesses: ['cemeteries', 'historical_sites', 'memorials']
    }
  ],
  
  "Bond Quests": [
    {
      text: "Go to a discount store and buy full outfits for each other under $20.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go shopping
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.SHOPPING],
      intensity: 'medium',
      setting: 'indoor',
      tags: ['shopping', 'creative', 'bond'],
      specificBusinesses: ['thrift_stores', 'discount_stores', 'fashion_retailers']
    },
    {
      text: "Eat at a restaurant where you don't recognize anything on the menu.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to restaurant
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.RESTAURANTS],
      intensity: 'medium',
      setting: 'indoor',
      tags: ['food', 'adventure', 'bond'],
      specificBusinesses: ['ethnic_restaurants', 'fine_dining', 'experimental_cuisine']
    },
    {
      text: "Do an open-mic night together (poetry, music, or comedy).",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to venue
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ENTERTAINMENT],
      intensity: 'high',
      setting: 'indoor',
      tags: ['entertainment', 'creative', 'bond'],
      specificBusinesses: ['comedy_clubs', 'music_venues', 'poetry_readings']
    },
    {
      text: "Go to a fancy store and try on clothes you'd never buy.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go shopping
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.SHOPPING],
      intensity: 'low',
      setting: 'indoor',
      tags: ['shopping', 'bond'],
      specificBusinesses: ['luxury_stores', 'fashion_boutiques', 'department_stores']
    },
    {
      text: "Go to a local brewery/distillery and do a tasting together.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to venue
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.ENTERTAINMENT, CARD_METADATA.BUSINESS_CATEGORIES.RESTAURANTS],
      intensity: 'medium',
      setting: 'indoor',
      tags: ['food', 'entertainment', 'bond'],
      specificBusinesses: ['breweries', 'distilleries', 'wine_tastings']
    },
    {
      text: "Go to a local market and buy ingredients for a meal you'll cook together.",
      recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND, // Must go to market
      businessCategories: [CARD_METADATA.BUSINESS_CATEGORIES.SHOPPING, CARD_METADATA.BUSINESS_CATEGORIES.RESTAURANTS],
      intensity: 'medium',
      setting: 'indoor',
      tags: ['food', 'shopping', 'bond'],
      specificBusinesses: ['grocery_stores', 'farmers_markets', 'specialty_foods']
    }
  ]
};

// Helper functions
export function getCardMetadata(card) {
  if (!card) return null;
  
  // Find the card in enhanced content
  const allCards = [
    ...Object.values(ENHANCED_QUESTIONS).flat(),
    ...Object.values(ENHANCED_MISSIONS).flat()
  ];
  
  return allCards.find(enhancedCard => enhancedCard.text === card.text) || {
    recommendationType: CARD_METADATA.RECOMMENDATION_TYPES.AT_HOME,
    businessCategories: [],
    intensity: 'medium',
    setting: 'any',
    tags: ['conversation', 'bond']
  };
}

export function shouldShowRecommendations(card) {
  const metadata = getCardMetadata(card);
  return metadata.recommendationType === CARD_METADATA.RECOMMENDATION_TYPES.OUTBOUND ||
         metadata.recommendationType === CARD_METADATA.RECOMMENDATION_TYPES.HYBRID;
}

export function getBusinessCategories(card) {
  const metadata = getCardMetadata(card);
  return metadata.businessCategories || [];
}