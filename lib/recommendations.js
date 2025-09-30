// lib/recommendations.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import catalogData from '../app/content/jacksonville_catalog.json';
import { getBusinessCategories, getCardMetadata, shouldShowRecommendations } from '../content-enhanced.js';

// Configuration for monetization mode
export const CONFIG = { 
  monetizationMode: 'affiliate' // 'affiliate' | 'sponsor'
};

// Load unified catalog
async function loadMergedCatalog() {
  try {
    // Try to load unified catalog first
    const unifiedData = await AsyncStorage.getItem('unified_business_catalog');
    
    if (unifiedData) {
      const allBusinesses = JSON.parse(unifiedData);
      console.log('Loaded unified catalog for recommendations:', allBusinesses.length, 'businesses');
      return allBusinesses;
    } else {
      // Fallback to static catalog if no unified catalog exists
      console.log('No unified catalog found, using static catalog');
      return catalogData;
    }
  } catch (error) {
    console.error('Error loading unified catalog:', error);
    // Fallback to just the static catalog
    return catalogData;
  }
}

// Calculate distance between two coordinates in kilometers
function km(a, b) {
  const R = 6371; // Earth's radius in km
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat/2)**2 + 
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Enhanced card analysis for better matching
function analyzeCard(card) {
  if (!card) return { tags: ['adventure', 'bond'], keywords: [], intensity: 'medium', setting: 'any' };
  
  const text = card.text?.toLowerCase() || '';
  const category = card.category?.toLowerCase() || '';
  const type = card.type?.toLowerCase() || '';
  
  // Extract keywords from card text
  const keywords = [];
  const outdoorKeywords = ['park', 'outdoor', 'walk', 'hike', 'beach', 'sunset', 'sunrise', 'nature', 'garden', 'zoo', 'arboretum'];
  const indoorKeywords = ['museum', 'gallery', 'theater', 'concert', 'cooking', 'class', 'workshop', 'studio', 'library', 'cafe', 'restaurant'];
  const adventureKeywords = ['explore', 'discover', 'adventure', 'mission', 'challenge', 'boat', 'tour', 'escape', 'thrill'];
  const creativeKeywords = ['art', 'creative', 'draw', 'paint', 'music', 'poetry', 'write', 'craft', 'design', 'photography'];
  const socialKeywords = ['together', 'partner', 'friend', 'bond', 'connection', 'date', 'couple', 'team', 'group'];
  const foodKeywords = ['eat', 'food', 'restaurant', 'cafe', 'cooking', 'meal', 'dining', 'taste', 'flavor'];
  const wellnessKeywords = ['peace', 'quiet', 'relax', 'meditation', 'wellness', 'spa', 'calm', 'serene'];
  
  // Analyze text content
  if (outdoorKeywords.some(k => text.includes(k))) keywords.push('outdoor');
  if (indoorKeywords.some(k => text.includes(k))) keywords.push('indoor');
  if (adventureKeywords.some(k => text.includes(k))) keywords.push('adventure');
  if (creativeKeywords.some(k => text.includes(k))) keywords.push('creative');
  if (socialKeywords.some(k => text.includes(k))) keywords.push('bond');
  if (foodKeywords.some(k => text.includes(k))) keywords.push('food');
  if (wellnessKeywords.some(k => text.includes(k))) keywords.push('wellness');
  
  // Determine intensity level
  let intensity = 'medium';
  if (text.includes('extreme') || text.includes('thrill') || text.includes('adventure')) intensity = 'high';
  if (text.includes('quiet') || text.includes('peaceful') || text.includes('calm')) intensity = 'low';
  
  // Determine preferred setting
  let setting = 'any';
  if (keywords.includes('outdoor')) setting = 'outdoor';
  if (keywords.includes('indoor')) setting = 'indoor';
  
  // Category-based tag mapping
  let tags = [];
  if (category.includes('adventure')) tags = ['adventure', 'outdoor', 'bond'];
  else if (category.includes('creative')) tags = ['creative', 'indoor', 'bond'];
  else if (category.includes('mirror')) tags = ['creative', 'indoor', 'wellness', 'bond'];
  else if (category.includes('bond')) tags = ['bond', 'indoor', 'adventure', 'creative'];
  else if (category.includes('spark')) tags = ['adventure', 'creative', 'bond', 'food'];
  else if (category.includes('playful')) tags = ['adventure', 'creative', 'bond', 'food'];
  else tags = ['adventure', 'bond', 'creative'];
  
  // Add keywords as additional tags
  tags = [...new Set([...tags, ...keywords])];
  
  return { tags, keywords, intensity, setting };
}

// Calculate distance with higher precision
function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2) return Infinity;
  
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lng - coord1.lng);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI/180);
}

// Calculate tag match score
function tagScore(item, wantedTags) {
  if (!item.tags || !wantedTags) return 0;
  return item.tags.filter(tag => wantedTags.includes(tag)).length;
}

// Get source preference based on monetization mode
function getSourcePreference(source) {
  const preferences = {
    'local-sponsor': CONFIG.monetizationMode === 'sponsor' ? 3 : 2,
    'fever': 1,
    'viator': 1,
    'getyourguide': 1,
    'groupon': 1,
    'ticketmaster': 0,
    'stubhub': 0
  };
  return preferences[source] ?? 0;
}

export async function recommendNearby({ userCity, userCoord, card, userLocation = null }) {
  // Load the merged catalog (static + user-added + overrides - hidden)
  const catalog = await loadMergedCatalog();
  if (!catalog || catalog.length === 0) return [];
  
  // Check if card should show recommendations
  if (!shouldShowRecommendations(card)) {
    console.log('Card does not need business recommendations:', card?.text?.substring(0, 50));
    return [];
  }
  
  // Get enhanced card metadata
  const cardMetadata = getCardMetadata(card);
  const businessCategories = getBusinessCategories(card);
  
  // Enhanced card analysis
  const cardAnalysis = analyzeCard(card);
  const { tags: wantedTags, keywords, intensity, setting } = cardAnalysis;
  
  console.log('Card Analysis:', {
    card: card?.text?.substring(0, 50) + '...',
    wantedTags,
    keywords,
    intensity,
    setting
  });
  
  // Filter items by location with enhanced precision
  let pool = catalog.filter(item => {
    // Exact city match (highest priority)
    const exactCityMatch = userCity && item.city && 
      item.city.toLowerCase() === userCity.toLowerCase();
    
    // Neighborhood/ZIP match (if available)
    const neighborhoodMatch = userLocation?.neighborhood && item.neighborhood &&
      item.neighborhood.toLowerCase().includes(userLocation.neighborhood.toLowerCase());
    
    // Distance-based match with higher precision
    let distanceMatch = false;
    if (userCoord && item.lat && item.lng) {
      const distance = calculateDistance(userCoord, { lat: item.lat, lng: item.lng });
      // Use smaller radius for more precise recommendations
      const maxDistance = item.radius_km || 25; // Default 25km if not specified
      distanceMatch = distance <= maxDistance;
    }
    
    return exactCityMatch || neighborhoodMatch || distanceMatch;
  });
  
  // If no location matches, fall back to Jacksonville items
  if (pool.length === 0) {
    pool = catalog.filter(item => 
      item.city && item.city.toLowerCase().includes('jacksonville')
    );
  }
  
  // Enhanced scoring system
  pool.forEach(item => {
    let score = 0;
    
    // Location scoring (40% weight)
    if (userCoord && item.lat && item.lng) {
      const distance = calculateDistance(userCoord, { lat: item.lat, lng: item.lng });
      score += Math.max(0, 40 - (distance * 2)); // Closer = higher score
    } else {
      score += 20; // Default location score
    }
    
    // Tag matching (30% weight)
    const tagMatches = tagScore(item, wantedTags);
    score += (tagMatches / wantedTags.length) * 30;
    
    // Keyword matching (20% weight)
    const keywordMatches = keywords.filter(keyword => 
      item.tags?.some(tag => tag.includes(keyword))
    ).length;
    score += (keywordMatches / Math.max(keywords.length, 1)) * 20;
    
    // Source preference (10% weight)
    score += getSourcePreference(item.source) * 10;
    
    // Setting preference bonus
    if (setting !== 'any' && item.tags?.includes(setting)) {
      score += 5;
    }
    
    // Intensity matching bonus
    if (intensity === 'high' && item.tags?.includes('adventure')) score += 3;
    if (intensity === 'low' && item.tags?.includes('wellness')) score += 3;
    
    item._score = score;
  });
  
  // Sort by calculated score
  pool.sort((a, b) => {
    const scoreDiff = (b._score || 0) - (a._score || 0);
    if (scoreDiff !== 0) return scoreDiff;
    
    // Secondary sort by source preference
    const sourceDiff = getSourcePreference(b.source) - getSourcePreference(a.source);
    if (sourceDiff !== 0) return sourceDiff;
    
    return a.name.localeCompare(b.name);
  });
  
  // Clean up temporary score property
  pool.forEach(item => delete item._score);
  
  console.log('Top recommendations:', pool.slice(0, 3).map(item => ({
    name: item.name,
    tags: item.tags,
    city: item.city,
    source: item.source
  })));
  
  // Return top 3 recommendations
  return pool.slice(0, 3);
}

// Update monetization mode
export function setMonetizationMode(mode) {
  CONFIG.monetizationMode = mode;
}
